import { StatusCodes } from 'http-status-codes';

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

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(StatusCodes.FORBIDDEN, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(StatusCodes.NOT_FOUND, message);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors?: any[]) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, errors);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(StatusCodes.CONFLICT, message);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests') {
    super(StatusCodes.TOO_MANY_REQUESTS, message);
  }
}

export class AccountLockedError extends ApiError {
  constructor(unlockTime: number) {
    super(
      StatusCodes.FORBIDDEN,
      `Account locked due to too many failed login attempts. Try again in ${Math.ceil(
        unlockTime / 60
      )} minutes.`
    );
  }
}

export class Invalid2FACodeError extends ApiError {
  constructor() {
    super(StatusCodes.UNAUTHORIZED, 'Invalid 2FA code');
  }
}

export class Requires2FAError extends ApiError {
  constructor() {
    super(StatusCodes.UNAUTHORIZED, '2FA verification required');
  }
}

export class InvalidTokenError extends ApiError {
  constructor(message = 'Invalid or expired token') {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }
}
