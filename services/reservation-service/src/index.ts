import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger } from '@airline-ops/shared-utils';
import { errorHandler } from './middleware/error-handler';
import { reservationRoutes } from './routes/reservation.routes';
import { healthRoutes } from './routes/health.routes';

dotenv.config();

const app = express();
const logger = createLogger('reservation-service');
const PORT = process.env.RESERVATION_SERVICE_PORT || 3002;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/v1/reservations', reservationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Reservation Service running on port ${PORT}`);
});

export default app;
