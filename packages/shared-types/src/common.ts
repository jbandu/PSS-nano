export type UUID = string;
export type ISODateTime = string;
export type ISODate = string;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: ISODateTime;
    requestId: UUID;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}
