import { UUID, ISODateTime, Status } from './common';

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
  SYSTEM = 'SYSTEM',
}

export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: Status;
  emailVerified: boolean;
  phoneNumber?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
