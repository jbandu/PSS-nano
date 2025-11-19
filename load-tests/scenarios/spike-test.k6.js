/**
 * k6 Spike Test
 *
 * Tests system behavior under sudden traffic spikes.
 * Rapidly increases load to identify breaking points.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Normal load
    { duration: '2m', target: 100 },
    // Sudden spike to 5000 users
    { duration: '30s', target: 5000 },
    // Hold spike for 1 minute
    { duration: '1m', target: 5000 },
    // Rapid drop back to normal
    { duration: '30s', target: 100 },
    // Recovery period
    { duration: '2m', target: 100 },
    // Drop to zero
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // During spike, allow higher response times
    'http_req_duration': ['p(99)<5000'],
    // Error rate should stay below 5% even during spike
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simple health check request
  const res = http.get(`${BASE_URL}/health`);

  check(res, {
    'service available': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 5000,
  });

  sleep(1);
}
