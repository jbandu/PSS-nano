import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger } from '@airline-ops/shared-utils';
import { errorHandler } from './middleware/error-handler';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';

dotenv.config();

const app = express();
const logger = createLogger('auth-service');
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT}`);
});

export default app;
