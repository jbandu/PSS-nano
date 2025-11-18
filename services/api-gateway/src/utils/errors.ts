import { StatusCodes } from 'http-status-codes';

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors?: any[]) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(StatusCodes.FORBIDDEN, message);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(StatusCodes.NOT_FOUND, message);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(StatusCodes.CONFLICT, message);
  }
}

/**
 * Unprocessable Entity Error (422)
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors?: any[]) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, errors);
  }
}

/**
 * Too Many Requests Error (429)
 */
export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests') {
    super(StatusCodes.TOO_MANY_REQUESTS, message);
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
}

/**
 * Bad Gateway Error (502)
 */
export class BadGatewayError extends ApiError {
  constructor(message = 'Bad gateway') {
    super(StatusCodes.BAD_GATEWAY, message);
  }
}

/**
 * Service Unavailable Error (503)
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(StatusCodes.SERVICE_UNAVAILABLE, message);
  }
}

/**
 * Gateway Timeout Error (504)
 */
export class GatewayTimeoutError extends ApiError {
  constructor(message = 'Gateway timeout') {
    super(StatusCodes.GATEWAY_TIMEOUT, message);
  }
}

/**
 * Circuit Breaker Open Error
 */
export class CircuitBreakerOpenError extends ApiError {
  constructor(serviceName: string) {
    super(
      StatusCodes.SERVICE_UNAVAILABLE,
      `Service ${serviceName} is currently unavailable due to circuit breaker`
    );
  }
}
