import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  keyPrefix: config.redis.keyPrefix,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

// Helper functions for common DCS operations

export const seatCache = {
  /**
   * Get seat map for a flight
   */
  async getSeatMap(flightId: string): Promise<any | null> {
    const key = `seat:map:${flightId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Cache seat map
   */
  async setSeatMap(flightId: string, seatMap: any): Promise<void> {
    const key = `seat:map:${flightId}`;
    await redis.setex(key, config.seat.mapCacheTTL, JSON.stringify(seatMap));
  },

  /**
   * Block a seat temporarily
   */
  async blockSeat(
    flightId: string,
    seatNumber: string,
    agentId: string,
    passengerId?: string
  ): Promise<boolean> {
    const key = `seat:block:${flightId}:${seatNumber}`;
    const value = JSON.stringify({ agentId, passengerId, blockedAt: new Date() });
    const result = await redis.set(key, value, 'EX', config.seat.blockDuration * 60, 'NX');
    return result === 'OK';
  },

  /**
   * Release a seat block
   */
  async releaseSeat(flightId: string, seatNumber: string): Promise<void> {
    const key = `seat:block:${flightId}:${seatNumber}`;
    await redis.del(key);
  },

  /**
   * Check if seat is blocked
   */
  async isSeatBlocked(flightId: string, seatNumber: string): Promise<boolean> {
    const key = `seat:block:${flightId}:${seatNumber}`;
    const exists = await redis.exists(key);
    return exists === 1;
  },

  /**
   * Get all blocked seats for a flight
   */
  async getBlockedSeats(flightId: string): Promise<string[]> {
    const pattern = `${config.redis.keyPrefix}seat:block:${flightId}:*`;
    const keys = await redis.keys(pattern);
    return keys.map((key) => key.split(':').pop() || '');
  },
};

export const checkInCache = {
  /**
   * Cache PNR data
   */
  async cachePNR(pnrLocator: string, data: any): Promise<void> {
    const key = `pnr:${pnrLocator}`;
    await redis.setex(key, 3600, JSON.stringify(data)); // 1 hour cache
  },

  /**
   * Get cached PNR
   */
  async getPNR(pnrLocator: string): Promise<any | null> {
    const key = `pnr:${pnrLocator}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Start a check-in transaction
   */
  async startTransaction(transactionId: string, data: any): Promise<void> {
    const key = `transaction:${transactionId}`;
    await redis.setex(key, config.checkIn.timeoutSeconds, JSON.stringify(data));
  },

  /**
   * Update transaction
   */
  async updateTransaction(transactionId: string, data: any): Promise<void> {
    const key = `transaction:${transactionId}`;
    const ttl = await redis.ttl(key);
    if (ttl > 0) {
      await redis.setex(key, ttl, JSON.stringify(data));
    }
  },

  /**
   * Get transaction
   */
  async getTransaction(transactionId: string): Promise<any | null> {
    const key = `transaction:${transactionId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Complete and remove transaction
   */
  async completeTransaction(transactionId: string): Promise<void> {
    const key = `transaction:${transactionId}`;
    await redis.del(key);
  },
};

export const flightCache = {
  /**
   * Cache flight details
   */
  async cacheFlight(flightId: string, data: any): Promise<void> {
    const key = `flight:${flightId}`;
    await redis.setex(key, 3600, JSON.stringify(data)); // 1 hour cache
  },

  /**
   * Get cached flight
   */
  async getFlight(flightId: string): Promise<any | null> {
    const key = `flight:${flightId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Get flight load statistics
   */
  async getFlightLoad(flightId: string): Promise<any | null> {
    const key = `flight:load:${flightId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Update flight load statistics
   */
  async updateFlightLoad(flightId: string, load: any): Promise<void> {
    const key = `flight:load:${flightId}`;
    await redis.setex(key, 7200, JSON.stringify(load)); // 2 hour cache
  },
};

export const agentCache = {
  /**
   * Track active agent session
   */
  async startSession(sessionId: string, agentData: any): Promise<void> {
    const key = `agent:session:${sessionId}`;
    await redis.setex(key, 28800, JSON.stringify(agentData)); // 8 hours
  },

  /**
   * Get agent session
   */
  async getSession(sessionId: string): Promise<any | null> {
    const key = `agent:session:${sessionId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  /**
   * End agent session
   */
  async endSession(sessionId: string): Promise<void> {
    const key = `agent:session:${sessionId}`;
    await redis.del(key);
  },
};

export const baggageCache = {
  /**
   * Generate unique bag tag number
   */
  async generateBagTagNumber(): Promise<string> {
    const key = 'baggage:tag:counter';
    const counter = await redis.incr(key);
    const tagNumber = `${config.baggage.tagPrefix}${counter.toString().padStart(config.baggage.tagLength - config.baggage.tagPrefix.length, '0')}`;
    return tagNumber;
  },

  /**
   * Cache bag tag data
   */
  async cacheBagTag(tagNumber: string, data: any): Promise<void> {
    const key = `baggage:tag:${tagNumber}`;
    await redis.setex(key, 86400, JSON.stringify(data)); // 24 hours
  },
};

export default redis;
