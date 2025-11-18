import Redis from 'ioredis';
import config from '../config';
import logger from './logger';

/**
 * Redis Client Singleton
 */
class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      RedisClient.instance.on('connect', () => {
        logger.info('Redis client connected');
      });

      RedisClient.instance.on('error', (error) => {
        logger.error('Redis client error', { error: error.message });
      });

      RedisClient.instance.on('close', () => {
        logger.warn('Redis client connection closed');
      });
    }

    return RedisClient.instance;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
      logger.info('Redis client disconnected');
    }
  }
}

export const redis = RedisClient.getInstance();

/**
 * Session storage helpers
 */
export const sessionStore = {
  /**
   * Store session data
   */
  async set(sessionId: string, data: any, ttl: number): Promise<void> {
    await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
  },

  /**
   * Get session data
   */
  async get(sessionId: string): Promise<any | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Delete session
   */
  async delete(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  },

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const sessions = await redis.smembers(`user:${userId}:sessions`);
    return sessions;
  },

  /**
   * Add session to user's session set
   */
  async addUserSession(userId: string, sessionId: string): Promise<void> {
    await redis.sadd(`user:${userId}:sessions`, sessionId);
  },

  /**
   * Remove session from user's session set
   */
  async removeUserSession(userId: string, sessionId: string): Promise<void> {
    await redis.srem(`user:${userId}:sessions`, sessionId);
  },

  /**
   * Delete all sessions for a user
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    const sessions = await sessionStore.getUserSessions(userId);
    const pipeline = redis.pipeline();

    sessions.forEach((sessionId) => {
      pipeline.del(`session:${sessionId}`);
    });

    pipeline.del(`user:${userId}:sessions`);
    await pipeline.exec();
  },
};

/**
 * Token blacklist helpers (for logout)
 */
export const tokenBlacklist = {
  /**
   * Add token to blacklist
   */
  async add(token: string, expiresIn: number): Promise<void> {
    await redis.setex(`blacklist:${token}`, expiresIn, '1');
  },

  /**
   * Check if token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const result = await redis.exists(`blacklist:${token}`);
    return result === 1;
  },
};

/**
 * Login attempt tracking
 */
export const loginAttempts = {
  /**
   * Increment login attempts
   */
  async increment(identifier: string): Promise<number> {
    const key = `login:attempts:${identifier}`;
    const attempts = await redis.incr(key);

    // Set expiry on first attempt
    if (attempts === 1) {
      await redis.expire(key, config.security.lockoutDuration / 1000);
    }

    return attempts;
  },

  /**
   * Get login attempts count
   */
  async get(identifier: string): Promise<number> {
    const attempts = await redis.get(`login:attempts:${identifier}`);
    return attempts ? parseInt(attempts, 10) : 0;
  },

  /**
   * Reset login attempts
   */
  async reset(identifier: string): Promise<void> {
    await redis.del(`login:attempts:${identifier}`);
  },

  /**
   * Check if account is locked
   */
  async isLocked(identifier: string): Promise<boolean> {
    const attempts = await loginAttempts.get(identifier);
    return attempts >= config.security.maxLoginAttempts;
  },

  /**
   * Get time until unlock
   */
  async getUnlockTime(identifier: string): Promise<number> {
    const ttl = await redis.ttl(`login:attempts:${identifier}`);
    return ttl > 0 ? ttl : 0;
  },
};

/**
 * Password reset token storage
 */
export const passwordResetTokens = {
  /**
   * Store password reset token
   */
  async set(token: string, userId: string): Promise<void> {
    await redis.setex(
      `password:reset:${token}`,
      config.security.passwordResetExpires / 1000,
      userId
    );
  },

  /**
   * Get user ID from reset token
   */
  async get(token: string): Promise<string | null> {
    return await redis.get(`password:reset:${token}`);
  },

  /**
   * Delete reset token
   */
  async delete(token: string): Promise<void> {
    await redis.del(`password:reset:${token}`);
  },
};

/**
 * OAuth authorization code storage
 */
export const oauthCodes = {
  /**
   * Store authorization code
   */
  async set(code: string, data: any): Promise<void> {
    await redis.setex(
      `oauth:code:${code}`,
      config.oauth.authorizationCodeExpiresIn,
      JSON.stringify(data)
    );
  },

  /**
   * Get and delete authorization code (single use)
   */
  async getAndDelete(code: string): Promise<any | null> {
    const data = await redis.get(`oauth:code:${code}`);
    if (data) {
      await redis.del(`oauth:code:${code}`);
      return JSON.parse(data);
    }
    return null;
  },
};

/**
 * API key usage tracking
 */
export const apiKeyUsage = {
  /**
   * Increment API key usage
   */
  async increment(apiKeyId: string): Promise<number> {
    const key = `api:usage:${apiKeyId}:${new Date().toISOString().split('T')[0]}`;
    const count = await redis.incr(key);

    // Expire after 90 days
    if (count === 1) {
      await redis.expire(key, 90 * 24 * 60 * 60);
    }

    return count;
  },

  /**
   * Get API key usage for today
   */
  async getToday(apiKeyId: string): Promise<number> {
    const key = `api:usage:${apiKeyId}:${new Date().toISOString().split('T')[0]}`;
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  },
};

export default redis;
