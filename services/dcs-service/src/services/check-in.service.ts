import prisma from '../utils/prisma';
import { checkInCache, seatCache } from '../utils/redis';
import { socketService } from './socket.service';
import { checkInLogger } from '../utils/logger';
import { config } from '../config';

export interface CheckInRequest {
  pnrLocator: string;
  flightId: string;
  agentId: string;
  agentName: string;
  stationCode: string;
  passengers: PassengerCheckInData[];
  deviceId?: string;
  ipAddress?: string;
}

export interface PassengerCheckInData {
  passengerId: string;
  firstName: string;
  lastName: string;
  title?: string;
  passengerType: string;
  sequenceNumber: number;
  ticketNumber?: string;
  frequentFlyerNumber?: string;
  frequentFlyerTier?: string;
  cabinClass: string;
  seatNumber?: string;
  ssrCodes?: string[];
}

export class CheckInService {
  /**
   * Start a new check-in transaction
   */
  async startCheckIn(request: CheckInRequest): Promise<any> {
    const startTime = Date.now();

    try {
      // Validate check-in window
      await this.validateCheckInWindow(request.flightId);

      // Create transaction record
      const transaction = await prisma.checkInTransaction.create({
        data: {
          pnrLocator: request.pnrLocator,
          flightId: request.flightId,
          agentId: request.agentId,
          agentName: request.agentName,
          stationCode: request.stationCode,
          transactionType: 'AGENT',
          status: 'IN_PROGRESS',
          totalPassengers: request.passengers.length,
          deviceId: request.deviceId,
          ipAddress: request.ipAddress,
        },
      });

      // Cache transaction
      await checkInCache.startTransaction(transaction.id, {
        ...request,
        transactionId: transaction.id,
        startTime,
      });

      checkInLogger.info('Check-in transaction started', {
        transactionId: transaction.id,
        pnrLocator: request.pnrLocator,
        flightId: request.flightId,
        passengerCount: request.passengers.length,
      });

      return transaction;
    } catch (error) {
      checkInLogger.error('Failed to start check-in', {
        pnrLocator: request.pnrLocator,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Process passenger check-in
   */
  async checkInPassenger(
    transactionId: string,
    passengerData: PassengerCheckInData
  ): Promise<any> {
    try {
      const passenger = await prisma.passengerCheckIn.create({
        data: {
          transactionId,
          passengerId: passengerData.passengerId,
          passengerType: passengerData.passengerType,
          firstName: passengerData.firstName,
          lastName: passengerData.lastName,
          title: passengerData.title,
          sequenceNumber: passengerData.sequenceNumber,
          ticketNumber: passengerData.ticketNumber,
          frequentFlyerNumber: passengerData.frequentFlyerNumber,
          frequentFlyerTier: passengerData.frequentFlyerTier,
          cabinClass: passengerData.cabinClass,
          seatNumber: passengerData.seatNumber,
          ssrCodes: passengerData.ssrCodes || [],
          checkInStatus: 'CHECKED_IN',
          apisStatus: this.determineAPISStatus(passengerData),
        },
      });

      // Emit event
      const transaction = await prisma.checkInTransaction.findUnique({
        where: { id: transactionId },
      });

      if (transaction) {
        socketService.emitPassengerCheckedIn(transaction.flightId, {
          transactionId,
          passenger: {
            id: passenger.id,
            name: `${passenger.firstName} ${passenger.lastName}`,
            seatNumber: passenger.seatNumber,
          },
        });
      }

      checkInLogger.info('Passenger checked in', {
        transactionId,
        passengerId: passenger.passengerId,
        seatNumber: passenger.seatNumber,
      });

      return passenger;
    } catch (error) {
      checkInLogger.error('Failed to check in passenger', {
        transactionId,
        passengerId: passengerData.passengerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Assign seat to passenger
   */
  async assignSeat(
    passengerCheckInId: string,
    flightId: string,
    seatNumber: string,
    seatType?: string
  ): Promise<any> {
    try {
      // Check if seat is available
      const isBlocked = await seatCache.isSeatBlocked(flightId, seatNumber);
      if (isBlocked) {
        throw new Error('Seat is currently blocked');
      }

      // Update passenger
      const passenger = await prisma.passengerCheckIn.update({
        where: { id: passengerCheckInId },
        data: {
          seatNumber,
          seatType: seatType as any,
          seatAssignedAt: new Date(),
        },
      });

      // Block the seat temporarily
      await seatCache.blockSeat(flightId, seatNumber, 'system', passenger.passengerId);

      // Emit seat assigned event
      socketService.emitSeatAssigned(
        flightId,
        seatNumber,
        passenger.passengerId,
        `${passenger.firstName} ${passenger.lastName}`
      );

      checkInLogger.info('Seat assigned', {
        passengerCheckInId,
        flightId,
        seatNumber,
      });

      return passenger;
    } catch (error) {
      checkInLogger.error('Failed to assign seat', {
        passengerCheckInId,
        seatNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Complete check-in transaction
   */
  async completeCheckIn(transactionId: string): Promise<any> {
    try {
      const cachedTransaction = await checkInCache.getTransaction(transactionId);
      const startTime = cachedTransaction?.startTime || Date.now();
      const duration = Math.floor((Date.now() - startTime) / 1000);

      const transaction = await prisma.checkInTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          completedTime: new Date(),
          checkInDuration: duration,
        },
        include: {
          passengers: true,
        },
      });

      // Update flight load
      await this.updateFlightLoad(transaction.flightId, transaction.passengers.length);

      // Clean up cache
      await checkInCache.completeTransaction(transactionId);

      // Update agent session stats
      await this.updateAgentStats(transaction.agentId, transaction.passengers.length);

      checkInLogger.info('Check-in completed', {
        transactionId,
        duration,
        passengerCount: transaction.passengers.length,
        targetTime: config.performance.targetCheckInTime,
        metTarget: duration <= config.performance.targetCheckInTime,
      });

      return transaction;
    } catch (error) {
      checkInLogger.error('Failed to complete check-in', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Search passengers
   */
  async searchPassengers(query: {
    pnrLocator?: string;
    lastName?: string;
    frequentFlyerNumber?: string;
    flightId?: string;
  }): Promise<any[]> {
    try {
      const where: any = {};

      if (query.pnrLocator) {
        where.transaction = { pnrLocator: { contains: query.pnrLocator, mode: 'insensitive' } };
      }

      if (query.lastName) {
        where.lastName = { contains: query.lastName, mode: 'insensitive' };
      }

      if (query.frequentFlyerNumber) {
        where.frequentFlyerNumber = query.frequentFlyerNumber;
      }

      if (query.flightId) {
        where.transaction = { ...where.transaction, flightId: query.flightId };
      }

      const passengers = await prisma.passengerCheckIn.findMany({
        where,
        include: {
          transaction: true,
          baggageTags: true,
          apisData: true,
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      return passengers;
    } catch (error) {
      checkInLogger.error('Failed to search passengers', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validate check-in window
   */
  private async validateCheckInWindow(flightId: string): Promise<void> {
    // TODO: Integrate with flight schedule service
    // For now, basic validation
    checkInLogger.debug('Validating check-in window', { flightId });
  }

  /**
   * Determine if APIS is required for passenger
   */
  private determineAPISStatus(passengerData: PassengerCheckInData): any {
    // TODO: Check route and determine if APIS is required
    return 'NOT_REQUIRED';
  }

  /**
   * Update flight load statistics
   */
  private async updateFlightLoad(flightId: string, passengerCount: number): Promise<void> {
    try {
      const load = await prisma.flightLoad.upsert({
        where: { flightId },
        create: {
          flightId,
          checkedInPassengers: passengerCount,
          totalPassengers: passengerCount,
        },
        update: {
          checkedInPassengers: { increment: passengerCount },
        },
      });

      // Emit update
      socketService.emitFlightLoadUpdate(flightId, load);
    } catch (error) {
      checkInLogger.error('Failed to update flight load', {
        flightId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update agent session statistics
   */
  private async updateAgentStats(agentId: string, passengerCount: number): Promise<void> {
    try {
      await prisma.agentSession.updateMany({
        where: {
          agentId,
          isActive: true,
        },
        data: {
          checkInsProcessed: { increment: 1 },
          passengersProcessed: { increment: passengerCount },
        },
      });
    } catch (error) {
      checkInLogger.error('Failed to update agent stats', {
        agentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const checkInService = new CheckInService();
