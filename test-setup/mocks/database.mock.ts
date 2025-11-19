/**
 * Database Mocking Utilities
 *
 * Mock Prisma Client for unit testing without database dependencies.
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

/**
 * Create a mock Prisma Client
 */
export const createMockPrismaClient = (): DeepMockProxy<PrismaClient> => {
  return mockDeep<PrismaClient>();
};

/**
 * Singleton mock for Prisma Client
 */
export const prismaMock = mockDeep<PrismaClient>();

/**
 * Reset the Prisma mock between tests
 */
export const resetPrismaMock = () => {
  mockReset(prismaMock);
};

/**
 * Mock database transaction
 */
export const mockTransaction = async <T>(
  callback: (tx: DeepMockProxy<PrismaClient>) => Promise<T>
): Promise<T> => {
  const txMock = createMockPrismaClient();
  return callback(txMock);
};

/**
 * Mock common Prisma operations
 */
export const mockPrismaOperations = {
  /**
   * Mock a findUnique operation
   */
  findUnique: <T>(data: T | null) => {
    return jest.fn().mockResolvedValue(data);
  },

  /**
   * Mock a findMany operation
   */
  findMany: <T>(data: T[]) => {
    return jest.fn().mockResolvedValue(data);
  },

  /**
   * Mock a create operation
   */
  create: <T>(data: T) => {
    return jest.fn().mockResolvedValue(data);
  },

  /**
   * Mock an update operation
   */
  update: <T>(data: T) => {
    return jest.fn().mockResolvedValue(data);
  },

  /**
   * Mock a delete operation
   */
  delete: <T>(data: T) => {
    return jest.fn().mockResolvedValue(data);
  },

  /**
   * Mock a count operation
   */
  count: (count: number) => {
    return jest.fn().mockResolvedValue(count);
  },
};

/**
 * Setup Prisma mock with common data
 */
export const setupPrismaMock = (model: string, operations: Record<string, any>) => {
  const modelMock = (prismaMock as any)[model];
  Object.keys(operations).forEach((operation) => {
    modelMock[operation].mockImplementation(operations[operation]);
  });
};

// Reset mocks after each test
afterEach(() => {
  resetPrismaMock();
});
