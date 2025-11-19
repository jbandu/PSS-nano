/**
 * k6 Soak Test (Endurance Test)
 *
 * Tests system stability over an extended period under normal load.
 * Identifies memory leaks, resource exhaustion, and degradation over time.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Ramp up to normal load
    { duration: '5m', target: 500 },
    // Stay at normal load for 2 hours
    { duration: '2h', target: 500 },
    // Ramp down
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    // Response times should remain consistent
    'http_req_duration': ['p(95)<2000', 'p(99)<3000'],
    // Error rate should be very low
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate realistic user behavior
  const actions = [
    () => http.get(`${BASE_URL}/api/v1/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-15`),
    () => http.get(`${BASE_URL}/api/v1/flights/search?origin=ORD&destination=SFO&departureDate=2025-12-20`),
    () => http.get(`${BASE_URL}/health`),
  ];

  const action = actions[Math.floor(Math.random() * actions.length)];
  const res = action();

  check(res, {
    'request successful': (r) => r.status === 200,
    'consistent performance': (r) => r.timings.duration < 3000,
  });

  sleep(Math.random() * 5 + 2); // 2-7 seconds think time
}

export function handleSummary(data) {
  const avgDuration = data.metrics.http_req_duration.values.avg;
  const errorRate = data.metrics.http_req_failed.values.rate;

  console.log(`
=================================
Soak Test Summary
=================================
Average Response Time: ${avgDuration.toFixed(2)}ms
Error Rate: ${(errorRate * 100).toFixed(2)}%
Total Requests: ${data.metrics.http_reqs.values.count}
=================================
  `);

  return {
    'soak-test-summary.json': JSON.stringify(data),
  };
}
