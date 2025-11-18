export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  AUD: 'AUD',
} as const;

export const CABIN_CLASSES = {
  ECONOMY: 'ECONOMY',
  PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
  BUSINESS: 'BUSINESS',
  FIRST: 'FIRST',
} as const;

export const RESERVATION_EXPIRY_HOURS = 24;
export const JWT_EXPIRATION = '24h';
export const REFRESH_TOKEN_EXPIRATION = '7d';
export const MAX_PASSENGERS_PER_BOOKING = 9;
export const MIN_BOOKING_ADVANCE_HOURS = 2;
export const MAX_BOOKING_ADVANCE_DAYS = 365;

export const RATE_LIMITS = {
  GLOBAL: 100, // requests per minute
  AUTH: 5, // login attempts per minute
  BOOKING: 10, // bookings per minute
} as const;
