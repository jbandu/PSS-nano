/**
 * Unit Tests for Token Service
 *
 * Tests token generation, verification, and blacklisting.
 */

import jwt from 'jsonwebtoken';
import { tokenService } from '../../services/token.service';
import { InvalidTokenError } from '../../utils/errors';
import { tokenBlacklist } from '../../utils/redis';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../utils/redis', () => ({
  tokenBlacklist: {
    isBlacklisted: jest.fn(),
    add: jest.fn(),
  },
}));
jest.mock('../../utils/logger');

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Act
      const result = tokenService.generateTokenPair(payload);

      // Assert
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.expiresIn).toBeGreaterThan(0);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });

    it('should include correct payload in access token', () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
      };

      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      tokenService.generateTokenPair(payload);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          type: 'access',
        }),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should include correct payload in refresh token', () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      tokenService.generateTokenPair(payload);

      // Assert
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          type: 'refresh',
          sessionId: expect.any(String),
        }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should successfully verify a valid access token', async () => {
      // Arrange
      const token = 'valid-access-token';
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        type: 'access',
      };

      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(false);
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      // Act
      const result = await tokenService.verifyAccessToken(token);

      // Assert
      expect(tokenBlacklist.isBlacklisted).toHaveBeenCalledWith(token);
      expect(jwt.verify).toHaveBeenCalled();
      expect(result).toEqual(payload);
    });

    it('should throw InvalidTokenError if token is blacklisted', async () => {
      // Arrange
      const token = 'blacklisted-token';
      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow(InvalidTokenError);
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow(
        'Token has been revoked'
      );
    });

    it('should throw InvalidTokenError if token type is not access', async () => {
      // Arrange
      const token = 'refresh-token';
      const payload = {
        userId: 'user-123',
        type: 'refresh',
      };

      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(false);
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      // Act & Assert
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow(InvalidTokenError);
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow(
        'Invalid token type'
      );
    });

    it('should throw InvalidTokenError if token is expired', async () => {
      // Arrange
      const token = 'expired-token';
      const error: any = new Error('Token expired');
      error.name = 'TokenExpiredError';

      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(false);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow(InvalidTokenError);
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow('Token has expired');
    });

    it('should throw InvalidTokenError if token is malformed', async () => {
      // Arrange
      const token = 'malformed-token';
      const error: any = new Error('Malformed token');
      error.name = 'JsonWebTokenError';

      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(false);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow(InvalidTokenError);
      await expect(tokenService.verifyAccessToken(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should successfully verify a valid refresh token', async () => {
      // Arrange
      const token = 'valid-refresh-token';
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        type: 'refresh',
      };

      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(false);
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      // Act
      const result = await tokenService.verifyRefreshToken(token);

      // Assert
      expect(result).toEqual(payload);
    });

    it('should throw InvalidTokenError if refresh token is blacklisted', async () => {
      // Arrange
      const token = 'blacklisted-refresh-token';
      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(tokenService.verifyRefreshToken(token)).rejects.toThrow(InvalidTokenError);
      await expect(tokenService.verifyRefreshToken(token)).rejects.toThrow(
        'Token has been revoked'
      );
    });

    it('should throw InvalidTokenError if token type is not refresh', async () => {
      // Arrange
      const token = 'access-token';
      const payload = {
        userId: 'user-123',
        type: 'access',
      };

      (tokenBlacklist.isBlacklisted as jest.Mock).mockResolvedValue(false);
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      // Act & Assert
      await expect(tokenService.verifyRefreshToken(token)).rejects.toThrow(InvalidTokenError);
      await expect(tokenService.verifyRefreshToken(token)).rejects.toThrow(
        'Invalid token type'
      );
    });
  });

  describe('blacklistToken', () => {
    it('should add token to blacklist with correct TTL', async () => {
      // Arrange
      const token = 'token-to-blacklist';
      const expiresIn = 3600;
      const decoded = {
        userId: 'user-123',
        exp: Math.floor(Date.now() / 1000) + expiresIn,
      };

      (jwt.decode as jest.Mock).mockReturnValue(decoded);

      // Act
      await tokenService.blacklistToken(token);

      // Assert
      expect(jwt.decode).toHaveBeenCalledWith(token);
      expect(tokenBlacklist.add).toHaveBeenCalledWith(
        token,
        expect.any(Number)
      );
    });

    it('should not add expired token to blacklist', async () => {
      // Arrange
      const token = 'expired-token';
      const decoded = {
        userId: 'user-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      (jwt.decode as jest.Mock).mockReturnValue(decoded);

      // Act
      await tokenService.blacklistToken(token);

      // Assert
      expect(tokenBlacklist.add).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const token = 'token';
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error('Decode error');
      });

      // Act & Assert
      await expect(tokenService.blacklistToken(token)).resolves.not.toThrow();
    });
  });

  describe('generateTempToken', () => {
    it('should generate a temporary 2FA token', () => {
      // Arrange
      const userId = 'user-123';
      const email = 'test@example.com';
      (jwt.sign as jest.Mock).mockReturnValue('temp-token');

      // Act
      const result = tokenService.generateTempToken(userId, email);

      // Assert
      expect(result).toBe('temp-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId,
          email,
          type: 'temp_2fa',
        },
        expect.any(String),
        { expiresIn: '10m' }
      );
    });
  });

  describe('verifyTempToken', () => {
    it('should successfully verify a valid temp token', () => {
      // Arrange
      const token = 'valid-temp-token';
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        type: 'temp_2fa',
      };

      (jwt.verify as jest.Mock).mockReturnValue(payload);

      // Act
      const result = tokenService.verifyTempToken(token);

      // Assert
      expect(result.userId).toBe(payload.userId);
      expect(result.email).toBe(payload.email);
    });

    it('should throw InvalidTokenError if token type is not temp_2fa', () => {
      // Arrange
      const token = 'wrong-type-token';
      const payload = {
        userId: 'user-123',
        type: 'access',
      };

      (jwt.verify as jest.Mock).mockReturnValue(payload);

      // Act & Assert
      expect(() => tokenService.verifyTempToken(token)).toThrow(InvalidTokenError);
      expect(() => tokenService.verifyTempToken(token)).toThrow('Invalid token type');
    });

    it('should throw InvalidTokenError if token is expired', () => {
      // Arrange
      const token = 'expired-token';
      const error: any = new Error('Token expired');
      error.name = 'TokenExpiredError';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => tokenService.verifyTempToken(token)).toThrow(InvalidTokenError);
      expect(() => tokenService.verifyTempToken(token)).toThrow('Verification session expired');
    });
  });
});
