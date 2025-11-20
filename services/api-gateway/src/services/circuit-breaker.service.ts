import CircuitBreaker from 'opossum';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import logger from '../utils/logger';
import { ServiceEndpoint } from '../config/services.config';
import { CircuitBreakerOpenError } from '../utils/errors';
import { circuitBreakerFailures, updateCircuitBreakerState } from '../utils/metrics';

/**
 * Circuit Breaker Manager
 * Manages circuit breakers for all backend services
 */
class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(service: ServiceEndpoint): CircuitBreaker {
    if (!this.breakers.has(service.name)) {
      this.breakers.set(service.name, this.createBreaker(service));
    }
    return this.breakers.get(service.name)!;
  }

  /**
   * Create a new circuit breaker for a service
   */
  private createBreaker(service: ServiceEndpoint): CircuitBreaker {
    const options = {
      timeout: service.timeout,
      errorThresholdPercentage: 50,
      resetTimeout: service.circuitBreaker?.resetTimeout || 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
      name: service.name,
      volumeThreshold: service.circuitBreaker?.threshold || 5,
    };

    // Create the circuit breaker
    const breaker = new CircuitBreaker(this.makeRequest, options);

    // Event handlers
    breaker.on('open', () => {
      logger.warn(`Circuit breaker opened for service: ${service.name}`);
      updateCircuitBreakerState(service.name, 'OPEN');
    });

    breaker.on('halfOpen', () => {
      logger.info(`Circuit breaker half-open for service: ${service.name}`);
      updateCircuitBreakerState(service.name, 'HALF_OPEN');
    });

    breaker.on('close', () => {
      logger.info(`Circuit breaker closed for service: ${service.name}`);
      updateCircuitBreakerState(service.name, 'CLOSED');
    });

    breaker.on('failure', (error) => {
      logger.error(`Circuit breaker failure for service: ${service.name}`, { error: error.message });
      circuitBreakerFailures.inc({ service: service.name });
    });

    breaker.on('success', () => {
      logger.debug(`Circuit breaker success for service: ${service.name}`);
    });

    breaker.on('timeout', () => {
      logger.warn(`Circuit breaker timeout for service: ${service.name}`);
    });

    breaker.on('reject', () => {
      logger.warn(`Circuit breaker rejected request for service: ${service.name}`);
    });

    // Initialize state metric
    updateCircuitBreakerState(service.name, 'CLOSED');

    return breaker;
  }

  /**
   * Make an HTTP request (wrapped by circuit breaker)
   */
  private async makeRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      const response = await axios(config);
      return response;
    } catch (error: any) {
      logger.error('Request failed in circuit breaker', {
        url: config.url,
        method: config.method,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute a request with circuit breaker protection
   */
  async execute(service: ServiceEndpoint, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (!service.circuitBreaker?.enabled) {
      // Circuit breaker disabled, make direct request
      return this.makeRequest(config);
    }

    const breaker = this.getBreaker(service);

    if (breaker.opened) {
      throw new CircuitBreakerOpenError(service.name);
    }

    try {
      return await breaker.fire(config) as AxiosResponse;
    } catch (error: any) {
      if (error.message === 'Breaker is open') {
        throw new CircuitBreakerOpenError(service.name);
      }
      throw error;
    }
  }

  /**
   * Get circuit breaker stats for a service
   */
  getStats(serviceName: string) {
    const breaker = this.breakers.get(serviceName);
    if (!breaker) {
      return null;
    }

    return {
      state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
      stats: breaker.stats,
    };
  }

  /**
   * Get all circuit breaker stats
   */
  getAllStats() {
    const stats: Record<string, any> = {};
    this.breakers.forEach((breaker, serviceName) => {
      stats[serviceName] = {
        state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
        stats: breaker.stats,
      };
    });
    return stats;
  }

  /**
   * Reset a circuit breaker
   */
  reset(serviceName: string) {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.close();
      logger.info(`Circuit breaker manually reset for service: ${serviceName}`);
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    this.breakers.forEach((breaker, serviceName) => {
      breaker.close();
      logger.info(`Circuit breaker manually reset for service: ${serviceName}`);
    });
  }
}

// Export singleton instance
export const circuitBreakerManager = new CircuitBreakerManager();
