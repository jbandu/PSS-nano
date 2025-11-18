import { Request, Response } from 'express';
import { checkInService } from '../services/check-in.service';
import { logger } from '../utils/logger';

export class CheckInController {
  /**
   * Start check-in transaction
   */
  async startCheckIn(req: Request, res: Response): Promise<void> {
    try {
      const transaction = await checkInService.startCheckIn(req.body);
      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error('Check-in start failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start check-in',
      });
    }
  }

  /**
   * Check in passenger
   */
  async checkInPassenger(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const passenger = await checkInService.checkInPassenger(transactionId, req.body);
      res.status(201).json({
        success: true,
        data: passenger,
      });
    } catch (error) {
      logger.error('Passenger check-in failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check in passenger',
      });
    }
  }

  /**
   * Assign seat
   */
  async assignSeat(req: Request, res: Response): Promise<void> {
    try {
      const { passengerCheckInId } = req.params;
      const { flightId, seatNumber, seatType } = req.body;
      const passenger = await checkInService.assignSeat(
        passengerCheckInId,
        flightId,
        seatNumber,
        seatType
      );
      res.status(200).json({
        success: true,
        data: passenger,
      });
    } catch (error) {
      logger.error('Seat assignment failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign seat',
      });
    }
  }

  /**
   * Complete check-in
   */
  async completeCheckIn(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const transaction = await checkInService.completeCheckIn(transactionId);
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error('Check-in completion failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete check-in',
      });
    }
  }

  /**
   * Search passengers
   */
  async searchPassengers(req: Request, res: Response): Promise<void> {
    try {
      const passengers = await checkInService.searchPassengers(req.query);
      res.status(200).json({
        success: true,
        data: passengers,
      });
    } catch (error) {
      logger.error('Passenger search failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search passengers',
      });
    }
  }
}

export const checkInController = new CheckInController();
