/**
 * Global Jest Setup
 *
 * Runs before each test suite across all packages.
 * Sets up environment variables, global mocks, and test utilities.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce noise in test output

// Mock environment variables for services
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/pss_test';
process.env.REDIS_URL = 'redis://localhost:6379/15'; // Use DB 15 for tests
process.env.RABBITMQ_URL = 'amqp://localhost:5672';
process.env.JWT_SECRET = 'test-jwt-secret-key-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '1h';

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Wait for async operations
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Generate random test data
  randomString: (length = 10) =>
    Math.random().toString(36).substring(2, length + 2),

  randomEmail: () =>
    `test_${Math.random().toString(36).substring(7)}@example.com`,

  randomPNR: () =>
    Math.random().toString(36).substring(2, 8).toUpperCase(),

  // Date utilities
  futureDate: (daysFromNow = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  },

  pastDate: (daysAgo = 7) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  },
};

// Suppress console output during tests (except errors)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging failed tests
  error: console.error,
};

// Clean up after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise((resolve) => setTimeout(resolve, 500));
});
