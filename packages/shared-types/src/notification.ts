import { UUID, ISODateTime } from './common';

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DELIVERED = 'DELIVERED',
}

export enum NotificationTemplate {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  FLIGHT_REMINDER = 'FLIGHT_REMINDER',
  FLIGHT_CANCELLATION = 'FLIGHT_CANCELLATION',
  FLIGHT_DELAY = 'FLIGHT_DELAY',
  CHECK_IN_REMINDER = 'CHECK_IN_REMINDER',
  BOARDING_PASS = 'BOARDING_PASS',
}

export interface Notification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  template: NotificationTemplate;
  recipient: string;
  subject?: string;
  content: string;
  status: NotificationStatus;
  metadata?: Record<string, any>;
  sentAt?: ISODateTime;
  deliveredAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface SendNotificationRequest {
  userId: UUID;
  type: NotificationType;
  template: NotificationTemplate;
  recipient: string;
  subject?: string;
  data: Record<string, any>;
}
