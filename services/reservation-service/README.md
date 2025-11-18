# Reservation Service

Core booking engine with comprehensive PNR management, shopping cart implementation, and complete booking flow orchestration.

## Overview

The Reservation Service is the heart of the airline PSS platform, handling all booking operations from flight selection to confirmation. It manages PNRs (Passenger Name Records), shopping carts, passenger information, and coordinates with inventory, payment, and notification services.

## Key Features

### ✅ PNR Management
- **Unique Locator Generation** - 6-character alphanumeric PNR codes (e.g., ABC123)
- **CRUD Operations** - Create, Read, Update, Cancel reservations
- **Multi-Passenger Bookings** - Up to 9 passengers per PNR
- **Group Bookings** - 10+ passengers with special handling
- **PNR Splitting** - Divide bookings for partial modifications
- **PNR Merging** - Combine related bookings
- **Version Control** - Optimistic locking for concurrent modifications

### ✅ Shopping Cart Implementation
- **Redis-Based Storage** - High-performance session management
- **Add/Remove Items** - Flights and ancillaries
- **Real-Time Pricing** - Dynamic price calculation
- **30-Minute Expiration** - Automatic cart cleanup
- **Cart Recovery** - Restore abandoned bookings
- **Multi-Currency Support** - Price display in passenger currency

### ✅ Complete Booking Flow
1. **Flight Selection** - Search and select from inventory service
2. **Inventory Check** - Real-time availability verification
3. **Passenger Collection** - Capture traveler information
4. **Fare Validation** - Verify pricing and rules
5. **Seat Assignment** - Allocate seats per passenger
6. **Ancillary Selection** - Bags, meals, seats, extras
7. **Payment Processing** - Integrate with payment service
8. **Booking Confirmation** - Generate PNR and send notifications

### ✅ Booking Modifications
- **Flight Changes** - Calculate fare differences and penalties
- **Passenger Corrections** - Name spelling fixes
- **Date Changes** - Validate availability and pricing
- **Refunds** - Full and partial refund processing
- **Cancellations** - Inventory release and refund initiation
- **Split PNR** - Separate passengers into new bookings

### ✅ Profile Integration
- **Auto-Populate** - Fill passenger data from saved profiles
- **Quick Rebooking** - One-click repeat bookings
- **Travel Preferences** - Seat, meal, special service requests
- **Loyalty Integration** - Frequent flyer number application
- **Payment Methods** - Saved credit cards

### ✅ Business Logic Validation
- **Infant-to-Adult Ratio** - Max 1 infant per adult
- **Unaccompanied Minors** - Age validation and special handling
- **Passport Expiry** - Minimum 6-month validity requirement
- **Advance Purchase** - Enforce fare rule deadlines
- **Booking Window** - Minimum hours before departure
- **Travel Document** - Passport, visa requirements

### ✅ External Service Integration
- **Inventory Service** - Real-time availability checks
- **Payment Service** - Transaction processing
- **Notification Service** - Email/SMS confirmations
- **RabbitMQ Events** - Publish booking events
- **Audit Logging** - Complete booking history

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│          Reservation Service (Port 3002)                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │              API Layer                            │ │
│  │  - Cart Management (/cart)                        │ │
│  │  - PNR Operations (/pnr)                          │ │
│  │  - Booking Flow (/booking)                        │ │
│  │  - Modifications (/modify)                        │ │
│  └─────────────────┬───────────────────────────────────┘ │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │          Shopping Cart Layer (Redis)              │ │
│  │  - Session Storage (30min TTL)                    │ │
│  │  - Cart Recovery                                  │ │
│  │  - Real-time Pricing                              │ │
│  └─────────────────┬───────────────────────────────────┘ │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │          Business Logic Layer                     │ │
│  │  - PNR Service (locator generation)               │ │
│  │  - Booking Service (flow orchestration)           │ │
│  │  - Pricing Service (fare calculation)             │ │
│  │  - Modification Service (changes/cancels)         │ │
│  │  - Validation Service (business rules)            │ │
│  └─────────────────┬───────────────────────────────────┘ │
│                    ▼                                     │
│  ┌─────────────────────────────────────────┬──────────┐ │
│  │   PostgreSQL (PNR Data)    │  External Services   │ │
│  │   - PNR Records             │  - Inventory Service │ │
│  │   - Passengers              │  - Payment Service   │ │
│  │   - Segments                │  - Notification Svc  │ │
│  │   - Audit Trail             │  - RabbitMQ Events   │ │
│  └─────────────────────────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| Complete Booking | <3 seconds | Flight selection to confirmation |
| Cart Operation | <100ms | Add/remove items from cart |
| PNR Retrieval | <200ms | Fetch booking by locator |
| Price Calculation | <500ms | Real-time fare calculation |
| Modification | <2 seconds | Flight change with repricing |
| Concurrent Bookings | 100+ | Simultaneous booking sessions |

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis (ioredis)
- **Message Queue**: RabbitMQ (amqplib)
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Validation**: Zod + Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest, Artillery

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure services
nano .env

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

## Configuration

### Key Environment Variables

```env
# Server
PORT=3002
NODE_ENV=development

# External Services
INVENTORY_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005

# Redis (Shopping Cart)
REDIS_HOST=localhost
REDIS_PORT=6379
CART_TTL=1800                        # 30 minutes

# Business Rules
MAX_PASSENGERS_PER_PNR=9             # Individual bookings
MIN_GROUP_PASSENGERS=10              # Group booking threshold
MAX_INFANTS_PER_ADULT=1              # Safety regulation
UNACCOMPANIED_MINOR_MIN_AGE=5        # Minimum age
UNACCOMPANIED_MINOR_MAX_AGE=11       # Maximum age
PASSPORT_MIN_VALIDITY_MONTHS=6       # Minimum validity
ADVANCE_PURCHASE_MIN_HOURS=2         # Minimum booking window

# Performance
BOOKING_TIMEOUT=3000                 # Complete booking timeout (ms)
INVENTORY_CHECK_TIMEOUT=500          # Availability check timeout
PAYMENT_TIMEOUT=5000                 # Payment processing timeout
