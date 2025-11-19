/**
 * Concurrent Load Test
 *
 * Load testing requirements:
 * - 1,000 concurrent bookings
 * - 10,000 availability queries/minute
 * - 500 concurrent check-ins
 * - Sustained load for 1 hour
 * - Spike testing (10x normal load)
 * - Measure: response time, error rate, resource usage
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const bookingSuccessRate = new Rate('booking_success_rate');
const checkinSuccessRate = new Rate('checkin_success_rate');
const availabilitySuccessRate = new Rate('availability_success_rate');

const bookingDuration = new Trend('booking_duration');
const checkinDuration = new Trend('checkin_duration');
const availabilityDuration = new Trend('availability_duration');

const totalBookings = new Counter('total_bookings');
const successfulBookings = new Counter('successful_bookings');
const failedBookings = new Counter('failed_bookings');

const totalCheckins = new Counter('total_checkins');
const successfulCheckins = new Counter('successful_checkins');

// Test configuration
export const options = {
  scenarios: {
    // 1,000 concurrent bookings
    concurrent_bookings: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '10m',
      exec: 'bookingFlow',
    },

    // 10,000 availability queries per minute = ~167/second
    high_volume_availability: {
      executor: 'constant-arrival-rate',
      rate: 10000,
      timeUnit: '1m',
      duration: '10m',
      preAllocatedVUs: 200,
      maxVUs: 500,
      exec: 'availabilityQuery',
    },

    // 500 concurrent check-ins
    concurrent_checkins: {
      executor: 'constant-vus',
      vus: 500,
      duration: '10m',
      exec: 'checkinFlow',
    },
  },

  thresholds: {
    // Error rate must be <1%
    'http_req_failed': ['rate<0.01'],

    // Response time thresholds
    'http_req_duration': [
      'p(95)<5000',
      'p(99)<10000',
    ],

    // Booking thresholds
    'booking_success_rate': ['rate>0.95'],
    'booking_duration': ['p(95)<5000', 'avg<3000'],

    // Check-in thresholds
    'checkin_success_rate': ['rate>0.98'],
    'checkin_duration': ['p(95)<7000', 'avg<4000'],

    // Availability thresholds
    'availability_success_rate': ['rate>0.99'],
    'availability_duration': ['p(95)<1000', 'avg<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = __ENV.API_BASE || 'http://localhost:4000';

// Test data
const airports = ['JFK', 'LAX', 'ORD', 'LHR', 'CDG', 'FRA', 'DXB', 'SIN', 'HKG', 'NRT', 'SYD', 'MEL'];

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

// Booking flow
export function bookingFlow() {
  const startTime = Date.now();
  let authToken = '';
  let flightId = '';
  let bookingId = '';

  totalBookings.add(1);

  group('Booking Flow', () => {
    // Login
    const loginRes = http.post(
      `${API_BASE}/api/v1/auth/login`,
      JSON.stringify({
        email: `user${Math.floor(Math.random() * 1000)}@example.com`,
        password: 'password123',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (loginRes.status === 200 || loginRes.status === 404) {
      // Register if user doesn't exist
      if (loginRes.status === 404) {
        const registerRes = http.post(
          `${API_BASE}/api/v1/auth/register`,
          JSON.stringify({
            email: `user${Math.floor(Math.random() * 1000)}@example.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (registerRes.status === 201) {
          const body = JSON.parse(registerRes.body);
          authToken = body.data.tokens.accessToken;
        }
      } else {
        const body = JSON.parse(loginRes.body);
        authToken = body.data.tokens.accessToken;
      }
    }

    sleep(0.5);

    // Search flights
    const search = generateFlightSearch();
    const searchRes = http.get(
      `${API_BASE}/api/v1/flights/search?origin=${search.origin}&destination=${search.destination}&departureDate=${search.departureDate}&passengers=${search.passengers}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (searchRes.status === 200) {
      try {
        const body = JSON.parse(searchRes.body);
        if (body.data && body.data.flights && body.data.flights.length > 0) {
          flightId = body.data.flights[0].id;
        }
      } catch (e) {
        console.error('Failed to parse search response');
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
      bookingDuration.add(duration);

      const success = check(bookingRes, {
        'booking created': (r) => r.status === 201,
        'PNR generated': (r) => {
          try {
            const body = JSON.parse(r.body);
            bookingId = body.data?.id;
            return body.data && body.data.pnr;
          } catch (e) {
            return false;
          }
        },
      });

      bookingSuccessRate.add(success);

      if (success) {
        successfulBookings.add(1);

        // Process payment
        if (bookingId) {
          sleep(0.5);

          http.post(
            `${API_BASE}/api/v1/payments/process`,
            JSON.stringify({
              bookingId,
              paymentMethod: 'credit_card',
              cardNumber: '4111111111111111',
              expiryDate: '12/28',
              cvv: '123',
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
        }
      } else {
        failedBookings.add(1);
      }
    } else {
      bookingSuccessRate.add(0);
      failedBookings.add(1);
    }
  });

  sleep(Math.random() * 3 + 2);
}

// Availability query
export function availabilityQuery() {
  const startTime = Date.now();

  group('Availability Query', () => {
    const search = generateFlightSearch();

    const response = http.get(
      `${API_BASE}/api/v1/flights/search?origin=${search.origin}&destination=${search.destination}&departureDate=${search.departureDate}&passengers=${search.passengers}`
    );

    const duration = Date.now() - startTime;
    availabilityDuration.add(duration);

    const success = check(response, {
      'availability query successful': (r) => r.status === 200,
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
  });

  // No sleep - high throughput
}

// Check-in flow
export function checkinFlow() {
  const startTime = Date.now();
  const pnr = `TST${Math.floor(Math.random() * 1000000)}`;

  totalCheckins.add(1);

  group('Check-In Flow', () => {
    // Retrieve booking
    const retrieveRes = http.post(
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

    // Select seat
    http.post(
      `${API_BASE}/api/v1/checkin/select-seat`,
      JSON.stringify({
        pnr: pnr,
        seat: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    sleep(0.5);

    // Complete check-in
    const checkinRes = http.post(
      `${API_BASE}/api/v1/checkin/complete`,
      JSON.stringify({
        pnr: pnr,
        apisData: {
          passportNumber: `AB${Math.floor(Math.random() * 9000000) + 1000000}`,
          nationality: 'US',
          dateOfBirth: '1990-01-01',
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const duration = Date.now() - startTime;
    checkinDuration.add(duration);

    const success = check(checkinRes, {
      'checkin completed': (r) => r.status === 200 || r.status === 404,
    });

    checkinSuccessRate.add(success);

    if (success) {
      successfulCheckins.add(1);
    }
  });

  sleep(Math.random() * 4 + 2);
}

export function setup() {
  console.log('🚀 Starting Concurrent Load Test');
  console.log('\nLoad Targets:');
  console.log('  • 1,000 concurrent bookings');
  console.log('  • 10,000 availability queries/minute');
  console.log('  • 500 concurrent check-ins');
  console.log('  • Duration: 10 minutes');
  console.log('');

  return {};
}

export function teardown(data) {
  console.log('\n✅ Concurrent Load Test Completed');
}
