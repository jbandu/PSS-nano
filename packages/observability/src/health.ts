/**
 * Health Check Utilities
 * Provides health check endpoints and utilities for monitoring service health
 */

import { Request, Response } from 'express';

export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded'
}

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: HealthStatus;
      message?: string;
      responseTime?: number;
      details?: any;
    };
  };
}

export type HealthCheckFunction = () => Promise<{
  status: HealthStatus;
  message?: string;
  details?: any;
}>;

export class HealthChecker {
  private checks: Map<string, HealthCheckFunction> = new Map();
  private serviceName: string;
  private serviceVersion: string;
  private startTime: number;

  constructor(serviceName: string, serviceVersion: string = '1.0.0') {
    this.serviceName = serviceName;
    this.serviceVersion = serviceVersion;
    this.startTime = Date.now();
  }

  /**
   * Register a health check
   */
  registerCheck(name: string, checkFn: HealthCheckFunction): void {
    this.checks.set(name, checkFn);
  }

  /**
   * Execute all health checks
   */
  async executeChecks(): Promise<HealthCheckResult> {
    const checksResults: HealthCheckResult['checks'] = {};
    let overallStatus = HealthStatus.HEALTHY;

    for (const [name, checkFn] of this.checks.entries()) {
      const startTime = Date.now();
      try {
        const result = await checkFn();
        const responseTime = Date.now() - startTime;

        checksResults[name] = {
          ...result,
          responseTime
        };

        // Determine overall status
        if (result.status === HealthStatus.UNHEALTHY) {
          overallStatus = HealthStatus.UNHEALTHY;
        } else if (result.status === HealthStatus.DEGRADED && overallStatus !== HealthStatus.UNHEALTHY) {
          overallStatus = HealthStatus.DEGRADED;
        }
      } catch (error) {
        checksResults[name] = {
          status: HealthStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - startTime
        };
        overallStatus = HealthStatus.UNHEALTHY;
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      version: this.serviceVersion,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: checksResults
    };
  }

  /**
   * Express middleware for health endpoint
   */
  middleware() {
    return async (req: Request, res: Response) => {
      const result = await this.executeChecks();

      const statusCode = result.status === HealthStatus.HEALTHY ? 200 : 503;

      res.status(statusCode).json(result);
    };
  }

  /**
   * Express middleware for liveness probe (simple check)
   */
  livenessProbe() {
    return (req: Request, res: Response) => {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString()
      });
    };
  }

  /**
   * Express middleware for readiness probe
   */
  readinessProbe() {
    return async (req: Request, res: Response) => {
      const result = await this.executeChecks();

      const statusCode = result.status === HealthStatus.HEALTHY ? 200 : 503;

      res.status(statusCode).json({
        status: result.status === HealthStatus.HEALTHY ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks: result.checks
      });
    };
  }
}

/**
 * Common health check functions
 */

export async function databaseHealthCheck(checkFn: () => Promise<boolean>): Promise<{
  status: HealthStatus;
  message?: string;
}> {
  try {
    const isHealthy = await checkFn();
    return {
      status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      message: isHealthy ? 'Database connection is healthy' : 'Database connection failed'
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: error instanceof Error ? error.message : 'Database health check failed'
    };
  }
}

export async function redisHealthCheck(checkFn: () => Promise<boolean>): Promise<{
  status: HealthStatus;
  message?: string;
}> {
  try {
    const isHealthy = await checkFn();
    return {
      status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      message: isHealthy ? 'Redis connection is healthy' : 'Redis connection failed'
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: error instanceof Error ? error.message : 'Redis health check failed'
    };
  }
}

export async function rabbitMQHealthCheck(checkFn: () => Promise<boolean>): Promise<{
  status: HealthStatus;
  message?: string;
}> {
  try {
    const isHealthy = await checkFn();
    return {
      status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      message: isHealthy ? 'RabbitMQ connection is healthy' : 'RabbitMQ connection failed'
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: error instanceof Error ? error.message : 'RabbitMQ health check failed'
    };
  }
}

export async function externalServiceHealthCheck(
  serviceName: string,
  checkFn: () => Promise<boolean>
): Promise<{
  status: HealthStatus;
  message?: string;
}> {
  try {
    const isHealthy = await checkFn();
    return {
      status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      message: isHealthy ? `${serviceName} is healthy` : `${serviceName} is unavailable`
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: error instanceof Error ? error.message : `${serviceName} health check failed`
    };
  }
}
