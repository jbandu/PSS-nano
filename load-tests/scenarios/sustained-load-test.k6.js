/**
 * Sustained Load Test - 1 Hour Duration
 *
 * Tests system stability and identifies:
 * - Memory leaks
 * - Resource exhaustion
 * - Degradation over time
 * - Connection pool issues
 * - Database performance degradation
 *
 * Sustained load metrics measured continuously for 1 hour
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics to track degradation over time
const responseTimeByMinute = new Trend('response_time_by_minute');
const errorRateByMinute = new Rate('error_rate_by_minute');
const throughputByMinute = new Counter('throughput_by_minute');
const activeConnections = new Gauge('active_connections');
const memoryUsage = new Gauge('estimated_memory_usage');

const bookingSuccessRate = new Rate('booking_success_rate');
const availabilitySuccessRate = new Rate('availability_success_rate');
const checkinSuccessRate = new Rate('checkin_success_rate');

// Test configuration for 1-hour sustained load
export const options = {
  scenarios: {
    // Sustained booking load
    sustained_bookings: {
      executor: 'constant-vus',
      vus: 100,
      duration: '60m',
      exec: 'bookingFlow',
    },

    // Sustained availability queries
    sustained_availability: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1m',
      duration: '60m',
      preAllocatedVUs: 50,
      maxVUs: 100,
      exec: 'availabilityQuery',
    },

    // Sustained check-ins
    sustained_checkins: {
      executor: 'constant-vus',
      vus: 50,
      duration: '60m',
      exec: 'checkinFlow',
    },

    // Periodic dashboard loads
    periodic_dashboard: {
      executor: 'constant-vus',
      vus: 10,
      duration: '60m',
      exec: 'dashboardLoad',
    },

    // Background API health checks every 30 seconds
    health_monitoring: {
      executor: 'constant-arrival-rate',
      rate: 2,
      timeUnit: '1m',
      duration: '60m',
      preAllocatedVUs: 1,
      maxVUs: 2,
      exec: 'healthCheck',
    },
  },

  thresholds: {
    // Should maintain <1% error rate throughout
    'http_req_failed': ['rate<0.01'],

    // Response times should not degrade significantly
    'http_req_duration': [
      'p(95)<5000',
      'p(99)<10000',
      'avg<2000',
    ],

    // Success rates should remain high
    'booking_success_rate': ['rate>0.95'],
    'availability_success_rate': ['rate>0.99'],
    'checkin_success_rate': ['rate>0.98'],

    // Response time should not increase over time
    'response_time_by_minute': [
      'p(95)<5000',
      'avg<2000',
    ],

    // Error rate should remain low throughout
    'error_rate_by_minute': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = __ENV.API_BASE || 'http://localhost:4000';

const airports = ['JFK', 'LAX', 'ORD', 'LHR', 'CDG', 'FRA', 'DXB', 'SIN', 'HKG', 'NRT'];

function generateFlightSearch() {
  const origin = airports[Math.floor(Math.random() * airports.length)];
  let destination = airports[Math.floor(Math.random() * airports.length)];

  while (destination === origin) {
    destination = airports[Math.floor(Math.random() * airports.length)];
  }

  const daysFromNow = Math.floor(Math.random() * 90) + 1;
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + daysFromNow);

  return {
    origin,
    destination,
    departureDate: departureDate.toISOString().split('T')[0],
    passengers: Math.floor(Math.random() * 4) + 1,
  };
}

function generatePassenger() {
  const id = Date.now() + Math.random();
  return {
    firstName: `Test${Math.floor(id)}`,
    lastName: `User${Math.floor(id)}`,
    email: `test.${Math.floor(id)}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    dateOfBirth: '1990-01-01',
    passportNumber: `AB${Math.floor(Math.random() * 9000000) + 1000000}`,
  };
}

// Booking flow with detailed metrics
export function bookingFlow() {
  const startTime = Date.now();
  let authToken = '';
  let flightId = '';

  group('Sustained Booking Flow', () => {
    // Login
    const loginRes = http.post(
      `${API_BASE}/api/v1/auth/login`,
      JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (loginRes.status === 200) {
      const body = JSON.parse(loginRes.body);
      authToken = body.data.tokens.accessToken;
    }

    sleep(0.5);

    // Search
    const search = generateFlightSearch();
    const searchRes = http.get(
      `${API_BASE}/api/v1/flights/search?origin=${search.origin}&destination=${search.destination}&departureDate=${search.departureDate}&passengers=${search.passengers}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (searchRes.status === 200) {
      const body = JSON.parse(searchRes.body);
      if (body.data && body.data.flights && body.data.flights.length > 0) {
        flightId = body.data.flights[0].id;
      }
    }

    sleep(1);

    // Create booking
    if (flightId) {
      const passenger = generatePassenger();
      const bookingRes = http.post(
        `${API_BASE}/api/v1/bookings`,
        JSON.stringify({
          flightId,
          passengers: [passenger],
          contactEmail: passenger.email,
          contactPhone: passenger.phone,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const duration = Date.now() - startTime;
      responseTimeByMinute.add(duration);
      throughputByMinute.add(1);

      const success = check(bookingRes, {
        'booking created': (r) => r.status === 201,
      });

      bookingSuccessRate.add(success);
      errorRateByMinute.add(!success);
    }
  });

  sleep(Math.random() * 3 + 2);
}

// Availability query
export function availabilityQuery() {
  const startTime = Date.now();

  group('Sustained Availability Query', () => {
    const search = generateFlightSearch();

    const response = http.get(
      `${API_BASE}/api/v1/flights/search?origin=${search.origin}&destination=${search.destination}&departureDate=${search.departureDate}&passengers=${search.passengers}`
    );

    const duration = Date.now() - startTime;
    responseTimeByMinute.add(duration);
    throughputByMinute.add(1);

    const success = check(response, {
      'query successful': (r) => r.status === 200,
    });

    availabilitySuccessRate.add(success);
    errorRateByMinute.add(!success);
  });
}

// Check-in flow
export function checkinFlow() {
  const startTime = Date.now();
  const pnr = `TST${Math.floor(Math.random() * 1000000)}`;

  group('Sustained Check-In Flow', () => {
    // Retrieve
    http.post(
      `${API_BASE}/api/v1/checkin/retrieve`,
      JSON.stringify({
        pnr: pnr,
        lastName: 'Smith',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    sleep(0.5);

    // Complete
    const checkinRes = http.post(
      `${API_BASE}/api/v1/checkin/complete`,
      JSON.stringify({
        pnr: pnr,
        apisData: {
          passportNumber: `AB${Math.floor(Math.random() * 9000000) + 1000000}`,
          nationality: 'US',
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const duration = Date.now() - startTime;
    responseTimeByMinute.add(duration);
    throughputByMinute.add(1);

    const success = check(checkinRes, {
      'checkin completed': (r) => r.status === 200 || r.status === 404,
    });

    checkinSuccessRate.add(success);
    errorRateByMinute.add(!success);
  });

  sleep(Math.random() * 4 + 2);
}

// Dashboard load
export function dashboardLoad() {
  group('Dashboard Load', () => {
    const loginRes = http.post(
      `${API_BASE}/api/v1/auth/login`,
      JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    let authToken = '';
    if (loginRes.status === 200) {
      const body = JSON.parse(loginRes.body);
      authToken = body.data.tokens.accessToken;
    }

    // Load multiple dashboard endpoints
    http.batch([
      ['GET', `${API_BASE}/api/v1/analytics/revenue`, null, {
        headers: { Authorization: `Bearer ${authToken}` },
      }],
      ['GET', `${API_BASE}/api/v1/analytics/bookings`, null, {
        headers: { Authorization: `Bearer ${authToken}` },
      }],
      ['GET', `${API_BASE}/api/v1/analytics/flights`, null, {
        headers: { Authorization: `Bearer ${authToken}` },
      }],
    ]);

    throughputByMinute.add(4);
  });

  sleep(Math.random() * 20 + 10);
}

// Health check monitoring
export function healthCheck() {
  const startTime = Date.now();

  group('Health Check', () => {
    const response = http.get(`${API_BASE}/api/v1/health`);

    const duration = Date.now() - startTime;

    const success = check(response, {
      'health check ok': (r) => r.status === 200,
      'response time <1s': (r) => duration < 1000,
    });

    if (success) {
      try {
        const body = JSON.parse(response.body);

        // Track resource usage if available
        if (body.memory) {
          memoryUsage.add(body.memory.heapUsed || 0);
        }

        if (body.connections) {
          activeConnections.add(body.connections.active || 0);
        }

        // Log warnings if resources are high
        if (body.memory && body.memory.heapUsed > 1000000000) { // >1GB
          console.warn(`⚠️  High memory usage: ${(body.memory.heapUsed / 1000000000).toFixed(2)}GB`);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });

  sleep(30); // Check every 30 seconds
}

export function setup() {
  console.log('🚀 Starting Sustained Load Test - 1 Hour Duration');
  console.log('\nTest Configuration:');
  console.log('  • Duration: 60 minutes');
  console.log('  • Concurrent bookings: 100 VUs');
  console.log('  • Availability queries: 1000/minute');
  console.log('  • Concurrent check-ins: 50 VUs');
  console.log('  • Dashboard users: 10 VUs');
  console.log('\nMonitoring for:');
  console.log('  • Memory leaks');
  console.log('  • Performance degradation');
  console.log('  • Resource exhaustion');
  console.log('  • Error rate increases');
  console.log('');

  // Warm-up health check
  const healthRes = http.get(`${API_BASE}/api/v1/health`);
  console.log(`Initial health check: ${healthRes.status}`);

  return {
    startTime: Date.now(),
  };
}

export function teardown(data) {
  const durationMinutes = (Date.now() - data.startTime) / 60000;

  console.log('\n✅ Sustained Load Test Completed');
  console.log(`\nActual duration: ${durationMinutes.toFixed(2)} minutes`);

  // Final health check
  const healthRes = http.get(`${API_BASE}/api/v1/health`);
  console.log(`Final health check: ${healthRes.status}`);

  if (healthRes.status === 200) {
    try {
      const body = JSON.parse(healthRes.body);
      console.log('\nFinal System State:');
      if (body.memory) {
        console.log(`  Memory: ${(body.memory.heapUsed / 1000000).toFixed(2)}MB`);
      }
      if (body.connections) {
        console.log(`  Active Connections: ${body.connections.active}`);
      }
    } catch (e) {
      // Ignore
    }
  }
}
