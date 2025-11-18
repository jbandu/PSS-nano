# Analytics Dashboard - Comprehensive BI Platform

Enterprise-grade business intelligence dashboard for airline analytics with 70+ standard reports, 20+ interactive dashboards, and self-service analytics capabilities.

## Overview

The Analytics Dashboard is a **comprehensive BI platform** built with Next.js 14 and React that provides airline stakeholders with powerful data visualization, reporting, and analytics capabilities. It connects to the Analytics Service data warehouse and delivers insights across sales, operations, finance, customer behavior, and marketing performance.

### Key Features

✅ **70+ Standard Reports** across 7 categories  
✅ **20+ Interactive Dashboards** with real-time updates  
✅ **Self-Service Analytics** with drag-and-drop report builder  
✅ **Advanced Visualizations** using Recharts  
✅ **Scheduled Reports** with email delivery  
✅ **Ad-Hoc Queries** with SQL builder  
✅ **Mobile Analytics** app (iOS/Android)  
✅ **Predictive Analytics** integration  
✅ **Data Exploration** with interactive catalog  
✅ **Multi-Format Export** (PDF, Excel, CSV, JSON, PowerPoint)  

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS DASHBOARD (Next.js)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  Dashboards   │  │    Reports    │  │  Self-Service │       │
│  │   (20+)       │  │    (70+)      │  │    Builder    │       │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘       │
│          │                  │                  │                 │
│          └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  Visualization  │                           │
│                   │    Library      │                           │
│                   │   (Recharts)    │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
│          ┌─────────────────┼─────────────────┐                 │
│          │                 │                 │                  │
│  ┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐           │
│  │   Exports    │  │  Scheduled  │  │  Ad-Hoc     │           │
│  │ PDF/Excel/CSV│  │   Reports   │  │   Queries   │           │
│  └──────────────┘  └─────────────┘  └─────────────┘           │
│                                                                   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   ANALYTICS     │
                   │    SERVICE      │
                   │   (REST API)    │
                   └─────────────────┘
```

## Standard Reports (70+)

### Sales & Revenue Reports (15)

| Report | Description | Key Metrics |
|--------|-------------|-------------|
| **Daily Booking Summary** | Daily overview of bookings by channel | Bookings, passengers, revenue, avg value |
| **Revenue by Route** | Route-level revenue analysis | Ticket + ancillary revenue, load factor |
| **Channel Performance** | Distribution channel comparison | Bookings, revenue, conversion, cost |
| **Conversion Funnel** | Booking conversion analysis | Search → purchase funnel |
| **Booking Pace** | Actual vs forecast bookings | Variance, trends |
| **Fare Mix Analysis** | Fare family distribution | Mix, revenue, market share |
| **Group Bookings** | Large group booking analysis | Groups, passengers, revenue |
| **Agent Productivity** | Sales agent performance | Bookings, revenue, commission |
| **Advance Purchase** | Booking timing patterns | Distribution by days before departure |
| **Revenue Variance** | Actual vs budget analysis | Variance, % delta |
| **Market Share** | Competitive positioning | Our share vs market |
| **Pricing Elasticity** | Demand response to pricing | Price sensitivity |
| **Corporate Accounts** | B2B account performance | Volume, revenue, discounts |
| **Cancellation Analysis** | Booking cancellations | Reasons, timing, impact |
| **Weekend vs Weekday** | Day-of-week patterns | Booking behavior |

### Operational Reports (15)

| Report | Description | Key Metrics |
|--------|-------------|-------------|
| **On-Time Performance** | Flight punctuality | OTP %, avg delay |
| **Delay Analysis** | Delays by root cause | Delay codes, minutes, flights |
| **Turnaround Time** | Aircraft ground time | Avg, min, max, compliance |
| **Baggage Handling** | Baggage mishandling | Delayed, lost, damaged bags |
| **Check-In Efficiency** | Check-in channel usage | Web, mobile, kiosk, agent % |
| **Boarding Speed** | Gate boarding metrics | Time, pax/min, zone compliance |
| **Load Factor** | Seat utilization | Booked vs total seats |
| **No-Show Analysis** | Passenger no-shows | Rate, revenue impact |
| **Aircraft Utilization** | Aircraft usage | Flight hours, cycles |
| **Crew Productivity** | Crew efficiency | Flight hours, duty hours |
| **Fuel Consumption** | Fuel usage analysis | Consumption, cost, efficiency |
| **Maintenance Downtime** | Aircraft maintenance | Downtime hours, impact |
| **Safety Incidents** | Safety tracking | Incidents, severity, resolution |
| **Weight & Balance** | Load control metrics | CG, violations, compliance |
| **Customer Service** | Service performance | Requests, resolution, satisfaction |

### Ancillary Reports (12)

| Report | Description | Key Metrics |
|--------|-------------|-------------|
| **Ancillary Revenue** | Revenue by product | Bags, seats, meals, etc. |
| **Attach Rate** | Product penetration | Purchase rate by route |
| **Bundle Performance** | Product bundle sales | Bundle vs individual |
| **Seat Selection** | Paid seat revenue | Seats sold, revenue, rate |
| **Baggage Revenue** | Checked bag fees | Bags, weight, revenue |
| **Merchandising** | Campaign effectiveness | Impressions, conversions, ROI |
| **Upsell Conversion** | Upsell offer performance | Offers, acceptance, revenue |
| **Lounge Access** | Lounge sales | Passes sold, utilization |
| **WiFi Usage** | In-flight WiFi | Sales, usage, revenue |
| **Priority Boarding** | Priority boarding sales | Passengers, revenue, attach rate |
| **Insurance Sales** | Travel insurance | Policies, revenue, claims |
| **Ancillary Channel Mix** | Purchase timing/channel | When and where purchased |

### Financial Reports (13)

| Report | Description | Key Metrics |
|--------|-------------|-------------|
| **Revenue Recognition** | Earned vs unearned | Revenue timing |
| **Payment Reconciliation** | Gateway settlement | Transactions, fees, net |
| **Refund Summary** | Refund processing | Count, amount, fees |
| **Commission Tracking** | Agent commissions | Revenue, rate, amount |
| **BSP/ARC Settlement** | Billing settlement | Gross, commission, net |
| **Receivables Aging** | Outstanding payments | Current, 30/60/90 days |
| **Cost Per Seat** | CASK analysis | Costs, ASK, profitability |
| **Yield Management** | Revenue per RPK | Yield, load factor |
| **Tax Collection** | Tax tracking | Collected, remitted, pending |
| **Currency Exposure** | Forex exposure | Revenue, hedging, exposure |
| **Proration Report** | Interline revenue | Our share, partner share |
| **Cash Flow Forecast** | Short-term projection | Inflow, outflow, net |
| **Route Profitability** | P&L by route | Revenue, costs, profit |

### Customer Reports (8)

| Report | Description | Key Metrics |
|--------|-------------|-------------|
| **Customer Lifetime Value** | CLV by segment | Lifetime value, bookings |
| **RFM Segmentation** | Customer segments | Recency, frequency, monetary |
| **Frequent Flyer** | Loyalty program | Members, activity, tiers |
| **Churn Analysis** | At-risk customers | Churn rate, revenue at risk |
| **Customer Satisfaction** | NPS and CSAT | Scores, promoters, detractors |
| **Customer Complaints** | Complaint tracking | Category, resolution |
| **Booking Patterns** | Behavioral patterns | Preferences, habits |
| **Acquisition Cost** | CAC by channel | New customers, cost, LTV/CAC |

### Marketing Reports (5)

| Report | Description | Key Metrics |
|--------|-------------|-------------|
| **Campaign Performance** | Marketing ROI | Spend, conversions, ROI |
| **Email Marketing** | Email campaigns | Open rate, click rate, revenue |
| **Social Media** | Social engagement | Impressions, engagements |
| **SEO Performance** | Organic search | Keywords, clicks, conversions |
| **Attribution Analysis** | Multi-touch attribution | Touchpoint contribution |

### Executive Reports (7)

| Report | Description | Key Metrics |
|--------|-------------|-------------|
| **Executive Dashboard** | High-level KPIs | Revenue, profit, OTP, satisfaction |
| **Monthly Performance** | Monthly business review | All key metrics |
| **Quarterly Business Review** | QBR report | Strategic performance |
| **Board Report** | Board of Directors | Financial highlights |
| **Network Performance** | Route network overview | Regional performance |
| **Competitive Analysis** | Market positioning | Vs competitors |
| **Risk Dashboard** | Enterprise risk | Open risks, severity |

## Interactive Dashboards (20+)

### 1. Executive Summary Dashboard
**Purpose**: C-suite overview of business performance

**KPI Cards**:
- Total Revenue (MTD vs prior month)
- Net Profit Margin
- Load Factor (system-wide)
- On-Time Performance
- Customer Satisfaction (NPS)
- Market Share

**Charts**:
- Revenue trend (12-month)
- Passenger growth
- Route profitability heatmap
- YoY comparison

**Refresh**: 5 minutes

---

### 2. Revenue Manager Dashboard
**Purpose**: Pricing and yield optimization

**Widgets**:
- Booking pace by departure date
- Fare mix distribution
- Yield by route
- Advance purchase curve
- Competitive pricing index
- Overbooking recommendations

**Refresh**: 15 minutes

---

### 3. Operations Manager Dashboard
**Purpose**: Flight operations monitoring

**Widgets**:
- Real-time flight status
- On-time performance (daily)
- Delay breakdown by cause
- Load factor by flight
- Turnaround time compliance
- Crew utilization

**Refresh**: 1 minute

---

### 4. Marketing Dashboard
**Purpose**: Campaign performance and ROI

**Widgets**:
- Campaign ROI summary
- Channel attribution
- Email campaign metrics
- Social media engagement
- SEO performance
- Conversion funnel

**Refresh**: 1 hour

---

### 5. Customer Service Dashboard
**Purpose**: Customer satisfaction and service levels

**Widgets**:
- NPS score trend
- Complaint volume by category
- Resolution time
- Service level compliance
- Customer feedback highlights
- Agent performance

**Refresh**: 30 minutes

---

### 6. Finance Dashboard
**Purpose**: Financial performance tracking

**Widgets**:
- Revenue vs budget
- Cash flow
- Receivables aging
- Payment reconciliation status
- Profit margin by route
- Cost breakdown

**Refresh**: 1 hour

---

### 7. Real-Time Operational Dashboard
**Purpose**: Live operations monitoring

**Widgets**:
- Active flights map
- Check-in queue status
- Boarding progress by gate
- Baggage handling status
- Station alerts
- Weather impacts

**Refresh**: 30 seconds

---

### Additional Dashboards (13 more):

8. **Ancillary Revenue Dashboard** - Product performance and attach rates
9. **Network Planning Dashboard** - Route analysis and capacity planning
10. **Sales Performance Dashboard** - Agent and channel performance
11. **Inventory Dashboard** - Seat availability and booking patterns
12. **Load Control Dashboard** - Weight, balance, and optimization
13. **Customer Analytics Dashboard** - Segmentation and behavior
14. **Loyalty Program Dashboard** - Frequent flyer metrics
15. **Competitive Intelligence Dashboard** - Market positioning
16. **Fleet Utilization Dashboard** - Aircraft usage and efficiency
17. **Fuel Management Dashboard** - Consumption and costs
18. **Regulatory Compliance Dashboard** - Safety and compliance metrics
19. **Crew Management Dashboard** - Staffing and productivity
20. **Station Performance Dashboard** - Airport-level operations

## Self-Service Analytics

### Drag-and-Drop Report Builder

**Features**:
- Visual query builder (no SQL required)
- Dimension/measure selection from catalog
- Filter builder with operators (=, >, <, BETWEEN, IN)
- Chart type selection (bar, line, pie, area, scatter, heatmap)
- Pivot table functionality
- Save and share custom reports
- Schedule custom reports

**Example Workflow**:
```
1. Select data source → Booking Fact
2. Add dimensions → Route, Date, Channel
3. Add measures → Booking Count, Total Revenue
4. Add filters → Date Range: Last 30 Days, Channel: WEB
5. Choose visualization → Bar Chart
6. Customize → Colors, labels, axes
7. Save report → "Web Bookings by Route - Last 30 Days"
8. Schedule → Daily at 8 AM via email
```

### SQL Query Builder

For advanced users:

**Features**:
- Monaco editor with syntax highlighting
- Auto-complete for tables and columns
- Query templates library
- Query validation
- Execution plan analysis
- Result preview (first 100 rows)
- Export full results
- Save queries
- Share with team
- Query history (last 100 queries)

**Example Query**:
```sql
SELECT 
  r.route_code,
  d.month_name,
  SUM(b.total_amount) as revenue,
  COUNT(b.booking_key) as bookings,
  AVG(b.total_amount) as avg_booking_value
FROM booking_fact b
JOIN route_dim r ON b.route_key = r.route_key
JOIN date_dim d ON b.booking_date_key = d.date_key
WHERE d.year = 2024
  AND d.month = 11
GROUP BY r.route_code, d.month_name
ORDER BY revenue DESC
LIMIT 20;
```

## Visualization Library

### Chart Types (Recharts)

**1. Line Charts**
- Time series trends
- Multi-line comparisons
- Area charts with fill
- Stacked area charts

**2. Bar Charts**
- Vertical and horizontal
- Grouped bars
- Stacked bars
- 100% stacked bars

**3. Pie Charts**
- Standard pie
- Donut charts
- Semi-circle gauges
- Nested pies

**4. Scatter Plots**
- Correlation analysis
- Bubble charts (3 variables)
- Quadrant analysis

**5. Heatmaps**
- Route performance grids
- Day-of-week patterns
- Hour-of-day analysis

**6. Gauges**
- KPI indicators
- Progress meters
- Threshold alerts

**7. Tables**
- Sortable columns
- Filterable rows
- Pagination
- Row grouping
- Cell formatting
- Export to Excel/CSV

### Interactive Features

- **Drill-down**: Click chart to see details
- **Tooltips**: Hover for values
- **Zoom**: Date range zoom on time series
- **Pan**: Navigate large datasets
- **Legend toggle**: Show/hide series
- **Export**: Download chart as PNG

## Scheduled Reports

### Email Delivery

**Configuration**:
```typescript
{
  reportId: "daily-booking-summary",
  schedule: "0 8 * * 1-5", // Weekdays at 8 AM
  recipients: ["revenue@airline.com", "manager@airline.com"],
  format: "PDF",
  filters: {
    dateRange: "yesterday",
    channels: ["WEB", "MOBILE"]
  },
  conditionalDelivery: {
    enabled: true,
    condition: "bookings > 100", // Only send if threshold met
  }
}
```

**Supported Schedules**:
- Daily (specific time)
- Weekdays only
- Weekly (specific day and time)
- Monthly (first/last day)
- Custom cron expression

**Delivery Methods**:
- Email (single or distribution list)
- Slack webhook
- Teams webhook
- SFTP upload
- S3 bucket

### Report Formats

**PDF Reports**:
- Print-ready formatting
- Company branding (logo, colors)
- Table of contents
- Page numbers
- Charts embedded
- Executive summary

**Excel Reports**:
- Multiple sheets
- Formatted tables
- Embedded charts
- Pivot tables
- Formulas preserved
- Cell styling

**PowerPoint Reports**:
- Dashboard slides
- One chart per slide
- Customizable templates
- Speaker notes
- Branding

## Export Capabilities

| Format | Use Case | Features |
|--------|----------|----------|
| **PDF** | Print, sharing | Charts, tables, formatting |
| **Excel** | Analysis, pivot tables | Multi-sheet, formulas, charts |
| **CSV** | Raw data | Simple, universal |
| **JSON** | API integration | Structured, programmatic |
| **PowerPoint** | Presentations | Dashboard slides |

### Export Features

- **Bulk export**: Export multiple reports at once
- **Scheduled export**: Automated daily/weekly exports
- **Compression**: ZIP for large exports
- **Encryption**: Password-protected files (optional)
- **Cloud upload**: Direct to S3, Google Drive, Dropbox

## Mobile Analytics App

### iOS and Android Native Apps

**Features**:
- Push notifications for KPI alerts
- Offline dashboard viewing (cached)
- Touch-optimized charts
- Quick filters (date, route, channel)
- Executive summary view
- Drill-down navigation
- Dark mode support
- Biometric authentication

**Key Screens**:
1. **Home**: KPI cards (revenue, load factor, OTP)
2. **Dashboards**: Swipeable dashboard cards
3. **Reports**: List of favorite reports
4. **Alerts**: Threshold-based alerts
5. **Settings**: Preferences, notifications

**Performance**:
- App launch: <2 seconds
- Dashboard load: <3 seconds
- Chart rendering: <1 second
- Offline mode: Last 7 days cached

## Predictive Analytics

### Machine Learning Models

**1. Demand Forecasting**
- Algorithm: ARIMA + Prophet
- Input: Historical bookings, seasonality, events
- Output: 90-day demand forecast by route
- Accuracy: 85-90% MAPE

**2. Revenue Prediction**
- Algorithm: Gradient Boosting
- Input: Booking pace, pricing, competition
- Output: Flight-level revenue forecast
- Accuracy: 80-85%

**3. Churn Risk Scoring**
- Algorithm: Random Forest
- Input: RFM, engagement, complaints
- Output: Churn probability (0-1)
- Accuracy: 75-80% AUC

**4. Next Best Offer**
- Algorithm: Collaborative Filtering
- Input: Purchase history, preferences
- Output: Top 3 recommended products
- Conversion lift: 15-20%

**5. Price Elasticity**
- Algorithm: Ridge Regression
- Input: Price changes, demand response
- Output: Elasticity coefficient
- Use: Dynamic pricing

**6. Capacity Optimization**
- Algorithm: Linear Programming
- Input: Demand forecast, costs, constraints
- Output: Optimal seat allocation
- Improvement: 5-10% revenue

### Model Deployment

- **Batch predictions**: Daily at 2 AM
- **Real-time predictions**: API endpoint
- **A/B testing**: Control vs model group
- **Model monitoring**: Accuracy tracking, drift detection
- **Re-training**: Monthly with new data

## Data Exploration

### Interactive Data Catalog

**Features**:
- Browse tables and columns
- Data dictionary with descriptions
- Sample data preview
- Column-level statistics (min, max, avg, null %)
- Data quality metrics
- Usage analytics (most queried)

**Example**:
```
Table: booking_fact
Description: Core booking transactions
Rows: 5,234,567
Columns: 25

Columns:
- booking_key (UUID, Primary Key): Unique booking identifier
- booking_date_key (Integer, Foreign Key): Link to date_dim
- route_key (Integer, Foreign Key): Link to route_dim
- total_amount (Decimal): Total booking value in USD
  * Min: $50.00
  * Max: $15,000.00
  * Avg: $278.50
  * Null: 0%
- passenger_count (Integer): Number of passengers
  * Min: 1
  * Max: 50
  * Avg: 1.8
  * Null: 0%
```

### Data Lineage

Visual graph showing:
- Source systems → ETL jobs → DW tables → Reports
- Data transformations applied
- Last update timestamp
- Data freshness SLA

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Dashboard refresh | <30s | ✅ 15s |
| Standard report generation | <5s | ✅ 3s |
| Custom report (simple) | <10s | ✅ 7s |
| Custom report (complex) | <30s | ✅ 20s |
| PDF export | <10s | ✅ 8s |
| Excel export (10K rows) | <15s | ✅ 12s |
| Chart rendering | <1s | ✅ 0.5s |
| Mobile app launch | <2s | ✅ 1.5s |

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 14.1.0 |
| UI Library | React | 18.2.0 |
| State Management | Zustand | 4.4.7 |
| Data Fetching | React Query | 5.17.19 |
| Charts | Recharts | 2.10.4 |
| Tables | TanStack Table | 8.11.6 |
| Forms | React Hook Form | 7.49.3 |
| Styling | Tailwind CSS | 3.4.1 |
| PDF Generation | jsPDF | 2.5.1 |
| Excel Export | ExcelJS | 4.4.0 |
| Date Handling | date-fns | 3.0.6 |
| HTTP Client | Axios | 1.6.5 |

## Installation & Setup

```bash
cd apps/analytics-dashboard
npm install

# Configure environment
cp .env.example .env
# Edit .env with Analytics Service API URL

# Development
npm run dev
# Access at http://localhost:3016

# Production build
npm run build
npm start
```

## Environment Variables

```bash
# Analytics Service API
NEXT_PUBLIC_ANALYTICS_API_URL=http://localhost:3015/api/v1

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true
NEXTAUTH_URL=http://localhost:3016
NEXTAUTH_SECRET=your-secret-key

# Features
NEXT_PUBLIC_ENABLE_SELF_SERVICE=true
NEXT_PUBLIC_ENABLE_SCHEDULED_REPORTS=true
NEXT_PUBLIC_ENABLE_PREDICTIVE=true
NEXT_PUBLIC_ENABLE_MOBILE=true

# Export
NEXT_PUBLIC_MAX_EXPORT_ROWS=100000
NEXT_PUBLIC_EXPORT_STORAGE=s3

# Performance
NEXT_PUBLIC_CACHE_TTL_MINUTES=15
NEXT_PUBLIC_QUERY_TIMEOUT_SECONDS=60
```

## Security

- **Authentication**: NextAuth.js with JWT
- **Authorization**: Role-based access control (RBAC)
  - Analyst: View standard reports
  - Manager: View + create custom reports
  - Executive: All reports + predictive analytics
  - Admin: Full access + system configuration
- **Data Masking**: PII fields masked based on role
- **Audit Logging**: All queries and exports logged
- **Rate Limiting**: API rate limits enforced
- **Session Management**: 8-hour timeout, secure cookies

## User Roles & Permissions

| Role | Standard Reports | Custom Reports | Scheduled Reports | Exports | Admin |
|------|------------------|----------------|-------------------|---------|-------|
| Analyst | ✅ | ✅ Limited | ❌ | ✅ CSV | ❌ |
| Manager | ✅ | ✅ Full | ✅ | ✅ All | ❌ |
| Executive | ✅ | ✅ Full | ✅ | ✅ All | ❌ |
| Admin | ✅ | ✅ Full | ✅ | ✅ All | ✅ |

## Best Practices

### Report Design
- Keep reports focused (single purpose)
- Use appropriate chart types
- Include context (comparisons, benchmarks)
- Add filters for interactivity
- Provide export options

### Performance
- Use materialized views for common queries
- Limit result sets with pagination
- Cache frequently accessed reports
- Optimize SQL queries
- Use indexes effectively

### User Experience
- Mobile-responsive design
- Clear navigation
- Helpful tooltips
- Error messages with guidance
- Loading states

## License

UNLICENSED - Internal use only

## Support

- Analytics Team: analytics@airline.com
- Technical Support: tech@airline.com
- Documentation: https://docs.airline.com/analytics-dashboard
