import { UUID, ISODateTime } from './common';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export interface Payment {
  id: UUID;
  reservationId: UUID;
  userId: UUID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CreatePaymentRequest {
  reservationId: UUID;
  userId: UUID;
  amount: number;
  currency: string;
  method: PaymentMethod;
  paymentDetails: PaymentDetails;
}

export interface PaymentDetails {
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  paypalEmail?: string;
  bankAccount?: string;
}

export interface PaymentIntent {
  id: UUID;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}
