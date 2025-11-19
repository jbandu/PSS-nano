# API Overview

## Introduction

PSS-nano provides a comprehensive RESTful API for all airline operations. This section documents all available APIs, authentication methods, and usage guidelines.

## Base URL

```
Development: http://localhost:3000/api/v1
Staging: https://staging-api.pss-nano.com/api/v1
Production: https://api.pss-nano.com/api/v1
```

## Authentication

All API requests require authentication using JWT tokens.

### Getting a Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Using the Token

Include the token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/v1/reservations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## API Structure

### Core APIs

1. **Authentication API** - User authentication and authorization
2. **Reservation API** - Booking management
3. **Inventory API** - Flight availability and inventory
4. **Payment API** - Payment processing
5. **Notification API** - Email/SMS notifications

### Operational APIs

6. **Pricing API** - Fare calculation
7. **Ancillary API** - Additional services
8. **Boarding API** - Boarding pass generation
9. **DCS API** - Check-in and departure control

## Rate Limiting

**Limits:**
- Authenticated users: 1000 requests/hour
- API keys: 5000 requests/hour
- Anonymous: 100 requests/hour

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## Versioning

We use URL versioning:
- Current: `/api/v1/...`
- Future: `/api/v2/...` (when breaking changes needed)

## Standard Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "The requested booking could not be found",
    "details": {
      "pnrLocator": "ABC123"
    }
  }
}
```

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Pagination

Use `page` and `limit` query parameters:

```bash
GET /api/v1/reservations?page=2&limit=20
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Filtering & Sorting

**Filtering:**
```bash
GET /api/v1/reservations?status=CONFIRMED&from=2024-01-01
```

**Sorting:**
```bash
GET /api/v1/reservations?sort=-createdAt
# - prefix for descending, + or no prefix for ascending
```

## OpenAPI Specification

Full OpenAPI 3.0 specifications are available for each service:

- [Auth API Spec](auth/endpoints.md)
- [Reservation API Spec](reservation/endpoints.md)
- [Inventory API Spec](inventory/endpoints.md)
- [Payment API Spec](payment/endpoints.md)

## Postman Collection

Download our Postman collection: [PSS-nano API Collection](postman-collections.md)

## SDKs

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- Java SDK

## Support

For API questions:
- Check the detailed endpoint documentation
- Search existing GitHub issues
- Create a new issue with the `api` label
