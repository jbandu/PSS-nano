/**
 * Flight Test Data Fixtures
 *
 * Realistic flight data for testing booking and inventory flows.
 */

export const AIRPORTS = [
  { code: 'JFK', city: 'New York', country: 'US', name: 'John F. Kennedy International Airport' },
  { code: 'LAX', city: 'Los Angeles', country: 'US', name: 'Los Angeles International Airport' },
  { code: 'ORD', city: 'Chicago', country: 'US', name: "O'Hare International Airport" },
  { code: 'LHR', city: 'London', country: 'GB', name: 'Heathrow Airport' },
  { code: 'CDG', city: 'Paris', country: 'FR', name: 'Charles de Gaulle Airport' },
  { code: 'FRA', city: 'Frankfurt', country: 'DE', name: 'Frankfurt Airport' },
  { code: 'DXB', city: 'Dubai', country: 'AE', name: 'Dubai International Airport' },
  { code: 'SIN', city: 'Singapore', country: 'SG', name: 'Changi Airport' },
  { code: 'HKG', city: 'Hong Kong', country: 'HK', name: 'Hong Kong International Airport' },
  { code: 'NRT', city: 'Tokyo', country: 'JP', name: 'Narita International Airport' },
  { code: 'SYD', city: 'Sydney', country: 'AU', name: 'Sydney Airport' },
  { code: 'YYZ', city: 'Toronto', country: 'CA', name: 'Toronto Pearson International Airport' },
];

export const AIRCRAFT_TYPES = [
  { code: 'B737', name: 'Boeing 737', seats: 180, economySeats: 150, businessSeats: 30 },
  { code: 'B777', name: 'Boeing 777', seats: 350, economySeats: 290, businessSeats: 60 },
  { code: 'B787', name: 'Boeing 787 Dreamliner', seats: 290, economySeats: 240, businessSeats: 50 },
  { code: 'A320', name: 'Airbus A320', seats: 180, economySeats: 150, businessSeats: 30 },
  { code: 'A350', name: 'Airbus A350', seats: 325, economySeats: 270, businessSeats: 55 },
  { code: 'A380', name: 'Airbus A380', seats: 550, economySeats: 450, businessSeats: 100 },
];

export const FARE_CLASSES = [
  { code: 'Y', name: 'Economy', basePrice: 250 },
  { code: 'W', name: 'Premium Economy', basePrice: 450 },
  { code: 'J', name: 'Business', basePrice: 1200 },
  { code: 'F', name: 'First Class', basePrice: 3500 },
];

/**
 * Generate a flight number
 */
export function generateFlightNumber(airlineCode = 'AA'): string {
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${airlineCode}${number}`;
}

/**
 * Generate a PNR (Passenger Name Record)
 */
export function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

/**
 * Generate a random flight
 */
export function generateFlight(overrides?: Partial<Flight>): Flight {
  const origin = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  let destination = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];

  // Ensure origin and destination are different
  while (destination.code === origin.code) {
    destination = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  }

  const aircraft = AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)];

  const departureTime = generateDepartureTime();
  const duration = generateFlightDuration(origin.code, destination.code);
  const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

  return {
    id: `FLT-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    flightNumber: generateFlightNumber(),
    origin: origin.code,
    destination: destination.code,
    departureTime: departureTime.toISOString(),
    arrivalTime: arrivalTime.toISOString(),
    aircraft: aircraft.code,
    status: 'scheduled',
    availableSeats: {
      economy: aircraft.economySeats,
      business: aircraft.businessSeats,
    },
    ...overrides,
  };
}

/**
 * Generate multiple flights
 */
export function generateFlights(count: number): Flight[] {
  return Array.from({ length: count }, () => generateFlight());
}

/**
 * Generate a departure time (1-90 days from now)
 */
function generateDepartureTime(): Date {
  const now = new Date();
  const daysFromNow = 1 + Math.floor(Math.random() * 89);
  const departureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

  // Random hour between 0-23
  departureDate.setHours(Math.floor(Math.random() * 24));
  departureDate.setMinutes(Math.floor(Math.random() * 60));
  departureDate.setSeconds(0);
  departureDate.setMilliseconds(0);

  return departureDate;
}

/**
 * Generate flight duration (in minutes) based on route
 */
function generateFlightDuration(origin: string, destination: string): number {
  // Simplified duration based on distance categories
  const shortHaul = ['JFK-ORD', 'LAX-ORD', 'LHR-CDG', 'LHR-FRA'];
  const mediumHaul = ['JFK-LHR', 'LAX-JFK', 'CDG-DXB'];

  const route = `${origin}-${destination}`;
  const reverseRoute = `${destination}-${origin}`;

  if (shortHaul.includes(route) || shortHaul.includes(reverseRoute)) {
    return 90 + Math.floor(Math.random() * 90); // 90-180 minutes
  } else if (mediumHaul.includes(route) || mediumHaul.includes(reverseRoute)) {
    return 300 + Math.floor(Math.random() * 180); // 300-480 minutes
  } else {
    return 480 + Math.floor(Math.random() * 240); // 480-720 minutes
  }
}

/**
 * Flight interface
 */
export interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  aircraft: string;
  status: string;
  availableSeats: {
    economy: number;
    business: number;
  };
}

/**
 * Sample flights for testing
 */
export const SAMPLE_FLIGHTS: Flight[] = [
  {
    id: 'FLT-001',
    flightNumber: 'AA1234',
    origin: 'JFK',
    destination: 'LAX',
    departureTime: '2025-12-01T08:00:00Z',
    arrivalTime: '2025-12-01T14:30:00Z',
    aircraft: 'B737',
    status: 'scheduled',
    availableSeats: {
      economy: 150,
      business: 30,
    },
  },
  {
    id: 'FLT-002',
    flightNumber: 'AA5678',
    origin: 'LHR',
    destination: 'JFK',
    departureTime: '2025-12-02T10:00:00Z',
    arrivalTime: '2025-12-02T13:00:00Z',
    aircraft: 'B777',
    status: 'scheduled',
    availableSeats: {
      economy: 290,
      business: 60,
    },
  },
];
