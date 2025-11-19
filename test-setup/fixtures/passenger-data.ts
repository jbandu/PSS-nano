/**
 * Passenger Test Data Fixtures
 *
 * Realistic passenger data for testing booking and reservation flows.
 */

export const PASSENGER_FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Emily',
  'Robert', 'Olivia', 'William', 'Sophia', 'Richard', 'Isabella', 'Thomas',
  'Ava', 'Charles', 'Mia', 'Daniel', 'Charlotte', 'Matthew', 'Amelia',
  'Christopher', 'Harper', 'Andrew', 'Evelyn', 'Joseph', 'Abigail',
];

export const PASSENGER_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Lewis',
];

export const PASSENGER_TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Japan', 'China', 'India', 'Brazil',
  'Mexico', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark',
];

export const COUNTRY_CODES = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'CN', 'IN', 'BR',
  'MX', 'NL', 'CH', 'SE', 'NO', 'DK',
];

/**
 * Generate a random passenger
 */
export function generatePassenger(overrides?: Partial<Passenger>): Passenger {
  const firstName = PASSENGER_FIRST_NAMES[
    Math.floor(Math.random() * PASSENGER_FIRST_NAMES.length)
  ];
  const lastName = PASSENGER_LAST_NAMES[
    Math.floor(Math.random() * PASSENGER_LAST_NAMES.length)
  ];
  const title = PASSENGER_TITLES[
    Math.floor(Math.random() * PASSENGER_TITLES.length)
  ];
  const nationality = COUNTRY_CODES[
    Math.floor(Math.random() * COUNTRY_CODES.length)
  ];

  return {
    id: `PAX-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    title,
    firstName,
    lastName,
    dateOfBirth: generateDateOfBirth(),
    gender: Math.random() > 0.5 ? 'M' : 'F',
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: generatePhoneNumber(),
    nationality,
    passportNumber: generatePassportNumber(nationality),
    passportExpiry: generatePassportExpiry(),
    ...overrides,
  };
}

/**
 * Generate multiple passengers
 */
export function generatePassengers(count: number): Passenger[] {
  return Array.from({ length: count }, () => generatePassenger());
}

/**
 * Generate a date of birth (18-80 years old)
 */
function generateDateOfBirth(): string {
  const today = new Date();
  const age = 18 + Math.floor(Math.random() * 62); // 18-80 years old
  const dob = new Date(
    today.getFullYear() - age,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  );
  return dob.toISOString().split('T')[0];
}

/**
 * Generate a phone number
 */
function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${prefix}${line}`;
}

/**
 * Generate a passport number
 */
function generatePassportNumber(countryCode: string): string {
  const num = Math.floor(Math.random() * 100000000);
  return `${countryCode}${num.toString().padStart(8, '0')}`;
}

/**
 * Generate a passport expiry date (1-10 years from now)
 */
function generatePassportExpiry(): string {
  const today = new Date();
  const years = 1 + Math.floor(Math.random() * 9);
  const expiry = new Date(today.getFullYear() + years, today.getMonth(), today.getDate());
  return expiry.toISOString().split('T')[0];
}

/**
 * Passenger interface
 */
export interface Passenger {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

/**
 * Sample passengers for testing
 */
export const SAMPLE_PASSENGERS: Passenger[] = [
  {
    id: 'PAX-001',
    title: 'Mr',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-03-15',
    gender: 'M',
    email: 'john.smith@example.com',
    phone: '+14155551234',
    nationality: 'US',
    passportNumber: 'US12345678',
    passportExpiry: '2030-12-31',
  },
  {
    id: 'PAX-002',
    title: 'Mrs',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1990-07-22',
    gender: 'F',
    email: 'sarah.johnson@example.com',
    phone: '+14155555678',
    nationality: 'US',
    passportNumber: 'US87654321',
    passportExpiry: '2029-06-30',
  },
];
