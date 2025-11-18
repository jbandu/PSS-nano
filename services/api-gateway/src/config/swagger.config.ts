import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airline Operations Platform API Gateway',
      version,
      description: `
        Central API Gateway for the Airline Operational Intelligence Platform.

        This gateway provides unified access to all microservices with:
        - Centralized authentication and authorization
        - Rate limiting and request throttling
        - Circuit breaker pattern for resilience
        - Request/response logging and monitoring
        - API documentation and testing interface

        ## Authentication

        Most endpoints require authentication using JWT tokens or API keys.

        ### JWT Authentication
        Include the JWT token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your-jwt-token>
        \`\`\`

        ### API Key Authentication
        Include the API key in the X-API-Key header:
        \`\`\`
        X-API-Key: <your-api-key>
        \`\`\`

        ## Rate Limiting

        The API Gateway enforces rate limits to ensure fair usage:
        - Default: 1000 requests per minute per client
        - Rate limit headers are included in all responses
        - Exceeding limits returns HTTP 429 (Too Many Requests)

        ## Service Architecture

        The gateway routes requests to the following microservices:
        - **Auth Service** - User authentication and authorization
        - **Reservation Service** - PNR and booking management
        - **Inventory Service** - Flight inventory and seat management
        - **Payment Service** - Payment processing and refunds
        - **Notification Service** - Email, SMS, and push notifications
        - **Flight Service** - Flight schedules and operations
      `,
      contact: {
        name: 'API Support',
        email: 'api-support@airline-ops.com',
      },
      license: {
        name: 'Proprietary',
        url: 'https://airline-ops.com/license',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api-staging.airline-ops.com',
        description: 'Staging server',
      },
      {
        url: 'https://api.airline-ops.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/v1/auth/login',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for programmatic access',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication credentials are missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  statusCode: { type: 'number', example: 401 },
                  message: { type: 'string', example: 'Unauthorized' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions to access the resource',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  statusCode: { type: 'number', example: 403 },
                  message: { type: 'string', example: 'Forbidden' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  statusCode: { type: 'number', example: 404 },
                  message: { type: 'string', example: 'Resource not found' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  statusCode: { type: 'number', example: 422 },
                  message: { type: 'string', example: 'Validation failed' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        TooManyRequestsError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  statusCode: { type: 'number', example: 429 },
                  message: { type: 'string', example: 'Too many requests' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        ServiceUnavailableError: {
          description: 'Service is temporarily unavailable',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  statusCode: { type: 'number', example: 503 },
                  message: { type: 'string', example: 'Service unavailable' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check and monitoring endpoints' },
      { name: 'Monitoring', description: 'Metrics and observability' },
      { name: 'Auth', description: 'Authentication and authorization' },
      { name: 'Reservations', description: 'PNR and booking management' },
      { name: 'Inventory', description: 'Flight inventory and seats' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Notifications', description: 'Email, SMS, and push notifications' },
      { name: 'Flights', description: 'Flight schedules and operations' },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
