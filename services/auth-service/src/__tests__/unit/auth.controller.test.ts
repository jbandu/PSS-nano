/**
 * Unit Tests for Auth Controller
 *
 * Tests HTTP request handling and response formatting.
 */

import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { createMockRequest, createMockResponse, createMockNext } from '../../../../../test-setup/utils/test-helpers';
import { UnauthorizedError, ConflictError } from '@airline-ops/shared-utils';

// Mock AuthService
jest.mock('../../services/auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    authController = new AuthController();
    (authController as any).authService = mockAuthService;
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user and return 201', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      const mockResult = {
        user: {
          id: 'user-123',
          email: requestBody.email,
          firstName: requestBody.firstName,
          lastName: requestBody.lastName,
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        },
      };

      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.register = jest.fn().mockResolvedValue(mockResult);

      // Act
      await authController.register(req as any, res as any, next);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(requestBody);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        meta: { timestamp: expect.any(String) },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if registration fails', async () => {
      // Arrange
      const requestBody = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const error = new ConflictError('User already exists');
      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.register = jest.fn().mockRejectedValue(error);

      // Act
      await authController.register(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login and return user with tokens', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: 'user-123',
          email: requestBody.email,
          firstName: 'John',
          lastName: 'Doe',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        },
      };

      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.login = jest.fn().mockResolvedValue(mockResult);

      // Act
      await authController.login(req as any, res as any, next);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(requestBody);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        meta: { timestamp: expect.any(String) },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error for invalid credentials', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new UnauthorizedError('Invalid credentials');
      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.login = jest.fn().mockRejectedValue(error);

      // Act
      await authController.login(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens', async () => {
      // Arrange
      const requestBody = {
        refreshToken: 'valid-refresh-token',
      };

      const mockResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };

      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.refreshToken = jest.fn().mockResolvedValue(mockResult);

      // Act
      await authController.refresh(req as any, res as any, next);

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(requestBody);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        meta: { timestamp: expect.any(String) },
      });
    });

    it('should call next with error for invalid refresh token', async () => {
      // Arrange
      const requestBody = {
        refreshToken: 'invalid-token',
      };

      const error = new UnauthorizedError('Invalid refresh token');
      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.refreshToken = jest.fn().mockRejectedValue(error);

      // Act
      await authController.refresh(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      // Arrange
      const requestBody = {
        refreshToken: 'valid-refresh-token',
      };

      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.logout = jest.fn().mockResolvedValue(undefined);

      // Act
      await authController.logout(req as any, res as any, next);

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith(requestBody.refreshToken);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Logged out successfully' },
        meta: { timestamp: expect.any(String) },
      });
    });

    it('should call next with error if logout fails', async () => {
      // Arrange
      const requestBody = {
        refreshToken: 'token',
      };

      const error = new Error('Logout failed');
      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.logout = jest.fn().mockRejectedValue(error);

      // Act
      await authController.logout(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      // Arrange
      const requestBody = {
        token: 'verification-token',
      };

      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.verifyEmail = jest.fn().mockResolvedValue(undefined);

      // Act
      await authController.verifyEmail(req as any, res as any, next);

      // Assert
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(requestBody.token);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Email verified successfully' },
        meta: { timestamp: expect.any(String) },
      });
    });

    it('should call next with error if verification fails', async () => {
      // Arrange
      const requestBody = {
        token: 'invalid-token',
      };

      const error = new UnauthorizedError('Invalid verification token');
      const req = createMockRequest({ body: requestBody });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.verifyEmail = jest.fn().mockRejectedValue(error);

      // Act
      await authController.verifyEmail(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
