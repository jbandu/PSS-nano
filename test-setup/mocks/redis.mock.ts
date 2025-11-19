/**
 * Redis Mocking Utilities
 *
 * Mock Redis client for unit testing without Redis dependencies.
 */

import { Redis } from 'ioredis';

/**
 * Create a mock Redis client
 */
export const createMockRedis = (): jest.Mocked<Redis> => {
  const mockRedis = {
    // String operations
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),

    // Hash operations
    hget: jest.fn(),
    hset: jest.fn(),
    hgetall: jest.fn(),
    hdel: jest.fn(),
    hexists: jest.fn(),

    // List operations
    lpush: jest.fn(),
    rpush: jest.fn(),
    lpop: jest.fn(),
    rpop: jest.fn(),
    lrange: jest.fn(),
    llen: jest.fn(),

    // Set operations
    sadd: jest.fn(),
    srem: jest.fn(),
    smembers: jest.fn(),
    sismember: jest.fn(),

    // Sorted set operations
    zadd: jest.fn(),
    zrem: jest.fn(),
    zrange: jest.fn(),
    zrangebyscore: jest.fn(),
    zcard: jest.fn(),

    // Key operations
    keys: jest.fn(),
    scan: jest.fn(),
    flushdb: jest.fn(),
    flushall: jest.fn(),

    // Pub/Sub
    publish: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    on: jest.fn(),

    // Connection
    connect: jest.fn(),
    disconnect: jest.fn(),
    quit: jest.fn(),

    // Pipeline
    pipeline: jest.fn(() => ({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    })),

    // Multi
    multi: jest.fn(() => ({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    })),

    // Status
    status: 'ready',
  } as unknown as jest.Mocked<Redis>;

  return mockRedis;
};

/**
 * Singleton mock Redis client
 */
export const redisMock = createMockRedis();

/**
 * Reset Redis mock
 */
export const resetRedisMock = () => {
  Object.values(redisMock).forEach((method) => {
    if (typeof method === 'function' && 'mockReset' in method) {
      (method as jest.Mock).mockReset();
    }
  });
};

/**
 * Mock Redis cache behavior
 */
export const mockRedisCache = {
  /**
   * Mock a successful cache hit
   */
  hit: (key: string, value: any) => {
    redisMock.get.mockImplementation((k) =>
      k === key ? Promise.resolve(JSON.stringify(value)) : Promise.resolve(null)
    );
  },

  /**
   * Mock a cache miss
   */
  miss: () => {
    redisMock.get.mockResolvedValue(null);
  },

  /**
   * Mock a successful cache set
   */
  set: () => {
    redisMock.set.mockResolvedValue('OK');
    redisMock.setex.mockResolvedValue('OK');
  },
};

// Reset mocks after each test
afterEach(() => {
  resetRedisMock();
});
