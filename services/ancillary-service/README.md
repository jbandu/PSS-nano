# Ancillary Service

Advanced ancillary revenue management system for airline operations, designed to maximize non-ticket revenue through intelligent product offering, dynamic pricing, and bundling strategies.

## 🎯 Revenue Target

**$3.75M Annual Revenue Increase** for a 10M passenger airline
- **Target Revenue per Passenger**: $0.375
- **Target Attach Rate**: 65%
- **Target Product Mix**: Optimized for margin and demand

## 📋 Table of Contents

- [Overview](#overview)
- [Product Catalog](#product-catalog)
- [Dynamic Pricing Engine](#dynamic-pricing-engine)
- [Bundling Engine](#bundling-engine)
- [Omnichannel Selling](#omnichannel-selling)
- [EMD Generation](#emd-generation)
- [Revenue Analytics](#revenue-analytics)
- [API Reference](#api-reference)
- [Performance Targets](#performance-targets)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)

## Overview

The Ancillary Service is a comprehensive revenue management platform that handles all aspects of ancillary products from catalog management to purchase fulfillment. It integrates with reservation, pricing, and notification services to provide a seamless customer experience across all touchpoints.

### Key Features

✅ **Product Catalog Management**
- 8 major product categories (Baggage, Seats, Meals, Lounge, Priority, WiFi, Insurance, Equipment)
- Dynamic availability rules based on route, class, passenger type
- Real-time inventory tracking
- Product bundling and packages

✅ **Dynamic Pricing**
- Time-to-departure pricing (0.8x early → 1.5x late)
- Demand-based pricing (0.9x low → 1.3x high)
- Channel-specific pricing (mobile discount, gate markup)
- Loyalty tier discounts (5% → 20%)
- Personalized pricing based on customer segments

✅ **Bundling Engine**
- Pre-configured bundles (Light, Standard, Max)
- Dynamic bundle recommendations
- Bundle discounts (15% standard, 25% max)
- Cross-sell and upsell optimization

✅ **Omnichannel Selling**
- Booking flow integration
- Post-booking upsell (24-48 hours before departure)
- Check-in upsell
- Gate/kiosk sales
- Mobile app integration

✅ **EMD Generation**
- Electronic Miscellaneous Document generation
- 13-digit EMD numbers with airline prefix
- 365-day validity period
- Service delivery tracking

✅ **Revenue Analytics**
- Real-time attach rate tracking
- Revenue per passenger metrics
- Product performance analytics
- A/B testing framework
- Conversion funnel analysis

## Product Catalog

### 1. Baggage Services

**Weight Tiers**: 23kg (Standard) | 32kg (Heavy) | 45kg+ (Oversized)

| Tier | Weight Range | Base Price | Dynamic Range |
|------|--------------|------------|---------------|
| Standard | Up to 23kg | $35.00 | $28 - $53 |
| Heavy | 23-32kg | $75.00 | $60 - $113 |
| Oversized | 32-45kg+ | $150.00 | $120 - $225 |

**Business Rules**:
- Maximum 5 bags per passenger
- Different limits for domestic (3) vs international (5)
- Pre-purchase discount vs gate purchase
- Loyalty tier discounts apply

**Dynamic Pricing Factors**:
```
Final Price = Base Price × Time Multiplier × Demand Multiplier × Channel Multiplier × (1 - Loyalty Discount)

Example (Standard Bag, 7 days before, high demand, mobile, Gold member):
$35.00 × 1.2 (7 days) × 1.1 (high demand) × 0.95 (mobile) × 0.90 (10% Gold discount) = $39.50
```

### 2. Seat Selection

**Seat Categories**:

| Category | Base Price | Features |
|----------|-----------|----------|
| Standard | $0.00 | Regular seat, no charge |
| Extra Legroom | $50.00 | 34-36" pitch, more space |
| Premium | $100.00 | Front cabin, priority boarding |
| Exit Row | $35.00 | Emergency exit, extra legroom |

**Availability Rules**:
- Seat selection cutoff: 2 hours before departure
- Exit row requires passenger acceptance
- Premium seats limited to front rows
- Class of service restrictions apply

**Dynamic Pricing**:
- Increases as departure approaches
- High-demand routes (0.8+ load factor) → +30%
- Popular seats (window/aisle, front) → +20%
- Last-minute selection (< 24h) → +50%

### 3. Meal Pre-Order

**Meal Options**:

| Type | Base Price | Description |
|------|-----------|-------------|
| Standard | $15.00 | Hot meal with beverage |
| Premium | $25.00 | Chef-curated menu, wine |
| Special | $20.00 | Dietary requirements (vegan, kosher, halal) |

**Business Rules**:
- Pre-order cutoff: 24 hours before departure
- Special meals require 48-hour notice
- Limited to long-haul flights (> 3 hours)
- Maximum 2 meals per passenger per segment

### 4. Lounge Access

**Access Types**:

| Type | Base Price | Duration | Amenities |
|------|-----------|----------|-----------|
| Domestic | $45.00 | 3 hours | Food, WiFi, Showers |
| International | $65.00 | 6 hours | Premium food, Spa, Business center |

**Business Rules**:
- Access valid 6 hours before departure
- One-time entry per purchase
- Guest passes available (+$40)
- Complimentary for premium passengers

### 5. Priority Services

**Service Types**:

| Service | Price | Benefit |
|---------|-------|---------|
| Priority Boarding | $15.00 | Board in Group 1 |
| Fast Track Security | $20.00 | Dedicated security lane |
| Priority Check-in | $10.00 | Dedicated check-in counter |

**Bundling**:
- Priority Bundle (all three): $40.00 (save $5)
- Automatically included in premium fares

### 6. WiFi Packages

**Package Tiers**:

| Package | Price | Data | Speed |
|---------|-------|------|-------|
| Basic | $9.99 | 100MB | 5 Mbps |
| Premium | $19.99 | 500MB | 15 Mbps |
| Unlimited | $29.99 | Unlimited | 25 Mbps |

**Business Rules**:
- Valid for single flight segment
- Purchase up to 24 hours before departure
- Device limit: 2 per purchase
- Streaming available on Premium/Unlimited only

### 7. Travel Insurance

**Coverage Tiers**:

| Tier | Price | Coverage |
|------|-------|----------|
| Basic | $25.00 | Trip cancellation, baggage loss |
| Premium | $50.00 | + Medical, trip interruption |
| Cancel for Any Reason | $100.00 | + Full refund flexibility |

**Business Rules**:
- Must purchase within 24 hours of booking
- Coverage up to ticket value
- Medical coverage up to $50,000
- Premium tier includes 24/7 assistance

### 8. Equipment Rental

**Equipment Types**:

| Equipment | Price | Availability |
|-----------|-------|--------------|
| Wheelchair | $0.00 | Complimentary (required 48h notice) |
| Car Seat | $15.00 | Children under 5 |
| Pet Carrier | $25.00 | In-cabin pets only |

## Dynamic Pricing Engine

### Pricing Algorithm

The dynamic pricing engine adjusts ancillary prices based on multiple factors to optimize revenue while maintaining customer satisfaction.

#### Time-to-Departure Multiplier

```
Multiplier = f(days_to_departure)

Days to Departure | Multiplier | Strategy
------------------|------------|----------
90+ days          | 0.8        | Early bird discount
30-89 days        | 1.0        | Base price
14-29 days        | 1.1        | Slight increase
7-13 days         | 1.2        | Moderate increase
3-6 days          | 1.3        | Higher urgency
1-2 days          | 1.5        | Maximum urgency
```

#### Demand Multiplier

Based on flight load factor and historical demand:

```
Demand Level | Load Factor | Multiplier
-------------|-------------|------------
Low          | < 0.5       | 0.9
Normal       | 0.5 - 0.8   | 1.0
High         | > 0.8       | 1.3
```

#### Channel Multiplier

Different pricing by sales channel:

```
Channel        | Multiplier | Strategy
---------------|------------|----------
Web Booking    | 1.0        | Base price
Mobile App     | 0.95       | Encourage mobile adoption
Kiosk          | 1.0        | No markup
Gate           | 1.10       | Last-minute premium
Agent          | 1.05       | Service cost recovery
```

#### Loyalty Discount

Tiered discounts by loyalty status:

```
Tier       | Discount | Annual Spend
-----------|----------|---------------
Silver     | 5%       | $2,000+
Gold       | 10%      | $5,000+
Platinum   | 15%      | $10,000+
Elite      | 20%      | $25,000+
```

### Complete Pricing Formula

```typescript
function calculateDynamicPrice(
  basePrice: number,
  daysToDepart: number,
  loadFactor: number,
  channel: Channel,
  loyaltyTier: LoyaltyTier
): number {
  const timeMultiplier = getTimeMultiplier(daysToDepart);
  const demandMultiplier = getDemandMultiplier(loadFactor);
  const channelMultiplier = getChannelMultiplier(channel);
  const loyaltyDiscount = getLoyaltyDiscount(loyaltyTier);

  const dynamicPrice = basePrice
    × timeMultiplier
    × demandMultiplier
    × channelMultiplier
    × (1 - loyaltyDiscount);

  // Apply maximum increase cap (2.0x)
  const maxPrice = basePrice × 2.0;
  return Math.min(dynamicPrice, maxPrice);
}
```

### Example Calculation

**Scenario**: Extra Legroom Seat Selection
- Base Price: $50.00
- Days to Departure: 7 days (multiplier: 1.2)
- Load Factor: 0.85 (high demand, multiplier: 1.3)
- Channel: Mobile app (multiplier: 0.95)
- Loyalty Tier: Gold (10% discount)

**Calculation**:
```
Price = $50.00 × 1.2 × 1.3 × 0.95 × 0.90
      = $50.00 × 1.332
      = $66.60
```

## Bundling Engine

### Pre-Configured Bundles

#### 1. Light Bundle - $15.00 (No discount, convenience only)
- 1 Standard bag (23kg)
- Standard seat selection
- **Target**: Budget-conscious travelers

#### 2. Standard Bundle - $115.00 (Save $15 vs individual)
- 1 Heavy bag (32kg): $75
- Extra legroom seat: $50
- Priority boarding: $15
- **Regular Price**: $140
- **Bundle Price**: $115
- **Savings**: $25 (17.8%)

#### 3. Max Bundle - $250.00 (Save $25 vs individual)
- 2 Heavy bags (32kg each): $150
- Premium seat: $100
- Priority services (all three): $45
- Lounge access (domestic): $45
- Premium meal: $25
- WiFi Premium: $20
- **Regular Price**: $385
- **Bundle Price**: $250
- **Savings**: $135 (35%)

### Dynamic Bundle Recommendations

The system analyzes passenger profiles and booking patterns to recommend personalized bundles:

```typescript
interface BundleRecommendation {
  bundleId: string;
  products: AncillaryProduct[];
  regularPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercentage: number;
  relevanceScore: number; // 0-100, based on passenger profile
  reason: string; // Why this bundle is recommended
}

function recommendBundle(passenger: Passenger, booking: Booking): BundleRecommendation[] {
  // Factors considered:
  // 1. Trip type (business vs leisure)
  // 2. Route length (short-haul vs long-haul)
  // 3. Booking class (economy vs premium)
  // 4. Historical purchases
  // 5. Loyalty tier
  // 6. Travel frequency

  // Example: Business traveler on long-haul → Recommend Max Bundle
  // Example: Leisure traveler on short-haul → Recommend Light/Standard
}
```

### Bundle Business Rules

1. **Minimum Items**: Bundles must contain at least 2 products
2. **Discount Tiers**:
   - 2-3 items: 10% discount
   - 4-5 items: 15% discount
   - 6+ items: 25% discount
3. **Bundle Validity**: Same as individual products (varies by product type)
4. **Modifications**: Individual products can be added/removed with price adjustment
5. **Refunds**: Bundle refund follows most restrictive product in bundle

## Omnichannel Selling

### Sales Touchpoints

#### 1. Initial Booking Flow
```
Flight Selection → Passenger Details → [ANCILLARY UPSELL] → Payment → Confirmation
```

**Strategy**:
- Show relevant products based on route and class
- Highlight bundles first, then individual products
- Use scarcity messaging ("Only 3 premium seats left")
- Show social proof ("90% of passengers on this route add baggage")

**Conversion Target**: 40% attach rate

#### 2. Post-Booking Upsell (24-48 hours after booking)
```
Booking Confirmed → Email (24h later) → Ancillary Offer → Purchase
```

**Strategy**:
- Email with personalized product recommendations
- 10% discount on ancillaries (incentive to purchase now)
- Cutoff: 48 hours before departure
- SMS reminder 48 hours before cutoff

**Conversion Target**: 15% of non-purchasers convert

#### 3. Pre-Flight Check-in (24 hours before)
```
Check-in Flow → Boarding Pass → [LAST CHANCE UPSELL] → Mobile Boarding Pass
```

**Strategy**:
- Seat upgrade offers (remaining inventory)
- Last-minute baggage add-ons
- Lounge access for premium experience
- Priority boarding for convenience

**Conversion Target**: 10% attach rate

#### 4. Airport Kiosk/Gate
```
Kiosk Check-in → [UPSELL SCREEN] → Print Boarding Pass
Gate → Agent Recommendation → Purchase
```

**Strategy**:
- Seat upgrades (unsold premium inventory)
- Baggage (higher pricing due to last-minute)
- Lounge access (if time permits)

**Conversion Target**: 5% attach rate (high-value transactions)

### Channel Performance Tracking

```typescript
interface ChannelMetrics {
  channel: 'booking' | 'post_booking' | 'checkin' | 'airport';
  attachRate: number; // Percentage of passengers purchasing
  revenuePerPassenger: number; // Average revenue
  conversionRate: number; // Offer → Purchase
  averageBasketSize: number; // Products per transaction
  topProducts: ProductPerformance[];
}
```

## EMD Generation

### Electronic Miscellaneous Document (EMD)

EMDs are electronic tickets for ancillary services, providing a standardized record of purchase and entitlement.

#### EMD Structure

```
Format: [Airline Prefix][Sequential Number][Check Digit]
Example: 125-1234567890-3

Components:
- Airline Prefix: 125 (3 digits, configurable)
- Sequential Number: 1234567890 (10 digits)
- Check Digit: 3 (Luhn algorithm)
- Total Length: 13 digits
```

#### EMD Generation Algorithm

```typescript
function generateEMD(airlinePrefix: string = '125'): string {
  // Generate sequential number
  const sequentialNumber = getNextSequentialNumber(); // From database

  // Combine prefix and sequential
  const partialEMD = airlinePrefix + sequentialNumber.toString().padStart(10, '0');

  // Calculate Luhn check digit
  const checkDigit = calculateLuhnCheckDigit(partialEMD);

  // Format EMD
  const emdNumber = `${airlinePrefix}-${sequentialNumber}-${checkDigit}`;

  return emdNumber;
}
```

#### EMD Metadata

```typescript
interface EMD {
  emdNumber: string; // 125-1234567890-3
  pnr: string; // Associated booking
  passengerId: string;
  productType: AncillaryType;
  productCode: string; // e.g., "SEAT-EXTRA", "BAG-HEAVY"
  description: string; // Human-readable description
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  issueDate: Date;
  validFrom: Date;
  validUntil: Date; // Issue date + 365 days
  flightSegments: string[]; // Associated flight numbers
  status: 'issued' | 'used' | 'refunded' | 'expired';
  channel: string; // Where it was purchased
  agentId?: string; // If sold by agent
}
```

#### EMD Lifecycle

```
Issue → Valid → Use/Consume → Archive
         ↓
       Refund → Void
         ↓
      Expire → Archive
```

**Validity**: 365 days from issue date

**Service Delivery Tracking**:
- Baggage: Tracked at check-in
- Seat: Assigned at boarding pass issuance
- Meal: Confirmed at galley loading
- Lounge: Scanned at lounge entrance
- WiFi: Activated on device
- Insurance: Policy number generated

## Revenue Analytics

### Key Metrics

#### 1. Attach Rate
Percentage of passengers purchasing at least one ancillary product.

```
Attach Rate = (Passengers with Ancillary Purchase / Total Passengers) × 100%

Target: 65%
Current Industry Average: 45-55%
```

**Tracking by**:
- Route
- Booking class
- Channel
- Passenger segment
- Time period

#### 2. Revenue Per Passenger (RPP)

```
RPP = Total Ancillary Revenue / Total Passengers

Target: $0.375 per passenger
For 10M passengers: $3.75M annual revenue
```

#### 3. Product Performance

| Product | Attach Rate | Avg Price | Revenue Contribution |
|---------|-------------|-----------|---------------------|
| Baggage | 45% | $42 | 35% |
| Seat Selection | 30% | $35 | 22% |
| Meals | 15% | $18 | 8% |
| Lounge | 8% | $55 | 10% |
| Priority Services | 12% | $15 | 5% |
| WiFi | 25% | $16 | 12% |
| Insurance | 10% | $35 | 8% |

#### 4. Conversion Funnel

```
Ancillary Page Views: 10,000
↓ (70% proceed)
Ancillary Offers Shown: 7,000
↓ (40% add to cart)
Items Added to Cart: 2,800
↓ (85% complete purchase)
Completed Purchases: 2,380

Overall Conversion: 23.8%
```

### A/B Testing Framework

The platform includes built-in A/B testing capabilities:

```typescript
interface ABTest {
  testId: string;
  name: string;
  hypothesis: string; // What we're testing
  variants: ABVariant[]; // Different versions
  sampleSize: number; // Percentage of traffic (e.g., 0.1 = 10%)
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'running' | 'completed' | 'paused';
  metrics: ABMetrics;
}

interface ABVariant {
  id: string;
  name: string; // e.g., "Control", "Variant A", "Variant B"
  description: string;
  trafficAllocation: number; // Percentage (must sum to 100)
  config: any; // Variant-specific configuration
}

// Example test: Bundle pricing
{
  testId: "bundle-discount-test-001",
  name: "Standard Bundle Discount",
  hypothesis: "Increasing discount from 15% to 20% will increase bundle attach rate",
  variants: [
    {
      id: "control",
      name: "Control (15% discount)",
      trafficAllocation: 50,
      config: { discount: 0.15, price: 115 }
    },
    {
      id: "variant-a",
      name: "Variant A (20% discount)",
      trafficAllocation: 50,
      config: { discount: 0.20, price: 105 }
    }
  ],
  sampleSize: 0.1, // 10% of total traffic
  metrics: {
    primaryMetric: "bundle_attach_rate",
    secondaryMetrics: ["revenue_per_passenger", "conversion_rate"]
  }
}
```

### Revenue Dashboards

**Executive Dashboard**:
- Daily/Weekly/Monthly revenue trends
- Attach rate by channel
- RPP vs target
- Top performing products
- Revenue forecast vs actuals

**Product Dashboard**:
- Individual product performance
- Pricing effectiveness
- Inventory utilization (seats, lounge capacity)
- Seasonal trends

**Channel Dashboard**:
- Conversion rates by channel
- Average basket size
- Time-to-purchase analysis
- Cart abandonment rates

## API Reference

### Product Catalog

#### Get Available Products
```http
GET /api/v1/products/available
```

**Query Parameters**:
- `origin` (required): Departure airport code
- `destination` (required): Arrival airport code
- `flightNumber` (required): Flight number
- `departureDate` (required): ISO 8601 date
- `bookingClass` (required): Booking class code
- `passengerType` (optional): ADT, CHD, INF

**Response**:
```json
{
  "products": [
    {
      "productId": "BAG-STD-001",
      "category": "baggage",
      "name": "Standard Checked Bag",
      "description": "23kg checked baggage",
      "basePrice": 35.00,
      "dynamicPrice": 39.50,
      "currency": "USD",
      "available": true,
      "inventory": 50,
      "restrictions": ["max_5_per_passenger"],
      "features": ["23kg", "standard_size"]
    }
  ],
  "bundles": [
    {
      "bundleId": "BUNDLE-STD",
      "name": "Standard Bundle",
      "products": ["BAG-HVY-001", "SEAT-EXTRA-001", "PRIORITY-BOARD"],
      "regularPrice": 140.00,
      "bundlePrice": 115.00,
      "savings": 25.00,
      "savingsPercentage": 17.8
    }
  ],
  "recommendations": [
    {
      "type": "bundle",
      "id": "BUNDLE-STD",
      "relevanceScore": 85,
      "reason": "Popular with passengers on this route"
    }
  ]
}
```

#### Get Product Details
```http
GET /api/v1/products/:productId
```

**Response**:
```json
{
  "productId": "SEAT-EXTRA-001",
  "category": "seat",
  "name": "Extra Legroom Seat",
  "description": "Seats with 34-36 inch pitch for more comfort",
  "basePrice": 50.00,
  "dynamicPricing": {
    "enabled": true,
    "currentPrice": 66.60,
    "factors": {
      "timeToDepart": 1.2,
      "demand": 1.3,
      "channel": 0.95,
      "loyalty": 0.90
    }
  },
  "availability": {
    "total": 24,
    "available": 12,
    "rows": ["12", "13", "14"]
  },
  "rules": {
    "cutoffHours": 2,
    "maxPerPassenger": 1,
    "restrictions": []
  }
}
```

### Purchase Flow

#### Add to Cart
```http
POST /api/v1/cart/add
```

**Request**:
```json
{
  "pnr": "ABC123",
  "passengerId": "PAX-001",
  "items": [
    {
      "productId": "BAG-STD-001",
      "quantity": 1,
      "flightSegment": "UA123"
    },
    {
      "productId": "SEAT-EXTRA-001",
      "quantity": 1,
      "seatNumber": "12A",
      "flightSegment": "UA123"
    }
  ]
}
```

**Response**:
```json
{
  "cartId": "CART-789",
  "items": [
    {
      "productId": "BAG-STD-001",
      "name": "Standard Checked Bag",
      "quantity": 1,
      "unitPrice": 39.50,
      "totalPrice": 39.50
    }
  ],
  "subtotal": 106.10,
  "taxes": 8.49,
  "total": 114.59,
  "currency": "USD",
  "expiresAt": "2025-11-18T15:30:00Z"
}
```

#### Purchase Ancillaries
```http
POST /api/v1/purchases
```

**Request**:
```json
{
  "pnr": "ABC123",
  "cartId": "CART-789",
  "payment": {
    "method": "credit_card",
    "token": "tok_visa_4242"
  }
}
```

**Response**:
```json
{
  "purchaseId": "PUR-456",
  "status": "confirmed",
  "emds": [
    {
      "emdNumber": "125-1234567890-3",
      "productId": "BAG-STD-001",
      "passengerName": "John Doe",
      "validUntil": "2026-11-18"
    }
  ],
  "total": 114.59,
  "currency": "USD",
  "confirmation": "ANC-789456"
}
```

### Revenue Analytics

#### Get Revenue Metrics
```http
GET /api/v1/analytics/revenue
```

**Query Parameters**:
- `startDate` (required): ISO 8601 date
- `endDate` (required): ISO 8601 date
- `groupBy` (optional): day, week, month, product, channel
- `route` (optional): Filter by route

**Response**:
```json
{
  "period": {
    "start": "2025-11-01",
    "end": "2025-11-18"
  },
  "metrics": {
    "totalRevenue": 456789.50,
    "totalPassengers": 125000,
    "revenuePerPassenger": 3.65,
    "attachRate": 0.67,
    "averageBasketSize": 98.50
  },
  "byProduct": [
    {
      "category": "baggage",
      "revenue": 159876.50,
      "attachRate": 0.45,
      "contribution": 0.35
    }
  ],
  "byChannel": [
    {
      "channel": "booking",
      "revenue": 285432.00,
      "attachRate": 0.42,
      "conversionRate": 0.38
    }
  ]
}
```

## Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Product Search Response | < 200ms | < 500ms |
| Price Calculation | < 150ms | < 300ms |
| Purchase Transaction | < 2000ms | < 3000ms |
| Cache Hit Rate | > 85% | > 75% |
| Concurrent Requests | 200 | 150 |
| Availability | 99.9% | 99.5% |
| Revenue Target | $3.75M/year | $3.0M/year |
| Attach Rate | 65% | 55% |

## Configuration

### Environment Variables

See `.env.example` for complete configuration. Key sections:

#### Server Configuration
```env
PORT=3005
SERVICE_NAME=ancillary-service
NODE_ENV=production
```

#### Database & Caching
```env
DATABASE_URL=postgresql://user:password@localhost:5432/airline_ops
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=4
CACHE_ENABLED=true
PRODUCT_CACHE_TTL=3600
PRICE_CACHE_TTL=300
```

#### Dynamic Pricing
```env
ENABLE_DYNAMIC_PRICING=true
TIME_TO_DEPARTURE_MULTIPLIER_EARLY=0.8
TIME_TO_DEPARTURE_MULTIPLIER_LATE=1.5
DEMAND_MULTIPLIER_LOW=0.9
DEMAND_MULTIPLIER_HIGH=1.3
MAX_DYNAMIC_INCREASE=2.0
```

#### Bundling
```env
ENABLE_BUNDLING=true
BUNDLE_DISCOUNT_STANDARD=15.00
BUNDLE_DISCOUNT_MAX=25.00
BUNDLE_MIN_ITEMS=2
```

#### Revenue Targets
```env
TARGET_ANNUAL_PASSENGERS=10000000
TARGET_ANCILLARY_REVENUE=3750000
TARGET_REVENUE_PER_PASSENGER=0.375
TARGET_ATTACH_RATE=0.65
```

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│                   (Rate Limiting, Auth)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Reservation  │ │   Pricing    │ │ Notification │
│   Service    │ │   Service    │ │   Service    │
└──────┬───────┘ └──────┬───────┘ └──────────────┘
       │                │
       └────────┬───────┘
                │
        ┌───────▼────────┐
        │   Ancillary    │
        │    Service     │
        └────────┬───────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│  Redis  │ │  PGSQL  │ │RabbitMQ │
│ (Cache) │ │  (DB)   │ │ (Events)│
└─────────┘ └─────────┘ └─────────┘
```

### Component Architecture

```
services/ancillary-service/
├── src/
│   ├── config/
│   │   ├── database.ts         # Prisma client
│   │   ├── redis.ts            # Redis client
│   │   └── rabbitmq.ts         # RabbitMQ connection
│   ├── engines/
│   │   ├── pricing.engine.ts   # Dynamic pricing logic
│   │   ├── bundling.engine.ts  # Bundle recommendations
│   │   └── rules.engine.ts     # Business rules evaluation
│   ├── services/
│   │   ├── product.service.ts  # Product catalog management
│   │   ├── pricing.service.ts  # Price calculations
│   │   ├── cart.service.ts     # Shopping cart
│   │   ├── purchase.service.ts # Purchase processing
│   │   ├── emd.service.ts      # EMD generation
│   │   └── analytics.service.ts# Revenue analytics
│   ├── controllers/
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── purchase.controller.ts
│   │   └── analytics.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── routes/
│   │   ├── product.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── purchase.routes.ts
│   │   └── analytics.routes.ts
│   ├── types/
│   │   ├── product.types.ts
│   │   ├── pricing.types.ts
│   │   └── analytics.types.ts
│   └── utils/
│       ├── logger.ts
│       ├── errors.ts
│       └── helpers.ts
```

### Data Flow

#### Purchase Flow
```
1. Customer selects flight (Reservation Service)
2. System fetches available ancillaries (Ancillary Service)
3. Dynamic prices calculated (Pricing Engine)
4. Customer adds items to cart (Cart Service)
5. Customer proceeds to payment (Payment Service)
6. Purchase confirmed, EMDs generated (EMD Service)
7. Events published to RabbitMQ (Revenue tracking)
8. Confirmation sent (Notification Service)
```

## Installation

```bash
# Navigate to service directory
cd services/ancillary-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Build the service
npm run build
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Type checking
npm run typecheck

# Run linter
npm run lint

# Format code
npm run format
```

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage Targets

- **Overall**: 85%+
- **Business Logic**: 90%+
- **Controllers**: 80%+
- **Services**: 90%+

### Key Test Scenarios

**Unit Tests**:
- Dynamic pricing calculations
- Bundle discount calculations
- Business rules validation
- EMD number generation
- Availability checks

**Integration Tests**:
- Complete purchase flow
- Cart management
- Product availability with inventory
- Revenue analytics aggregation
- RabbitMQ event publishing

**Load Tests**:
```bash
# Using Artillery
npm run test:load
```

Target: 200 concurrent requests, < 200ms p95 response time

## Revenue Optimization Strategies

### 1. Personalization
- Segment customers by behavior (business vs leisure)
- Recommend products based on historical purchases
- A/B test different price points by segment
- Personalized email campaigns for post-booking upsell

### 2. Bundling Optimization
- Analyze product purchase correlations
- Create bundles that maximize perceived value
- Test different bundle compositions
- Seasonal bundle adjustments

### 3. Dynamic Pricing Refinement
- Machine learning models for demand prediction
- Competitor price monitoring
- Real-time inventory optimization
- Price elasticity testing

### 4. Channel Optimization
- Optimize conversion rates by channel
- Mobile-first experience for high-converting products
- Reduce friction in checkout flow
- Cart abandonment recovery campaigns

### 5. Product Mix
- Identify underperforming products
- Test new product offerings
- Seasonal product availability (WiFi on long-haul)
- Route-specific products

## Monitoring & Alerts

### Key Metrics to Monitor

**Performance**:
- API response times (p50, p95, p99)
- Cache hit rates
- Database query performance
- External service latency

**Business**:
- Hourly/daily revenue
- Attach rate trends
- Product-specific conversion rates
- Average basket size

**Technical**:
- Error rates by endpoint
- RabbitMQ queue depths
- Redis memory usage
- Database connection pool

### Alert Thresholds

```yaml
alerts:
  - name: Low Attach Rate
    condition: attach_rate < 0.55
    severity: warning

  - name: Critical Attach Rate
    condition: attach_rate < 0.45
    severity: critical

  - name: High Response Time
    condition: p95_response_time > 500ms
    severity: warning

  - name: Revenue Below Target
    condition: daily_revenue < (target_revenue / 365)
    severity: warning

  - name: Service Down
    condition: health_check_failed
    severity: critical
```

## Troubleshooting

### Common Issues

**Issue**: Prices not updating dynamically
- Check ENABLE_DYNAMIC_PRICING in .env
- Verify Redis cache TTLs
- Check pricing engine calculations in logs

**Issue**: Low attach rates
- Review product recommendations algorithm
- Check bundle visibility in UI
- Analyze cart abandonment rates
- Review pricing competitiveness

**Issue**: Slow product search
- Check cache hit rates (target > 85%)
- Verify database indexes
- Review query performance
- Check Redis connection

**Issue**: EMD generation failures
- Verify sequential number service
- Check database constraints
- Review Luhn algorithm implementation

## Support & Contributing

For issues, feature requests, or questions:
- Create an issue in the repository
- Contact the platform team
- Review API documentation
- Check logs for detailed error messages

---

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**Maintained By**: Airline Operations Platform Team
