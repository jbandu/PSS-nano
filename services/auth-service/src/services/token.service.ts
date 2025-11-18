import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { JWTPayload, TokenPair } from '../types';
import { InvalidTokenError } from '../utils/errors';
import { tokenBlacklist } from '../utils/redis';
import logger from '../utils/logger';

/**
 * Token Service
 * Handles JWT generation, validation, and refresh
 */
class TokenService {
  /**
   * Generate access and refresh tokens
   */
  generateTokenPair(payload: Omit<JWTPayload, 'type'>): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Extract expiry time from config
    const expiryMs = this.parseExpiry(config.jwt.accessExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(expiryMs / 1000), // Convert to seconds
    };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
    const accessPayload: JWTPayload = {
      ...payload,
      type: 'access',
    };

    return jwt.sign(accessPayload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
    const refreshPayload: JWTPayload = {
      ...payload,
      type: 'refresh',
      sessionId: payload.sessionId || uuidv4(),
    };

    return jwt.sign(refreshPayload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        throw new InvalidTokenError('Token has been revoked');
      }

      const payload = jwt.verify(token, config.jwt.accessSecret) as JWTPayload;

      if (payload.type !== 'access') {
        throw new InvalidTokenError('Invalid token type');
      }

      return payload;
    } catch (error: any) {
      if (error instanceof InvalidTokenError) {
        throw error;
      }

      if (error.name === 'TokenExpiredError') {
        throw new InvalidTokenError('Token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new InvalidTokenError('Invalid token');
      }

      logger.error('Token verification error', { error: error.message });
      throw new InvalidTokenError();
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        throw new InvalidTokenError('Token has been revoked');
      }

      const payload = jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;

      if (payload.type !== 'refresh') {
        throw new InvalidTokenError('Invalid token type');
      }

      return payload;
    } catch (error: any) {
      if (error instanceof InvalidTokenError) {
        throw error;
      }

      if (error.name === 'TokenExpiredError') {
        throw new InvalidTokenError('Refresh token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new InvalidTokenError('Invalid refresh token');
      }

      logger.error('Refresh token verification error', { error: error.message });
      throw new InvalidTokenError();
    }
  }

  /**
   * Blacklist token (for logout)
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await tokenBlacklist.add(token, expiresIn);
          logger.info('Token blacklisted', { userId: decoded.userId });
        }
      }
    } catch (error: any) {
      logger.error('Failed to blacklist token', { error: error.message });
    }
  }

  /**
   * Generate temporary token for 2FA verification
   */
  generateTempToken(userId: string, email: string): string {
    return jwt.sign(
      {
        userId,
        email,
        type: 'temp_2fa',
      },
      config.jwt.accessSecret,
      { expiresIn: '10m' } // Temp tokens expire in 10 minutes
    );
  }

  /**
   * Verify temporary 2FA token
   */
  verifyTempToken(token: string): { userId: string; email: string } {
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as any;

      if (payload.type !== 'temp_2fa') {
        throw new InvalidTokenError('Invalid token type');
      }

      return {
        userId: payload.userId,
        email: payload.email,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new InvalidTokenError('Verification session expired');
      }

      throw new InvalidTokenError('Invalid verification token');
    }
  }

  /**
   * Parse expiry string to milliseconds
   */
  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return parseInt(expiry, 10);
    }
  }
}

export const tokenService = new TokenService();
export default tokenService;
