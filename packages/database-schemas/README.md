# Database Schemas Package

Comprehensive Prisma database schema for the airline operational intelligence platform with multi-tenant architecture, revenue management, and operational tracking capabilities.

## Table of Contents

- [Overview](#overview)
- [Schema Architecture](#schema-architecture)
- [Entity Relationships](#entity-relationships)
- [Multi-Tenant Design](#multi-tenant-design)
- [Indexing Strategy](#indexing-strategy)
- [Soft Delete Implementation](#soft-delete-implementation)
- [Setup and Usage](#setup-and-usage)
- [Domain Concepts](#domain-concepts)

## Overview

This package contains the complete database schema for an airline PSS (Passenger Service System) platform built with Prisma ORM and PostgreSQL. The schema supports:

- **Multi-tenant SaaS architecture** - Multiple airlines on shared infrastructure
- **Core booking operations** - PNR management, flight inventory, seat assignment
- **Revenue management** - Fare classes, booking classes, overbooking control
- **Operational workflow** - Check-in, boarding, baggage tracking, load control
- **Financial tracking** - Payments, refunds, revenue accounting, commissions
- **Access control** - RBAC with roles, permissions, audit logging, API keys
- **Analytics** - Customer segmentation, booking analytics, campaign tracking

## Schema Architecture

### Model Categories

The schema is organized into the following logical domains:

#### 1. Core Entities (11 models)
- `Organization` - Multi-tenant airline entities
- `User` - Users with role-based access
- `Role` / `Permission` - RBAC implementation
- `PNR` - Passenger Name Records (bookings)
- `PNRSegment` - Flight segments within a booking
- `Passenger` - Traveler information
- `Flight` - Flight schedule and operations
- `Inventory` - Seat availability by cabin/booking class
- `Fare` - Pricing and fare rules
- `AncillaryProduct` - Additional services (bags, meals, seats)

#### 2. Operational Tables (9 models)
- `Seat` - Aircraft seat configuration
- `SeatAssignment` - Passenger seat allocation
- `CheckIn` - Check-in records
- `BoardingRecord` - Boarding pass and gate control
- `Baggage` - Baggage tracking end-to-end
- `Airport` - Airport master data
- `Aircraft` - Fleet information
- `FlightOperation` - Real-time flight status
- `LoadControl` - Weight and balance calculations

#### 3. Financial Tables (4 models)
- `Payment` - Payment transactions with gateway integration
- `Refund` - Refund processing
- `RevenueAccounting` - Revenue recognition and accounting periods
- `Commission` - Agent/partner commissions

#### 4. User & Access Management (3 models)
- `AuditLog` - Complete audit trail of all actions
- `ApiKey` - API authentication with scoped permissions
- `UserPreferences` - User-specific settings (JSON)

#### 5. Analytics Tables (4 models)
- `CustomerSegment` - Customer lifetime value and segmentation
- `BookingAnalytic` - Conversion funnel and attribution
- `PerformanceMetric` - KPI tracking
- `Campaign` - Marketing campaign performance

#### 6. Supporting Data (20+ enums)
- Type-safe enumerations for status fields, roles, payment methods, etc.

## Entity Relationships

### Core Booking Flow

```
Organization (Airline)
    ├── PNR (Booking)
    │   ├── PNRSegment (Flight segments)
    │   │   └── Flight
    │   │       ├── Inventory (Seat availability by class)
    │   │       ├── Seat (Physical seats)
    │   │       ├── Aircraft
    │   │       └── Airport (Origin/Destination)
    │   ├── Passenger
    │   │   ├── SeatAssignment
    │   │   ├── CheckIn
    │   │   ├── BoardingRecord
    │   │   └── Baggage
    │   ├── Payment
    │   │   └── Refund
    │   └── AncillaryProduct
    └── User (with Role/Permissions)
```

### Key Relationships Explained

#### PNR → Flight Relationship
- A PNR contains multiple `PNRSegment` records (one per flight)
- Each segment links to a `Flight` and references a specific `Fare`
- Segments track individual journey legs in multi-city itineraries

#### Inventory Management
- Each `Flight` has multiple `Inventory` records (one per cabin/booking class combination)
- Example: Flight ABC123 might have:
  - Business/J class: 16 total seats, 14 available, 18 authorized (overbooking)
  - Economy/Y class: 100 total seats, 87 available, 110 authorized
  - Economy/M class: 64 total seats, 50 available, 70 authorized

#### Fare Structure
- `Fare` records define pricing rules by route, cabin, and fare type
- Fare classes (J, C, D, Y, B, M, etc.) map to booking classes
- Contains refund rules, change fees, baggage allowances (JSON)
- Taxes stored as JSON for flexibility across jurisdictions

#### Operational Workflow
```
Booking (PNR)
  → Check-in (CheckIn)
    → Seat Assignment (SeatAssignment)
      → Boarding Pass (BoardingRecord)
        → Baggage Tag (Baggage)
          → Load Control (LoadControl)
```

## Multi-Tenant Design

### Organization Scoping

All tenant-scoped data includes an `organizationId` field with the following pattern:

```prisma
model PNR {
  id             String       @id @default(uuid())
  organizationId String       // Tenant isolation field
  organization   Organization @relation(fields: [organizationId], references: [id])
  // ... other fields

  @@index([organizationId])  // Performance index
}
```

### Tenant-Isolated Models

The following models are scoped to organizations:
- PNR, PNRSegment, Passenger
- Flight, Inventory, Seat, Aircraft
- Fare, AncillaryProduct
- Payment, Refund, RevenueAccounting, Commission
- CheckIn, BoardingRecord, Baggage, LoadControl
- CustomerSegment, BookingAnalytic, Campaign

### Shared Reference Data

Some models are shared across all tenants:
- `Airport` - Global airport database
- `User` roles and permissions for cross-tenant admin users

### Data Isolation Strategy

Application-level enforcement:
```typescript
// All queries must filter by organizationId
const pnrs = await prisma.pNR.findMany({
  where: {
    organizationId: currentUser.organizationId,
    // ... other filters
  }
});
```

## Indexing Strategy

### Index Categories

#### 1. Foreign Key Indexes
All foreign key relationships are indexed for join performance:
```prisma
@@index([organizationId])
@@index([userId])
@@index([pnrId])
@@index([flightId])
// etc.
```

#### 2. Query Performance Indexes
Common query patterns are optimized:

**PNR lookups:**
```prisma
model PNR {
  pnr String @unique  // 6-char alphanumeric lookup
  @@index([organizationId, status])  // List bookings by status
  @@index([organizationId, createdAt])  // Recent bookings
  @@index([contactEmail])  // Email-based search
  @@index([contactPhone])  // Phone-based search
}
```

**Flight searches:**
```prisma
model Flight {
  @@index([organizationId, flightNumber, scheduledDeparture])  // Flight schedule queries
  @@index([originAirportId, destinationAirportId, scheduledDeparture])  // Route searches
  @@index([status])  // Operational status filtering
}
```

**Inventory availability:**
```prisma
model Inventory {
  @@unique([flightId, cabinClass, bookingClass])  // Unique constraint + index
  @@index([flightId, cabinClass])  // Cabin-level availability
}
```

#### 3. Operational Workflow Indexes
Real-time operations require fast lookups:
```prisma
model CheckIn {
  @@index([flightId, status])  // Check-in counters
  @@index([passengerId, pnrId])  // Passenger lookup
}

model BoardingRecord {
  @@index([flightId, boardingGroup, status])  // Boarding queue management
  @@index([seatNumber])  // Duplicate seat detection
}

model Baggage {
  @@index([tagNumber])  // Baggage tracking
  @@index([flightId, status])  // Flight baggage manifest
}
```

#### 4. Analytics Indexes
Reporting and analytics queries:
```prisma
model RevenueAccounting {
  @@index([organizationId, accountingPeriod])  // Period reports
  @@index([organizationId, fiscalYear, isReconciled])  // Fiscal reconciliation
}

model AuditLog {
  @@index([userId, action, createdAt])  // User activity reports
  @@index([entityType, entityId])  // Entity history
}
```

### Composite Index Considerations

Multi-column indexes follow the query pattern:
1. **Equality filters first** (`organizationId`, `status`)
2. **Range filters second** (`createdAt`, `scheduledDeparture`)
3. **Sort fields last** (if not already included)

Example:
```prisma
// Query: Get confirmed bookings for airline X created in last 30 days, sorted by date
@@index([organizationId, status, createdAt])
```

## Soft Delete Implementation

### Models with Soft Delete

Soft deletes are implemented on models where data must be retained for:
- **Audit compliance** - Regulatory requirements
- **Business intelligence** - Historical analysis
- **Customer service** - Inquiry support

Models with `deletedAt`:
- `PNR`, `Passenger`
- `Flight`, `Inventory`
- `User`, `Role`, `ApiKey`
- `AncillaryProduct`, `Fare`
- `Campaign`

### Pattern

```prisma
model PNR {
  id        String    @id @default(uuid())
  deletedAt DateTime? // NULL = active, timestamp = deleted
  // ... other fields

  @@index([deletedAt])  // Filter active records efficiently
}
```

### Usage

```typescript
// Create with soft delete support
await prisma.pNR.update({
  where: { id: pnrId },
  data: { deletedAt: new Date() }
});

// Query only active records
const activePNRs = await prisma.pNR.findMany({
  where: { deletedAt: null }
});

// Include deleted records when needed
const allPNRs = await prisma.pNR.findMany(); // No filter = all records
```

### Alternative: isActive Flag

Some models use `isActive: Boolean` for toggling availability:
- `Fare.isActive` - Enable/disable fare for sale
- `AncillaryProduct.isActive` - Product availability
- `ApiKey.isActive` - Key revocation

## Setup and Usage

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm db:generate
```

### Database Migrations

```bash
# Create and apply migration (development)
pnpm db:migrate

# Apply migrations (production)
pnpm db:migrate:deploy

# Push schema without migration (prototyping)
pnpm db:push
```

### Seeding the Database

The seed script creates a complete sample dataset:

```bash
pnpm db:seed
```

**Seed data includes:**
- 2 organizations (Skyline Airways, Pacific Wings)
- 4 users with roles (admin, agent, 2 customers)
- 5 airports (JFK, LAX, ORD, MIA, SFO)
- 2 aircraft (Boeing 737-800, Airbus A320-200)
- 2 flights with complete inventory
- 184 seats with pricing tiers
- 3 fare classes (Business, Economy Flex, Economy Basic)
- 6 ancillary products (bags, seats, WiFi, meals, etc.)
- Sample PNR with payment
- Customer segment and marketing campaign

**Test credentials:**
- Admin: `admin@skylineairways.com` / `Admin123!`
- Agent: `agent@skylineairways.com` / `Agent123!`
- Customer: `john.doe@example.com` / `Customer123!`

### Prisma Studio

Visual database browser:

```bash
pnpm db:studio
```

Open http://localhost:5555

### Using in Services

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example: Search flights
const flights = await prisma.flight.findMany({
  where: {
    organizationId: 'org-id',
    originAirportId: 'JFK',
    destinationAirportId: 'LAX',
    scheduledDeparture: {
      gte: new Date(),
      lte: addDays(new Date(), 7)
    }
  },
  include: {
    originAirport: true,
    destinationAirport: true,
    inventory: true
  }
});
```

## Domain Concepts

### PNR (Passenger Name Record)

A PNR is the core booking entity in airline systems. Key characteristics:
- **6-character alphanumeric code** (e.g., ABC123)
- Contains one or more flight segments
- Links to one or more passengers
- Tracks payment status independently from booking status
- Can have ancillary products (bags, seats, meals)

**PNR Lifecycle:**
```
PENDING → CONFIRMED → TICKETED → CHECKED_IN → BOARDED → FLOWN
                                                      ↓
                                                 CANCELLED / NO_SHOW
```

### Booking Classes

Booking classes control inventory and pricing:
- **J** - Business full fare
- **C** - Business discount
- **D** - Business deep discount
- **Y** - Economy full fare (most flexible)
- **B** - Economy advance purchase
- **M** - Economy restricted
- **K** - Economy group

Each class has different:
- Price points
- Availability (inventory pools)
- Rules (changes, refunds)
- Ancillary eligibility

### Revenue Management

#### Overbooking Control
```prisma
model Inventory {
  totalSeats      Int  // Physical seats (e.g., 100)
  availableSeats  Int  // Currently bookable (e.g., 87)
  authorizedSeats Int  // Overbooking limit (e.g., 110)
  oversoldSeats   Int  // How many oversold (e.g., 0)
}
```

Formula: `oversoldSeats = (totalSeats - availableSeats) - totalSeats`

If `availableSeats` goes negative, the flight is oversold.

#### Fare Rules

Fares contain complex rules stored as JSON:
```json
{
  "minStay": "1 night",
  "maxStay": "30 days",
  "advancePurchase": "14 days",
  "blackoutDates": ["2024-12-24", "2024-12-25"],
  "combinability": "NOT_ALLOWED"
}
```

### Multi-Segment Bookings

Round-trip and multi-city itineraries:
```typescript
const pnr = {
  pnr: "ABC123",
  segments: [
    { segmentNumber: 1, flightId: "JFK-LAX", fareClass: "Y" },
    { segmentNumber: 2, flightId: "LAX-JFK", fareClass: "Y" }
  ]
};
```

Each segment can have different:
- Fare classes
- Booking classes
- Seat assignments
- Ancillaries

### Payment Flow

```
PENDING → AUTHORIZED → CAPTURED → COMPLETED
              ↓
         FAILED → CANCELLED
              ↓
        REFUNDED / PARTIALLY_REFUNDED
```

- **AUTHORIZED** - Funds held, not yet captured
- **CAPTURED** - Funds transferred from customer
- **COMPLETED** - Payment settled, reconciled

### Load Control

Pre-flight calculations for safety and efficiency:
```prisma
model LoadControl {
  totalPassengers Int
  totalBaggage    Int
  totalCargo      Float  // kg
  totalWeight     Float  // kg
  centerOfGravity Float  // CG position
  fuelWeight      Float  // kg
}
```

Must be completed before:
- Flight departure
- Final boarding
- Aircraft pushback

### Audit Logging

All critical actions are logged:
```prisma
model AuditLog {
  action     AuditAction  // CREATE, UPDATE, DELETE, etc.
  entityType String       // "PNR", "Payment", etc.
  entityId   String       // Record ID
  changes    Json?        // Before/after values
  ipAddress  String?
  userAgent  String?
}
```

Use cases:
- Regulatory compliance (PCI, GDPR)
- Fraud investigation
- Customer dispute resolution
- Security incident response

### API Key Scopes

Granular API access control:
```json
{
  "scopes": [
    "booking:read",
    "booking:write",
    "inventory:read",
    "payment:read"
  ]
}
```

Supports:
- Partner integrations (OTAs, metasearch)
- Mobile apps
- Internal microservices
- Third-party analytics

## Schema Validation

### Constraints

The schema enforces data integrity through:

1. **Unique constraints** - Prevent duplicates
   - PNR codes, flight numbers + dates, email addresses
   - Seat assignments per flight
   - API keys, transaction IDs

2. **Foreign key constraints** - Referential integrity
   - Cascading deletes where appropriate
   - Restrict deletes on referenced records

3. **Check constraints** (application-level)
   - Seat availability ≤ total seats
   - Payment amount > 0
   - Email format validation

### Data Types

Strategic type choices:
- **UUIDs** for primary keys (distributed system friendly)
- **String** for codes (PNR, flight numbers) - flexible format
- **Float** for currency (careful with rounding in application)
- **Json** for flexible nested data (settings, rules, metadata)
- **DateTime** with timezone awareness

## Performance Considerations

### Query Optimization Tips

1. **Always filter by organizationId first** - Reduces result set
2. **Use indexes for sorting** - Avoid table scans
3. **Limit result sets** - Pagination is critical
4. **Select only needed fields** - Reduce data transfer
5. **Use `include` judiciously** - N+1 queries can kill performance

### Connection Pooling

Configure Prisma connection pool:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=60"
```

Recommended settings:
- Web service: 10-20 connections per instance
- Background jobs: 2-5 connections
- Monitor active connections under load

### Caching Strategy

Cache these read-heavy entities:
- Airports (rarely change)
- Aircraft configurations
- Fare rules
- Ancillary products

Use Redis/Memcached with TTLs:
- Static data: 24 hours
- Semi-static (fares): 1 hour
- Dynamic (inventory): No cache or 30 seconds

## Migration Strategy

### Development

```bash
# Create migration after schema changes
pnpm db:migrate

# Name migrations descriptively
# Example: 20240101120000_add_loyalty_program
```

### Production

```bash
# Review migration SQL before deploying
cat prisma/migrations/20240101120000_add_loyalty_program/migration.sql

# Apply with zero-downtime strategy
pnpm db:migrate:deploy
```

**Zero-downtime pattern:**
1. Add new columns as nullable
2. Deploy application code (dual writes)
3. Backfill data
4. Make columns required
5. Remove old columns (next release)

## Contributing

When modifying the schema:

1. **Update this README** - Document new entities and relationships
2. **Add indexes** - Consider query patterns
3. **Update seed script** - Include sample data for new entities
4. **Test migrations** - Verify up/down migrations work
5. **Update TypeScript types** - Run `pnpm db:generate`

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Airline PSS Concepts](https://en.wikipedia.org/wiki/Passenger_service_system)
- [IATA Standards](https://www.iata.org/en/services/statistics/)

## License

Proprietary - All rights reserved
