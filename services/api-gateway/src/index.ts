import { createApp } from './app';
import config from './config';
import logger from './utils/logger';
import { healthCheckService } from './services/health-check.service';

/**
 * Start the API Gateway server
 */
const startServer = async () => {
  try {
    // Create Express app
    const app = createApp();

    // Start health check service
    healthCheckService.start();
    logger.info('Health check service started');

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`API Gateway started on port ${config.port}`, {
        environment: config.env,
        nodeVersion: process.version,
        pid: process.pid,
      });
      logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
      logger.info(`Health check available at http://localhost:${config.port}/health`);
      logger.info(`Metrics available at http://localhost:${config.port}/metrics`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown`);

      // Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Stop health check service
      healthCheckService.stop();

      // Give ongoing requests time to complete
      setTimeout(() => {
        logger.info('Graceful shutdown complete');
        process.exit(0);
      }, 5000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
      process.exit(1);
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Start the server
startServer();
