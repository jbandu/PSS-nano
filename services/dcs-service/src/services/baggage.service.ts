import prisma from '../utils/prisma';
import { baggageCache } from '../utils/redis';
import { socketService } from './socket.service';
import { baggageLogger } from '../utils/logger';
import { config } from '../config';
import PDFDocument from 'pdfkit';

export interface BaggageTagRequest {
  passengerCheckInId: string;
  flightId: string;
  weight: number;
  weightUnit?: string;
  pieceCount?: number;
  baggageType?: string;
  origin: string;
  destination: string;
  connections?: string[];
  isOverweight?: boolean;
  isOversized?: boolean;
  isFragile?: boolean;
  isPriority?: boolean;
  specialHandlingCodes?: string[];
}

export class BaggageService {
  /**
   * Create and issue baggage tag
   */
  async issueBaggageTag(request: BaggageTagRequest): Promise<any> {
    try {
      // Generate unique tag number
      const tagNumber = await baggageCache.generateBagTagNumber();

      // Get passenger details
      const passenger = await prisma.passengerCheckIn.findUnique({
        where: { id: request.passengerCheckInId },
        include: { transaction: true },
      });

      if (!passenger) {
        throw new Error('Passenger not found');
      }

      // Determine sequence number
      const existingBags = await prisma.baggageTag.count({
        where: { passengerCheckInId: request.passengerCheckInId },
      });

      // Calculate fees
      const excessBaggageFee = this.calculateBaggageFee(
        passenger.cabinClass,
        existingBags + 1,
        request.weight,
        request.isOverweight || false
      );

      // Create baggage tag record
      const baggageTag = await prisma.baggageTag.create({
        data: {
          passengerCheckInId: request.passengerCheckInId,
          tagNumber,
          sequenceNumber: existingBags + 1,
          weight: request.weight,
          weightUnit: request.weightUnit || 'KG',
          pieceCount: request.pieceCount || 1,
          baggageType: (request.baggageType as any) || 'CHECKED',
          origin: request.origin,
          destination: request.destination,
          connections: request.connections || [],
          status: 'CHECKED_IN',
          isOverweight: request.isOverweight || false,
          isOversized: request.isOversized || false,
          isFragile: request.isFragile || false,
          isPriority: request.isPriority || false,
          specialHandlingCodes: request.specialHandlingCodes || [],
          excessBaggageFee,
          feePaid: excessBaggageFee === 0,
        },
      });

      // Update passenger's total bags and weight
      await prisma.passengerCheckIn.update({
        where: { id: request.passengerCheckInId },
        data: {
          totalBags: { increment: 1 },
          totalWeight: { increment: request.weight },
        },
      });

      // Update transaction
      await prisma.checkInTransaction.update({
        where: { id: passenger.transactionId },
        data: {
          baggageProcessed: true,
          feesCollected: { increment: excessBaggageFee },
        },
      });

      // Update agent session
      await this.updateAgentBaggageStats(passenger.transaction.agentId, 1);

      // Send BSM if enabled
      if (config.baggage.bsmEnabled) {
        await this.sendBSM(baggageTag.id);
      }

      // Cache tag data
      await baggageCache.cacheBagTag(tagNumber, baggageTag);

      // Emit event
      socketService.emitBaggageTagged(request.flightId, {
        tagNumber,
        passenger: `${passenger.firstName} ${passenger.lastName}`,
        weight: request.weight,
        destination: request.destination,
      });

      baggageLogger.info('Baggage tag issued', {
        tagNumber,
        passengerCheckInId: request.passengerCheckInId,
        weight: request.weight,
        destination: request.destination,
        fee: excessBaggageFee,
      });

      return baggageTag;
    } catch (error) {
      baggageLogger.error('Failed to issue baggage tag', {
        passengerCheckInId: request.passengerCheckInId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate bag tag PDF
   */
  async generateBagTagPDF(tagNumber: string): Promise<Buffer> {
    try {
      const baggageTag = await prisma.baggageTag.findUnique({
        where: { tagNumber },
        include: {
          passengerCheckIn: {
            include: { transaction: true },
          },
        },
      });

      if (!baggageTag) {
        throw new Error('Baggage tag not found');
      }

      const passenger = baggageTag.passengerCheckIn;

      // Create PDF
      const doc = new PDFDocument({ size: [288, 432] }); // 4x6 inches at 72 DPI
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));

      // Header
      doc.fontSize(16).text('BAGGAGE TAG', { align: 'center' });
      doc.moveDown();

      // Tag number (large)
      doc.fontSize(24).text(tagNumber, { align: 'center' });
      doc.moveDown();

      // Passenger name
      doc.fontSize(12).text(`${passenger.firstName} ${passenger.lastName}`, { align: 'center' });
      doc.moveDown(0.5);

      // Flight info
      doc.fontSize(10);
      doc.text(`Flight: ${passenger.transaction.flightId}`);
      doc.text(`PNR: ${passenger.transaction.pnrLocator}`);
      doc.text(`Seat: ${passenger.seatNumber || 'N/A'}`);
      doc.moveDown();

      // Routing
      doc.text(`From: ${baggageTag.origin}`);
      doc.text(`To: ${baggageTag.destination}`);
      if (baggageTag.connections.length > 0) {
        doc.text(`Via: ${baggageTag.connections.join(', ')}`);
      }
      doc.moveDown();

      // Bag details
      doc.text(`Bag ${baggageTag.sequenceNumber} of ${passenger.totalBags}`);
      doc.text(`Weight: ${baggageTag.weight} ${baggageTag.weightUnit}`);
      doc.moveDown();

      // Special handling codes
      if (baggageTag.specialHandlingCodes.length > 0) {
        doc.fontSize(12).text('SPECIAL HANDLING:', { underline: true });
        doc.fontSize(10).text(baggageTag.specialHandlingCodes.join(', '));
      }

      if (baggageTag.isFragile) {
        doc.fontSize(14).fillColor('red').text('FRAGILE', { align: 'center' });
        doc.fillColor('black');
      }

      if (baggageTag.isPriority) {
        doc.fontSize(14).fillColor('blue').text('PRIORITY', { align: 'center' });
        doc.fillColor('black');
      }

      // TODO: Add PDF417 barcode
      // This would require a barcode generation library
      doc.moveDown();
      doc.fontSize(8).text(`Barcode: ${tagNumber}`, { align: 'center' });

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', reject);
      });
    } catch (error) {
      baggageLogger.error('Failed to generate bag tag PDF', {
        tagNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Track baggage status
   */
  async updateBaggageStatus(tagNumber: string, status: string, location?: string): Promise<any> {
    try {
      const baggageTag = await prisma.baggageTag.update({
        where: { tagNumber },
        data: {
          status: status as any,
          currentLocation: location,
          scannedAt: { push: new Date() },
        },
      });

      baggageLogger.info('Baggage status updated', {
        tagNumber,
        status,
        location,
      });

      return baggageTag;
    } catch (error) {
      baggageLogger.error('Failed to update baggage status', {
        tagNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Send BSM (Baggage Source Message)
   */
  private async sendBSM(baggageTagId: string): Promise<void> {
    try {
      const baggageTag = await prisma.baggageTag.findUnique({
        where: { id: baggageTagId },
        include: {
          passengerCheckIn: {
            include: { transaction: true },
          },
        },
      });

      if (!baggageTag) {
        throw new Error('Baggage tag not found');
      }

      // Generate BSM message (simplified)
      const bsmMessage = this.generateBSMMessage(baggageTag);

      // TODO: Send BSM to baggage handling system
      // For now, just log it
      baggageLogger.info('BSM generated', {
        tagNumber: baggageTag.tagNumber,
        bsm: bsmMessage,
      });

      // Update record
      await prisma.baggageTag.update({
        where: { id: baggageTagId },
        data: {
          bsmSent: true,
          bsmSentAt: new Date(),
        },
      });
    } catch (error) {
      baggageLogger.error('Failed to send BSM', {
        baggageTagId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate BSM message (IATA format)
   */
  private generateBSMMessage(baggageTag: any): string {
    const passenger = baggageTag.passengerCheckIn;
    const transaction = passenger.transaction;

    // Simplified BSM format
    const bsm = [
      'BSM',
      baggageTag.tagNumber,
      `${passenger.lastName}/${passenger.firstName}`,
      transaction.pnrLocator,
      transaction.flightId,
      `${baggageTag.origin}${baggageTag.destination}`,
      `${baggageTag.weight}${baggageTag.weightUnit}`,
      baggageTag.sequenceNumber,
      new Date().toISOString(),
    ].join('/');

    return bsm;
  }

  /**
   * Calculate baggage fee
   */
  private calculateBaggageFee(
    cabinClass: string,
    bagNumber: number,
    weight: number,
    isOverweight: boolean
  ): number {
    let fee = 0;

    // Get allowance based on cabin class
    const allowance =
      config.baggage.allowance[cabinClass.toLowerCase() as keyof typeof config.baggage.allowance] ||
      config.baggage.allowance.economy;

    // Excess bag fee (example: $50 per bag over allowance)
    if (bagNumber > allowance) {
      fee += 50;
    }

    // Overweight fee
    if (isOverweight || weight > config.baggage.maxWeight.kg) {
      fee += config.baggage.heavyBagFee;
    }

    return fee;
  }

  /**
   * Update agent baggage statistics
   */
  private async updateAgentBaggageStats(agentId: string, bagsProcessed: number): Promise<void> {
    try {
      await prisma.agentSession.updateMany({
        where: {
          agentId,
          isActive: true,
        },
        data: {
          bagsProcessed: { increment: bagsProcessed },
        },
      });
    } catch (error) {
      baggageLogger.error('Failed to update agent baggage stats', {
        agentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const baggageService = new BaggageService();
