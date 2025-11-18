import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http';
import { config } from './config';
import { socketService } from './services/socket.service';

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
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'boarding-service',
    timestamp: new Date().toISOString(),
  });
});

// API routes would go here

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
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
  console.log(`Boarding Service running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Socket.IO enabled: ${config.socketIo.enabled}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
