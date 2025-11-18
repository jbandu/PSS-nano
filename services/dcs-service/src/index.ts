import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http';
import { config } from './config';
import { logger } from './utils/logger';
import { socketService } from './services/socket.service';
import routes from './routes';

// Create Express app
const app = express();

// Create HTTP server
const httpServer = http.createServer(app);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: config.env === 'production' ? 'Internal server error' : err.message,
  });
});

// Initialize Socket.IO
socketService.initialize(httpServer);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  logger.info(`DCS Service running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Socket.IO enabled: ${config.socketIo.enabled}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
