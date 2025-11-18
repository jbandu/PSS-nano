import { Router } from 'express';
import { serviceRegistry } from '../config/services.config';
import { createServiceProxy, measureResponseTime, checkCircuitBreaker } from '../middleware/proxy.middleware';
import { authenticateJWT, optionalAuthenticateJWT } from '../middleware/auth.middleware';

const router = Router();

/**
 * Auth Service Routes
 * Public endpoints for authentication
 */
router.use(
  '/auth/*',
  optionalAuthenticateJWT, // Optional auth for login/register
  measureResponseTime('auth-service'),
  checkCircuitBreaker(serviceRegistry.auth),
  createServiceProxy(serviceRegistry.auth)
);

/**
 * Reservation Service Routes
 * Protected endpoints for managing reservations
 */
router.use(
  '/reservations/*',
  authenticateJWT, // Required auth
  measureResponseTime('reservation-service'),
  checkCircuitBreaker(serviceRegistry.reservation),
  createServiceProxy(serviceRegistry.reservation)
);

/**
 * Inventory Service Routes
 * Protected endpoints for inventory management
 */
router.use(
  '/inventory/*',
  authenticateJWT, // Required auth
  measureResponseTime('inventory-service'),
  checkCircuitBreaker(serviceRegistry.inventory),
  createServiceProxy(serviceRegistry.inventory)
);

/**
 * Payment Service Routes
 * Protected endpoints for payment processing
 */
router.use(
  '/payments/*',
  authenticateJWT, // Required auth
  measureResponseTime('payment-service'),
  checkCircuitBreaker(serviceRegistry.payment),
  createServiceProxy(serviceRegistry.payment)
);

/**
 * Notification Service Routes
 * Protected endpoints for notifications
 */
router.use(
  '/notifications/*',
  authenticateJWT, // Required auth
  measureResponseTime('notification-service'),
  checkCircuitBreaker(serviceRegistry.notification),
  createServiceProxy(serviceRegistry.notification)
);

/**
 * Flight Service Routes
 * Protected endpoints for flight management
 */
router.use(
  '/flights/*',
  authenticateJWT, // Required auth
  measureResponseTime('flight-service'),
  checkCircuitBreaker(serviceRegistry.flight),
  createServiceProxy(serviceRegistry.flight)
);

export default router;
