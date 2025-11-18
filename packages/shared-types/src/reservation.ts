import { UUID, ISODateTime } from './common';
import { CabinClass } from './flight';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export interface Passenger {
  id?: UUID;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  nationality?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Reservation {
  id: UUID;
  userId: UUID;
  pnr: string;
  status: ReservationStatus;
  flightId: UUID;
  passengers: Passenger[];
  cabinClass: CabinClass;
  seatNumbers: string[];
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  bookingDate: ISODateTime;
  expiryDate: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CreateReservationRequest {
  userId: UUID;
  flightId: UUID;
  passengers: Passenger[];
  cabinClass: CabinClass;
  seatNumbers?: string[];
}

export interface UpdateReservationRequest {
  passengers?: Passenger[];
  seatNumbers?: string[];
}
