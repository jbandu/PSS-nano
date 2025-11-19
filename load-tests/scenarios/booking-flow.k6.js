/**
 * k6 Load Test - Booking Flow
 *
 * Simulates 1000+ concurrent users completing flight bookings.
 * Tests system performance under realistic load.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const bookingSuccessRate = new Rate('booking_success_rate');
const bookingDuration = new Trend('booking_duration');
const failedBookings = new Counter('failed_bookings');
const successfulBookings = new Counter('successful_bookings');

// Test configuration
export const options = {
  stages: [
    // Ramp-up: 0 to 100 users over 2 minutes
    { duration: '2m', target: 100 },
    // Steady state: 100 users for 5 minutes
    { duration: '5m', target: 100 },
    // Ramp-up to peak: 100 to 1000 users over 3 minutes
    { duration: '3m', target: 1000 },
    // Peak load: 1000 users for 5 minutes
    { duration: '5m', target: 1000 },
    // Ramp-down: 1000 to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // 95% of requests should complete within 2 seconds
    'http_req_duration': ['p(95)<2000'],
    // Error rate should be less than 1%
    'http_req_failed': ['rate<0.01'],
    // Booking success rate should be above 98%
    'booking_success_rate': ['rate>0.98'],
    // Average booking duration should be under 5 seconds
    'booking_duration': ['avg<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const airports = ['JFK', 'LAX', 'ORD', 'LHR', 'CDG', 'FRA', 'DXB', 'SIN'];
const testCard = {
  number: '4111111111111111',
  expiry: '12/28',
  cvv: '123',
};

/**
 * Generate random passenger data
 */
function generatePassenger() {
  const id = Date.now() + Math.random();
  return {
    firstName: `Test${id}`,
    lastName: `User${id}`,
    email: `test.user.${id}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  };
}

/**
 * Generate random flight search
 */
function generateFlightSearch() {
  const origin = airports[Math.floor(Math.random() * airports.length)];
  let destination = airports[Math.floor(Math.random() * airports.length)];

  // Ensure origin and destination are different
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

/**
 * Main test scenario - Complete booking flow
 */
export default function () {
  const startTime = Date.now();
  let authToken = '';
  let flightId = '';
  let bookingId = '';

  group('Complete Booking Flow', () => {
    // Step 1: Login/Authentication
    group('Authentication', () => {
      const loginPayload = JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      });

      const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' },
      });

      check(loginRes, {
        'login successful': (r) => r.status === 200,
        'received access token': (r) => {
          const body = JSON.parse(r.body);
          return body.data && body.data.tokens && body.data.tokens.accessToken;
        },
      });

      if (loginRes.status === 200) {
        const body = JSON.parse(loginRes.body);
        authToken = body.data.tokens.accessToken;
      }
    });

    sleep(1);

    // Step 2: Search for flights
    group('Flight Search', () => {
      const search = generateFlightSearch();
      const searchRes = http.get(
        `${BASE_URL}/api/v1/flights/search?origin=${search.origin}&destination=${search.destination}&departureDate=${search.departureDate}&passengers=${search.passengers}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const searchSuccess = check(searchRes, {
        'search successful': (r) => r.status === 200,
        'flights returned': (r) => {
          const body = JSON.parse(r.body);
          return body.data && body.data.flights && body.data.flights.length > 0;
        },
      });

      if (searchSuccess && searchRes.status === 200) {
        const body = JSON.parse(searchRes.body);
        if (body.data.flights.length > 0) {
          flightId = body.data.flights[0].id;
        }
      }
    });

    sleep(2);

    // Step 3: Create booking
    group('Create Booking', () => {
      if (!flightId) {
        console.log('No flight selected, skipping booking');
        failedBookings.add(1);
        return;
      }

      const passenger = generatePassenger();
      const bookingPayload = JSON.stringify({
        flightId,
        passengers: [passenger],
        contactEmail: passenger.email,
        contactPhone: passenger.phone,
      });

      const bookingRes = http.post(
        `${BASE_URL}/api/v1/bookings`,
        bookingPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const bookingSuccess = check(bookingRes, {
        'booking created': (r) => r.status === 201,
        'PNR generated': (r) => {
          const body = JSON.parse(r.body);
          return body.data && body.data.pnr;
        },
      });

      if (bookingSuccess && bookingRes.status === 201) {
        const body = JSON.parse(bookingRes.body);
        bookingId = body.data.id;
      }
    });

    sleep(1);

    // Step 4: Process payment
    group('Payment Processing', () => {
      if (!bookingId) {
        console.log('No booking created, skipping payment');
        failedBookings.add(1);
        return;
      }

      const paymentPayload = JSON.stringify({
        bookingId,
        paymentMethod: 'credit_card',
        cardNumber: testCard.number,
        expiryDate: testCard.expiry,
        cvv: testCard.cvv,
      });

      const paymentRes = http.post(
        `${BASE_URL}/api/v1/payments/process`,
        paymentPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const paymentSuccess = check(paymentRes, {
        'payment successful': (r) => r.status === 200,
        'booking confirmed': (r) => {
          const body = JSON.parse(r.body);
          return body.data && body.data.status === 'confirmed';
        },
      });

      // Record metrics
      const duration = Date.now() - startTime;
      bookingDuration.add(duration);

      if (paymentSuccess) {
        bookingSuccessRate.add(1);
        successfulBookings.add(1);
      } else {
        bookingSuccessRate.add(0);
        failedBookings.add(1);
      }
    });
  });

  // Random think time between iterations
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}

/**
 * Setup function - runs once before the test
 */
export function setup() {
  console.log('Starting booking flow load test...');
  console.log(`Target URL: ${BASE_URL}`);
  return {};
}

/**
 * Teardown function - runs once after the test
 */
export function teardown(data) {
  console.log('Load test completed');
}
