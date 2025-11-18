import prisma from '../utils/prisma';
import { apisLogger } from '../utils/logger';
import { config } from '../config';

export interface APISDataRequest {
  passengerCheckInId: string;
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  nationality: string;
  expiryDate: Date;
  dateOfBirth: Date;
  gender: string;
  placeOfBirth?: string;
  hasVisa?: boolean;
  visaNumber?: string;
  visaType?: string;
  visaIssuingCountry?: string;
  visaExpiryDate?: Date;
  redressNumber?: string;
  knownTravelerNumber?: string;
  destinationAddress?: string;
  destinationCity?: string;
  destinationCountry?: string;
}

export interface SecureFlightRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  dateOfBirth: Date;
  gender: string;
}

export class APISService {
  /**
   * Collect APIS data for passenger
   */
  async collectAPISData(request: APISDataRequest): Promise<any> {
    try {
      // Validate required fields
      this.validateAPISData(request);

      // Check Timatic if enabled
      let timaticResult = null;
      let requiresVisa = false;
      if (config.apis.timaticValidation) {
        const timatic = await this.checkTimatic(
          request.documentType,
          request.nationality,
          request.destinationCountry || ''
        );
        timaticResult = timatic.result;
        requiresVisa = timatic.requiresVisa;
      }

      // Create APIS data record
      const apisData = await prisma.aPISData.create({
        data: {
          passengerCheckInId: request.passengerCheckInId,
          documentType: request.documentType,
          documentNumber: request.documentNumber,
          issuingCountry: request.issuingCountry,
          nationality: request.nationality,
          expiryDate: request.expiryDate,
          dateOfBirth: request.dateOfBirth,
          gender: request.gender,
          placeOfBirth: request.placeOfBirth,
          hasVisa: request.hasVisa || false,
          visaNumber: request.visaNumber,
          visaType: request.visaType,
          visaIssuingCountry: request.visaIssuingCountry,
          visaExpiryDate: request.visaExpiryDate,
          redressNumber: request.redressNumber,
          knownTravelerNumber: request.knownTravelerNumber,
          destinationAddress: request.destinationAddress,
          destinationCity: request.destinationCity,
          destinationCountry: request.destinationCountry,
          timaticChecked: config.apis.timaticValidation,
          timaticResult,
          requiresVisa,
          screeningStatus: 'PENDING',
        },
      });

      // Update passenger status
      await prisma.passengerCheckIn.update({
        where: { id: request.passengerCheckInId },
        data: {
          apisStatus: 'COLLECTED',
        },
      });

      // Update transaction
      const passenger = await prisma.passengerCheckIn.findUnique({
        where: { id: request.passengerCheckInId },
      });

      if (passenger) {
        await prisma.checkInTransaction.update({
          where: { id: passenger.transactionId },
          data: {
            apisCollected: true,
          },
        });
      }

      // Perform watchlist screening if enabled
      if (config.screening.enabled) {
        await this.performScreening(apisData.id);
      }

      apisLogger.info('APIS data collected', {
        passengerCheckInId: request.passengerCheckInId,
        nationality: request.nationality,
        documentType: request.documentType,
      });

      return apisData;
    } catch (error) {
      apisLogger.error('Failed to collect APIS data', {
        passengerCheckInId: request.passengerCheckInId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Submit APIS to government systems
   */
  async submitAPIS(apisDataId: string): Promise<any> {
    try {
      const apisData = await prisma.aPISData.findUnique({
        where: { id: apisDataId },
        include: {
          passengerCheckIn: {
            include: { transaction: true },
          },
        },
      });

      if (!apisData) {
        throw new Error('APIS data not found');
      }

      // Submit to Secure Flight if enabled and route requires it
      if (config.government.secureFlight) {
        await this.submitSecureFlight(apisData);
      }

      // Submit to CARICOM IMPACS if enabled
      if (config.government.caricomImpacs) {
        await this.submitCaricomImpacs(apisData);
      }

      // Update APIS data
      const updated = await prisma.aPISData.update({
        where: { id: apisDataId },
        data: {
          submittedToAPIS: true,
          submittedAt: new Date(),
          apisConfirmationNumber: this.generateConfirmationNumber(),
        },
      });

      // Update passenger status
      await prisma.passengerCheckIn.update({
        where: { id: apisData.passengerCheckInId },
        data: {
          apisStatus: 'SUBMITTED',
        },
      });

      apisLogger.info('APIS submitted', {
        apisDataId,
        passengerCheckInId: apisData.passengerCheckInId,
      });

      return updated;
    } catch (error) {
      apisLogger.error('Failed to submit APIS', {
        apisDataId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Submit to US Secure Flight
   */
  private async submitSecureFlight(apisData: any): Promise<void> {
    try {
      const passenger = apisData.passengerCheckIn;

      // Create Secure Flight data
      const secureFlightData = await prisma.secureFlightData.create({
        data: {
          apisDataId: apisData.id,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          dateOfBirth: apisData.dateOfBirth,
          gender: apisData.gender,
        },
      });

      // TODO: Actually submit to DHS Secure Flight API
      // For now, simulate submission
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update with mock clearance
      await prisma.secureFlightData.update({
        where: { id: secureFlightData.id },
        data: {
          submitted: true,
          submittedAt: new Date(),
          confirmationNumber: this.generateConfirmationNumber(),
          clearanceStatus: 'CLEARED',
        },
      });

      apisLogger.info('Secure Flight submitted', {
        apisDataId: apisData.id,
      });
    } catch (error) {
      apisLogger.error('Failed to submit Secure Flight', {
        apisDataId: apisData.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Submit to CARICOM IMPACS
   */
  private async submitCaricomImpacs(apisData: any): Promise<void> {
    try {
      // TODO: Submit to CARICOM IMPACS system
      // For now, just mark as submitted
      await prisma.aPISData.update({
        where: { id: apisData.id },
        data: {
          caricomImpacs: true,
        },
      });

      apisLogger.info('CARICOM IMPACS submitted', {
        apisDataId: apisData.id,
      });
    } catch (error) {
      apisLogger.error('Failed to submit CARICOM IMPACS', {
        apisDataId: apisData.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Perform watchlist screening
   */
  private async performScreening(apisDataId: string): Promise<void> {
    try {
      const apisData = await prisma.aPISData.findUnique({
        where: { id: apisDataId },
        include: { passengerCheckIn: true },
      });

      if (!apisData) {
        throw new Error('APIS data not found');
      }

      // TODO: Actual watchlist screening
      // For now, simulate screening with random score
      const screeningScore = Math.random() * 100;

      let screeningStatus: any = 'CLEARED';
      if (screeningScore < config.screening.autoClearThreshold) {
        if (screeningScore < 50) {
          screeningStatus = 'MANUAL_REVIEW';
        } else if (screeningScore < 80) {
          screeningStatus = 'SELECTEE';
        }
      }

      await prisma.aPISData.update({
        where: { id: apisDataId },
        data: {
          screeningStatus,
          screeningScore,
          screeningClearedAt: screeningStatus === 'CLEARED' ? new Date() : null,
        },
      });

      apisLogger.info('Watchlist screening completed', {
        apisDataId,
        screeningStatus,
        screeningScore,
      });
    } catch (error) {
      apisLogger.error('Failed to perform screening', {
        apisDataId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check Timatic for visa requirements
   */
  private async checkTimatic(
    documentType: string,
    nationality: string,
    destination: string
  ): Promise<{ result: string; requiresVisa: boolean }> {
    try {
      // TODO: Integrate with actual Timatic API
      // For now, return mock data
      const requiresVisa = ['US', 'GB', 'AU', 'CA'].includes(destination) && nationality !== destination;

      return {
        result: requiresVisa ? 'Visa required' : 'No visa required',
        requiresVisa,
      };
    } catch (error) {
      apisLogger.error('Failed to check Timatic', {
        nationality,
        destination,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        result: 'Unable to verify',
        requiresVisa: false,
      };
    }
  }

  /**
   * Validate APIS data
   */
  private validateAPISData(request: APISDataRequest): void {
    const required = config.apis.mandatoryFields;

    for (const field of required) {
      if (field && !(request as any)[field]) {
        throw new Error(`Missing required APIS field: ${field}`);
      }
    }

    // Validate document expiry
    if (new Date(request.expiryDate) < new Date()) {
      throw new Error('Document has expired');
    }

    // Validate visa if required
    if (request.hasVisa && !request.visaNumber) {
      throw new Error('Visa number is required when visa is indicated');
    }
  }

  /**
   * Generate confirmation number
   */
  private generateConfirmationNumber(): string {
    return `APIS${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }

  /**
   * Process OCR data from passport scan
   */
  async processOCRData(passengerCheckInId: string, ocrData: any): Promise<any> {
    try {
      // Extract data from OCR result
      const extractedData = this.extractFromOCR(ocrData);

      // Create APIS data with OCR information
      const apisData = await this.collectAPISData({
        passengerCheckInId,
        ...extractedData,
        documentType: 'P', // Passport
      } as APISDataRequest);

      // Mark as OCR processed
      await prisma.aPISData.update({
        where: { id: apisData.id },
        data: {
          ocrProcessed: true,
          ocrConfidence: ocrData.confidence || 0,
          ocrRawData: ocrData,
        },
      });

      apisLogger.info('OCR data processed', {
        passengerCheckInId,
        confidence: ocrData.confidence,
      });

      return apisData;
    } catch (error) {
      apisLogger.error('Failed to process OCR data', {
        passengerCheckInId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Extract APIS data from OCR result
   */
  private extractFromOCR(ocrData: any): Partial<APISDataRequest> {
    // TODO: Implement actual OCR data extraction
    // This would parse MRZ (Machine Readable Zone) from passport
    return {
      documentNumber: ocrData.documentNumber || '',
      issuingCountry: ocrData.issuingCountry || '',
      nationality: ocrData.nationality || '',
      expiryDate: ocrData.expiryDate ? new Date(ocrData.expiryDate) : new Date(),
      dateOfBirth: ocrData.dateOfBirth ? new Date(ocrData.dateOfBirth) : new Date(),
      gender: ocrData.gender || 'M',
    };
  }
}

export const apisService = new APISService();
