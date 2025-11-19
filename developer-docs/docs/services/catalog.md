# Service Catalog

## Overview

PSS-nano consists of 18 microservices, 5 frontend applications, and 4 shared packages. This catalog provides a complete reference of all services, their responsibilities, endpoints, and dependencies.

## Core Business Services

### 1. API Gateway
**Port:** 3000
**Repository:** `/services/api-gateway`
**Status:** Production

**Responsibility:**
- Central entry point for all client requests
- Request routing to backend services
- Authentication and authorization
- Rate limiting and throttling
- Circuit breaker implementation
- Request/response transformation
- API versioning

**Key Features:**
- JWT token validation
- API key management
- Per-client rate limiting (100 req/min default)
- Service discovery integration
- Health check aggregation
- Metrics collection

**Endpoints:**
- `/*` - Proxy to backend services
- `/health` - Health check
- `/metrics` - Prometheus metrics

**Dependencies:**
- Consul (service discovery)
- Redis (rate limiting)
- All backend services

**Configuration:**
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=***
REDIS_URL=redis://localhost:6379
CONSUL_HOST=localhost
CONSUL_PORT=8500
```

---

### 2. Auth Service
**Port:** 3001
**Repository:** `/services/auth-service`
**Status:** Production

**Responsibility:**
- User authentication and authorization
- JWT token generation and validation
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- API key management
- Session management
- Audit logging

**Key Features:**
- JWT with refresh tokens
- TOTP-based MFA
- 5-level role hierarchy (Admin, Manager, Agent, User, Guest)
- Granular permissions
- Password hashing with bcrypt
- Account lockout after failed attempts
- OAuth 2.0 support (planned)

**API Endpoints:**
```typescript
POST   /api/v1/auth/register        // User registration
POST   /api/v1/auth/login           // User login
POST   /api/v1/auth/refresh         // Refresh token
POST   /api/v1/auth/logout          // User logout
POST   /api/v1/auth/mfa/setup       // Setup MFA
POST   /api/v1/auth/mfa/verify      // Verify MFA code
GET    /api/v1/auth/me              // Get current user
PUT    /api/v1/auth/password        // Change password
POST   /api/v1/auth/forgot-password // Forgot password
POST   /api/v1/auth/reset-password  // Reset password
GET    /health                      // Health check
```

**Database Tables:**
- `User` - User accounts
- `Role` - User roles
- `Permission` - Granular permissions
- `ApiKey` - API keys for integrations
- `AuditLog` - Security audit trail

**Dependencies:**
- PostgreSQL
- Redis (session storage)
- Email service (password reset)

**Performance:**
- P95 latency: < 100ms
- Throughput: 500 req/s
- Availability: 99.9%

---

### 3. Reservation Service
**Port:** 3002
**Repository:** `/services/reservation-service`
**Status:** Production

**Responsibility:**
- PNR (Passenger Name Record) management
- Booking creation and modification
- Passenger data management
- E-ticket generation
- Booking cancellation and refunds
- Split PNR operations
- Group bookings

**Key Features:**
- 6-character PNR locator generation
- Multi-segment bookings
- Special service requests (SSR)
- Travel document validation
- Name change functionality
- Booking history tracking
- Waitlist management

**API Endpoints:**
```typescript
POST   /api/v1/reservations               // Create booking
GET    /api/v1/reservations/:id           // Get booking by ID
GET    /api/v1/reservations/pnr/:locator  // Get by PNR locator
PUT    /api/v1/reservations/:id           // Modify booking
DELETE /api/v1/reservations/:id           // Cancel booking
POST   /api/v1/reservations/:id/split     // Split PNR
GET    /api/v1/reservations/:id/history   // Booking history
POST   /api/v1/reservations/group         // Group booking
GET    /api/v1/reservations/search        // Search bookings
```

**Database Tables:**
- `PNR` - Passenger name records
- `PNRSegment` - Flight segments
- `Passenger` - Passenger details
- `Ticket` - E-tickets
- `SpecialServiceRequest` - SSRs

**Events Published:**
- `booking.created`
- `booking.modified`
- `booking.cancelled`
- `ticket.issued`

**Dependencies:**
- Inventory Service (availability check)
- Pricing Service (fare calculation)
- Payment Service (payment processing)
- RabbitMQ (event publishing)

**Performance:**
- P95 latency: < 200ms
- Database queries: < 50ms
- Throughput: 200 bookings/min

---

### 4. Inventory Service
**Port:** 3003
**Repository:** `/services/inventory-service`
**Status:** Production

**Responsibility:**
- Real-time seat inventory management
- Flight availability calculation
- Seat hold and release
- Seat map management
- Overbooking control
- Inventory sync with GDS

**Key Features:**
- Real-time availability updates
- Configurable seat hold timeout (15 minutes default)
- Multi-class inventory (Economy, Premium, Business, First)
- Seat allocation algorithms
- Overbooking management
- Inventory history and forecasting

**API Endpoints:**
```typescript
GET    /api/v1/flights/search            // Search flights
GET    /api/v1/flights/:id/availability  // Check availability
POST   /api/v1/flights/:id/hold          // Hold seats
POST   /api/v1/flights/:id/release       // Release hold
POST   /api/v1/flights/:id/confirm       // Confirm seats
GET    /api/v1/flights/:id/seatmap       // Get seat map
PUT    /api/v1/flights/:id/inventory     // Update inventory
GET    /api/v1/flights/:id/history       // Inventory history
```

**Database Tables:**
- `Flight` - Flight schedule
- `FlightInventory` - Available seats by class
- `SeatMap` - Seat configuration
- `FlightOperation` - Operational status

**Events Published:**
- `inventory.updated`
- `inventory.depleted`
- `seats.held`
- `seats.released`

**Dependencies:**
- Redis (inventory cache, 5-minute TTL)
- RabbitMQ (event publishing)

**Performance:**
- P95 latency: < 100ms (cached), < 200ms (uncached)
- Cache hit rate: > 80%
- Throughput: 1000 req/s

---

### 5. Payment Service
**Port:** 3004
**Repository:** `/services/payment-service`
**Status:** Production

**Responsibility:**
- Payment processing
- Multiple payment gateway support
- Refund processing
- Revenue accounting
- PCI compliance
- Fraud detection
- Commission calculation

**Key Features:**
- Multi-gateway support (Stripe, PayPal, bank transfer)
- 3D Secure authentication
- Automatic retry on failure
- Refund workflows (full/partial)
- Revenue recognition
- Commission tracking
- Payment reconciliation

**API Endpoints:**
```typescript
POST   /api/v1/payments                // Process payment
GET    /api/v1/payments/:id            // Get payment details
POST   /api/v1/payments/:id/refund     // Refund payment
GET    /api/v1/payments/pnr/:pnrId     // Get by PNR
POST   /api/v1/payments/:id/retry      // Retry failed payment
GET    /api/v1/payments/reconcile      // Payment reconciliation
POST   /api/v1/payments/webhook        // Gateway webhook
```

**Database Tables:**
- `Payment` - Payment records
- `Refund` - Refund transactions
- `RevenueAccounting` - Revenue tracking
- `Commission` - Commission calculations

**Events Published:**
- `payment.completed`
- `payment.failed`
- `refund.processed`
- `revenue.recognized`

**Dependencies:**
- Stripe SDK
- PayPal SDK
- RabbitMQ

**Security:**
- PCI DSS Level 1 compliant
- No card data storage
- Tokenization via payment gateways
- TLS 1.3 for all connections

**Performance:**
- P95 latency: < 500ms
- Success rate: > 99%
- Retry: 3 attempts with exponential backoff

---

### 6. Notification Service
**Port:** 3005
**Repository:** `/services/notification-service`
**Status:** Production

**Responsibility:**
- Multi-channel notifications
- Email delivery
- SMS delivery
- Push notifications
- Template management
- Delivery tracking
- Notification preferences

**Key Features:**
- Multiple channels (email, SMS, push)
- Template engine (Handlebars)
- Scheduled notifications
- Delivery retry logic
- Bounce handling
- Unsubscribe management
- A/B testing support

**API Endpoints:**
```typescript
POST   /api/v1/notifications/email      // Send email
POST   /api/v1/notifications/sms        // Send SMS
POST   /api/v1/notifications/push       // Send push notification
GET    /api/v1/notifications/:id        // Get notification status
POST   /api/v1/notifications/batch      // Batch send
GET    /api/v1/notifications/templates  // List templates
PUT    /api/v1/notifications/preferences // Update preferences
```

**Events Consumed:**
- `booking.created` → Booking confirmation
- `payment.completed` → Payment receipt
- `checkin.completed` → Boarding pass
- `flight.delayed` → Delay notification

**Dependencies:**
- SMTP provider (SendGrid, AWS SES)
- SMS provider (Twilio, AWS SNS)
- Push notification service (FCM, APNs)
- RabbitMQ (event consumption)

**Performance:**
- Email delivery: < 5 seconds
- SMS delivery: < 3 seconds
- Delivery rate: > 99%
- Throughput: 10,000 notifications/min

---

## Operational Services

### 7. Pricing Service
**Repository:** `/services/pricing-service`
**Status:** Production

**Responsibility:**
- Dynamic pricing
- Fare calculation
- Fare rules engine
- Seasonal pricing
- Promotional fares
- Ancillary pricing

**Key Features:**
- Rule-based pricing engine
- Dynamic pricing algorithms
- Fare families (Basic, Standard, Flexible)
- Corporate discount codes
- Promotional campaigns
- Price forecasting

**API Endpoints:**
```typescript
POST   /api/v1/pricing/calculate       // Calculate fare
GET    /api/v1/pricing/fares/:id       // Get fare details
GET    /api/v1/pricing/rules/:fareId   // Get fare rules
POST   /api/v1/pricing/validate        // Validate price
GET    /api/v1/pricing/promotions      // Active promotions
```

**Database Tables:**
- `Fare` - Fare configurations
- `FareRule` - Fare restrictions
- `Promotion` - Promotional campaigns

---

### 8. Ancillary Service
**Repository:** `/services/ancillary-service`
**Status:** Production

**Responsibility:**
- Seat selection
- Baggage management
- Meal preferences
- Lounge access
- Priority boarding
- Travel insurance

**API Endpoints:**
```typescript
GET    /api/v1/ancillaries/products    // List products
POST   /api/v1/ancillaries/add         // Add to booking
GET    /api/v1/ancillaries/pnr/:id     // Get by booking
DELETE /api/v1/ancillaries/:id         // Remove ancillary
```

**Database Tables:**
- `AncillaryProduct` - Product catalog
- `PNRAncillary` - Purchased ancillaries

---

### 9. Boarding Service
**Repository:** `/services/boarding-service`
**Status:** Production

**Responsibility:**
- Boarding pass generation
- IATA BCBP barcode creation
- Mobile boarding pass
- Gate validation
- Boarding sequence
- Flight closure

**API Endpoints:**
```typescript
POST   /api/v1/boarding/pass           // Generate boarding pass
GET    /api/v1/boarding/pass/:id       // Get boarding pass
POST   /api/v1/boarding/validate       // Validate at gate
GET    /api/v1/boarding/flight/:id     // Flight boarding status
POST   /api/v1/boarding/close          // Close flight
```

**Database Tables:**
- `BoardingPass` - Boarding passes
- `BoardingRecord` - Gate scan records

---

### 10. DCS Service
**Repository:** `/services/dcs-service`
**Status:** Production

**Responsibility:**
- Check-in processing
- Baggage handling
- Departure control
- Weight & balance
- Load planning

**API Endpoints:**
```typescript
POST   /api/v1/checkin/search          // Search booking
POST   /api/v1/checkin/complete        // Complete check-in
POST   /api/v1/baggage/tag             // Create baggage tag
GET    /api/v1/baggage/track/:tagId    // Track baggage
POST   /api/v1/dcs/load-sheet          // Generate load sheet
```

**Database Tables:**
- `CheckInTransaction` - Check-in records
- `PassengerCheckIn` - Individual check-ins
- `BaggageTag` - Baggage tags
- `BaggageTrackingEvent` - Baggage tracking

---

## Integration Services

### 11. GDS Integration Service
**Repository:** `/services/gds-integration-service`
**Status:** Production

**Responsibility:**
- Amadeus integration
- Sabre integration
- Galileo integration
- Inventory sync
- Booking sync

---

### 12. Airport Integration Service
**Repository:** `/services/airport-integration-service`
**Status:** Production

**Responsibility:**
- SITA connectivity
- ARINC integration
- Airport operational systems
- Flight information display

---

### 13. Regulatory Compliance Service
**Repository:** `/services/regulatory-compliance-service`
**Status:** Production

**Responsibility:**
- API (Advance Passenger Information)
- APIS compliance
- Customs declarations
- Regulatory reporting

---

## Support Services

### 14. Analytics Service
**Repository:** `/services/analytics-service`
**Status:** Production

**Responsibility:**
- Business intelligence
- Data warehousing
- Reporting
- KPI calculation

---

### 15. Marketing Service
**Repository:** `/services/marketing-service`
**Status:** Production

**Responsibility:**
- Campaign management
- Customer segmentation
- Email marketing
- Loyalty programs

---

### 16. Load Control Service
**Repository:** `/services/load-control-service`
**Status:** Production

**Responsibility:**
- Weight & balance
- Load planning
- Fuel calculation
- Center of gravity

---

### 17. CMS Service
**Repository:** `/services/cms-service`
**Status:** Production

**Responsibility:**
- Content management
- Configuration management
- Static content delivery

---

## Frontend Applications

### 1. Booking Engine
**Port:** 4001
**Technology:** Next.js 14, React 18, TailwindCSS
**Repository:** `/apps/booking-engine`

**Purpose:** Customer-facing booking application

---

### 2. Agent Portal
**Port:** 4000
**Technology:** Next.js 14, React 18, TailwindCSS
**Repository:** `/apps/agent-portal`

**Purpose:** Internal agent dashboard

---

### 3. Mobile App
**Technology:** React Native
**Repository:** `/apps/mobile-app`

**Purpose:** iOS and Android passenger app

---

### 4. Mobile Agent App
**Technology:** React Native
**Repository:** `/apps/mobile-agent-app`

**Purpose:** Mobile agent application

---

### 5. Analytics Dashboard
**Technology:** Next.js, React
**Repository:** `/apps/analytics-dashboard`

**Purpose:** Business analytics and reporting

---

## Shared Packages

### 1. Database Schemas
**Repository:** `/packages/database-schemas`
**Technology:** Prisma ORM

**Contents:**
- Complete database schema (40+ tables)
- Migrations
- Seed data

---

### 2. Shared Types
**Repository:** `/packages/shared-types`
**Technology:** TypeScript

**Contents:**
- Common interfaces
- Type definitions
- Enums

---

### 3. Shared Utils
**Repository:** `/packages/shared-utils`
**Technology:** TypeScript

**Contents:**
- Common utilities
- Helper functions
- Validation logic

---

### 4. Observability
**Repository:** `/packages/observability`
**Technology:** Prometheus, Winston, Jaeger

**Contents:**
- Metrics collection
- Logging utilities
- Tracing integration
- Event publishing/consuming

---

## Service Communication Matrix

| Service | Calls | Called By | Events Published | Events Consumed |
|---------|-------|-----------|------------------|-----------------|
| API Gateway | All services | Clients | - | - |
| Auth Service | - | All services | user.created | - |
| Reservation | Inventory, Pricing, Payment | API Gateway | booking.created | payment.completed |
| Inventory | - | Reservation | inventory.updated | - |
| Payment | Stripe, PayPal | Reservation | payment.completed | booking.created |
| Notification | SMTP, SMS | - | - | All booking/payment events |

## Summary

- **18 Microservices** providing complete airline operations
- **5 Frontend Applications** for various user types
- **4 Shared Packages** for code reuse
- **Production-ready** with comprehensive testing
- **Horizontally scalable** with Kubernetes
- **Event-driven** architecture for loose coupling
- **Observable** with metrics, logs, and traces
