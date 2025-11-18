import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import logger from './logger';

/**
 * Email Service
 */
class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.user
        ? {
            user: config.email.user,
            pass: config.email.password,
          }
        : undefined,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, token: string, name: string): Promise<void> {
    const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Reset Password
            </a>
            <p>Or copy this link to your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in ${config.security.passwordResetExpires / 60000} minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Airline Operations Platform</p>
          </div>
        `,
      });

      logger.info('Password reset email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send password reset email', { email, error: error.message });
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send 2FA setup email
   */
  async send2FASetup(email: string, name: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Two-Factor Authentication Enabled',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Two-Factor Authentication Enabled</h2>
            <p>Hello ${name},</p>
            <p>Two-factor authentication has been successfully enabled on your account.</p>
            <p>You will now need to enter a verification code from your authenticator app when logging in.</p>
            <p>If you didn't enable this, please contact support immediately.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Airline Operations Platform</p>
          </div>
        `,
      });

      logger.info('2FA setup email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send 2FA setup email', { email, error: error.message });
    }
  }

  /**
   * Send suspicious activity alert
   */
  async sendSuspiciousActivityAlert(email: string, name: string, activity: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Security Alert: Suspicious Activity Detected',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Security Alert</h2>
            <p>Hello ${name},</p>
            <p>We detected suspicious activity on your account:</p>
            <div style="background-color: #f8f9fa; padding: 16px; border-left: 4px solid #dc3545; margin: 16px 0;">
              <strong>${activity}</strong>
            </div>
            <p>If this was you, no action is needed. Otherwise, please:</p>
            <ul>
              <li>Change your password immediately</li>
              <li>Enable two-factor authentication</li>
              <li>Review your recent account activity</li>
            </ul>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Airline Operations Platform</p>
          </div>
        `,
      });

      logger.info('Suspicious activity email sent', { email, activity });
    } catch (error: any) {
      logger.error('Failed to send suspicious activity email', { email, error: error.message });
    }
  }

  /**
   * Send new device login notification
   */
  async sendNewDeviceNotification(
    email: string,
    name: string,
    device: string,
    location: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'New Device Login Detected',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Device Login</h2>
            <p>Hello ${name},</p>
            <p>We detected a login from a new device:</p>
            <div style="background-color: #f8f9fa; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 4px 0;"><strong>Device:</strong> ${device}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${location}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>If this wasn't you, please secure your account immediately.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Airline Operations Platform</p>
          </div>
        `,
      });

      logger.info('New device notification sent', { email, device });
    } catch (error: any) {
      logger.error('Failed to send new device notification', { email, error: error.message });
    }
  }

  /**
   * Send account lockout notification
   */
  async sendAccountLockout(email: string, name: string, unlockTime: number): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Account Temporarily Locked',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">Account Locked</h2>
            <p>Hello ${name},</p>
            <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
            <p>Your account will be automatically unlocked in ${Math.ceil(
              unlockTime / 60
            )} minutes.</p>
            <p>If you didn't attempt to log in, please contact support.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Airline Operations Platform</p>
          </div>
        `,
      });

      logger.info('Account lockout email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send account lockout email', { email, error: error.message });
    }
  }
}

export const emailService = new EmailService();
export default emailService;
