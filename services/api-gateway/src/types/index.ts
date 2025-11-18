import { Request } from 'express';

/**
 * Extended Express Request with user context
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
    permissions?: string[];
  };
  correlationId?: string;
  apiKey?: {
    id: string;
    scopes: string[];
    organizationId: string;
  };
}

/**
 * Service health status
 */
export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  responseTime?: number;
  lastCheck?: Date;
  error?: string;
}

/**
 * API Gateway health response
 */
export interface GatewayHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  services: ServiceHealth[];
  version: string;
}

/**
 * Circuit breaker state
 */
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * Circuit breaker stats
 */
export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}

/**
 * Prometheus metrics labels
 */
export interface MetricLabels {
  service?: string;
  method?: string;
  route?: string;
  status?: string;
  [key: string]: string | undefined;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'microsoft';

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * API Key scope
 */
export type ApiKeyScope =
  | 'booking:read'
  | 'booking:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'payment:read'
  | 'payment:write'
  | 'flight:read'
  | 'notification:send'
  | '*';

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  target: string;
  methods?: string[];
  authenticated?: boolean;
  requiredScopes?: ApiKeyScope[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}
