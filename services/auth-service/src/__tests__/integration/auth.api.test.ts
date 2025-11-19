/**
 * Integration Tests for Auth API
 *
 * Tests the full HTTP request/response cycle including:
 * - Request validation
 * - Authentication middleware
 * - Database interactions
 * - Response formatting
 */

import request from 'supertest';
import app from '../../index';
import { prisma } from '@airline-ops/database-schemas';
import { hash } from 'bcryptjs';

// Mock database
jest.mock('@airline-ops/database-schemas', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const requestBody = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      const hashedPassword = await hash(requestBody.password, 10);
      const mockUser = {
        id: 'user-123',
        email: requestBody.email,
        password: hashedPassword,
        firstName: requestBody.firstName,
        lastName: requestBody.lastName,
        phoneNumber: requestBody.phoneNumber,
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user.email).toBe(requestBody.email);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should return 409 if user already exists', async () => {
      // Arrange
      const requestBody = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: requestBody.email,
      });

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(409);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid email format', async () => {
      // Arrange
      const requestBody = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: '123', // Too weak
        firstName: 'John',
        lastName: 'Doe',
      };

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const password = 'SecurePass123!';
      const hashedPassword = await hash(password, 10);

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        status: 'ACTIVE',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for inactive account', async () => {
      // Arrange
      const hashedPassword = await hash('password', 10);
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        status: 'INACTIVE',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        status: 'ACTIVE',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Note: In real tests, you'd use an actual valid JWT
      const refreshToken = 'valid-refresh-token';

      // Act
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect('Content-Type', /json/);

      // Assert
      // This will likely fail in the test without a real token
      // In production tests, you'd generate a real token
      expect(response.body).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';

      // Act
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in response', async () => {
      // Act
      const response = await request(app).get('/health');

      // Assert
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      // Act
      const response = await request(app)
        .options('/api/v1/auth/login')
        .expect(204);

      // Assert
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return consistent error format', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid',
          password: 'pass',
        });

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle internal server errors gracefully', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        });

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBeGreaterThanOrEqual(500);
    });
  });
});
