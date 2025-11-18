import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import config from '../config';
import logger from '../utils/logger';

/**
 * JWT Authentication Middleware
 */
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // Attach user info to request
      req.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
        permissions: decoded.permissions || [],
      };

      logger.debug('JWT authentication successful', {
        userId: req.user.id,
        correlationId: req.correlationId,
      });

      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional JWT Authentication (doesn't fail if no token)
 */
export const optionalAuthenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(); // No token, continue without user
  }

  try {
    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      req.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
        permissions: decoded.permissions || [],
      };
    }
  } catch (error) {
    // Ignore errors for optional auth
    logger.debug('Optional JWT authentication failed', { error });
  }

  next();
};

/**
 * API Key Authentication Middleware
 */
export const authenticateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('API key required');
    }

    // TODO: Validate API key against database
    // For now, we'll add a placeholder that should be implemented
    // by calling the auth service or database

    // Example implementation:
    // const keyData = await validateApiKey(apiKey);
    // req.apiKey = keyData;

    logger.warn('API key validation not implemented yet');

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control Middleware
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Permission-Based Access Control Middleware
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userPermissions = req.user.permissions || [];

      // Check if user has all required permissions or has wildcard permission
      const hasPermission =
        userPermissions.includes('*') ||
        requiredPermissions.every((permission) =>
          userPermissions.includes(permission)
        );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Scope-Based Access Control for API Keys
 */
export const requireScope = (...requiredScopes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.apiKey) {
        throw new UnauthorizedError('API key authentication required');
      }

      const keyScopes = req.apiKey.scopes || [];

      // Check if API key has all required scopes or has wildcard scope
      const hasScope =
        keyScopes.includes('*') ||
        requiredScopes.every((scope) => keyScopes.includes(scope));

      if (!hasScope) {
        throw new ForbiddenError(
          `Access denied. Required scopes: ${requiredScopes.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Organization-Based Access Control
 */
export const requireOrganization = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestedOrgId = req.params.organizationId || req.body.organizationId;

    if (!requestedOrgId) {
      return next(); // No organization context needed
    }

    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Super admin can access any organization
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Regular users can only access their own organization
    if (req.user.organizationId !== requestedOrgId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    next();
  } catch (error) {
    next(error);
  }
};
