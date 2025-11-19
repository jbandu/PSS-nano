# Data Flow Architecture

## Overview

This document describes how data flows through the PSS-nano platform for key business operations. Understanding these data flows is crucial for development, debugging, and optimization.

## Booking Flow

### Complete Booking Journey

```mermaid
sequenceDiagram
    actor Customer
    participant BookingUI
    participant APIGateway
    participant AuthService
    participant ReservationService
    participant InventoryService
    participant PricingService
    participant PaymentService
    participant NotificationService
    participant RabbitMQ
    participant Database

    Customer->>BookingUI: Search for flights
    BookingUI->>APIGateway: GET /api/v1/flights/search
    APIGateway->>InventoryService: Search flights
    InventoryService->>Database: Query available flights
    Database-->>InventoryService: Flight results
    InventoryService-->>APIGateway: Available flights
    APIGateway-->>BookingUI: Flight options
    BookingUI-->>Customer: Display flights

    Customer->>BookingUI: Select flight
    BookingUI->>APIGateway: GET /api/v1/pricing/calculate
    APIGateway->>PricingService: Calculate fare
    PricingService->>Database: Get fare rules
    Database-->>PricingService: Fare data
    PricingService-->>APIGateway: Calculated price
    APIGateway-->>BookingUI: Price breakdown
    BookingUI-->>Customer: Show price

    Customer->>BookingUI: Enter passenger details
    Customer->>BookingUI: Confirm booking
    BookingUI->>APIGateway: POST /api/v1/auth/login
    APIGateway->>AuthService: Authenticate
    AuthService-->>APIGateway: JWT token
    APIGateway-->>BookingUI: Auth token

    BookingUI->>APIGateway: POST /api/v1/reservations
    APIGateway->>ReservationService: Create booking

    ReservationService->>InventoryService: Hold seats
    InventoryService->>Database: Update inventory
    Database-->>InventoryService: Seats held
    InventoryService-->>ReservationService: Confirmed

    ReservationService->>Database: Create PNR
    Database-->>ReservationService: PNR created

    ReservationService->>RabbitMQ: Publish booking.created
    RabbitMQ-->>NotificationService: Event
    NotificationService->>NotificationService: Send confirmation email

    ReservationService-->>APIGateway: Booking confirmed (PNR)
    APIGateway-->>BookingUI: Success
    BookingUI-->>Customer: Confirmation + PNR

    Customer->>BookingUI: Proceed to payment
    BookingUI->>APIGateway: POST /api/v1/payments
    APIGateway->>PaymentService: Process payment
    PaymentService->>PaymentService: Call Stripe
    PaymentService->>Database: Save payment
    Database-->>PaymentService: Saved
    PaymentService->>RabbitMQ: Publish payment.completed
    PaymentService-->>APIGateway: Payment success
    APIGateway-->>BookingUI: Payment confirmed

    RabbitMQ-->>ReservationService: payment.completed
    ReservationService->>Database: Update PNR status
    RabbitMQ-->>NotificationService: payment.completed
    NotificationService->>NotificationService: Send e-ticket
```

### Booking Data Structure

```typescript
// Complete booking object flow
interface BookingDataFlow {
  // Step 1: Flight Search
  searchCriteria: {
    origin: string;
    destination: string;
    departureDate: Date;
    returnDate?: Date;
    passengers: { adults: number; children: number; infants: number };
  };

  // Step 2: Flight Selection
  selectedFlight: {
    flightId: string;
    flightNumber: string;
    cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    availableSeats: number;
  };

  // Step 3: Pricing
  pricing: {
    baseFare: number;
    taxes: number;
    fees: number;
    total: number;
    currency: string;
  };

  // Step 4: Passenger Details
  passengers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'M' | 'F' | 'O';
    nationality: string;
    documentType: 'PASSPORT' | 'ID_CARD';
    documentNumber: string;
    documentExpiry: Date;
  }>;

  // Step 5: PNR Creation
  pnr: {
    pnrLocator: string; // 6-character code
    status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
    createdAt: Date;
  };

  // Step 6: Payment
  payment: {
    paymentId: string;
    amount: number;
    currency: string;
    method: 'CARD' | 'PAYPAL' | 'BANK_TRANSFER';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    transactionId: string;
  };
}
```

## Check-in Flow

### Web Check-in Process

```mermaid
sequenceDiagram
    actor Passenger
    participant CheckInUI
    participant APIGateway
    participant AuthService
    participant DCSService
    participant ReservationService
    participant BoardingService
    participant NotificationService
    participant Database

    Passenger->>CheckInUI: Enter PNR + Last Name
    CheckInUI->>APIGateway: POST /api/v1/checkin/search
    APIGateway->>DCSService: Search booking

    DCSService->>ReservationService: Get PNR details
    ReservationService->>Database: Query PNR
    Database-->>ReservationService: PNR data
    ReservationService-->>DCSService: Booking details

    DCSService->>Database: Check eligibility
    Database-->>DCSService: Eligible for check-in
    DCSService-->>APIGateway: Booking found
    APIGateway-->>CheckInUI: Show booking
    CheckInUI-->>Passenger: Display booking details

    Passenger->>CheckInUI: Select seats
    CheckInUI->>APIGateway: POST /api/v1/checkin/seats
    APIGateway->>DCSService: Assign seats
    DCSService->>Database: Update seat assignments
    Database-->>DCSService: Seats assigned
    DCSService-->>APIGateway: Confirmed
    APIGateway-->>CheckInUI: Seats confirmed

    Passenger->>CheckInUI: Add baggage
    CheckInUI->>APIGateway: POST /api/v1/checkin/baggage
    APIGateway->>DCSService: Register baggage
    DCSService->>Database: Create baggage tags
    Database-->>DCSService: Tags created
    DCSService-->>APIGateway: Baggage registered

    Passenger->>CheckInUI: Complete check-in
    CheckInUI->>APIGateway: POST /api/v1/checkin/complete
    APIGateway->>DCSService: Finalize check-in

    DCSService->>Database: Create check-in record
    Database-->>DCSService: Check-in saved

    DCSService->>BoardingService: Generate boarding pass
    BoardingService->>BoardingService: Create IATA BCBP
    BoardingService->>Database: Save boarding pass
    Database-->>BoardingService: Saved
    BoardingService-->>DCSService: Boarding pass ready

    DCSService->>NotificationService: Send boarding pass
    NotificationService->>NotificationService: Email + SMS
    NotificationService-->>Passenger: Boarding pass delivered

    DCSService-->>APIGateway: Check-in complete
    APIGateway-->>CheckInUI: Success
    CheckInUI-->>Passenger: Show boarding pass
```

## Payment Flow

### Payment Processing

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway
    participant PaymentService
    participant StripeGateway
    participant Database
    participant RabbitMQ
    participant ReservationService
    participant NotificationService

    Client->>APIGateway: POST /api/v1/payments
    APIGateway->>PaymentService: Process payment

    PaymentService->>Database: Create payment record (PENDING)
    Database-->>PaymentService: Record created

    PaymentService->>StripeGateway: Charge customer

    alt Payment Success
        StripeGateway-->>PaymentService: Payment successful
        PaymentService->>Database: Update status (COMPLETED)
        PaymentService->>Database: Create revenue record

        PaymentService->>RabbitMQ: Publish payment.completed
        RabbitMQ-->>ReservationService: Update PNR status
        RabbitMQ-->>NotificationService: Send receipt

        PaymentService-->>APIGateway: Success response
        APIGateway-->>Client: Payment confirmed
    else Payment Failed
        StripeGateway-->>PaymentService: Payment failed
        PaymentService->>Database: Update status (FAILED)

        PaymentService->>RabbitMQ: Publish payment.failed
        RabbitMQ-->>NotificationService: Send failure notice

        PaymentService-->>APIGateway: Error response
        APIGateway-->>Client: Payment failed
    end
```

### Refund Flow

```mermaid
sequenceDiagram
    participant Agent
    participant APIGateway
    participant PaymentService
    participant StripeGateway
    participant ReservationService
    participant Database
    participant RabbitMQ

    Agent->>APIGateway: POST /api/v1/refunds
    APIGateway->>PaymentService: Initiate refund

    PaymentService->>Database: Get original payment
    Database-->>PaymentService: Payment details

    PaymentService->>ReservationService: Validate cancellation
    ReservationService-->>PaymentService: Refund amount confirmed

    PaymentService->>StripeGateway: Process refund
    StripeGateway-->>PaymentService: Refund successful

    PaymentService->>Database: Create refund record
    PaymentService->>Database: Update payment status
    Database-->>PaymentService: Saved

    PaymentService->>RabbitMQ: Publish refund.completed
    RabbitMQ-->>ReservationService: Update PNR
    RabbitMQ-->>NotificationService: Send notification

    PaymentService-->>APIGateway: Refund confirmed
    APIGateway-->>Agent: Success
```

## Inventory Management Flow

### Real-time Inventory Updates

```mermaid
flowchart TD
    A[Booking Request] --> B{Check Availability}
    B -->|Available| C[Hold Seats]
    B -->|Not Available| D[Return Error]

    C --> E[Create PNR]
    E --> F{Payment Timeout?}

    F -->|Within Time| G[Payment Completed]
    F -->|Timeout| H[Release Seats]

    G --> I[Confirm Seats]
    I --> J[Reduce Inventory]

    H --> K[Update Inventory]
    K --> L[Cancel PNR]

    J --> M[Publish inventory.updated Event]
    M --> N[Update Cache]
    M --> O[Notify GDS]
    M --> P[Update Analytics]
```

### Inventory Synchronization

```typescript
// Inventory update propagation
interface InventoryUpdate {
  flightId: string;
  cabinClass: CabinClass;
  previousAvailable: number;
  currentAvailable: number;
  changeReason: 'BOOKING' | 'CANCELLATION' | 'ADJUSTMENT';
  timestamp: Date;
}

// Service responsibilities
const inventoryFlow = {
  // 1. Inventory Service: Source of truth
  inventoryService: async (flightId: string) => {
    const inventory = await db.flightInventory.findUnique({
      where: { flightId },
      select: { available: true }
    });

    // Update cache
    await redis.set(`inventory:${flightId}`, inventory.available, 'EX', 300);

    // Publish event
    await publishEvent('inventory.updated', {
      flightId,
      available: inventory.available
    });

    return inventory;
  },

  // 2. Cache Layer: Fast reads
  cacheLayer: async (flightId: string) => {
    const cached = await redis.get(`inventory:${flightId}`);
    if (cached) return parseInt(cached);

    // Cache miss - fetch from DB
    return await inventoryService(flightId);
  },

  // 3. GDS Sync: External system update
  gdsSync: async (event: InventoryUpdate) => {
    await gdsClient.updateAvailability({
      flightNumber: event.flightId,
      availableSeats: event.currentAvailable
    });
  },

  // 4. Analytics: Business metrics
  analyticsUpdate: async (event: InventoryUpdate) => {
    await db.bookingAnalytics.create({
      data: {
        flightId: event.flightId,
        inventoryChange: event.previousAvailable - event.currentAvailable,
        timestamp: event.timestamp
      }
    });
  }
};
```

## Event-Driven Data Flow

### Event Types and Consumers

```mermaid
graph TB
    subgraph "Event Publishers"
        RES[Reservation Service]
        PAY[Payment Service]
        INV[Inventory Service]
        DCS[DCS Service]
    end

    subgraph "Message Broker"
        MQ[RabbitMQ]
    end

    subgraph "Event Consumers"
        NOT[Notification Service]
        ANALYTICS[Analytics Service]
        AUDIT[Audit Service]
        GDS[GDS Integration]
    end

    RES -->|booking.created| MQ
    RES -->|booking.modified| MQ
    RES -->|booking.cancelled| MQ

    PAY -->|payment.completed| MQ
    PAY -->|payment.failed| MQ
    PAY -->|refund.processed| MQ

    INV -->|inventory.updated| MQ
    INV -->|inventory.depleted| MQ

    DCS -->|checkin.completed| MQ
    DCS -->|boarding.completed| MQ

    MQ --> NOT
    MQ --> ANALYTICS
    MQ --> AUDIT
    MQ --> GDS
```

### Event Schema

```typescript
// Base event interface
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: Date;
  version: number;
  correlationId?: string;
  causationId?: string;
  metadata: {
    userId?: string;
    organizationId: string;
    source: string;
  };
  payload: unknown;
}

// Booking events
interface BookingCreatedEvent extends DomainEvent {
  eventType: 'booking.created';
  aggregateType: 'PNR';
  payload: {
    pnrId: string;
    pnrLocator: string;
    passengerCount: number;
    flightId: string;
    totalAmount: number;
    status: 'PENDING';
  };
}

interface PaymentCompletedEvent extends DomainEvent {
  eventType: 'payment.completed';
  aggregateType: 'Payment';
  payload: {
    paymentId: string;
    pnrId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    transactionId: string;
  };
}

// Event publishing
async function publishDomainEvent<T extends DomainEvent>(event: T): Promise<void> {
  await rabbitmq.publish('domain.events', event.eventType, {
    ...event,
    timestamp: new Date(),
    eventId: generateEventId()
  });

  // Also store in event store for event sourcing
  await eventStore.append(event);
}
```

## Caching Strategy

### Multi-Level Cache

```mermaid
flowchart LR
    A[Client Request] --> B{L1: Application Cache}
    B -->|Hit| C[Return Cached]
    B -->|Miss| D{L2: Redis Cache}
    D -->|Hit| E[Update L1]
    E --> C
    D -->|Miss| F{L3: Database}
    F --> G[Update L2]
    G --> E
```

### Cache Implementation

```typescript
// Three-level caching strategy
class CacheService {
  private l1Cache = new Map(); // In-memory
  private l2Cache = redis;      // Redis
  private database = prisma;    // PostgreSQL

  async get<T>(key: string, ttl: number = 300): Promise<T | null> {
    // Level 1: Application cache
    if (this.l1Cache.has(key)) {
      logger.debug(`L1 cache hit: ${key}`);
      return this.l1Cache.get(key);
    }

    // Level 2: Redis cache
    const l2Value = await this.l2Cache.get(key);
    if (l2Value) {
      logger.debug(`L2 cache hit: ${key}`);
      const parsed = JSON.parse(l2Value);
      this.l1Cache.set(key, parsed);
      return parsed;
    }

    // Level 3: Database
    logger.debug(`Cache miss: ${key}`);
    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    // Update all levels
    this.l1Cache.set(key, value);
    await this.l2Cache.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(key: string): Promise<void> {
    this.l1Cache.delete(key);
    await this.l2Cache.del(key);
  }
}

// Usage
const cache = new CacheService();

async function getFlightAvailability(flightId: string) {
  const cacheKey = `flight:${flightId}:availability`;

  // Try cache first
  let availability = await cache.get<number>(cacheKey);

  if (availability === null) {
    // Fetch from database
    availability = await db.flightInventory.findUnique({
      where: { flightId },
      select: { available: true }
    }).then(r => r?.available || 0);

    // Update cache
    await cache.set(cacheKey, availability, 300); // 5 min TTL
  }

  return availability;
}
```

## Data Consistency

### Eventual Consistency Pattern

```typescript
// Saga pattern for distributed transactions
class BookingCreationSaga {
  async execute(bookingData: CreateBookingDTO) {
    const sagaId = generateSagaId();
    const compensations: Array<() => Promise<void>> = [];

    try {
      // Step 1: Create PNR
      const pnr = await this.createPNR(bookingData);
      compensations.push(() => this.deletePNR(pnr.id));

      // Step 2: Hold inventory
      await this.holdInventory(bookingData.flightId, bookingData.seats);
      compensations.push(() => this.releaseInventory(bookingData.flightId, bookingData.seats));

      // Step 3: Create payment intent
      const payment = await this.createPaymentIntent(pnr.id, bookingData.amount);
      compensations.push(() => this.cancelPaymentIntent(payment.id));

      // Step 4: Publish event
      await publishEvent('booking.created', { pnrId: pnr.id, sagaId });

      return pnr;

    } catch (error) {
      // Execute compensating transactions in reverse order
      logger.error(`Saga ${sagaId} failed, executing compensations`);

      for (const compensation of compensations.reverse()) {
        try {
          await compensation();
        } catch (compError) {
          logger.error(`Compensation failed: ${compError}`);
        }
      }

      throw error;
    }
  }
}
```

## Performance Optimization

### Query Optimization

```typescript
// Bad: N+1 query problem
async function getBadBookingsWithPassengers(organizationId: string) {
  const bookings = await db.pnr.findMany({
    where: { organizationId }
  });

  // N additional queries!
  for (const booking of bookings) {
    booking.passengers = await db.passenger.findMany({
      where: { pnrId: booking.id }
    });
  }

  return bookings;
}

// Good: Single query with joins
async function getGoodBookingsWithPassengers(organizationId: string) {
  return await db.pnr.findMany({
    where: { organizationId },
    include: {
      passengers: true,
      segments: {
        include: {
          flight: true
        }
      }
    }
  });
}

// Even better: Pagination + selective fields
async function getOptimalBookingsWithPassengers(
  organizationId: string,
  page: number = 1,
  limit: number = 20
) {
  return await db.pnr.findMany({
    where: { organizationId },
    select: {
      id: true,
      pnrLocator: true,
      status: true,
      passengers: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
}
```

## Conclusion

Understanding data flow through PSS-nano is essential for:
- **Development**: Building new features correctly
- **Debugging**: Tracing issues through the system
- **Optimization**: Identifying bottlenecks
- **Monitoring**: Knowing what to measure

Key takeaways:
1. Data flows through multiple services via REST APIs and events
2. Caching reduces database load and improves performance
3. Events enable loose coupling and eventual consistency
4. Proper error handling and compensations ensure data integrity
5. Monitoring data flow helps identify issues early
