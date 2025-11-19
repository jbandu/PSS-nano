/**
 * Correlation ID Utility
 * Manages correlation IDs for request tracing across services
 */

import { createNamespace, getNamespace } from 'cls-hooked';
import { v4 as uuidv4 } from 'uuid';

const NAMESPACE = 'observability-context';
const CORRELATION_ID_KEY = 'correlationId';

// Create namespace for correlation context
const namespace = createNamespace(NAMESPACE);

export function initCorrelationContext(correlationId?: string): void {
  const ns = getNamespace(NAMESPACE);
  if (ns) {
    ns.set(CORRELATION_ID_KEY, correlationId || generateCorrelationId());
  }
}

export function getCorrelationId(): string {
  const ns = getNamespace(NAMESPACE);
  if (ns) {
    const id = ns.get(CORRELATION_ID_KEY);
    if (id) return id;
  }
  return 'no-correlation-id';
}

export function setCorrelationId(correlationId: string): void {
  const ns = getNamespace(NAMESPACE);
  if (ns) {
    ns.set(CORRELATION_ID_KEY, correlationId);
  }
}

export function generateCorrelationId(): string {
  return uuidv4();
}

export function runWithCorrelationId<T>(
  correlationId: string,
  fn: () => T
): T {
  const ns = getNamespace(NAMESPACE);
  if (!ns) {
    throw new Error('Correlation context namespace not initialized');
  }

  return ns.runAndReturn(() => {
    ns.set(CORRELATION_ID_KEY, correlationId);
    return fn();
  });
}

export { namespace as correlationNamespace };
