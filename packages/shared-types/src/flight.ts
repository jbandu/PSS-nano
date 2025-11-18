import { UUID, ISODateTime } from './common';

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  IN_FLIGHT = 'IN_FLIGHT',
  LANDED = 'LANDED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
}

export enum CabinClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

export interface Flight {
  id: UUID;
  flightNumber: string;
  airlineCode: string;
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: ISODateTime;
  scheduledArrival: ISODateTime;
  actualDeparture?: ISODateTime;
  actualArrival?: ISODateTime;
  status: FlightStatus;
  aircraftType: string;
  capacity: number;
  availableSeats: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: CabinClass;
}

export interface Seat {
  id: UUID;
  flightId: UUID;
  seatNumber: string;
  cabinClass: CabinClass;
  isAvailable: boolean;
  price?: number;
  isEmergencyExit: boolean;
}

export interface Inventory {
  id: UUID;
  flightId: UUID;
  cabinClass: CabinClass;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  blockedSeats: number;
  updatedAt: ISODateTime;
}
