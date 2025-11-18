import { Request, Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservation.service';

export class ReservationController {
  private service: ReservationService;

  constructor() {
    this.service = new ReservationService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getById(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getByPNR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getByPNR(req.params.pnr);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.service.listByUser(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.cancel(req.params.id);
      res.json({ success: true, data: { message: 'Reservation cancelled' } });
    } catch (error) {
      next(error);
    }
  };
}
