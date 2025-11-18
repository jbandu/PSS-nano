import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';
import { loginSchema, registerSchema, refreshTokenSchema } from '../validators/auth.validator';
import { rateLimiter } from '../middleware/rate-limiter';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', rateLimiter(5, 60000), validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refresh);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);

export { router as authRoutes };
