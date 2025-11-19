/**
 * Booking Test Data Fixtures
 *
 * Realistic booking and payment data for testing.
 */

import { generatePNR } from './flight-data';
import { SAMPLE_PASSENGERS } from './passenger-data';
import { SAMPLE_FLIGHTS } from './flight-data';

/**
 * Payment card data (test cards)
 */
export const TEST_PAYMENT_CARDS = {
  visa: {
    number: '4111111111111111',
    expiry: '12/28',
    cvv: '123',
    holder: 'John Smith',
    type: 'visa',
  },
  mastercard: {
    number: '5555555555554444',
    expiry: '12/28',
    cvv: '456',
    holder: 'Sarah Johnson',
    type: 'mastercard',
  },
  amex: {
    number: '378282246310005',
    expiry: '12/28',
    cvv: '1234',
    holder: 'Michael Brown',
    type: 'amex',
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/28',
    cvv: '123',
    holder: 'Declined Card',
    type: 'visa',
  },
  insufficientFunds: {
    number: '4000000000009995',
    expiry: '12/28',
    cvv: '123',
    holder: 'Insufficient Funds',
    type: 'visa',
  },
};

/**
 * Ancillary products
 */
export const ANCILLARY_PRODUCTS = [
  { id: 'BAG-001', code: 'BAG', name: 'Extra Baggage (23kg)', price: 50 },
  { id: 'MEAL-001', code: 'MEAL', name: 'Premium Meal', price: 25 },
  { id: 'SEAT-001', code: 'SEAT', name: 'Preferred Seat Selection', price: 30 },
  { id: 'SEAT-002', code: 'SEAT_EXTRA', name: 'Extra Legroom Seat', price: 75 },
  { id: 'LOUNGE-001', code: 'LOUNGE', name: 'Airport Lounge Access', price: 50 },
  { id: 'WIFI-001', code: 'WIFI', name: 'Inflight WiFi', price: 15 },
  { id: 'PRIORITY-001', code: 'PRIORITY', name: 'Priority Boarding', price: 20 },
];

/**
 * Generate a random booking
 */
export function generateBooking(overrides?: Partial<Booking>): Booking {
  const pnr = generatePNR();
  const passenger = SAMPLE_PASSENGERS[0];
  const flight = SAMPLE_FLIGHTS[0];

  const basePrice = 350;
  const taxes = basePrice * 0.15;
  const fees = 25;

  return {
    id: `BKG-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    pnr,
    status: 'confirmed',
    passenger: {
      id: passenger.id,
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email,
    },
    flights: [
      {
        id: flight.id,
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        class: 'Y',
        seatNumber: generateSeatNumber(),
      },
    ],
    payment: {
      amount: basePrice + taxes + fees,
      currency: 'USD',
      breakdown: {
        basePrice,
        taxes,
        fees,
        ancillaries: 0,
      },
      status: 'completed',
      method: 'credit_card',
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Generate multiple bookings
 */
export function generateBookings(count: number): Booking[] {
  return Array.from({ length: count }, () => generateBooking());
}

/**
 * Generate a seat number
 */
function generateSeatNumber(): string {
  const row = Math.floor(Math.random() * 30) + 1;
  const seat = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
  return `${row}${seat}`;
}

/**
 * Booking interface
 */
export interface Booking {
  id: string;
  pnr: string;
  status: string;
  passenger: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  flights: Array<{
    id: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    class: string;
    seatNumber: string;
  }>;
  payment: {
    amount: number;
    currency: string;
    breakdown: {
      basePrice: number;
      taxes: number;
      fees: number;
      ancillaries: number;
    };
    status: string;
    method: string;
  };
  createdAt: string;
}

/**
 * Sample booking for testing
 */
export const SAMPLE_BOOKING: Booking = {
  id: 'BKG-001',
  pnr: 'ABC123',
  status: 'confirmed',
  passenger: {
    id: 'PAX-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
  },
  flights: [
    {
      id: 'FLT-001',
      flightNumber: 'AA1234',
      origin: 'JFK',
      destination: 'LAX',
      departureTime: '2025-12-01T08:00:00Z',
      arrivalTime: '2025-12-01T14:30:00Z',
      class: 'Y',
      seatNumber: '12A',
    },
  ],
  payment: {
    amount: 400,
    currency: 'USD',
    breakdown: {
      basePrice: 350,
      taxes: 52.5,
      fees: 25,
      ancillaries: 0,
    },
    status: 'completed',
    method: 'credit_card',
  },
  createdAt: '2025-11-19T10:00:00Z',
};
