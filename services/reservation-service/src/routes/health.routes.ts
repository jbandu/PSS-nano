import { Router } from 'express';
import { prisma } from '@airline-ops/database-schemas';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      service: 'reservation-service',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'reservation-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

export { router as healthRoutes };
