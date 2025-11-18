import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest, RefreshTokenRequest } from '@airline-ops/shared-types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RegisterRequest = req.body;
      const result = await this.authService.register(data);
      res.status(201).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: LoginRequest = req.body;
      const result = await this.authService.login(data);
      res.json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RefreshTokenRequest = req.body;
      const result = await this.authService.refreshToken(data);
      res.json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      await this.authService.verifyEmail(token);
      res.json({
        success: true,
        data: { message: 'Email verified successfully' },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}
