import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const controller = new ReservationController();

router.post('/', authenticate, controller.create);
router.get('/:id', authenticate, controller.getById);
router.get('/pnr/:pnr', authenticate, controller.getByPNR);
router.get('/', authenticate, controller.list);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.cancel);

export { router as reservationRoutes };
