import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { healthCheckService } from '../services/health-check.service';
import { circuitBreakerManager } from '../services/circuit-breaker.service';
import { GatewayHealth } from '../types';
import config from '../config';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get API Gateway health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Gateway is healthy
 *       503:
 *         description: Gateway is unhealthy
 */
router.get('/health', (req: Request, res: Response) => {
  const overallHealth = healthCheckService.getOverallHealth();
  const services = healthCheckService.getAllHealth();

  const response: GatewayHealth = {
    status: overallHealth,
    timestamp: new Date(),
    uptime: process.uptime(),
    services,
    version: process.env.npm_package_version || '1.0.0',
  };

  const statusCode =
    overallHealth === 'healthy'
      ? StatusCodes.OK
      : overallHealth === 'degraded'
      ? StatusCodes.OK
      : StatusCodes.SERVICE_UNAVAILABLE;

  res.status(statusCode).json(response);
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Check if gateway is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Gateway is ready
 *       503:
 *         description: Gateway is not ready
 */
router.get('/ready', (req: Request, res: Response) => {
  const overallHealth = healthCheckService.getOverallHealth();

  if (overallHealth === 'unhealthy') {
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      status: 'not ready',
      message: 'All backend services are unavailable',
    });
  }

  res.status(StatusCodes.OK).json({
    status: 'ready',
    message: 'API Gateway is ready to accept traffic',
  });
});

/**
 * @swagger
 * /live:
 *   get:
 *     summary: Check if gateway process is alive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Gateway is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    status: 'alive',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
  });
});

/**
 * @swagger
 * /health/services:
 *   get:
 *     summary: Get health status of all backend services
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health statuses
 */
router.get('/health/services', (req: Request, res: Response) => {
  const services = healthCheckService.getAllHealth();
  res.json({ services });
});

/**
 * @swagger
 * /health/circuit-breakers:
 *   get:
 *     summary: Get status of all circuit breakers
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Circuit breaker statuses
 */
router.get('/health/circuit-breakers', (req: Request, res: Response) => {
  const stats = circuitBreakerManager.getAllStats();
  res.json({ circuitBreakers: stats });
});

export default router;
