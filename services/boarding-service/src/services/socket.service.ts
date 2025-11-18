import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config';

export class SocketService {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HttpServer): void {
    if (!config.socketIo.enabled) {
      console.log('Socket.IO is disabled');
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
      console.log(`Socket client connected: ${socket.id}`);

      // Join flight room
      socket.on('join:flight', (flightId: string) => {
        socket.join(`flight:${flightId}`);
        console.log(`Socket ${socket.id} joined flight room: ${flightId}`);
      });

      // Join gate room
      socket.on('join:gate', (gateNumber: string) => {
        socket.join(`gate:${gateNumber}`);
        console.log(`Socket ${socket.id} joined gate room: ${gateNumber}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket client disconnected: ${socket.id}`);
      });
    });

    console.log(`Socket.IO server initialized on port ${config.socketIo.port}`);
  }

  /**
   * Emit boarding scan event
   */
  emitBoardingScan(flightId: string, scanData: any): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('boarding:scan', scanData);
  }

  /**
   * Emit boarding status update
   */
  emitBoardingStatus(flightId: string, status: any): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('boarding:status', status);
  }

  /**
   * Emit gate statistics update
   */
  emitGateStatistics(gateNumber: string, stats: any): void {
    if (!this.io) return;
    this.io.to(`gate:${gateNumber}`).emit('gate:statistics', stats);
  }

  /**
   * Emit boarding zone announcement
   */
  emitZoneAnnouncement(flightId: string, zone: any): void {
    if (!this.io) return;
    this.io.to(`flight:${flightId}`).emit('boarding:zone', zone);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();
