import { Request, Response } from 'express';
import { baggageService } from '../services/baggage.service';
import { logger } from '../utils/logger';

export class BaggageController {
  /**
   * Issue baggage tag
   */
  async issueBaggageTag(req: Request, res: Response): Promise<void> {
    try {
      const baggageTag = await baggageService.issueBaggageTag(req.body);
      res.status(201).json({
        success: true,
        data: baggageTag,
      });
    } catch (error) {
      logger.error('Baggage tag issuance failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to issue baggage tag',
      });
    }
  }

  /**
   * Generate bag tag PDF
   */
  async generateBagTagPDF(req: Request, res: Response): Promise<void> {
    try {
      const { tagNumber } = req.params;
      const pdfBuffer = await baggageService.generateBagTagPDF(tagNumber);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="bag-tag-${tagNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Bag tag PDF generation failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate bag tag PDF',
      });
    }
  }

  /**
   * Update baggage status
   */
  async updateBaggageStatus(req: Request, res: Response): Promise<void> {
    try {
      const { tagNumber } = req.params;
      const { status, location } = req.body;
      const baggageTag = await baggageService.updateBaggageStatus(tagNumber, status, location);
      res.status(200).json({
        success: true,
        data: baggageTag,
      });
    } catch (error) {
      logger.error('Baggage status update failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update baggage status',
      });
    }
  }
}

export const baggageController = new BaggageController();
