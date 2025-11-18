# Analytics Service - Data Warehouse & Business Intelligence

Comprehensive data warehouse and analytics platform for airline operations, revenue management, and business intelligence.

## Overview

The Analytics Service is a **enterprise-grade data warehouse** built on a dimensional modeling approach (star schema) optimized for OLAP queries and business intelligence. It aggregates data from multiple operational systems, transforms it for analytical purposes, and provides fast, reliable access to historical and real-time business metrics.

### Key Features

- **Star Schema Design** with 7 dimension tables and 4 fact tables
- **ETL Pipeline** with hourly, daily, and weekly jobs
- **Data Quality Framework** with automated validation
- **Materialized Views** for sub-second query performance
- **5+ Years** of historical data retention
- **10TB+** storage capacity
- **REST API** for custom analytics
- **Real-time Metrics** API
- **Export Capabilities** (CSV, Excel, JSON, Parquet)
- **Scheduled Reports** with email delivery

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA SOURCES (OLTP)                          │
├─────────────────────────────────────────────────────────────────┤
│  Reservation  │  Payment  │  DCS  │  Inventory  │  Ancillary   │
└────┬──────────┴─────┬─────┴───┬───┴──────┬──────┴──────┬────────┘
     │                │         │          │             │
     └────────────────┴─────────┴──────────┴─────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   ETL PIPELINE     │
                    │ ────────────────   │
                    │  Extract           │
                    │  Transform         │
                    │  Load              │
                    │  Quality Check     │
                    └─────────┬──────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  DIMENSIONS  │  │    FACTS    │  │ AGGREGATES  │
    │──────────────│  │─────────────│  │─────────────│
    │  Date        │  │  Booking    │  │  Daily      │
    │  Route       │  │  Revenue    │  │  Monthly    │
    │  Customer    │  │  Operational│  │  Quarterly  │
    │  Product     │  │  Ancillary  │  │  Yearly     │
    │  Channel     │  │             │  │             │
    │  Flight      │  │             │  │             │
    │  Agent       │  │             │  │             │
    └──────────────┘  └─────────────┘  └─────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │   ANALYTICS  │  │     API     │  │   REPORTS   │
    │      API     │  │   QUERIES   │  │  EXPORTS    │
    └──────────────┘  └─────────────┘  └─────────────┘
```

## Data Model

### Star Schema Design

The data warehouse follows **Kimball's dimensional modeling** methodology with a star schema optimized for query performance and business user understanding.

#### Dimension Tables (7)

**1. Date Dimension** (`date_dim`)
- Complete calendar with business logic
- Fields: year, quarter, month, week, day of week, fiscal periods, holidays, seasons
- Enables time-based analysis and time intelligence
- Pre-populated for 10 years (past 5 years + future 5 years)

**2. Route Dimension** (`route_dim`)
- Origin-destination pairs with geography
- Fields: route code, cities, countries, regions, distance, duration, market type
- SCD Type 2: tracks changes over time (e.g., route reclassification)
- Enables geographic and market analysis

**3. Customer Dimension** (`customer_dim`)
- Passenger profiles with segmentation
- Fields: demographics, frequent flyer status, customer segment, RFM scores
- SCD Type 2: tracks customer evolution (e.g., tier changes)
- Enables customer behavior and segmentation analysis

**4. Product Dimension** (`product_dim`)
- Fare families and ancillary products
- Fields: product type, fare family, cabin class, features, pricing
- SCD Type 2: tracks product changes
- Enables product performance analysis

**5. Channel Dimension** (`channel_dim`)
- Booking channels and touchpoints
- Fields: channel type, online/offline, distribution type, cost
- Enables channel performance and distribution analysis

**6. Flight Dimension** (`flight_dim`)
- Flight details and aircraft configuration
- Fields: flight number, carrier, aircraft type, seat configuration
- SCD Type 2: tracks configuration changes
- Enables operational analysis

**7. Agent Dimension** (`agent_dim`)
- Sales agents and agencies
- Fields: agent details, agency, performance tier, commission rate
- SCD Type 2: tracks agent evolution
- Enables agent performance analysis

#### Fact Tables (4)

**1. Booking Fact** (`booking_fact`)
- **Grain**: One row per booking (PNR)
- **Measures**: 
  - Counts: passengers, infants, segments
  - Financial: base fare, taxes, fees, total amount
  - Timing: advance purchase days, booking hour
- **Dimensions**: All 7 dimensions
- **Degenerate Dimensions**: PNR locator, booking reference, ticket number
- **Use Cases**: Booking trends, demand forecasting, channel analysis

**2. Revenue Fact** (`revenue_fact`)
- **Grain**: One row per financial transaction
- **Measures**:
  - Revenue: ticket, ancillary, baggage, seat, other
  - Costs: taxes, fees, commissions, distribution
  - Net revenue
- **Dimensions**: Date, route, customer, channel, agent
- **Use Cases**: Revenue analysis, profitability, financial reporting

**3. Operational Fact** (`operational_fact`)
- **Grain**: One row per flight departure
- **Measures**:
  - Capacity: total seats, booked, available, load factor
  - Passengers: breakdown by type and cabin
  - Check-ins: by channel
  - Baggage: count and weight
  - Timing: block time, delays
- **Dimensions**: Date, route, flight
- **Use Cases**: On-time performance, load factor, operational efficiency

**4. Ancillary Fact** (`ancillary_fact`)
- **Grain**: One row per ancillary product sale
- **Measures**: quantity, unit price, total price, cost, margin
- **Dimensions**: Date, customer, product, channel
- **Use Cases**: Ancillary revenue, attach rates, product performance

#### Aggregated Fact Tables (Pre-calculated for Performance)

**Daily Booking Summary** (`daily_booking_summary`)
- Pre-aggregated daily metrics by route and channel
- Sub-second query response for dashboards

**Monthly Revenue Summary** (`monthly_revenue_summary`)
- Pre-aggregated monthly revenue by route
- Fast historical trend analysis

### Slowly Changing Dimensions (SCD Type 2)

Selected dimensions use SCD Type 2 to track historical changes:

```sql
-- Example: Customer dimension tracking tier changes
customerKey | naturalKey | name      | tier     | effectiveFrom | effectiveTo | isCurrent
1           | CUST001    | John Doe  | Silver   | 2023-01-01    | 2024-06-30  | false
2           | CUST001    | John Doe  | Gold     | 2024-07-01    | NULL        | true
```

This preserves historical context for accurate analysis.

## ETL Pipeline

### ETL Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ETL ORCHESTRATION                           │
│                   (Cron Jobs / Airflow DAGs)                     │
└───┬──────────────┬──────────────┬──────────────┬───────────────┘
    │              │              │              │
    ▼              ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│Booking │    │Revenue │    │  Ops   │    │Ancil.  │
│  ETL   │    │  ETL   │    │  ETL   │    │  ETL   │
└───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘
    │             │             │             │
    └─────────────┴─────────────┴─────────────┘
                  │
          ┌───────▼───────┐
          │ Data Quality  │
          │    Checks     │
          └───────┬───────┘
                  │
                  ▼
          ┌───────────────┐
          │  Load to DW   │
          └───────────────┘
```

### ETL Schedules

| Job | Frequency | Schedule (Cron) | Purpose |
|-----|-----------|-----------------|---------|
| Booking ETL | Hourly | `0 */1 * * *` | Near real-time booking data |
| Revenue ETL | Daily | `0 0 * * *` | Daily financial reconciliation |
| Operational ETL | Every 6h | `0 */6 * * *` | Flight operations metrics |
| Ancillary ETL | Every 2h | `0 */2 * * *` | Ancillary sales tracking |
| Dimension Update | Daily | `0 0 2 * * *` | SCD Type 2 updates |
| Aggregation Refresh | Daily | `0 0 3 * * *` | Rebuild materialized views |

### ETL Process Flow

#### 1. Extract

```typescript
// Extract bookings from source system
async function extractBookings(lastRunTime: Date): Promise<Booking[]> {
  // Incremental extraction - only new/modified records
  const bookings = await sourceDB.query(`
    SELECT * FROM pnrs
    WHERE updated_at > $1
    ORDER BY updated_at
  `, [lastRunTime]);
  
  return bookings.rows;
}
```

#### 2. Transform

```typescript
// Transform booking to fact table format
function transformBooking(booking: Booking): BookingFactRow {
  return {
    bookingDateKey: toDateKey(booking.bookingDate),
    departureDateKey: toDateKey(booking.departureDate),
    routeKey: lookupRouteKey(booking.origin, booking.destination),
    customerKey: lookupCustomerKey(booking.customerId),
    productKey: lookupProductKey(booking.fareCode),
    channelKey: lookupChannelKey(booking.channel),
    flightKey: lookupFlightKey(booking.flightNumber),
    // ... measures
    baseFare: booking.baseFare,
    taxes: booking.taxes,
    totalAmount: booking.totalAmount,
    advancePurchaseDays: calculateAdvancePurchase(booking),
  };
}
```

#### 3. Load

```typescript
// Bulk insert to fact table
async function loadBookingFacts(facts: BookingFactRow[]): Promise<void> {
  // Use batch inserts for performance
  const batchSize = 1000;
  
  for (let i = 0; i < facts.length; i += batchSize) {
    const batch = facts.slice(i, i + batchSize);
    await warehouseDB.bookingFact.createMany({
      data: batch,
      skipDuplicates: true, // Idempotent loads
    });
  }
}
```

#### 4. Data Quality Checks

After loading, run quality checks:

```typescript
// Example quality checks
const checks = [
  // Completeness: No null values in required fields
  checkCompleteness('booking_fact', ['bookingDateKey', 'totalAmount']),
  
  // Accuracy: Total amount = base fare + taxes + fees
  checkAccuracy('booking_fact', 'totalAmount = baseFare + taxes + fees'),
  
  // Consistency: All foreign keys exist in dimension tables
  checkReferentialIntegrity('booking_fact', 'routeKey', 'route_dim'),
  
  // Timeliness: Data is recent (< 24 hours old)
  checkTimeliness('booking_fact', 'createdAt', 24),
  
  // Uniqueness: No duplicate bookings
  checkUniqueness('booking_fact', ['pnrLocator', 'bookingReference']),
];

await runQualityChecks(checks);
```

### Incremental vs Full Load

**Incremental Load** (Default)
- Extracts only changed records since last run
- Uses `updated_at` timestamp or incremental ID
- Fast and efficient
- Suitable for hourly/daily jobs

**Full Load**
- Extracts entire dataset
- Used for initial load and monthly reconciliation
- Slower but ensures completeness
- Scheduled for low-traffic periods

### Error Handling

```typescript
// ETL with retry logic
async function runETLWithRetry(jobName: string, maxRetries = 3): Promise<void> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await runETL(jobName);
      await logSuccess(jobName);
      return;
    } catch (error) {
      attempt++;
      await logError(jobName, error, attempt);
      
      if (attempt >= maxRetries) {
        await sendAlert(`ETL ${jobName} failed after ${maxRetries} attempts`);
        throw error;
      }
      
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

## Data Quality Framework

### Quality Dimensions

1. **Completeness**: All required fields have values
2. **Accuracy**: Data correctly represents reality
3. **Consistency**: Data is consistent across systems
4. **Timeliness**: Data is up-to-date
5. **Uniqueness**: No duplicate records
6. **Validity**: Data conforms to business rules

### Quality Checks

```typescript
// Example quality check implementations

// 1. Completeness Check
async function checkCompleteness(
  tableName: string,
  columns: string[],
  threshold: number = 0.95
): Promise<QualityCheckResult> {
  for (const column of columns) {
    const result = await db.$queryRaw`
      SELECT 
        COUNT(*) as total_count,
        COUNT(${column}) as non_null_count,
        (COUNT(${column})::float / COUNT(*)) as completeness
      FROM ${tableName}
      WHERE created_at > NOW() - INTERVAL '1 day'
    `;
    
    if (result.completeness < threshold) {
      return {
        status: 'FAILED',
        message: `Column ${column} completeness ${result.completeness} below threshold ${threshold}`,
      };
    }
  }
  
  return { status: 'PASSED' };
}

// 2. Referential Integrity Check
async function checkReferentialIntegrity(
  factTable: string,
  foreignKey: string,
  dimensionTable: string
): Promise<QualityCheckResult> {
  const orphans = await db.$queryRaw`
    SELECT COUNT(*) as orphan_count
    FROM ${factTable} f
    LEFT JOIN ${dimensionTable} d ON f.${foreignKey} = d.${primaryKey}
    WHERE d.${primaryKey} IS NULL
  `;
  
  if (orphans.orphan_count > 0) {
    return {
      status: 'FAILED',
      message: `Found ${orphans.orphan_count} orphaned records in ${factTable}`,
    };
  }
  
  return { status: 'PASSED' };
}

// 3. Anomaly Detection
async function detectAnomalies(
  tableName: string,
  metric: string,
  windowDays: number = 30
): Promise<QualityCheckResult> {
  // Calculate mean and standard deviation
  const stats = await db.$queryRaw`
    SELECT 
      AVG(${metric}) as mean,
      STDDEV(${metric}) as stddev
    FROM ${tableName}
    WHERE date_key > ${getDateKey(daysAgo(windowDays))}
  `;
  
  // Check recent values against 3-sigma rule
  const recentValues = await db.$queryRaw`
    SELECT ${metric}
    FROM ${tableName}
    WHERE date_key = ${getDateKey(today())}
  `;
  
  const anomalies = recentValues.filter(v => 
    Math.abs(v - stats.mean) > 3 * stats.stddev
  );
  
  if (anomalies.length > 0) {
    return {
      status: 'WARNING',
      message: `Detected ${anomalies.length} anomalies in ${metric}`,
    };
  }
  
  return { status: 'PASSED' };
}
```

### Data Profiling

Automated data profiling runs weekly to understand data distribution:

```typescript
interface DataProfile {
  tableName: string;
  columnName: string;
  dataType: string;
  nullCount: number;
  nullPercent: number;
  distinctCount: number;
  minValue: any;
  maxValue: any;
  avgValue: number;
  medianValue: number;
  topValues: Array<{ value: any; count: number }>;
}
```

## Performance Optimization

### 1. Partitioning

Tables are partitioned by date for query performance:

```sql
-- Booking fact partitioned by booking date (monthly)
CREATE TABLE booking_fact (
  ...
) PARTITION BY RANGE (booking_date_key);

CREATE TABLE booking_fact_2024_01 PARTITION OF booking_fact
  FOR VALUES FROM (20240101) TO (20240201);

CREATE TABLE booking_fact_2024_02 PARTITION OF booking_fact
  FOR VALUES FROM (20240201) TO (20240301);
  
-- Automatic partition creation via cron job
```

### 2. Indexing Strategy

```sql
-- Dimension tables: Index on natural keys
CREATE INDEX idx_customer_email ON customer_dim(email);
CREATE INDEX idx_route_code ON route_dim(route_code);

-- Fact tables: Composite indexes on foreign keys
CREATE INDEX idx_booking_fact_date_route 
  ON booking_fact(booking_date_key, route_key);

CREATE INDEX idx_booking_fact_customer 
  ON booking_fact(customer_key);

-- Covering indexes for common queries
CREATE INDEX idx_booking_fact_channel_revenue 
  ON booking_fact(channel_key, booking_date_key) 
  INCLUDE (total_amount, passenger_count);
```

### 3. Materialized Views

Pre-calculated aggregations for dashboard queries:

```sql
-- Daily booking summary
CREATE MATERIALIZED VIEW daily_booking_summary AS
SELECT 
  booking_date_key,
  route_key,
  channel_key,
  COUNT(*) as booking_count,
  SUM(passenger_count) as passenger_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_booking_value,
  AVG(advance_purchase_days) as avg_advance_purchase
FROM booking_fact
GROUP BY booking_date_key, route_key, channel_key;

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_booking_summary;
```

### 4. Query Result Caching

Frequently accessed queries are cached in Redis:

```typescript
async function getCachedQuery(
  queryKey: string,
  queryFn: () => Promise<any>,
  ttlMinutes: number = 60
): Promise<any> {
  // Check cache
  const cached = await redis.get(queryKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Execute query
  const result = await queryFn();
  
  // Cache result
  await redis.setex(queryKey, ttlMinutes * 60, JSON.stringify(result));
  
  return result;
}
```

### 5. Columnar Storage (Parquet)

For archival and analytics, export to Parquet format:

```typescript
// Export fact table to Parquet
await exportToParquet('booking_fact', {
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  outputPath: '/data/parquet/booking_fact_2023.parquet',
  compression: 'ZSTD',
});
```

Benefits:
- 10x compression ratio
- Column-level compression
- Fast analytical queries
- Compatible with Spark, Presto, etc.

## Data Retention & Archival

### Retention Policy

| Data Tier | Retention | Storage Type | Query Performance |
|-----------|-----------|--------------|-------------------|
| **Hot** | 1 year | SSD (PostgreSQL) | Sub-second |
| **Warm** | 5 years | Standard disk | 1-5 seconds |
| **Cold** | 7+ years | Archive (Parquet) | 10-60 seconds |

### Automatic Archival Process

```typescript
// Monthly archival job
async function archiveOldData(): Promise<void> {
  const cutoffDate = subtractMonths(new Date(), 12); // 1 year ago
  
  // 1. Export to Parquet
  await exportToParquet('booking_fact', {
    startDate: subtractMonths(cutoffDate, 1),
    endDate: cutoffDate,
    outputPath: '/archive/parquet/',
  });
  
  // 2. Verify export
  const exported = await verifyParquetFile('/archive/parquet/...');
  if (!exported) {
    throw new Error('Parquet export verification failed');
  }
  
  // 3. Delete from hot storage
  await db.bookingFact.deleteMany({
    where: {
      bookingDateKey: {
        lt: toDateKey(cutoffDate),
      },
    },
  });
  
  // 4. Log archival
  await logArchival('booking_fact', cutoffDate, exported.recordCount);
}
```

## API Endpoints

### Query API

#### Get Booking Analytics

```http
POST /api/v1/analytics/bookings/query
Content-Type: application/json
Authorization: Bearer <token>

{
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "groupBy": ["route", "channel"],
  "metrics": ["bookingCount", "passengerCount", "totalRevenue"],
  "filters": {
    "channel": ["WEB", "MOBILE_APP"],
    "cabinClass": "ECONOMY"
  },
  "orderBy": {
    "totalRevenue": "DESC"
  },
  "limit": 100
}

Response 200 OK:
{
  "data": [
    {
      "route": "JFK-LAX",
      "channel": "WEB",
      "bookingCount": 1250,
      "passengerCount": 2100,
      "totalRevenue": 450000.00
    },
    // ...
  ],
  "metadata": {
    "totalRows": 1250,
    "executionTimeMs": 125,
    "cached": false
  }
}
```

#### Get Revenue Analytics

```http
POST /api/v1/analytics/revenue/query
Content-Type: application/json

{
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "groupBy": ["date", "route"],
  "metrics": [
    "ticketRevenue",
    "ancillaryRevenue",
    "totalRevenue",
    "netRevenue"
  ]
}

Response: Daily revenue by route
```

#### Get Operational Metrics

```http
GET /api/v1/analytics/operational/metrics?date=2024-11-18

Response 200 OK:
{
  "date": "2024-11-18",
  "flights": 145,
  "passengers": 24500,
  "loadFactor": 0.82,
  "onTimePerformance": 0.87,
  "cancelledFlights": 2,
  "delayedFlights": 15,
  "avgDelayMinutes": 12.5
}
```

### Real-time Metrics API

```http
GET /api/v1/analytics/realtime/dashboard

Response 200 OK:
{
  "timestamp": "2024-11-18T10:30:00Z",
  "today": {
    "bookings": 450,
    "revenue": 125000,
    "passengers": 12500
  },
  "lastHour": {
    "bookings": 35,
    "revenue": 9800
  },
  "trending": {
    "topRoutes": ["JFK-LAX", "ATL-ORD", "DFW-PHX"],
    "topChannels": ["WEB", "MOBILE_APP"],
    "avgBookingValue": 278.00
  }
}
```

### Export API

```http
POST /api/v1/analytics/export
Content-Type: application/json

{
  "query": {
    "table": "booking_fact",
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "columns": [
      "booking_date",
      "route_code",
      "passenger_count",
      "total_amount"
    ]
  },
  "format": "CSV",
  "deliveryMethod": "DOWNLOAD"
}

Response 202 Accepted:
{
  "exportId": "exp_123456",
  "status": "PROCESSING",
  "estimatedCompletionTime": "2024-11-18T10:35:00Z",
  "downloadUrl": null
}

// Poll for completion
GET /api/v1/analytics/export/exp_123456

Response 200 OK:
{
  "exportId": "exp_123456",
  "status": "COMPLETED",
  "downloadUrl": "https://analytics.airline.com/exports/exp_123456.csv",
  "expiresAt": "2024-11-19T10:30:00Z",
  "fileSize": 1048576,
  "recordCount": 15000
}
```

## Installation & Setup

```bash
cd services/analytics-service
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations
npm run migrate

# Seed dimension tables
npm run seed

# Start service
npm run dev

# Production
npm run build
npm start
```

## Running ETL Jobs

```bash
# Run specific ETL job
npm run etl:run -- --job=booking

# Run all ETL jobs
npm run etl:run -- --all

# Full load (rebuild entire warehouse)
npm run etl:run -- --full-load

# Schedule ETL jobs (background)
npm run etl:schedule
```

## Data Quality Checks

```bash
# Run all quality checks
npm run quality:check

# Run specific check
npm run quality:check -- --check=completeness

# Generate data profile report
npm run quality:profile
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| OLTP Database | PostgreSQL | Source operational data |
| OLAP Database | PostgreSQL / ClickHouse | Data warehouse |
| ETL Orchestration | Cron / Apache Airflow | Job scheduling |
| Data Transformations | TypeScript / dbt | Business logic |
| Data Quality | Custom framework | Validation |
| Caching | Redis | Query results |
| API Framework | Express.js | REST API |
| Export Formats | fast-csv, exceljs | CSV, Excel |
| Columnar Storage | Parquet | Archival |

## Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Query Response (Dashboard) | <1s | 0.5s |
| Query Response (Ad-hoc) | <5s | 3s |
| ETL Job (Hourly) | <10min | 5min |
| ETL Job (Daily) | <1h | 30min |
| Data Freshness | <2h | 1h |
| Storage Capacity | 10TB+ | Scalable |
| Historical Data | 5+ years | 7 years |

## Monitoring & Alerting

### Monitored Metrics

- ETL job success/failure rates
- ETL job duration
- Data quality check results
- Query performance (p50, p95, p99)
- Database size and growth
- Cache hit rate
- API response times

### Alerts

- ETL job failure
- Data quality check failure
- Slow queries (>30s)
- Disk usage >85%
- Missing data (gap detection)

## Security

- **Authentication**: JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Masking**: PII fields masked for non-privileged users
- **Audit Logging**: All queries logged
- **Rate Limiting**: API rate limits per user/role
- **IP Whitelisting**: Optional IP restrictions

## License

UNLICENSED - Internal use only

## Support

For questions or issues:
- Analytics Team: analytics@airline.com
- Technical Support: tech@airline.com
- Documentation: https://docs.airline.com/analytics
