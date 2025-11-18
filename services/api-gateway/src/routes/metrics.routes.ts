import { Router, Request, Response } from 'express';
import { register } from '../utils/metrics';

const router = Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get Prometheus metrics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Prometheus metrics in text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.send(metrics);
});

export default router;
