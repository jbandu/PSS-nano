import axios from 'axios';
import logger from '../utils/logger';
import { ServiceEndpoint, getAllServices } from '../config/services.config';
import { ServiceHealth } from '../types';
import { updateServiceHealth, serviceResponseTime } from '../utils/metrics';

/**
 * Health Check Service
 * Monitors health of all backend services
 */
class HealthCheckService {
  private healthCache: Map<string, ServiceHealth> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Start periodic health checks
   */
  start() {
    if (this.checkInterval) {
      return; // Already running
    }

    logger.info('Starting health check service');

    // Initial check
    this.checkAllServices();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllServices();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop periodic health checks
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Health check service stopped');
    }
  }

  /**
   * Check health of all services
   */
  async checkAllServices(): Promise<void> {
    const services = getAllServices();
    const checks = services.map((service) => this.checkService(service));
    await Promise.allSettled(checks);
  }

  /**
   * Check health of a single service
   */
  async checkService(service: ServiceEndpoint): Promise<ServiceHealth> {
    const start = Date.now();
    const healthUrl = `${service.url}${service.healthCheck}`;

    try {
      const response = await axios.get(healthUrl, {
        timeout: 5000,
        validateStatus: (status) => status === 200,
      });

      const responseTime = Date.now() - start;

      const health: ServiceHealth = {
        service: service.name,
        status: 'healthy',
        responseTime,
        lastCheck: new Date(),
      };

      this.healthCache.set(service.name, health);
      updateServiceHealth(service.name, true);
      serviceResponseTime.observe({ service: service.name, operation: 'health_check' }, responseTime / 1000);

      logger.debug(`Service ${service.name} is healthy (${responseTime}ms)`);
      return health;
    } catch (error: any) {
      const health: ServiceHealth = {
        service: service.name,
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error.message,
      };

      this.healthCache.set(service.name, health);
      updateServiceHealth(service.name, false);

      logger.warn(`Service ${service.name} is unhealthy: ${error.message}`);
      return health;
    }
  }

  /**
   * Get health status of a service
   */
  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthCache.get(serviceName);
  }

  /**
   * Get health status of all services
   */
  getAllHealth(): ServiceHealth[] {
    return Array.from(this.healthCache.values());
  }

  /**
   * Check if a service is healthy
   */
  isServiceHealthy(serviceName: string): boolean {
    const health = this.healthCache.get(serviceName);
    return health?.status === 'healthy';
  }

  /**
   * Get overall health status
   */
  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const allHealth = this.getAllHealth();

    if (allHealth.length === 0) {
      return 'unknown' as any;
    }

    const unhealthyCount = allHealth.filter((h) => h.status === 'unhealthy').length;
    const healthyCount = allHealth.filter((h) => h.status === 'healthy').length;

    if (unhealthyCount === 0) {
      return 'healthy';
    } else if (healthyCount > 0) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }
}

// Export singleton instance
export const healthCheckService = new HealthCheckService();
