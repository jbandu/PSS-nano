/**
 * Service Registry Configuration
 * Defines all microservices and their endpoints
 */

export interface ServiceEndpoint {
  name: string;
  url: string;
  healthCheck: string;
  timeout: number;
  retries: number;
  circuitBreaker?: {
    enabled: boolean;
    threshold: number;
    timeout: number;
    resetTimeout: number;
  };
}

export interface ServiceRegistry {
  [key: string]: ServiceEndpoint;
}

const getServiceUrl = (serviceName: string, port: string): string => {
  return process.env[`${serviceName.toUpperCase()}_URL`] || `http://localhost:${port}`;
};

export const serviceRegistry: ServiceRegistry = {
  auth: {
    name: 'auth-service',
    url: getServiceUrl('auth', '3001'),
    healthCheck: '/health',
    timeout: 5000,
    retries: 3,
    circuitBreaker: {
      enabled: true,
      threshold: 5, // Open circuit after 5 failures
      timeout: 10000, // 10 seconds
      resetTimeout: 30000, // 30 seconds before attempting to close
    },
  },
  reservation: {
    name: 'reservation-service',
    url: getServiceUrl('reservation', '3002'),
    healthCheck: '/health',
    timeout: 10000,
    retries: 3,
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      timeout: 15000,
      resetTimeout: 30000,
    },
  },
  inventory: {
    name: 'inventory-service',
    url: getServiceUrl('inventory', '3003'),
    healthCheck: '/health',
    timeout: 8000,
    retries: 3,
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      timeout: 12000,
      resetTimeout: 30000,
    },
  },
  payment: {
    name: 'payment-service',
    url: getServiceUrl('payment', '3004'),
    healthCheck: '/health',
    timeout: 15000, // Longer timeout for payment processing
    retries: 2, // Fewer retries to avoid duplicate charges
    circuitBreaker: {
      enabled: true,
      threshold: 3,
      timeout: 20000,
      resetTimeout: 60000, // Longer reset for payment issues
    },
  },
  notification: {
    name: 'notification-service',
    url: getServiceUrl('notification', '3005'),
    healthCheck: '/health',
    timeout: 5000,
    retries: 3,
    circuitBreaker: {
      enabled: true,
      threshold: 10, // More tolerant for non-critical service
      timeout: 8000,
      resetTimeout: 30000,
    },
  },
  flight: {
    name: 'flight-service',
    url: getServiceUrl('flight', '3006'),
    healthCheck: '/health',
    timeout: 8000,
    retries: 3,
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      timeout: 12000,
      resetTimeout: 30000,
    },
  },
};

export const getService = (serviceName: string): ServiceEndpoint | undefined => {
  return serviceRegistry[serviceName];
};

export const getAllServices = (): ServiceEndpoint[] => {
  return Object.values(serviceRegistry);
};
