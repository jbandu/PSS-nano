# DCS Service (Departure Control System)

Backend service for airport check-in operations, providing comprehensive departure control functionality including passenger check-in, seat assignment, baggage handling, and APIS data collection.

## Overview

The DCS Service is a critical component of the airline PSS platform, handling all airport check-in operations from passenger search to boarding pass issuance. It integrates with reservation, inventory, payment, and ancillary services to provide a complete departure control solution.

**Target Performance**: Sub-5 second check-in completion per passenger

## Features

### Core Check-in Operations
- **Multi-channel Check-in**: Agent, web, mobile, and kiosk check-in support
- **Passenger Search**: By PNR, name, frequent flyer number
- **Quick Check-in Interface**: Optimized for high-volume processing
- **Multi-passenger Check-in**: Process up to 9 passengers in a single transaction
- **Group Check-in**: Special handling for groups of 10+ passengers
- **Session Management**: Track agent sessions and productivity metrics

### Seat Management
- **Interactive Seat Maps**: Real-time seat availability visualization
- **Seat Assignment**: Manual and automatic seat assignment
- **Seat Blocking**: Temporary seat holds with 5-minute expiration
- **Seat Types**: Standard, extra legroom, premium, emergency exit, bulkhead
- **Seat Preferences**: Window, aisle, middle preferences
- **Real-time Updates**: Socket.io for live seat map synchronization

### Baggage Handling
- **Bag Tag Generation**: Unique 10-digit IATA-compliant bag tag numbers
- **BSM Generation**: Baggage Source Messages in IATA 1.6 format
- **Baggage Tracking**: Full lifecycle tracking from check-in to delivery
- **Special Handling**: Overweight, oversized, fragile, priority baggage
- **Excess Baggage Fees**: Automatic fee calculation based on cabin class
- **Bag Tag Printing**: PDF generation with barcode (PDF417)

### APIS (Advance Passenger Information System)
- **Document Collection**: Passport, visa, ID card information
- **OCR Support**: Passport scanning with optical character recognition
- **Timatic Integration**: Visa requirement validation
- **Watchlist Screening**: Security screening with automated clearance
- **Government Systems**:
  - US Secure Flight (TSA)
  - CARICOM IMPACS
  - Customs declaration
  - Immigration preclearance
- **APIS Submission**: Automated submission to government systems

### Load Control
- **Flight Load Tracking**: Real-time passenger and baggage counts
- **Weight & Balance**: Load sheet generation in IATA LIR format
- **Cabin Breakdown**: First, business, premium economy, economy counts
- **Cargo Management**: Integration with cargo weight tracking
- **Flight Close-out**: Automated close-out with manifest generation

### Standby Management
- **Standby List**: Priority-based standby passenger management
- **Auto-clearance**: Automatic standby clearance based on availability
- **Priority Rules**: Status tier and check-in time priority
- **Denied Boarding**: Voluntary and involuntary denied boarding handling
- **Compensation**: Automated compensation calculation

## Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5+
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (ioredis)
- **Real-time**: Socket.io for live updates
- **Logging**: Winston with daily rotation
- **PDF Generation**: PDFKit

### Database Schema

**Key Models**:
- `CheckInTransaction`: Main check-in transaction record
- `PassengerCheckIn`: Individual passenger check-in details
- `BaggageTag`: Baggage tag and tracking information
- `APISData`: Advance passenger information
- `SecureFlightData`: US TSA Secure Flight data
- `SpecialServiceRequest`: SSR handling (wheelchair, medical, etc.)
- `SeatBlock`: Temporary seat blocking
- `AgentSession`: Agent session tracking
- `StandbyPassenger`: Standby list management
- `FlightLoad`: Flight load statistics
- `CheckInAudit`: Comprehensive audit logging

### API Endpoints

#### Check-in APIs
```
POST   /api/v1/check-in/start                    - Start check-in transaction
POST   /api/v1/check-in/:transactionId/passenger - Check in passenger
POST   /api/v1/check-in/passenger/:id/seat       - Assign seat
POST   /api/v1/check-in/:transactionId/complete  - Complete check-in
GET    /api/v1/check-in/search                   - Search passengers
```

#### Baggage APIs
```
POST   /api/v1/baggage/tag                       - Issue baggage tag
GET    /api/v1/baggage/tag/:tagNumber/pdf        - Generate bag tag PDF
PUT    /api/v1/baggage/tag/:tagNumber/status     - Update baggage status
```

#### APIS APIs
```
POST   /api/v1/apis/collect                      - Collect APIS data
POST   /api/v1/apis/:apisDataId/submit           - Submit APIS to government
POST   /api/v1/apis/passenger/:id/ocr            - Process OCR data
```

### Socket.io Events

**Server Emits**:
- `seat:map:update` - Full seat map update
- `seat:blocked` - Seat temporarily blocked
- `seat:released` - Seat block released
- `seat:assigned` - Seat assigned to passenger
- `passenger:checked-in` - Passenger checked in
- `baggage:tagged` - Baggage tag issued
- `flight:load:update` - Flight load statistics updated
- `standby:update` - Standby list updated

**Client Emits**:
- `join:flight` - Join flight room for updates
- `leave:flight` - Leave flight room
- `join:station` - Join station room

## Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- pnpm (workspace manager)

### Setup

1. **Install dependencies**:
```bash
cd services/dcs-service
pnpm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database**:
```bash
pnpm db:generate
pnpm db:migrate
```

4. **Start service**:
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## Configuration

### Environment Variables

**Server Configuration**:
- `NODE_ENV`: Environment (development, production)
- `PORT`: Service port (default: 3010)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port (default: 6379)

**Socket.io Configuration**:
- `SOCKET_IO_PORT`: WebSocket port (default: 3011)
- `SOCKET_IO_CORS_ORIGIN`: Allowed CORS origins
- `ENABLE_SOCKET_IO`: Enable real-time updates

**Check-in Configuration**:
- `CHECK_IN_OPEN_HOURS`: Hours before departure to open check-in (default: 24)
- `CHECK_IN_CLOSE_MINUTES`: Minutes before departure to close check-in (default: 45)
- `MAX_PASSENGERS_PER_TRANSACTION`: Maximum passengers per transaction (default: 9)
- `CHECK_IN_TIMEOUT_SECONDS`: Transaction timeout (default: 300)

**Seat Configuration**:
- `ENABLE_AUTO_SEAT_ASSIGNMENT`: Enable automatic seat assignment
- `SEAT_MAP_CACHE_TTL`: Seat map cache duration in seconds (default: 60)
- `ENABLE_SEAT_BLOCKING`: Enable temporary seat blocking
- `BLOCK_SEAT_DURATION_MINUTES`: Seat block duration (default: 5)

**Baggage Configuration**:
- `BAG_TAG_NUMBER_PREFIX`: Bag tag prefix (default: AA)
- `BAG_TAG_NUMBER_LENGTH`: Bag tag length (default: 10)
- `ENABLE_IATA_BSM`: Enable BSM generation
- `BSM_VERSION`: BSM version (default: 1.6)
- `MAX_BAG_WEIGHT_KG`: Maximum bag weight (default: 23)
- `HEAVY_BAG_FEE_USD`: Heavy bag fee (default: 100)

**APIS Configuration**:
- `ENABLE_APIS`: Enable APIS collection
- `APIS_REQUIRED_ROUTES`: Comma-separated country codes requiring APIS
- `ENABLE_PASSPORT_SCANNING`: Enable passport OCR
- `ENABLE_TIMATIC_VALIDATION`: Enable Timatic visa validation
- `ENABLE_WATCHLIST_SCREENING`: Enable security screening

**Performance Targets**:
- `TARGET_CHECK_IN_TIME_SECONDS`: Target check-in time (default: 5)
- `TARGET_SEAT_MAP_LOAD_TIME_MS`: Target seat map load time (default: 500)
- `TARGET_PASSENGER_LOOKUP_TIME_MS`: Target search time (default: 1000)
- `TARGET_CONCURRENT_AGENTS`: Target concurrent agents (default: 100)

See `.env.example` for complete configuration options.

## Usage Examples

### Start Check-in Transaction
```typescript
POST /api/v1/check-in/start
{
  "pnrLocator": "ABC123",
  "flightId": "AA100-2024-01-15-JFK-LAX",
  "agentId": "agent-001",
  "agentName": "John Doe",
  "stationCode": "JFK",
  "passengers": [
    {
      "passengerId": "pax-001",
      "firstName": "Jane",
      "lastName": "Smith",
      "passengerType": "ADT",
      "sequenceNumber": 1,
      "cabinClass": "Y"
    }
  ]
}
```

### Issue Baggage Tag
```typescript
POST /api/v1/baggage/tag
{
  "passengerCheckInId": "checkin-001",
  "flightId": "AA100-2024-01-15-JFK-LAX",
  "weight": 20,
  "weightUnit": "KG",
  "origin": "JFK",
  "destination": "LAX",
  "connections": []
}
```

### Collect APIS Data
```typescript
POST /api/v1/apis/collect
{
  "passengerCheckInId": "checkin-001",
  "documentType": "P",
  "documentNumber": "123456789",
  "issuingCountry": "US",
  "nationality": "US",
  "expiryDate": "2030-12-31",
  "dateOfBirth": "1990-01-01",
  "gender": "F"
}
```

## Performance Optimization

### Caching Strategy
- **Seat Maps**: Cached for 60 seconds with Redis
- **PNR Data**: Cached for 1 hour
- **Flight Details**: Cached for 1 hour
- **Agent Sessions**: Cached for 8 hours
- **Baggage Tags**: Cached for 24 hours

### Database Optimization
- Indexed on frequently queried fields (PNR, flight ID, passenger ID)
- Optimistic locking for concurrent seat assignments
- Batch operations for multi-passenger check-ins

### Real-time Updates
- Socket.io for push-based updates (no polling)
- Flight-specific rooms to minimize broadcast overhead
- Heartbeat monitoring with automatic reconnection

## Monitoring & Logging

### Logging
- **Application Logs**: `logs/dcs-service-YYYY-MM-DD.log`
- **Error Logs**: `logs/dcs-service-error-YYYY-MM-DD.log`
- **Check-in Transactions**: `logs/check-in-transactions-YYYY-MM-DD.log`
- **Baggage Operations**: `logs/baggage-YYYY-MM-DD.log`
- **APIS Submissions**: `logs/apis-YYYY-MM-DD.log`

### Audit Trail
Complete audit logging in `CheckInAudit` table:
- Agent actions (who, what, when, where)
- PII access logging
- Configuration changes
- System events

### Metrics
- Check-in completion time
- Seat map load time
- Passenger lookup time
- Concurrent agent sessions
- Baggage processing rate
- APIS submission success rate

### Health Check
```
GET /api/v1/health
```

Returns service status, database connectivity, Redis connectivity, and uptime.

## Security

### Authentication
- JWT token-based authentication
- API key support for system integrations
- Role-based access control (RBAC)

### Data Protection
- PII data encryption at rest
- Secure document storage
- GDPR compliance
- Access logging for all PII operations

### Audit Logging
- All check-in transactions logged
- Agent actions tracked
- Configuration changes logged
- 2-year retention for compliance

## Integration

### External Services
- **Reservation Service**: PNR retrieval and updates
- **Inventory Service**: Seat availability and locking
- **Payment Service**: Fee collection
- **Ancillary Service**: Upsell and cross-sell

### Government Systems
- **US DHS Secure Flight**: TSA passenger screening
- **CARICOM IMPACS**: Caribbean immigration
- **Timatic**: Visa requirement validation
- **Watchlist Screening**: Security clearance

### Airport Systems
- **Baggage Handling System**: BSM integration
- **Flight Information Display**: Real-time updates
- **Common Use Self-Service (CUSS)**: Kiosk integration

## Development

### Project Structure
```
services/dcs-service/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── config/
│   │   └── index.ts            # Configuration management
│   ├── controllers/
│   │   ├── check-in.controller.ts
│   │   ├── baggage.controller.ts
│   │   └── apis.controller.ts
│   ├── services/
│   │   ├── check-in.service.ts # Business logic
│   │   ├── baggage.service.ts
│   │   ├── apis.service.ts
│   │   └── socket.service.ts   # Real-time updates
│   ├── routes/
│   │   └── index.ts            # API routes
│   ├── utils/
│   │   ├── logger.ts           # Logging utilities
│   │   ├── redis.ts            # Redis client
│   │   └── prisma.ts           # Prisma client
│   └── index.ts                # Entry point
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts
```bash
pnpm dev              # Start development server with watch
pnpm build            # Build for production
pnpm start            # Start production server
pnpm typecheck        # Run TypeScript type checking
pnpm test             # Run tests
pnpm db:migrate       # Run database migrations
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio
```

### Adding New Features
1. Update Prisma schema if database changes are needed
2. Create/update service layer with business logic
3. Create/update controller for HTTP handling
4. Add routes in `routes/index.ts`
5. Add Socket.io events if real-time updates needed
6. Update documentation

## Troubleshooting

### Common Issues

**Socket.io Connection Failed**:
- Check `SOCKET_IO_PORT` and `SOCKET_IO_CORS_ORIGIN`
- Verify firewall allows WebSocket connections
- Check client is using correct Socket.io URL

**Slow Check-in Performance**:
- Review database query performance
- Check Redis cache hit rate
- Monitor concurrent agent count
- Review seat map caching

**BSM Not Sending**:
- Verify `ENABLE_IATA_BSM=true`
- Check baggage handling system integration
- Review BSM logs for errors

**APIS Submission Failed**:
- Verify government system credentials
- Check network connectivity to government endpoints
- Review APIS validation errors
- Ensure all mandatory fields are collected

## License

Proprietary - Airline Operations Platform

## Support

For technical support and questions:
- Email: support@airline-ops.com
- Documentation: https://docs.airline-ops.com
- Issue Tracker: https://github.com/airline-ops/pss-platform/issues
