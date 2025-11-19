/**
 * Performance Verification Test Suite
 *
 * Validates all performance thresholds:
 * - Availability query: <500ms
 * - Booking completion: <3 seconds
 * - Check-in: <5 seconds per passenger
 * - Boarding scan: <2 seconds
 * - Dashboard load: <30 seconds
 * - API response (p95): <200ms
 * - API response (p99): <500ms
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics for each performance threshold
const availabilityQueryTime = new Trend('availability_query_time');
const bookingCompletionTime = new Trend('booking_completion_time');
const checkinTime = new Trend('checkin_time');
const boardingScanTime = new Trend('boarding_scan_time');
const dashboardLoadTime = new Trend('dashboard_load_time');
const apiResponseTime = new Trend('api_response_time');

// Success rates
const availabilitySuccessRate = new Rate('availability_success_rate');
const bookingSuccessRate = new Rate('booking_success_rate');
const checkinSuccessRate = new Rate('checkin_success_rate');
const boardingSuccessRate = new Rate('boarding_success_rate');

// Counters
const totalRequests = new Counter('total_requests');
const failedRequests = new Counter('failed_requests');

// Gauges
const activeUsers = new Gauge('active_users');

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: Availability queries (high volume, low latency)
    availability_queries: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      exec: 'availabilityTest',
    },

    // Scenario 2: Booking flow (medium volume)
    booking_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 0 },
      ],
      startTime: '5s',
      exec: 'bookingTest',
    },

    // Scenario 3: Check-in flow
    checkin_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      startTime: '10s',
      exec: 'checkinTest',
    },

    // Scenario 4: Boarding scans (rapid, sequential)
    boarding_scans: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1m',
      duration: '5m',
      preAllocatedVUs: 5,
      maxVUs: 10,
      startTime: '15s',
      exec: 'boardingTest',
    },

    // Scenario 5: Dashboard loads (periodic)
    dashboard_loads: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5m',
      startTime: '20s',
      exec: 'dashboardTest',
    },

    // Scenario 6: API stress test for p95/p99 metrics
    api_stress: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      startTime: '25s',
      exec: 'apiStressTest',
    },
  },

  thresholds: {
    // Availability query: <500ms
    'availability_query_time': [
      'p(95)<500',
      'p(99)<800',
      'avg<300',
    ],

    // Booking completion: <3 seconds
    'booking_completion_time': [
      'p(95)<3000',
      'p(99)<5000',
      'avg<2000',
    ],

    // Check-in: <5 seconds
    'checkin_time': [
      'p(95)<5000',
      'p(99)<7000',
      'avg<3000',
    ],

    // Boarding scan: <2 seconds
    'boarding_scan_time': [
      'p(95)<2000',
      'p(99)<3000',
      'avg<1500',
    ],

    // Dashboard load: <30 seconds
    'dashboard_load_time': [
      'p(95)<30000',
      'p(99)<35000',
      'avg<20000',
    ],

    // API response times (p95): <200ms, (p99): <500ms
    'api_response_time': [
      'p(95)<200',
      'p(99)<500',
      'avg<100',
      'max<1000',
    ],

    // Overall HTTP metrics
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],
    'http_req_failed': ['rate<0.01'],

    // Success rates
    'availability_success_rate': ['rate>0.99'],
    'booking_success_rate': ['rate>0.95'],
    'checkin_success_rate': ['rate>0.98'],
    'boarding_success_rate': ['rate>0.99'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = __ENV.API_BASE || 'http://localhost:4000';

// Test data generators
function generateFlightSearch() {
  const airports = ['JFK', 'LAX', 'ORD', 'LHR', 'CDG', 'FRA', 'DXB', 'SIN', 'HKG', 'NRT'];
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
    email: `test.user.${Math.floor(id)}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    dateOfBirth: '1990-01-01',
    passportNumber: `AB${Math.floor(Math.random() * 9000000) + 1000000}`,
  };
}

// Scenario 1: Availability query test (<500ms)
export function availabilityTest() {
  const startTime = Date.now();

  group('Availability Query', () => {
    const search = generateFlightSearch();

    const response = http.get(
      `${API_BASE}/api/v1/flights/search?origin=${search.origin}&destination=${search.destination}&departureDate=${search.departureDate}&passengers=${search.passengers}`,
      {
        tags: { name: 'availability_query' },
      }
    );

    const duration = Date.now() - startTime;
    availabilityQueryTime.add(duration);
    totalRequests.add(1);

    const success = check(response, {
      'availability query successful': (r) => r.status === 200,
      'availability query <500ms': (r) => r.timings.duration < 500,
      'flights returned': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && Array.isArray(body.data.flights);
        } catch (e) {
          return false;
        }
      },
    });

    availabilitySuccessRate.add(success);
    if (!success) failedRequests.add(1);
  });

  sleep(Math.random() * 2 + 1); // 1-3 seconds think time
}

// Scenario 2: Complete booking flow test (<3s)
export function bookingTest() {
  const startTime = Date.now();
  let authToken = '';
  let flightId = '';

  group('Complete Booking Flow', () => {
    // Login
    const loginRes = http.post(
      `${API_BASE}/api/v1/auth/login`,
      JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'login' },
      }
    );

    if (loginRes.status === 200) {
      const body = JSON.parse(loginRes.body);
      authToken = body.data.tokens.accessToken;
    }

    sleep(0.5);

    // Search flights
    const search = generateFlightSearch();
    const searchRes = http.get(
      `${API_BASE}/api/v1/flights/search?origin=${search.origin}&destination=${search.destination}&departureDate=${search.departureDate}&passengers=${search.passengers}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        tags: { name: 'search_flights' },
      }
    );

    if (searchRes.status === 200) {
      const body = JSON.parse(searchRes.body);
      if (body.data.flights && body.data.flights.length > 0) {
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
          tags: { name: 'create_booking' },
        }
      );

      const duration = Date.now() - startTime;
      bookingCompletionTime.add(duration);
      totalRequests.add(3); // login + search + booking

      const success = check(bookingRes, {
        'booking created': (r) => r.status === 201,
        'booking <3s': (r) => duration < 3000,
        'PNR generated': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.data && body.data.pnr;
          } catch (e) {
            return false;
          }
        },
      });

      bookingSuccessRate.add(success);
      if (!success) failedRequests.add(1);
    } else {
      bookingSuccessRate.add(0);
      failedRequests.add(1);
    }
  });

  sleep(Math.random() * 3 + 2); // 2-5 seconds think time
}

// Scenario 3: Check-in flow test (<5s)
export function checkinTest() {
  const startTime = Date.now();

  group('Check-In Flow', () => {
    // Retrieve booking
    const retrieveRes = http.post(
      `${API_BASE}/api/v1/checkin/retrieve`,
      JSON.stringify({
        pnr: 'ABC123',
        lastName: 'Smith',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'retrieve_booking' },
      }
    );

    sleep(0.5);

    // Select seat
    http.post(
      `${API_BASE}/api/v1/checkin/select-seat`,
      JSON.stringify({
        pnr: 'ABC123',
        seat: '15C',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'select_seat' },
      }
    );

    sleep(0.5);

    // Complete check-in
    const checkinRes = http.post(
      `${API_BASE}/api/v1/checkin/complete`,
      JSON.stringify({
        pnr: 'ABC123',
        apisData: {
          passportNumber: 'AB1234567',
          nationality: 'US',
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'complete_checkin' },
      }
    );

    const duration = Date.now() - startTime;
    checkinTime.add(duration);
    totalRequests.add(3);

    const success = check(checkinRes, {
      'checkin completed': (r) => r.status === 200,
      'checkin <5s': (r) => duration < 5000,
      'boarding pass generated': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.boardingPass;
        } catch (e) {
          return false;
        }
      },
    });

    checkinSuccessRate.add(success);
    if (!success) failedRequests.add(1);
  });

  sleep(Math.random() * 4 + 2); // 2-6 seconds think time
}

// Scenario 4: Boarding scan test (<2s)
export function boardingTest() {
  const startTime = Date.now();

  group('Boarding Scan', () => {
    const pnr = `PNR${Math.floor(Math.random() * 1000000)}`;

    const scanRes = http.post(
      `${API_BASE}/api/v1/boarding/scan`,
      JSON.stringify({
        boardingPassCode: pnr,
        flightNumber: 'AA100',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'boarding_scan' },
      }
    );

    const duration = Date.now() - startTime;
    boardingScanTime.add(duration);
    totalRequests.add(1);

    const success = check(scanRes, {
      'boarding scan successful': (r) => r.status === 200 || r.status === 404,
      'boarding scan <2s': (r) => duration < 2000,
    });

    boardingSuccessRate.add(success);
    if (!success) failedRequests.add(1);
  });

  sleep(0.5); // Quick succession for boarding
}

// Scenario 5: Dashboard load test (<30s)
export function dashboardTest() {
  const startTime = Date.now();

  group('Dashboard Load', () => {
    // Login
    const loginRes = http.post(
      `${API_BASE}/api/v1/auth/login`,
      JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'dashboard_login' },
      }
    );

    let authToken = '';
    if (loginRes.status === 200) {
      const body = JSON.parse(loginRes.body);
      authToken = body.data.tokens.accessToken;
    }

    // Load dashboard metrics (multiple API calls)
    const dashboardCalls = [
      http.get(`${API_BASE}/api/v1/analytics/revenue`, {
        headers: { Authorization: `Bearer ${authToken}` },
        tags: { name: 'dashboard_revenue' },
      }),
      http.get(`${API_BASE}/api/v1/analytics/bookings`, {
        headers: { Authorization: `Bearer ${authToken}` },
        tags: { name: 'dashboard_bookings' },
      }),
      http.get(`${API_BASE}/api/v1/analytics/flights`, {
        headers: { Authorization: `Bearer ${authToken}` },
        tags: { name: 'dashboard_flights' },
      }),
      http.get(`${API_BASE}/api/v1/analytics/performance`, {
        headers: { Authorization: `Bearer ${authToken}` },
        tags: { name: 'dashboard_performance' },
      }),
    ];

    const duration = Date.now() - startTime;
    dashboardLoadTime.add(duration);
    totalRequests.add(5); // login + 4 dashboard calls

    check(duration, {
      'dashboard load <30s': (d) => d < 30000,
    });
  });

  sleep(Math.random() * 10 + 5); // 5-15 seconds think time
}

// Scenario 6: API stress test for p95/p99 metrics
export function apiStressTest() {
  group('API Stress Test', () => {
    const endpoints = [
      { method: 'GET', url: `${API_BASE}/api/v1/flights`, name: 'list_flights' },
      { method: 'GET', url: `${API_BASE}/api/v1/airports`, name: 'list_airports' },
      { method: 'GET', url: `${API_BASE}/api/v1/fares`, name: 'list_fares' },
      { method: 'GET', url: `${API_BASE}/api/v1/ancillaries`, name: 'list_ancillaries' },
      { method: 'GET', url: `${API_BASE}/api/v1/health`, name: 'health_check' },
    ];

    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

    const response = http.get(endpoint.url, {
      tags: { name: endpoint.name },
    });

    apiResponseTime.add(response.timings.duration);
    totalRequests.add(1);

    check(response, {
      'API p95 <200ms target': (r) => r.timings.duration < 200,
      'API p99 <500ms target': (r) => r.timings.duration < 500,
      'status is 200': (r) => r.status === 200,
    });

    if (response.status !== 200) {
      failedRequests.add(1);
    }
  });

  sleep(Math.random() * 0.5); // Rapid requests
}

// Setup function
export function setup() {
  console.log('🚀 Starting Performance Verification Test Suite');
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`API Base: ${API_BASE}`);
  console.log('\nPerformance Targets:');
  console.log('  • Availability query: <500ms');
  console.log('  • Booking completion: <3 seconds');
  console.log('  • Check-in: <5 seconds');
  console.log('  • Boarding scan: <2 seconds');
  console.log('  • Dashboard load: <30 seconds');
  console.log('  • API p95: <200ms');
  console.log('  • API p99: <500ms');
  console.log('');

  return {};
}

// Teardown function
export function teardown(data) {
  console.log('\n✅ Performance Verification Test Suite Completed');
}

// Generate HTML report
export function handleSummary(data) {
  return {
    'performance-report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
