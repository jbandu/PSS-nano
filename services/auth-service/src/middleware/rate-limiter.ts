import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};
