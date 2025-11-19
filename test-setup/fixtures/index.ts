/**
 * Test Data Fixtures - Entry Point
 *
 * Central export for all test fixtures and data generators.
 */

// Passenger data
export * from './passenger-data';

// Flight data
export * from './flight-data';

// Booking data
export * from './booking-data';

/**
 * Common test data utilities
 */
export const testData = {
  /**
   * Generate a future date
   */
  futureDate: (daysFromNow = 7): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  },

  /**
   * Generate a past date
   */
  pastDate: (daysAgo = 7): Date => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  },

  /**
   * Generate a random UUID
   */
  randomUUID: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * Generate a random string
   */
  randomString: (length = 10): string => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  /**
   * Generate a random email
   */
  randomEmail: (): string => {
    return `test_${Math.random().toString(36).substring(7)}@example.com`;
  },

  /**
   * Generate a random integer
   */
  randomInt: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Pick a random item from an array
   */
  randomItem: <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  },
};
