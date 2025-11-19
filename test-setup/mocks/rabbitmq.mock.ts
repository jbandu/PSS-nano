/**
 * RabbitMQ Mocking Utilities
 *
 * Mock RabbitMQ client for unit testing without message queue dependencies.
 */

import type { Connection, Channel, ConsumeMessage } from 'amqplib';

/**
 * Create a mock RabbitMQ channel
 */
export const createMockChannel = (): jest.Mocked<Channel> => {
  return {
    // Basic operations
    assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue', messageCount: 0, consumerCount: 0 }),
    assertExchange: jest.fn().mockResolvedValue({ exchange: 'test-exchange' }),
    bindQueue: jest.fn().mockResolvedValue({}),
    unbindQueue: jest.fn().mockResolvedValue({}),

    // Publishing
    sendToQueue: jest.fn().mockReturnValue(true),
    publish: jest.fn().mockReturnValue(true),

    // Consuming
    consume: jest.fn().mockResolvedValue({ consumerTag: 'test-consumer' }),
    cancel: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue(false),

    // Message acknowledgement
    ack: jest.fn(),
    nack: jest.fn(),
    reject: jest.fn(),

    // Prefetch
    prefetch: jest.fn().mockResolvedValue({}),

    // Close
    close: jest.fn().mockResolvedValue({}),

    // Events
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
  } as unknown as jest.Mocked<Channel>;
};

/**
 * Create a mock RabbitMQ connection
 */
export const createMockConnection = (): jest.Mocked<Connection> => {
  const mockChannel = createMockChannel();

  return {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
    createConfirmChannel: jest.fn().mockResolvedValue(mockChannel),
    close: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
  } as unknown as jest.Mocked<Connection>;
};

/**
 * Singleton mock channel
 */
export const channelMock = createMockChannel();

/**
 * Singleton mock connection
 */
export const connectionMock = createMockConnection();

/**
 * Create a mock consume message
 */
export const createMockMessage = (
  content: any,
  properties?: Partial<ConsumeMessage['properties']>
): ConsumeMessage => {
  return {
    content: Buffer.from(JSON.stringify(content)),
    fields: {
      deliveryTag: 1,
      redelivered: false,
      exchange: 'test-exchange',
      routingKey: 'test-routing-key',
      consumerTag: undefined,
    },
    properties: {
      contentType: 'application/json',
      contentEncoding: undefined,
      headers: {},
      deliveryMode: undefined,
      priority: undefined,
      correlationId: undefined,
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: undefined,
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined,
      ...properties,
    },
  };
};

/**
 * Reset RabbitMQ mocks
 */
export const resetRabbitMQMocks = () => {
  Object.values(channelMock).forEach((method) => {
    if (typeof method === 'function' && 'mockReset' in method) {
      (method as jest.Mock).mockReset();
    }
  });

  Object.values(connectionMock).forEach((method) => {
    if (typeof method === 'function' && 'mockReset' in method) {
      (method as jest.Mock).mockReset();
    }
  });
};

// Reset mocks after each test
afterEach(() => {
  resetRabbitMQMocks();
});
