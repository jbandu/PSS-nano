import { Request, Response } from 'express';
import { apisService } from '../services/apis.service';
import { logger } from '../utils/logger';

export class APISController {
  /**
   * Collect APIS data
   */
  async collectAPISData(req: Request, res: Response): Promise<void> {
    try {
      const apisData = await apisService.collectAPISData(req.body);
      res.status(201).json({
        success: true,
        data: apisData,
      });
    } catch (error) {
      logger.error('APIS data collection failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to collect APIS data',
      });
    }
  }

  /**
   * Submit APIS to government systems
   */
  async submitAPIS(req: Request, res: Response): Promise<void> {
    try {
      const { apisDataId } = req.params;
      const result = await apisService.submitAPIS(apisDataId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('APIS submission failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit APIS',
      });
    }
  }

  /**
   * Process OCR data from passport scan
   */
  async processOCRData(req: Request, res: Response): Promise<void> {
    try {
      const { passengerCheckInId } = req.params;
      const { ocrData } = req.body;
      const apisData = await apisService.processOCRData(passengerCheckInId, ocrData);
      res.status(200).json({
        success: true,
        data: apisData,
      });
    } catch (error) {
      logger.error('OCR processing failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process OCR data',
      });
    }
  }
}

export const apisController = new APISController();
