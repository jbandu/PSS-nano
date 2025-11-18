import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config';
import { logger } from '../utils/logger';

export class SocketService {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HttpServer): void {
    if (!config.socketIo.enabled) {
      logger.info('Socket.IO is disabled');
      return;
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.socketIo.corsOrigin,
        credentials: true,
      },
      pingTimeout: config.socketIo.pingTimeout,
      pingInterval: config.socketIo.pingInterval,
    });

    this.io.on('connection', (socket) => {
      logger.info(`Socket client connected: ${socket.id}`);

      // Join flight-specific rooms
      socket.on('join:flight', (flightId: string) => {
        socket.join(`flight:${flightId}`);
        logger.info(`Socket ${socket.id} joined flight room: ${flightId}`);
      });

      // Leave flight room
      socket.on('leave:flight', (flightId: string) => {
        socket.leave(`flight:${flightId}`);
        logger.info(`Socket ${socket.id} left flight room: ${flightId}`);
      });

      // Join agent station room
      socket.on('join:station', (stationCode: string) => {
        socket.join(`station:${stationCode}`);
        logger.info(`Socket ${socket.id} joined station room: ${stationCode}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket client disconnected: ${socket.id}`);
      });
    });

    logger.info(`Socket.IO server initialized on port ${config.socketIo.port}`);
  }

  /**
   * Emit seat map update to all clients watching a flight
   */
  emitSeatMapUpdate(flightId: string, seatMap: any): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('seat:map:update', seatMap);
    logger.debug(`Emitted seat map update for flight ${flightId}`);
  }

  /**
   * Emit seat block event
   */
  emitSeatBlocked(flightId: string, seatNumber: string, agentId: string): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('seat:blocked', { seatNumber, agentId });
    logger.debug(`Emitted seat blocked event for ${seatNumber} on flight ${flightId}`);
  }

  /**
   * Emit seat release event
   */
  emitSeatReleased(flightId: string, seatNumber: string): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('seat:released', { seatNumber });
    logger.debug(`Emitted seat released event for ${seatNumber} on flight ${flightId}`);
  }

  /**
   * Emit seat assigned event
   */
  emitSeatAssigned(
    flightId: string,
    seatNumber: string,
    passengerId: string,
    passengerName: string
  ): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('seat:assigned', {
      seatNumber,
      passengerId,
      passengerName,
    });
    logger.debug(`Emitted seat assigned event for ${seatNumber} on flight ${flightId}`);
  }

  /**
   * Emit passenger checked in event
   */
  emitPassengerCheckedIn(flightId: string, passengerData: any): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('passenger:checked-in', passengerData);
    logger.debug(`Emitted passenger checked in event for flight ${flightId}`);
  }

  /**
   * Emit baggage tagged event
   */
  emitBaggageTagged(flightId: string, baggageData: any): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('baggage:tagged', baggageData);
    logger.debug(`Emitted baggage tagged event for flight ${flightId}`);
  }

  /**
   * Emit flight load update
   */
  emitFlightLoadUpdate(flightId: string, loadData: any): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('flight:load:update', loadData);
    logger.debug(`Emitted flight load update for flight ${flightId}`);
  }

  /**
   * Emit standby list update
   */
  emitStandbyListUpdate(flightId: string, standbyList: any[]): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('standby:update', standbyList);
    logger.debug(`Emitted standby list update for flight ${flightId}`);
  }

  /**
   * Emit general notification to station
   */
  emitStationNotification(stationCode: string, notification: any): void {
    if (!this.io) return;
    this.io.to(`station:${stationCode}`).emit('station:notification', notification);
    logger.debug(`Emitted station notification to ${stationCode}`);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();
