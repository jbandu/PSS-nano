import { Request } from 'express';

/**
 * Authenticated Request with user context
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
  sessionId?: string;
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  permissions?: string[];
  sessionId?: string;
  type: 'access' | 'refresh';
}

/**
 * Token Pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
  tokens: TokenPair;
  requires2FA?: boolean;
  tempToken?: string;
}

/**
 * Session Data
 */
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Device Information
 */
export interface DeviceInfo {
  userAgent: string;
  ip: string;
  browser?: string;
  os?: string;
  device?: string;
}

/**
 * OAuth Client
 */
export interface OAuthClient {
  id: string;
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUris: string[];
  scopes: string[];
  organizationId?: string;
}

/**
 * OAuth Authorization Code
 */
export interface AuthorizationCodeData {
  userId: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  codeChallenge?: string;
  codeChallengeMethod?: 'plain' | 'S256';
}

/**
 * API Key Scope
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
 * Audit Event Type
 */
export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_CHANGE'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_VERIFIED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'ACCOUNT_LOCKED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SESSION_CREATED'
  | 'SESSION_DELETED'
  | 'PERMISSION_CHANGED';

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  userId?: string;
  eventType: AuditEventType;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}
