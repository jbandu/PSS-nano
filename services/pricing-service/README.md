# Pricing Service

Dynamic fare management and revenue optimization engine with advanced pricing algorithms, tax calculation, and multi-currency support.

## Overview

The Pricing Service is the revenue management core of the airline PSS platform, responsible for fare calculation, dynamic pricing, tax computation, bundling, and commission management. It processes millions of price calculations daily with sub-200ms response times.

## Key Features

### ✅ Fare Repository
- **Fare Basis Code Management** - Store and manage fare basis codes (Y, B, M, H, Q, etc.)
- **Fare Families** - Basic, Standard, Flex, Premium with different benefits
- **Fare Rules Engine** - Refundable, changeable, cancellation policies
- **Validity Periods** - Advance purchase windows, min/max stay requirements
- **Seasonal Variations** - Peak/off-peak pricing by date ranges
- **Route-Specific Fares** - Origin-destination fare management

### ✅ Dynamic Pricing
- **Base Fare + Adjustments** - Start with base and apply dynamic factors
- **Demand-Based Pricing** - Adjust based on booking load (0.7x - 3.0x multiplier)
- **Time-to-Departure Curves** - Price increases as departure approaches
- **Load Factor Optimization** - Target 80%+ load with optimal pricing
- **Competitor Monitoring** - Integration-ready for price comparison
- **Price Recommendations** - AI-suggested optimal pricing

### ✅ Tax Calculation Engine
- **Country-Specific Rules** - US, EU, Canada, Australia, etc.
- **Airport Fees** - Landing fees, terminal charges, security fees
- **Government Taxes** - Per passenger, per segment, percentage-based
- **Fuel Surcharges** - Dynamic fuel surcharge calculation
- **Multi-Currency Support** - 50+ currencies with ISO 4217 codes
- **Real-Time FX** - Foreign exchange rate updates

### ✅ Pricing Rules
- **Route-Based Pricing** - Different rates per city pair
- **Passenger Type Pricing** - Adult, child (75% of adult), infant (10%), senior, military
- **Booking Class Multipliers** - First class, Business, Premium Economy, Economy
- **Channel Pricing** - Direct booking, GDS, OTA with different markups
- **Corporate Discounts** - Negotiated rates for corporate clients
- **Promotional Pricing** - Promo codes with discount limits

### ✅ Fare Families & Bundling
- **Bundle Definitions** - Flight + bag + seat + priority boarding
- **Upsell Logic** - Show savings vs. à la carte purchase
- **Cross-Sell** - Recommend complementary services
- **Dynamic Bundles** - Adjust bundle contents by route/demand
- **Bundle Discounts** - 15% discount vs. individual pricing

### ✅ Price Calculation API
- **Total Trip Price** - All-inclusive pricing
- **Component Breakdown** - Base fare, taxes, fees, ancillaries
- **Split Payments** - Support multiple payment methods
- **Price Guarantee** - Lock price for 30 minutes during booking
- **Fare Difference** - Calculate change fees for modifications
- **Multi-Currency Display** - Show prices in passenger's currency

### ✅ Commission Engine
- **Travel Agency Commission** - 10% default on base fare
- **GDS Override** - Fixed commission amounts
- **Affiliate Tracking** - Commission by referral source
- **Commission Reports** - Detailed commission breakdowns

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Pricing Service (Port 3004)                   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │              API Layer                            │ │
│  │  - Calculate Price (/calculate)                   │ │
│  │  - Fare Search (/fares)                           │ │
│  │  - Tax Calculation (/taxes)                       │ │
│  │  - Bundle Pricing (/bundles)                      │ │
│  └─────────────────┬───────────────────────────────────┘ │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │          Caching Layer (Redis)                    │ │
│  │  - Fare Cache (1 hour)                            │ │
│  │  - Price Cache (5 minutes)                        │ │
│  │  - Tax Rules (24 hours)                           │ │
│  │  - FX Rates (1 hour)                              │ │
│  └─────────────────┬───────────────────────────────────┘ │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │          Pricing Engines                          │ │
│  │  - Fare Engine (base pricing)                     │ │
│  │  - Dynamic Pricing Engine (demand adjustment)     │ │
│  │  - Tax Engine (country-specific rules)            │ │
│  │  - Bundle Engine (package pricing)                │ │
│  │  - Commission Engine (agent commissions)          │ │
│  │  - FX Engine (currency conversion)                │ │
│  └─────────────────┬───────────────────────────────────┘ │
│                    ▼                                     │
│  ┌─────────────────────────────────────────┬──────────┐ │
│  │   PostgreSQL (Fare Data)     │  External APIs     │ │
│  │   - Fare Basis Codes          │  - FX Rate API    │ │
│  │   - Fare Rules                │  - Tax API        │ │
│  │   - Tax Rules                 │  - Competitor API │ │
│  │   - Bundles                   │                   │ │
│  └───────────────────────────────┴───────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| Price Calculation | <200ms | Complete price with taxes |
| Fare Search | <300ms | Search applicable fares |
| Tax Calculation | <50ms | All taxes for itinerary |
| Bundle Pricing | <100ms | Calculate bundle price |
| Cache Hit Rate | 85%+ | Reduce database queries |
| Concurrent Requests | 200+ | Simultaneous calculations |

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript 5+
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis (ioredis)
- **Currency**: dinero.js, currency.js
- **Date**: date-fns
- **Validation**: Zod + Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure settings
nano .env

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

## Configuration

### Currency Support (ISO 4217)

Supports 50+ currencies:
- **Americas**: USD, CAD, MXN, BRL, ARS
- **Europe**: EUR, GBP, CHF, SEK, NOK, DKK, PLN
- **Asia**: JPY, CNY, KRW, INR, SGD, HKD, THB, MYR
- **Oceania**: AUD, NZD
- **Middle East**: AED, SAR, QAR
- **Africa**: ZAR, EGP

### Dynamic Pricing Configuration

```env
# Enable dynamic pricing
ENABLE_DYNAMIC_PRICING=true

# Time-to-departure buckets (days)
TIME_TO_DEPARTURE_BUCKETS=90,60,30,14,7,3,1

# Pricing multipliers
BASE_DEMAND_FACTOR=1.0               # Base multiplier
HIGH_DEMAND_THRESHOLD=0.8            # 80% load = high demand
DYNAMIC_PRICING_MIN_MULTIPLIER=0.7   # 30% discount max
DYNAMIC_PRICING_MAX_MULTIPLIER=3.0   # 3x increase max
```

### Tax Configuration

```env
# US Taxes
US_EXCISE_TAX_RATE=0.075            # 7.5% of base fare
US_SEGMENT_TAX=4.50                 # Per segment
US_SEPTEMBER_11_FEE=5.60            # Per passenger
US_APHIS_FEE=3.96                   # Agricultural inspection

# EU Taxes
EU_VAT_RATE=0.20                    # 20% VAT
EU_PASSENGER_SERVICE_CHARGE=10.00   # Per passenger
```

### Passenger Type Pricing

```env
CHILD_DISCOUNT_PERCENTAGE=25        # 75% of adult fare
INFANT_DISCOUNT_PERCENTAGE=90       # 10% of adult fare
SENIOR_DISCOUNT_PERCENTAGE=10       # 10% discount
MILITARY_DISCOUNT_PERCENTAGE=15     # 15% discount
```

## Usage

### Development

```bash
# Run in development mode
pnpm dev

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Generate coverage
pnpm test:coverage
```

## API Endpoints

### Price Calculation

#### Calculate Trip Price
```http
POST /api/pricing/calculate
Content-Type: application/json

{
  "itinerary": [
    {
      "origin": "JFK",
      "destination": "LAX",
      "departureDate": "2024-03-15",
      "flightNumber": "AA101",
      "cabinClass": "ECONOMY",
      "bookingClass": "Y"
    }
  ],
  "passengers": [
    { "type": "ADULT", "count": 2 },
    { "type": "CHILD", "count": 1 }
  ],
  "currency": "USD"
}
```

**Response:**
```json
{
  "totalPrice": {
    "amount": 897.45,
    "currency": "USD"
  },
  "breakdown": {
    "baseFare": {
      "amount": 599.00,
      "currency": "USD"
    },
    "taxes": [
      {
        "code": "US",
        "name": "US Excise Tax",
        "amount": 44.93,
        "currency": "USD"
      },
      {
        "code": "AY",
        "name": "US Segment Tax",
        "amount": 13.50,
        "currency": "USD"
      },
      {
        "code": "ZP",
        "name": "September 11 Fee",
        "amount": 16.80,
        "currency": "USD"
      }
    ],
    "fees": [
      {
        "code": "YQ",
        "name": "Fuel Surcharge",
        "amount": 75.00,
        "currency": "USD"
      }
    ],
    "totalTaxes": 148.45,
    "totalFees": 75.00,
    "ancillaries": 0.00
  },
  "perPassenger": [
    {
      "type": "ADULT",
      "baseFare": 299.50,
      "taxes": 74.23,
      "fees": 37.50,
      "total": 411.23
    },
    {
      "type": "CHILD",
      "baseFare": 224.63,
      "taxes": 55.67,
      "fees": 37.50,
      "total": 317.80
    }
  ],
  "validUntil": "2024-03-15T10:30:00Z",
  "fareRules": {
    "refundable": false,
    "changeable": true,
    "changeFee": 75.00,
    "advancePurchase": 7,
    "minStay": 1,
    "maxStay": 30
  }
}
```

#### Lock Price
```http
POST /api/pricing/lock
Content-Type: application/json

{
  "priceQuoteId": "uuid",
  "duration": 1800
}
```

**Response:**
```json
{
  "lockId": "uuid",
  "priceQuoteId": "uuid",
  "lockedPrice": 897.45,
  "currency": "USD",
  "expiresAt": "2024-03-15T10:30:00Z",
  "lockFee": 0.00
}
```

### Fare Search

#### Search Fares
```http
POST /api/pricing/fares/search
Content-Type: application/json

{
  "origin": "JFK",
  "destination": "LAX",
  "departureDate": "2024-03-15",
  "returnDate": "2024-03-22",
  "cabinClass": "ECONOMY",
  "passengers": {
    "adults": 2,
    "children": 1
  }
}
```

**Response:**
```json
{
  "fares": [
    {
      "fareFamily": "BASIC",
      "fareBasisCode": "YLEG0NR",
      "price": {
        "amount": 599.00,
        "currency": "USD"
      },
      "rules": {
        "refundable": false,
        "changeable": false,
        "baggageAllowance": "1 carry-on",
        "seatSelection": "at check-in",
        "advancePurchase": 7
      },
      "available": true
    },
    {
      "fareFamily": "STANDARD",
      "fareBasisCode": "YLEG0",
      "price": {
        "amount": 779.00,
        "currency": "USD"
      },
      "rules": {
        "refundable": false,
        "changeable": true,
        "changeFee": 75.00,
        "baggageAllowance": "1 checked bag + carry-on",
        "seatSelection": "advance",
        "advancePurchase": 3
      },
      "available": true
    },
    {
      "fareFamily": "FLEX",
      "fareBasisCode": "YLEG",
      "price": {
        "amount": 959.00,
        "currency": "USD"
      },
      "rules": {
        "refundable": true,
        "refundFee": 25.00,
        "changeable": true,
        "changeFee": 0.00,
        "baggageAllowance": "2 checked bags + carry-on",
        "seatSelection": "advance",
        "priorityBoarding": true
      },
      "available": true
    }
  ]
}
```

### Tax Calculation

#### Calculate Taxes
```http
POST /api/pricing/taxes/calculate
Content-Type: application/json

{
  "route": {
    "origin": "JFK",
    "destination": "LHR",
    "stops": []
  },
  "baseFare": 899.00,
  "currency": "USD",
  "passengers": [
    { "type": "ADULT", "count": 1 }
  ]
}
```

**Response:**
```json
{
  "taxes": [
    {
      "code": "US",
      "name": "US Excise Tax",
      "rate": 0.075,
      "amount": 67.43,
      "currency": "USD"
    },
    {
      "code": "AY",
      "name": "US Segment Tax",
      "amount": 4.50,
      "currency": "USD"
    },
    {
      "code": "ZP",
      "name": "September 11 Fee",
      "amount": 5.60,
      "currency": "USD"
    },
    {
      "code": "GB",
      "name": "UK Air Passenger Duty",
      "amount": 87.00,
      "currency": "USD",
      "originalAmount": 78.00,
      "originalCurrency": "GBP"
    }
  ],
  "totalTaxes": 164.53,
  "currency": "USD"
}
```

### Bundle Pricing

#### Get Bundles
```http
GET /api/pricing/bundles?route=JFK-LAX&cabinClass=ECONOMY
```

**Response:**
```json
{
  "bundles": [
    {
      "id": "bundle-basic",
      "name": "Basic Bundle",
      "family": "BASIC",
      "includes": [
        "Flight",
        "1 carry-on bag"
      ],
      "price": {
        "amount": 599.00,
        "currency": "USD"
      },
      "savings": 0.00
    },
    {
      "id": "bundle-standard",
      "name": "Standard Bundle",
      "family": "STANDARD",
      "includes": [
        "Flight",
        "1 checked bag",
        "1 carry-on bag",
        "Advance seat selection"
      ],
      "price": {
        "amount": 779.00,
        "currency": "USD"
      },
      "alaCartePrice": 809.00,
      "savings": 30.00,
      "recommended": true
    },
    {
      "id": "bundle-premium",
      "name": "Premium Bundle",
      "family": "FLEX",
      "includes": [
        "Flight",
        "2 checked bags",
        "1 carry-on bag",
        "Advance seat selection",
        "Priority boarding",
        "Premium meal",
        "WiFi"
      ],
      "price": {
        "amount": 959.00,
        "currency": "USD"
      },
      "alaCartePrice": 1099.00,
      "savings": 140.00
    }
  ]
}
```

### Commission Calculation

#### Calculate Commission
```http
POST /api/pricing/commission/calculate
Content-Type: application/json

{
  "baseFare": 899.00,
  "currency": "USD",
  "channel": "TRAVEL_AGENCY",
  "agencyId": "uuid"
}
```

**Response:**
```json
{
  "baseFare": 899.00,
  "commissionRate": 0.10,
  "commission": 89.90,
  "currency": "USD",
  "breakdown": {
    "baseCommission": 89.90,
    "override": 0.00,
    "bonus": 0.00
  }
}
```

## Fare Families

### Family Definitions

**BASIC (Economy Light)**
- Lowest price
- Non-refundable
- Non-changeable
- 1 carry-on only
- Seat at check-in
- Last to board

**STANDARD (Economy)**
- Mid-range price (+30%)
- Non-refundable
- Changeable (fee applies)
- 1 checked bag + carry-on
- Advance seat selection
- Standard boarding

**FLEX (Economy Plus)**
- Higher price (+60%)
- Refundable (fee applies)
- Free changes
- 2 checked bags + carry-on
- Advance seat selection
- Priority boarding
- Premium meal option

**PREMIUM (Premium Economy)**
- Premium price (+150%)
- Fully refundable
- Unlimited changes
- 2 checked bags + carry-on
- Extra legroom
- Priority boarding
- Premium meal
- WiFi included
- Lounge access

## Dynamic Pricing Algorithm

### Time-to-Departure Curve

```typescript
function calculateDemandMultiplier(daysToDepart: number, loadFactor: number): number {
  // Base multiplier on time to departure
  let multiplier = 1.0;

  if (daysToDepart > 90) multiplier = 0.8;
  else if (daysToDepart > 60) multiplier = 0.9;
  else if (daysToDepart > 30) multiplier = 1.0;
  else if (daysToDepart > 14) multiplier = 1.1;
  else if (daysToDepart > 7) multiplier = 1.3;
  else if (daysToDepart > 3) multiplier = 1.6;
  else if (daysToDepart > 1) multiplier = 2.0;
  else multiplier = 2.5;

  // Adjust for load factor
  if (loadFactor > 0.8) {
    multiplier *= 1.5; // High demand
  } else if (loadFactor > 0.6) {
    multiplier *= 1.2; // Medium demand
  } else if (loadFactor < 0.3) {
    multiplier *= 0.8; // Low demand, discount
  }

  // Enforce limits
  return Math.max(0.7, Math.min(3.0, multiplier));
}
```

### Example Pricing

**Base Fare**: $300

| Days to Departure | Load Factor | Multiplier | Final Price |
|-------------------|-------------|------------|-------------|
| 120 days          | 20%         | 0.70       | $210        |
| 90 days           | 40%         | 0.80       | $240        |
| 30 days           | 60%         | 1.00       | $300        |
| 14 days           | 70%         | 1.32       | $396        |
| 7 days            | 80%         | 1.95       | $585        |
| 3 days            | 85%         | 2.40       | $720        |
| 1 day             | 90%         | 3.00       | $900        |

## Tax Rules by Country

### United States

- **Excise Tax**: 7.5% of base fare
- **Segment Tax**: $4.50 per segment
- **September 11 Fee**: $5.60 per passenger (domestic)
- **APHIS Fee**: $3.96 (international arrivals)
- **Customs Fee**: $5.77 (international arrivals)
- **Immigration Fee**: $7.00 (international arrivals)

### European Union

- **VAT**: 0-20% depending on country
- **Air Passenger Duty (UK)**: £13-£180 based on distance and class
- **Solidarity Tax (France)**: €2.63-€63 based on class and destination
- **Passenger Service Charge**: Varies by airport

### Canada

- **GST/HST**: 5-15% depending on province
- **Air Travelers Security Charge**: CAD 7.12-25.91
- **Airport Improvement Fee**: Varies by airport

### Australia

- **GST**: 10% on domestic flights
- **Passenger Movement Charge**: AUD 60 (international departures)

## Foreign Exchange

### Supported Currencies

```typescript
const CURRENCIES = {
  USD: { symbol: '$', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
  GBP: { symbol: '£', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
  CNY: { symbol: '¥', decimals: 2 },
  // ... 45 more currencies
};
```

### FX Rate Update

- **Source**: ExchangeRate-API or similar
- **Update Frequency**: Hourly
- **Fallback**: Use previous rates if API unavailable
- **Precision**: 6 decimal places
- **Cache**: 1 hour TTL

### Example Conversion

```typescript
const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: FXRates
): number => {
  const rate = rates[toCurrency] / rates[fromCurrency];
  return amount * rate;
};

// $100 USD to EUR (rate: 0.92)
convertCurrency(100, 'USD', 'EUR', rates); // €92.00
```

## Commission Structure

### Travel Agency Commission

- **Base Commission**: 10% of base fare
- **Minimum Commission**: $10
- **Maximum Commission**: $100 per ticket
- **Override Commission**: Negotiated fixed amounts
- **Bonus Commission**: Volume-based bonuses

### GDS Commission

- **Booking Fee**: $25 per booking
- **Segment Fee**: $5 per segment
- **Transaction Fee**: $2 per transaction

### Affiliate Commission

- **Commission Rate**: 5% of total booking value
- **Cookie Duration**: 30 days
- **Attribution**: Last-click attribution

## Performance Optimization

### Caching Strategy

**Fare Cache (1 hour):**
```typescript
key: price:fare:{origin}:{dest}:{date}:{class}
ttl: 3600 seconds
```

**Price Cache (5 minutes):**
```typescript
key: price:quote:{hash}
ttl: 300 seconds
```

**Tax Rules (24 hours):**
```typescript
key: price:tax:{country}:{type}
ttl: 86400 seconds
```

**FX Rates (1 hour):**
```typescript
key: price:fx:{currency}
ttl: 3600 seconds
```

### Database Optimization

- Indexed on: `origin`, `destination`, `date`, `bookingClass`
- Materialized views for complex fare calculations
- Connection pooling (20 connections)
- Query result caching

## Testing

### Unit Tests

```bash
pnpm test:unit
```

Test coverage:
- Fare calculation logic
- Tax calculation engine
- Bundle pricing
- Commission calculation
- Currency conversion

### Integration Tests

```bash
pnpm test:integration
```

Test scenarios:
- End-to-end price calculation
- Multi-currency pricing
- Tax calculation by country
- Bundle vs. à la carte pricing
- Commission calculation

### Edge Cases

- Zero fare (award tickets)
- Negative fare adjustments
- Multi-segment complex routes
- Mixed cabin class
- Infant lap vs. seat
- Military/senior discounts
- Corporate negotiated fares

## Monitoring

### Key Metrics

- **Price Calculation Time**: p50, p95, p99
- **Cache Hit Rate**: Target 85%+
- **FX API Response Time**: Target <500ms
- **Error Rate**: Target <0.1%
- **Concurrent Calculations**: Current load

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-15T10:00:00Z",
  "uptime": 86400,
  "services": {
    "database": "connected",
    "redis": "connected",
    "fxApi": "available"
  },
  "performance": {
    "avgCalculationTime": 145,
    "cacheHitRate": 0.89,
    "activeCalculations": 23
  }
}
```

## Error Handling

### Error Codes

- **400** - Invalid request (missing parameters)
- **404** - Fare not found
- **422** - Calculation error (invalid route, etc.)
- **429** - Rate limit exceeded
- **503** - Service unavailable (FX API down)

### Error Response

```json
{
  "status": "error",
  "statusCode": 422,
  "message": "Cannot calculate fare for invalid route",
  "details": {
    "origin": "JFK",
    "destination": "INVALID"
  },
  "timestamp": "2024-03-15T10:00:00Z"
}
```

## Deployment

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3004
CMD ["node", "dist/index.js"]
```

### Environment (Production)

```bash
NODE_ENV=production
PORT=3004
DATABASE_URL="postgresql://..."
REDIS_HOST=redis.production.internal
ENABLE_DYNAMIC_PRICING=true
FX_API_KEY="production-key"
```

## Contributing

1. Follow TypeScript strict mode
2. Add tests for all pricing logic (min 90% coverage)
3. Test edge cases thoroughly
4. Update tax rules when regulations change
5. Document fare rule changes

## License

Proprietary - All rights reserved
