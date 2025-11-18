/**
 * Airline PSS Platform - Database Schemas
 * 
 * Centralized Prisma client and types for the entire platform.
 * 
 * @example
 * ```typescript
 * import { prisma } from '@airline-ops/database-schemas';
 * 
 * const pnr = await prisma.pNR.findUnique({
 *   where: { locator: 'ABC123' },
 * });
 * ```
 */

export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

/**
 * Re-export commonly used types for convenience
 */
export type {
  Organization,
  PNR,
  Passenger,
  Flight,
  FlightInventory,
  Fare,
  AncillaryProduct,
  Payment,
  CheckInTransaction,
  BoardingPass,
  BoardingRecord,
  BaggageTag,
  User,
  Role,
  Permission,
  Campaign,
} from '@prisma/client';
