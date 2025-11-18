# Authentication Service

Comprehensive authentication and authorization microservice for the Airline Operations Platform with enterprise-grade security features.

## Features

### ✅ User Authentication
- **Email/Password Login** - Secure bcrypt password hashing (12 rounds)
- **User Registration** - Account creation with email verification
- **JWT Tokens** - Separate access and refresh tokens with configurable expiry
- **Token Refresh** - Seamless token renewal without re-authentication
- **Password Reset** - Email-based password reset flow with time-limited tokens
- **Password Change** - Authenticated password update with current password verification

### ✅ Two-Factor Authentication (2FA)
- **TOTP Support** - Time-based one-time passwords using speakeasy
- **QR Code Generation** - Easy setup with authenticator apps (Google Authenticator, Authy)
- **Backup Codes** - 10 single-use backup codes for account recovery
- **Code Regeneration** - Generate new backup codes when needed
- **Enable/Disable** - Toggle 2FA with code verification

### ✅ Authorization System
- **Role-Based Access Control (RBAC)** - Roles: admin, agent, ops_manager, revenue_manager, passenger
- **Permission System** - Granular permissions (booking:read, booking:write, etc.)
- **Resource-Based Access** - Organization and tenant-level isolation
- **Permission Middleware** - Easy-to-use route protection

### ✅ API Key Management
- **Key Generation** - Cryptographically secure API keys
- **Scoped Permissions** - Fine-grained access control (booking:*, inventory:*, payment:*)
- **Key Rotation** - Generate new keys and revoke old ones
- **Usage Tracking** - Track API key usage per day
- **Prefix Support** - Easily identifiable keys (ak_xxx)

### ✅ Session Management
- **Redis-Backed Sessions** - High-performance session storage
- **Concurrent Session Limits** - Max 3 sessions per user (configurable)
- **Session Timeout** - Automatic expiration after inactivity
- **Device Tracking** - Track user agent, browser, OS, IP address
- **Multi-Session Management** - View and revoke sessions per device

### ✅ Security Features
- **Account Lockout** - Lock account after 5 failed login attempts
- **Lockout Duration** - 15-minute automatic unlock
- **IP-Based Rate Limiting** - Prevent brute force attacks
- **Login Attempt Tracking** - Monitor failed login attempts
- **Suspicious Activity Detection** - Alert on unusual patterns
- **Email Notifications** - Account lockout, new device, password changes
- **Token Blacklisting** - Logout invalidates tokens
- **Audit Logging** - Comprehensive security event logging

### ✅ OAuth 2.0 Provider
- **Authorization Code Flow** - Standard OAuth 2.0 flow
- **Client Credentials Flow** - Service-to-service authentication
- **Refresh Token Rotation** - Enhanced security
- **PKCE Support** - Proof Key for Code Exchange
- **Scope Management** - Fine-grained access control

### ✅ Audit & Compliance
- **Comprehensive Audit Logs** - All authentication events logged
- **90-Day Retention** - Extended retention for audit logs
- **Event Types** - LOGIN, LOGOUT, PASSWORD_CHANGE, 2FA_ENABLED, etc.
- **IP & Device Tracking** - Full context for security investigations
- **JSON Log Format** - Easy integration with log aggregation tools

## Architecture

```
┌─────────────────────────────────────────┐
│       Authentication Service             │
│            (Port 3001)                   │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Controllers Layer              │ │
│  │  - AuthController                  │ │
│  │  - 2FAController                   │ │
│  │  - APIKeyController                │ │
│  │  - SessionController               │ │
│  │  - OAuthController                 │ │
│  └────────────────────────────────────┘ │
│               ▼                          │
│  ┌────────────────────────────────────┐ │
│  │     Services Layer                 │ │
│  │  - AuthService                     │ │
│  │  - TokenService                    │ │
│  │  - TwoFactorService                │ │
│  │  - APIKeyService                   │ │
│  │  - SessionService                  │ │
│  │  - OAuthService                    │ │
│  └────────────────────────────────────┘ │
│               ▼                          │
│  ┌────────────────────────────────────┐ │
│  │     Middleware Layer               │ │
│  │  - Authentication                  │ │
│  │  - Authorization (RBAC)            │ │
│  │  - Rate Limiting                   │ │
│  │  - Validation (Zod)                │ │
│  │  - Error Handling                  │ │
│  └────────────────────────────────────┘ │
│               ▼                          │
│  ┌──────────────┬──────────────────────┐│
│  │  PostgreSQL  │       Redis          ││
│  │  (User Data) │  (Sessions/Cache)    ││
│  └──────────────┴──────────────────────┘│
└─────────────────────────────────────────┘
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache**: Redis (ioredis)
- **Authentication**: JWT (jsonwebtoken)
- **2FA**: Speakeasy, QRCode
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Email**: Nodemailer
- **Logging**: Winston
- **Testing**: Jest, Supertest

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure .env with your settings
nano .env

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

## Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/airline_ops"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000
ENABLE_2FA=true

# Email (SMTP)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@airline-ops.com
```

## Usage

### Development

```bash
# Run in development mode with hot reload
pnpm dev

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CUSTOMER"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

**With 2FA Enabled:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "requires2FA": true,
  "tempToken": "temporary-token-for-2fa-verification"
}
```

#### Verify 2FA
```http
POST /api/auth/2fa/verify
Content-Type: application/json

{
  "tempToken": "temporary-token",
  "code": "123456"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

#### Request Password Reset
```http
POST /api/auth/password/reset-request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/password/reset
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "NewSecurePass123!"
}
```

#### Change Password
```http
POST /api/auth/password/change
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

### Two-Factor Authentication

#### Setup 2FA
```http
POST /api/auth/2fa/setup
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "data:image/png;base64,...",
  "backupCodes": ["ABCD1234", "EFGH5678", ...]
}
```

#### Enable 2FA
```http
POST /api/auth/2fa/enable
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "code": "123456"
}
```

#### Disable 2FA
```http
POST /api/auth/2fa/disable
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "code": "123456"
}
```

#### Regenerate Backup Codes
```http
POST /api/auth/2fa/backup-codes
Authorization: Bearer <access-token>
```

### API Keys

#### Create API Key
```http
POST /api/auth/api-keys
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Production API",
  "scopes": ["booking:read", "booking:write", "inventory:read"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "key": "ak_1234567890abcdef",
  "name": "Production API",
  "scopes": ["booking:read", "booking:write"],
  "createdAt": "2024-01-15T12:00:00Z"
}
```

#### List API Keys
```http
GET /api/auth/api-keys
Authorization: Bearer <access-token>
```

#### Revoke API Key
```http
DELETE /api/auth/api-keys/:id
Authorization: Bearer <access-token>
```

### Sessions

#### List Active Sessions
```http
GET /api/auth/sessions
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-id",
      "device": "Chrome on macOS",
      "ip": "192.168.1.1",
      "lastActivity": "2024-01-15T12:00:00Z",
      "current": true
    }
  ]
}
```

#### Revoke Session
```http
DELETE /api/auth/sessions/:id
Authorization: Bearer <access-token>
```

#### Revoke All Sessions
```http
DELETE /api/auth/sessions
Authorization: Bearer <access-token>
```

### OAuth 2.0

#### Authorization Endpoint
```http
GET /oauth/authorize?client_id=xxx&redirect_uri=xxx&response_type=code&scope=booking:read
```

#### Token Endpoint
```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=auth-code&
client_id=xxx&
client_secret=xxx&
redirect_uri=xxx
```

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Security
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days), single-use
- **Reset Token**: Time-limited (1 hour)
- **Temp 2FA Token**: Very short-lived (10 minutes)

### Rate Limiting
- **Global**: 100 requests per 15 minutes
- **Login**: 5 attempts per 15 minutes per IP
- **Password Reset**: 3 requests per hour per email

### Account Lockout
- **Threshold**: 5 failed login attempts
- **Duration**: 15 minutes auto-unlock
- **Notification**: Email sent to account owner

### Suspicious Activity Detection
- Multiple failed login attempts
- Login from new device/location
- Rapid password change attempts
- Unusual API key usage patterns

## Middleware Usage

### Protect Routes with Authentication
```typescript
import { authenticateJWT } from './middleware/auth.middleware';

router.get('/protected', authenticateJWT, (req, res) => {
  // req.user is available
  res.json({ message: 'Protected data', user: req.user });
});
```

### Require Specific Roles
```typescript
import { authenticateJWT, requireRole } from './middleware/auth.middleware';

router.post('/admin-only',
  authenticateJWT,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  (req, res) => {
    // Only admins can access
  }
);
```

### Require Specific Permissions
```typescript
import { authenticateJWT, requirePermission } from './middleware/auth.middleware';

router.post('/bookings',
  authenticateJWT,
  requirePermission('booking:write'),
  (req, res) => {
    // Only users with booking:write permission
  }
);
```

### Tenant Isolation
```typescript
import { authenticateJWT, requireOrganization } from './middleware/auth.middleware';

router.get('/organizations/:organizationId/data',
  authenticateJWT,
  requireOrganization,
  (req, res) => {
    // Ensures user can only access their organization's data
  }
);
```

## Database Schema

The service uses the following models from the shared database schema:

- **User** - User accounts with credentials
- **Role** - RBAC roles (admin, agent, etc.)
- **Permission** - Granular permissions
- **UserRole** - User-to-role mapping
- **RolePermission** - Role-to-permission mapping
- **ApiKey** - API key storage
- **AuditLog** - Security event logging

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test auth.service.test.ts

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Example Test
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await authService.login(
        'test@example.com',
        'password123',
        deviceInfo
      );

      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should fail with invalid password', async () => {
      await expect(
        authService.login('test@example.com', 'wrong', deviceInfo)
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Attempt 5 times
      for (let i = 0; i < 5; i++) {
        await authService.login('test@example.com', 'wrong', deviceInfo)
          .catch(() => {});
      }

      // 6th attempt should throw AccountLockedError
      await expect(
        authService.login('test@example.com', 'wrong', deviceInfo)
      ).rejects.toThrow(AccountLockedError);
    });
  });
});
```

## Monitoring & Logging

### Log Levels
- **error**: Application errors
- **warn**: Warning conditions
- **info**: Informational messages
- **debug**: Debug information

### Log Files
- `logs/combined-YYYY-MM-DD.log` - All logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/audit-YYYY-MM-DD.log` - Security audit logs (90-day retention)

### Audit Events
All security-related events are logged:
- LOGIN_SUCCESS / LOGIN_FAILURE
- LOGOUT
- PASSWORD_RESET_REQUEST / PASSWORD_RESET_SUCCESS
- PASSWORD_CHANGE
- 2FA_ENABLED / 2FA_DISABLED / 2FA_VERIFIED
- API_KEY_CREATED / API_KEY_REVOKED
- ACCOUNT_LOCKED
- SUSPICIOUS_ACTIVITY
- SESSION_CREATED / SESSION_DELETED

## Error Handling

All errors return consistent JSON responses:

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### Error Types
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Performance Considerations

### Redis Caching
- Session data cached in Redis
- Login attempts tracked in Redis
- Token blacklist stored in Redis
- Password reset tokens cached

### Database Indexes
- Email (unique)
- API key (unique)
- User ID + Session ID composite
- Audit log timestamp

### Connection Pooling
- Prisma connection pooling configured
- Redis connection pool managed by ioredis

## Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://..."
REDIS_HOST=redis.production.internal
JWT_ACCESS_SECRET="<strong-random-secret>"
JWT_REFRESH_SECRET="<different-strong-secret>"
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

## Troubleshooting

### Account Locked
**Problem**: User cannot log in due to too many failed attempts

**Solution**:
1. Check Redis: `redis-cli GET login:attempts:user@example.com`
2. Manual unlock: `redis-cli DEL login:attempts:user@example.com`
3. Or wait 15 minutes for automatic unlock

### 2FA Not Working
**Problem**: 2FA codes always invalid

**Solution**:
1. Check server time is synchronized (NTP)
2. Verify secret is correctly stored in database
3. Check `window` parameter in verification (default: 2)

### Session Expired Too Quickly
**Problem**: Users logged out unexpectedly

**Solution**:
1. Check `SESSION_MAX_AGE` environment variable
2. Verify Redis is running and accessible
3. Check for Redis memory limits

### High Memory Usage
**Problem**: Redis memory growing

**Solution**:
1. Review token blacklist TTLs
2. Check session cleanup
3. Monitor API key usage tracking

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Follow OWASP security guidelines
5. Use conventional commits

## License

Proprietary - All rights reserved
