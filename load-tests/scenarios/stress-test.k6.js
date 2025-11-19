/**
 * k6 Stress Test
 *
 * Finds the breaking point of the system by gradually increasing load
 * until errors occur or performance degrades significantly.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Warm up
    { duration: '5m', target: 500 },   // Approaching normal load
    { duration: '5m', target: 1000 },  // Normal load
    { duration: '5m', target: 2000 },  // High load
    { duration: '5m', target: 3000 },  // Very high load
    { duration: '5m', target: 4000 },  // Extreme load
    { duration: '5m', target: 5000 },  // Maximum load
    { duration: '10m', target: 5000 }, // Hold at max
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'],
    'http_req_failed': ['rate<0.10'], // Allow up to 10% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // API Gateway health check
  const gatewayRes = http.get(`${BASE_URL}/health`);

  check(gatewayRes, {
    'gateway responding': (r) => r.status === 200,
  });

  sleep(Math.random() * 2 + 1);

  // Reservation service check
  const reservationRes = http.get(`${BASE_URL}/api/v1/reservations/health`);

  check(reservationRes, {
    'reservation service responding': (r) => r.status === 200,
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'stress-test-summary.json': JSON.stringify(data),
  };
}
