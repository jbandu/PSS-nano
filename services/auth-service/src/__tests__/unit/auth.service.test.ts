/**
 * Unit Tests for Auth Service
 *
 * Tests authentication logic including:
 * - User registration
 * - Login/logout
 * - Token generation and refresh
 * - Email verification
 */

import { AuthService } from '../../services/auth.service';
import { prisma } from '@airline-ops/database-schemas';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ConflictError, ValidationError } from '@airline-ops/shared-utils';

// Mock dependencies
jest.mock('@airline-ops/database-schemas', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 'user-123',
        email: registerData.email,
        password: hashedPassword,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phoneNumber: registerData.phoneNumber,
        role: 'USER',
        status: 'ACTIVE',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          password: hashedPassword,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phoneNumber: registerData.phoneNumber,
        },
      });
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe('mock-token');
    });

    it('should throw ConflictError if user already exists', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: registerData.email,
      });

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      // Arrange
      const hashedPassword = 'hashed_password';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: registerData.email,
        password: hashedPassword,
        role: 'USER',
      });
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Act
      await authService.register(registerData);

      // Assert
      expect(hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: hashedPassword,
          }),
        })
      );
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-123',
      email: loginData.email,
      password: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      status: 'ACTIVE',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined();
      expect(result.tokens).toBeDefined();
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedError if password is invalid', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedError if user account is not active', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: 'INACTIVE' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);
      (compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData)).rejects.toThrow('Account is not active');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token with valid refresh token', async () => {
      // Arrange
      const refreshTokenData = { refreshToken: 'valid-refresh-token' };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        status: 'ACTIVE',
      };

      (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser.id });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('new-token');

      // Act
      const result = await authService.refreshToken(refreshTokenData);

      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result.accessToken).toBe('new-token');
      expect(result.refreshToken).toBe('new-token');
    });

    it('should throw UnauthorizedError if refresh token is invalid', async () => {
      // Arrange
      const refreshTokenData = { refreshToken: 'invalid-token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      const refreshTokenData = { refreshToken: 'valid-token' };
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'non-existent' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should throw UnauthorizedError if user is not active', async () => {
      // Arrange
      const refreshTokenData = { refreshToken: 'valid-token' };
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        status: 'INACTIVE',
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout with valid refresh token', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';

      // Act & Assert
      await expect(authService.logout(refreshToken)).resolves.not.toThrow();
    });

    it('should throw ValidationError if refresh token is not provided', async () => {
      // Act & Assert
      await expect(authService.logout('')).rejects.toThrow(ValidationError);
      await expect(authService.logout('')).rejects.toThrow('Refresh token is required');
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      // Arrange
      const token = 'valid-verification-token';
      const userId = 'user-123';
      (jwt.verify as jest.Mock).mockReturnValue({ userId });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        emailVerified: true,
      });

      // Act & Assert
      await expect(authService.verifyEmail(token)).resolves.not.toThrow();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { emailVerified: true },
      });
    });

    it('should throw UnauthorizedError if verification token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.verifyEmail(token)).rejects.toThrow(UnauthorizedError);
      await expect(authService.verifyEmail(token)).rejects.toThrow(
        'Invalid verification token'
      );
    });
  });

  describe('Token Generation', () => {
    it('should generate both access and refresh tokens', async () => {
      // Arrange
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: registerData.email,
        role: 'USER',
      });
      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(jwt.sign).toHaveBeenCalledTimes(2); // Access + Refresh tokens
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.tokens.expiresIn).toBeDefined();
    });

    it('should include user info in token payload', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password: 'hashed',
        role: 'ADMIN',
        status: 'ACTIVE',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      await authService.login(loginData);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Password Sanitization', () => {
    it('should never return password in response', async () => {
      // Arrange
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: registerData.email,
        password: 'hashed_password',
        role: 'USER',
      });
      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(result.user.password).toBeUndefined();
      expect(result.user.email).toBe(registerData.email);
    });
  });
});
