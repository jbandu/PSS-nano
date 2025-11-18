import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@airline-ops/database-schemas';
import { LoginRequest, RegisterRequest, RefreshTokenRequest, AuthTokens, User } from '@airline-ops/shared-types';
import { UnauthorizedError, ConflictError, NotFoundError, ValidationError } from '@airline-ops/shared-utils';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
  private readonly REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(data: RefreshTokenRequest): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(data.refreshToken, this.JWT_SECRET) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // In a production environment, you would invalidate the token
    // by storing it in a blacklist (Redis) or removing from database
    // For now, we'll just verify it exists
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { emailVerified: true },
      });
    } catch (error) {
      throw new UnauthorizedError('Invalid verification token');
    }
  }

  private generateTokens(userId: string, email: string, role: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, email, role },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { userId, email, role, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRATION }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiration(this.JWT_EXPIRATION),
    };
  }

  private parseExpiration(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      case 'm':
        return value * 60;
      default:
        return 3600;
    }
  }

  private sanitizeUser(user: any): User {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
