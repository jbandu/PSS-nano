import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, Invalid2FACodeError } from '../utils/errors';
import { emailService } from '../utils/email';
import { auditLogger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Two-Factor Authentication Service
 * Handles TOTP-based 2FA setup and verification
 */
class TwoFactorService {
  /**
   * Generate 2FA secret and QR code
   */
  async setup(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Airline Ops (${user.email})`,
      issuer: 'Airline Operations Platform',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store secret temporarily (will be confirmed after first successful verification)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: backupCodes,
      },
    });

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Enable 2FA after verifying setup code
   */
  async enable(userId: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new NotFoundError('2FA setup not found');
    }

    // Verify code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before/after
    });

    if (!isValid) {
      throw new Invalid2FACodeError();
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    // Send confirmation email
    await emailService.send2FASetup(user.email, user.firstName || 'User');

    auditLogger.info('2FA enabled', {
      userId,
      eventType: '2FA_ENABLED',
    });
  }

  /**
   * Disable 2FA
   */
  async disable(userId: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.twoFactorEnabled) {
      return; // Already disabled
    }

    // Verify code
    const isValid = await this.verifyCode(userId, code);
    if (!isValid) {
      throw new Invalid2FACodeError();
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    });

    auditLogger.info('2FA disabled', {
      userId,
      eventType: '2FA_DISABLED',
    });
  }

  /**
   * Verify 2FA code
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return false;
    }

    // Check if it's a backup code
    if (user.twoFactorBackupCodes) {
      const backupCodes = user.twoFactorBackupCodes as string[];
      const backupIndex = backupCodes.indexOf(code);

      if (backupIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(backupIndex, 1);
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorBackupCodes: backupCodes },
        });

        auditLogger.info('2FA backup code used', { userId });
        return true;
      }
    }

    // Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    return isValid;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: backupCodes },
    });

    auditLogger.info('2FA backup codes regenerated', { userId });

    return backupCodes;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }

    return codes;
  }
}

export const twoFactorService = new TwoFactorService();
export default twoFactorService;
