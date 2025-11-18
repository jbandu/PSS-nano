import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();

interface ScanBoardingPassRequest {
  boardingPassNumber: string;
  barcodeData: string;
  gateNumber: string;
  scannedBy: string;
  scannerDevice?: string;
}

interface ScanResult {
  success: boolean;
  scan?: any;
  boardingPass?: any;
  validation: {
    isValid: boolean;
    status: string;
    message?: string;
  };
  processingTime: number;
}

export class BoardingService {
  /**
   * Scan boarding pass at gate
   */
  async scanBoardingPass(request: ScanBoardingPassRequest): Promise<ScanResult> {
    const startTime = Date.now();

    try {
      // Parse barcode data (IATA BCBP format)
      const bcbpData = this.parseBCBP(request.barcodeData);

      // Find boarding pass
      const boardingPass = await prisma.boardingPass.findUnique({
        where: { boardingPassNumber: request.boardingPassNumber },
      });

      if (!boardingPass) {
        return {
          success: false,
          validation: {
            isValid: false,
            status: 'INVALID_BARCODE',
            message: 'Boarding pass not found',
          },
          processingTime: Date.now() - startTime,
        };
      }

      // Validate boarding pass
      const validation = await this.validateBoardingPass(boardingPass, request.gateNumber);

      if (!validation.isValid) {
        // Create invalid scan record
        await prisma.boardingScan.create({
          data: {
            boardingPassId: boardingPass.id,
            scanTime: new Date(),
            scanType: 'BOARDING',
            scannedBy: request.scannedBy,
            gateNumber: request.gateNumber,
            scannerDevice: request.scannerDevice,
            isValid: false,
            validationStatus: validation.status as any,
            validationMessage: validation.message,
            processingTime: Date.now() - startTime,
          },
        });

        return {
          success: false,
          boardingPass,
          validation,
          processingTime: Date.now() - startTime,
        };
      }

      // Check for duplicate scan
      const duplicateCheck = await this.checkDuplicateScan(
        boardingPass.id,
        request.gateNumber
      );

      // Create scan record
      const scan = await prisma.boardingScan.create({
        data: {
          boardingPassId: boardingPass.id,
          scanTime: new Date(),
          scanType: 'BOARDING',
          scannedBy: request.scannedBy,
          gateNumber: request.gateNumber,
          scannerDevice: request.scannerDevice,
          isValid: true,
          validationStatus: 'VALID',
          processingTime: Date.now() - startTime,
          isDuplicate: duplicateCheck.isDuplicate,
          duplicateOf: duplicateCheck.originalScanId,
          duplicateInterval: duplicateCheck.intervalSeconds,
          seatVerified: config.boarding.seatVerification,
          expectedSeat: boardingPass.seatNumber,
          actualSeat: boardingPass.seatNumber,
        },
      });

      // Update boarding pass status
      await prisma.boardingPass.update({
        where: { id: boardingPass.id },
        data: {
          status: 'BOARDED',
          boardedAt: new Date(),
          boardedBy: request.scannedBy,
          boardingGate: request.gateNumber,
        },
      });

      // Update gate operation counts
      await this.updateGateOperationCounts(boardingPass.flightId, request.gateNumber);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        scan,
        boardingPass,
        validation: {
          isValid: true,
          status: 'VALID',
        },
        processingTime,
      };
    } catch (error) {
      console.error('Scan error:', error);
      throw error;
    }
  }

  /**
   * Parse IATA BCBP barcode data
   */
  private parseBCBP(barcodeData: string): any {
    // Simplified BCBP parser
    // Format: M1PASSENGER/FIRST          EABC123 JFKLAX AA 1234 123Y012A0001 148>5180 M0
    const bcbp = {
      formatCode: barcodeData.substring(0, 1),
      numberOfLegs: parseInt(barcodeData.substring(1, 2)),
      passengerName: barcodeData.substring(2, 22).trim(),
      pnrLocator: barcodeData.substring(23, 30).trim(),
      origin: barcodeData.substring(30, 33),
      destination: barcodeData.substring(33, 36),
      carrier: barcodeData.substring(36, 39).trim(),
      flightNumber: barcodeData.substring(39, 44).trim(),
      flightDate: barcodeData.substring(44, 47),
      compartmentCode: barcodeData.substring(47, 48),
      seatNumber: barcodeData.substring(48, 52).trim(),
      checkInSequence: barcodeData.substring(52, 57),
      passengerStatus: barcodeData.substring(57, 58),
    };

    return bcbp;
  }

  /**
   * Validate boarding pass
   */
  private async validateBoardingPass(
    boardingPass: any,
    gateNumber: string
  ): Promise<{ isValid: boolean; status: string; message?: string }> {
    // Check if already boarded
    if (boardingPass.status === 'BOARDED') {
      return {
        isValid: false,
        status: 'ALREADY_BOARDED',
        message: 'Passenger has already boarded',
      };
    }

    // Check if cancelled
    if (boardingPass.status === 'CANCELLED') {
      return {
        isValid: false,
        status: 'CANCELLED',
        message: 'Boarding pass has been cancelled',
      };
    }

    // Check if expired
    if (new Date(boardingPass.validUntil) < new Date()) {
      return {
        isValid: false,
        status: 'EXPIRED',
        message: 'Boarding pass has expired',
      };
    }

    // Check gate assignment
    const gateOp = await prisma.gateOperation.findFirst({
      where: {
        flightId: boardingPass.flightId,
        gateNumber,
      },
    });

    if (!gateOp) {
      return {
        isValid: false,
        status: 'WRONG_GATE',
        message: `Wrong gate. This flight is not assigned to gate ${gateNumber}`,
      };
    }

    return {
      isValid: true,
      status: 'VALID',
    };
  }

  /**
   * Check for duplicate scan
   */
  private async checkDuplicateScan(
    boardingPassId: string,
    gateNumber: string
  ): Promise<{ isDuplicate: boolean; originalScanId?: string; intervalSeconds?: number }> {
    if (!config.boarding.duplicatePrevention) {
      return { isDuplicate: false };
    }

    const recentScans = await prisma.boardingScan.findMany({
      where: {
        boardingPassId,
        gateNumber,
        scanTime: {
          gte: new Date(Date.now() - config.boarding.duplicateScanTimeout * 1000),
        },
      },
      orderBy: { scanTime: 'desc' },
      take: 1,
    });

    if (recentScans.length > 0) {
      const intervalSeconds = Math.floor(
        (Date.now() - new Date(recentScans[0].scanTime).getTime()) / 1000
      );

      return {
        isDuplicate: true,
        originalScanId: recentScans[0].id,
        intervalSeconds,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Update gate operation counts
   */
  private async updateGateOperationCounts(
    flightId: string,
    gateNumber: string
  ): Promise<void> {
    await prisma.gateOperation.updateMany({
      where: {
        flightId,
        gateNumber,
      },
      data: {
        boardedPassengers: { increment: 1 },
      },
    });
  }

  /**
   * Start boarding for a flight
   */
  async startBoarding(flightId: string, gateNumber: string, agentId: string): Promise<any> {
    const gateOp = await prisma.gateOperation.updateMany({
      where: {
        flightId,
        gateNumber,
      },
      data: {
        boardingStatus: 'GENERAL_BOARDING',
        boardingStartTime: new Date(),
      },
    });

    return gateOp;
  }

  /**
   * Complete boarding
   */
  async completeBoarding(flightId: string, gateNumber: string): Promise<any> {
    const gateOp = await prisma.gateOperation.updateMany({
      where: {
        flightId,
        gateNumber,
      },
      data: {
        boardingStatus: 'BOARDING_COMPLETE',
        boardingEndTime: new Date(),
      },
    });

    return gateOp;
  }

  /**
   * Get boarding statistics
   */
  async getBoardingStatistics(flightId: string): Promise<any> {
    const gateOp = await prisma.gateOperation.findFirst({
      where: { flightId },
    });

    if (!gateOp) {
      return null;
    }

    const scans = await prisma.boardingScan.findMany({
      where: {
        boardingPass: {
          flightId,
        },
      },
      orderBy: { scanTime: 'asc' },
    });

    const avgProcessingTime =
      scans.reduce((sum, scan) => sum + (scan.processingTime || 0), 0) / scans.length;

    const boardingDuration = gateOp.boardingStartTime && gateOp.boardingEndTime
      ? (new Date(gateOp.boardingEndTime).getTime() -
          new Date(gateOp.boardingStartTime).getTime()) /
        60000
      : null;

    return {
      totalPassengers: gateOp.totalPassengers,
      boardedPassengers: gateOp.boardedPassengers,
      boardingDuration,
      avgProcessingTime: Math.round(avgProcessingTime),
      boardingSpeed: boardingDuration
        ? gateOp.boardedPassengers / boardingDuration
        : null,
    };
  }
}

export const boardingService = new BoardingService();
