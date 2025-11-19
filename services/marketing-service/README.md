# Marketing Service - Customer Segmentation & Campaign Orchestration

Comprehensive marketing automation platform with advanced customer segmentation, multi-channel campaign orchestration, personalization engine, and ML-driven insights.

## Overview

The Marketing Service is an **enterprise-grade marketing automation platform** that enables data-driven customer engagement through sophisticated segmentation, targeted campaigns, and personalized experiences. It integrates with multiple channels (email, SMS, push, social media) and uses machine learning to optimize campaign performance and drive incremental revenue.

### Key Features

✅ **Advanced Customer Segmentation** (50+ predefined segments)  
✅ **RFM Analysis** (Recency, Frequency, Monetary value)  
✅ **Campaign Creation & Orchestration**  
✅ **Multi-Channel Delivery** (Email, SMS, Push, In-App, Social)  
✅ **Drag-and-Drop Email Designer**  
✅ **Campaign Automation** (Triggered, Drip, Lifecycle)  
✅ **Offer Management** (Promo codes, restrictions, tracking)  
✅ **A/B Testing Framework** (Up to 5 variants)  
✅ **Customer Journey Mapping**  
✅ **Personalization Engine** (ML-powered recommendations)  
✅ **GDPR Compliance** (Consent management, DNC lists)  
✅ **Real-Time Analytics** (Campaign performance, ROI)  

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKETING SERVICE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Segmentation │  │  Campaigns   │  │    Offers    │          │
│  │              │  │              │  │              │          │
│  │ • RFM        │  │ • Creation   │  │ • Promo Codes│          │
│  │ • Behavioral │  │ • Scheduling │  │ • Redemption │          │
│  │ • Predictive │  │ • A/B Test   │  │ • Tracking   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                          │                                       │
│                 ┌────────▼────────┐                             │
│                 │  Automation     │                             │
│                 │    Engine       │                             │
│                 └────────┬────────┘                             │
│                          │                                       │
│         ┌────────────────┼────────────────┐                    │
│         │                │                │                     │
│  ┌──────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐             │
│  │Personalizati│  │  Channels  │  │ Compliance │             │
│  │on Engine    │  │            │  │            │             │
│  │             │  │ • Email    │  │ • Consent  │             │
│  │ • ML Model  │  │ • SMS      │  │ • DNC      │             │
│  │ • Next-Best │  │ • Push     │  │ • GDPR     │             │
│  │ • Dynamic   │  │ • Social   │  │ • Audit    │             │
│  └─────────────┘  └────────────┘  └────────────┘             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
         ┌───────▼──────┐      ┌──────▼──────┐
         │  External    │      │  Analytics  │
         │  Services    │      │   Service   │
         │              │      │             │
         │ • Sendgrid   │      │ • Campaign  │
         │ • Twilio     │      │   Metrics   │
         │ • Firebase   │      │ • ROI       │
         │ • Meta API   │      │ • Reports   │
         └──────────────┘      └─────────────┘
```

## Customer Segmentation

### 1. Demographic Segmentation

Segment customers by demographic attributes:

**Available Attributes**:
- Age groups
- Gender
- Location (country, city, region)
- Language preference
- Nationality

**Example Segments**:
- "Millennials (25-40)" - Age-based targeting
- "European Travelers" - Region-based targeting
- "Spanish Speakers" - Language-based targeting

### 2. Behavioral Segmentation

Segment based on booking behavior and preferences:

**Behavioral Attributes**:
- Booking frequency (1x, 2-5x, 6-10x, 10+ per year)
- Preferred routes (domestic, international, specific routes)
- Preferred cabin class (Economy, Business, First)
- Advance purchase window (last-minute, 1-7 days, 8-30 days, 30+ days)
- Booking channel preference (web, mobile, agent)
- Seasonal patterns (summer travelers, winter travelers)
- Group vs individual travel

**Example Segments**:
- "Frequent Business Travelers" - 10+ bookings/year, Business class, weekday departures
- "Leisure Travelers" - 1-2 bookings/year, Economy class, weekend departures
- "Last-Minute Bookers" - <7 days advance purchase

### 3. Value-Based Segmentation (RFM Analysis)

**RFM Framework**:
```
R = Recency: Days since last booking
F = Frequency: Number of bookings in period
M = Monetary: Total spend in period

Each dimension scored 1-5 (5 = best)
```

**RFM Scoring**:
```typescript
// Recency Score
1: 365+ days ago
2: 181-365 days ago
3: 91-180 days ago
4: 31-90 days ago
5: 0-30 days ago

// Frequency Score
1: 1 booking
2: 2 bookings
3: 3-4 bookings
4: 5-9 bookings
5: 10+ bookings

// Monetary Score
1: $0-$500
2: $501-$1000
3: $1001-$2500
4: $2501-$5000
5: $5000+
```

**RFM Segments** (11 pre-defined):

| Segment | RFM Range | Description | Marketing Strategy |
|---------|-----------|-------------|-------------------|
| **Champions** | 555, 554, 544 | Best customers | Reward, upsell premium |
| **Loyal Customers** | 545, 455, 454 | Consistent value | Cross-sell, loyalty program |
| **Potential Loyalists** | 543, 444, 435 | Good customers | Nurture, engage regularly |
| **Recent Customers** | 511, 512, 521 | New customers | Onboard, build relationship |
| **Promising** | 511, 421, 412 | Recent, low frequency | Encourage repeat booking |
| **Needs Attention** | 433, 343, 334 | Declining | Reactivate, special offers |
| **About to Sleep** | 331, 321, 312 | At risk | Win-back campaigns |
| **At Risk** | 233, 234, 244 | High value, not recent | Aggressive retention |
| **Can't Lose Them** | 155, 154, 144 | Best customers slipping | Win-back, premium offers |
| **Hibernating** | 221, 222, 223 | Low value, inactive | Low-cost re-engagement |
| **Lost** | 111, 112, 121 | Churned | Minimal spend, surveys |

**RFM Calculation**:
```sql
WITH rfm_base AS (
  SELECT 
    customer_id,
    DATEDIFF(days, MAX(booking_date), CURRENT_DATE) as recency,
    COUNT(DISTINCT booking_id) as frequency,
    SUM(total_amount) as monetary
  FROM bookings
  WHERE booking_date > CURRENT_DATE - INTERVAL '12 months'
  GROUP BY customer_id
),
rfm_scores AS (
  SELECT 
    customer_id,
    NTILE(5) OVER (ORDER BY recency DESC) as r_score,
    NTILE(5) OVER (ORDER BY frequency) as f_score,
    NTILE(5) OVER (ORDER BY monetary) as m_score
  FROM rfm_base
)
SELECT * FROM rfm_scores;
```

### 4. Lifecycle Segmentation

Track customers through their lifecycle:

**Lifecycle Stages**:

| Stage | Definition | Example Actions |
|-------|------------|-----------------|
| **New** | First booking in last 30 days | Welcome series, onboarding |
| **Active** | 2+ bookings in last 90 days | Engagement, loyalty rewards |
| **Engaged** | 5+ bookings in last 180 days | VIP treatment, early access |
| **At-Risk** | No booking in 90-180 days | Win-back offers |
| **Churned** | No booking in 180+ days | Survey, aggressive offers |
| **Reactivated** | Returned after churned | Re-onboarding |

### 5. Predictive Segmentation

ML-powered predictive segments:

**Churn Risk Prediction**:
```typescript
interface ChurnPrediction {
  customerId: string;
  churnProbability: number; // 0-1
  churnRiskBucket: 'Low' | 'Medium' | 'High' | 'Critical';
  keyFactors: string[]; // Top factors contributing to churn
  recommendedActions: string[];
}

// Example
{
  customerId: "CUST123",
  churnProbability: 0.78,
  churnRiskBucket: "High",
  keyFactors: [
    "180 days since last booking",
    "3 abandoned searches in last 30 days",
    "Competitor booking detected"
  ],
  recommendedActions: [
    "Send personalized win-back offer",
    "Provide route-specific discount",
    "Reach out via email within 48h"
  ]
}
```

**Propensity to Buy**:
- Next purchase probability (0-1)
- Predicted booking date
- Predicted route
- Predicted spend amount

**Lifetime Value (LTV) Prediction**:
- 12-month LTV prediction
- 24-month LTV prediction
- Lifetime LTV prediction

### 6. Custom Segment Builder

**Segment Builder Interface**:
```typescript
interface SegmentCriteria {
  logic: 'AND' | 'OR';
  rules: SegmentRule[];
}

interface SegmentRule {
  field: string; // customer.age, booking.frequency, etc.
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'BETWEEN' | 'CONTAINS';
  value: any;
}

// Example: High-value frequent business travelers
{
  logic: 'AND',
  rules: [
    { field: 'customer.totalSpend', operator: '>=', value: 5000 },
    { field: 'booking.frequency', operator: '>=', value: 10 },
    { field: 'booking.cabinClass', operator: 'IN', value: ['BUSINESS', 'FIRST'] },
    { field: 'customer.rfmSegment', operator: 'IN', value: ['Champions', 'Loyal'] }
  ]
}
```

**50+ Predefined Segments**:

Sales & Revenue:
1. High-Value Customers (>$5K annual spend)
2. VIP Customers (Top 1%)
3. First-Time Bookers
4. Repeat Customers (2+ bookings)
5. Group Bookers
6. Corporate Account Travelers
7. Last-Minute Bookers
8. Early Planners (30+ days advance)
9. Price-Sensitive (Economy only)
10. Premium Seekers (Business/First)

Geographic:
11. Domestic Travelers
12. International Travelers
13. Transcontinental Travelers
14. Regional Travelers (Europe, Asia, Americas)
15. Specific Route Flyers (NYC-LA, etc.)

Behavioral:
16. Frequent Flyers (10+ trips/year)
17. Seasonal Travelers (Summer/Winter)
18. Weekend Travelers
19. Weekday Travelers
20. Mobile Bookers
21. Web Bookers
22. Agent Bookers

Lifecycle:
23. New Customers (First 30 days)
24. Active Customers
25. At-Risk Customers (90-180 days inactive)
26. Churned Customers (180+ days)
27. Reactivated Customers
28. Win-Back Candidates

Engagement:
29. Email Engaged (High open rates)
30. Email Disengaged (Low engagement)
31. SMS Opted-In
32. App Users
33. Loyalty Program Members
34. Social Media Followers

Product Affinity:
35. Ancillary Buyers (Seats, Bags, Meals)
36. Upgrade Seekers
37. Bundle Purchasers
38. No Ancillary Buyers

Predictive:
39. High Churn Risk (>70%)
40. Medium Churn Risk (30-70%)
41. High Propensity to Buy (Next 30 days)
42. High LTV Predicted (>$10K)

Special:
43. Birthday This Month
44. Anniversary This Month
45. Abandoned Cart (Last 7 days)
46. Search but No Book (Last 30 days)
47. Complained Recently
48. Excellent NPS Score (9-10)
49. Detractors (0-6 NPS)
50. Referral Program Participants

## Campaign Creation

### Campaign Wizard

**7-Step Campaign Creation**:

**Step 1: Campaign Details**
```typescript
{
  name: "Summer Sale 2024",
  campaignCode: "SUMMER24",
  type: "PROMOTIONAL",
  description: "20% off all European routes",
  goalType: "REVENUE",
  goalValue: 500000 // $500K revenue target
}
```

**Step 2: Target Audience**
- Select segments (AND/OR logic)
- Exclude segments
- Preview audience size
- Export audience list

**Step 3: Offer Definition**
```typescript
{
  offerType: "DISCOUNT",
  discountType: "PERCENTAGE",
  discountPercentage: 20,
  validFrom: "2024-06-01",
  validTo: "2024-08-31",
  minimumPurchase: 100,
  applicableRoutes: ["JFK-LON", "JFK-PAR", "JFK-ROM"],
  blackoutDates: [
    { start: "2024-07-04", end: "2024-07-08" }, // July 4th week
    { start: "2024-08-15", end: "2024-08-25" }  // Peak summer
  ],
  maxUsageTotal: 10000,
  maxUsagePerCustomer: 2
}
```

**Step 4: Channel Selection**
- Select channels (Email, SMS, Push, etc.)
- Set channel priority
- Configure send times (immediate, scheduled, optimal)

**Step 5: Content Creation**
- Choose email template
- Customize subject line, content, CTA
- Add personalization tokens
- Preview email

**Step 6: A/B Testing** (Optional)
- Create variants (up to 5)
- Set traffic allocation
- Define success metric

**Step 7: Review & Schedule**
- Review all settings
- Set budget cap
- Schedule launch
- Submit for approval (if required)

### Campaign Types

**1. Promotional Campaigns**
- Sale announcements
- Flash sales
- Limited-time offers
- Seasonal promotions

**2. Transactional Campaigns**
- Booking confirmations
- Payment receipts
- Itinerary updates
- Boarding pass delivery

**3. Lifecycle Campaigns**
- Welcome series (new customers)
- Onboarding sequences
- Birthday/Anniversary campaigns
- Renewal reminders

**4. Triggered Campaigns**
- Abandoned cart recovery
- Browse abandonment
- Post-purchase follow-up
- Review requests

**5. Drip Campaigns**
- Educational series
- Nurture sequences
- Product training
- Customer success

**6. Re-Engagement Campaigns**
- Win-back inactive customers
- Lapsed customer reactivation
- Dormant account wake-up

**7. Cross-Sell Campaigns**
- Complementary product suggestions
- Bundle offers
- Upgrade opportunities

**8. Upsell Campaigns**
- Premium seat offers
- Cabin class upgrades
- Ancillary product suggestions

## Multi-Channel Orchestration

### Supported Channels

**1. Email (Sendgrid/Mailgun)**

**Configuration**:
```typescript
{
  provider: "sendgrid",
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: "marketing@airline.com",
  fromName: "Airline Marketing",
  replyTo: "support@airline.com",
  trackOpens: true,
  trackClicks: true,
  unsubscribeGroup: "marketing-promo"
}
```

**Features**:
- Transactional and marketing emails
- Template management
- Personalization tokens
- A/B testing
- Open and click tracking
- Bounce handling
- Unsubscribe management

**2. SMS (Twilio)**

**Configuration**:
```typescript
{
  provider: "twilio",
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: "+1-555-AIRLINE",
  messagingService: "MG1234567890",
  statusCallback: "https://api.airline.com/sms/status"
}
```

**Features**:
- Promotional SMS
- Transactional SMS (OTP, confirmations)
- MMS support (images)
- Link shortening
- Delivery status tracking
- Opt-out handling (STOP, UNSTOP)

**3. Push Notifications (Firebase)**

**Configuration**:
```typescript
{
  provider: "firebase",
  serviceAccount: "./firebase-admin-key.json",
  databaseURL: "https://airline-app.firebaseio.com",
  topics: ["all-users", "ios-users", "android-users"]
}
```

**Features**:
- Rich notifications (images, buttons)
- Deep linking to app screens
- Segmented push
- Scheduled delivery
- Silent notifications (data-only)
- Badge count management

**4. In-App Messaging**

**Message Types**:
- Modal popups
- Banners (top/bottom)
- Full-screen takeovers
- Tooltips
- Badge notifications

**Triggers**:
- App launch
- Screen view
- Event-based
- Time-based

**5. Website Personalization**

**Personalization Types**:
- Hero banner
- Promotional bar
- Product recommendations
- Dynamic pricing display
- Popups/modals
- Content blocks

**6. Social Media Integration**

**Meta (Facebook/Instagram)**:
- Custom Audiences sync
- Lookalike Audiences creation
- Conversion API integration
- Ad campaign creation

**X (Twitter)**:
- Tailored Audiences sync
- Tweet scheduling
- Direct message campaigns

## Email Campaign Builder

### Drag-and-Drop Designer

**Available Components**:
- Text blocks
- Image blocks
- Button CTAs
- Dividers
- Spacers
- Social media icons
- Product cards
- Multi-column layouts

**MJML Support**:
```xml
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-image src="logo.png" alt="Airline Logo" />
        <mj-text font-size="20px" color="#1E40AF">
          Summer Sale: 20% Off European Routes
        </mj-text>
        <mj-button href="https://airline.com/book?promo=SUMMER24">
          Book Now
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

### Responsive Templates

**Pre-built Templates**:
- Welcome email
- Promotional announcement
- Flash sale
- Abandoned cart
- Post-booking thank you
- Review request
- Win-back offer
- Newsletter
- Event invitation
- Seasonal greetings

### Personalization Tokens

**Available Tokens**:
```handlebars
{{customer.firstName}}
{{customer.lastName}}
{{customer.frequentFlyerNumber}}
{{customer.tier}}
{{lastBooking.route}}
{{lastBooking.date}}
{{offer.code}}
{{offer.discount}}
{{campaign.name}}
{{dynamic.recommendedRoute}}
{{dynamic.personalizedPrice}}
```

**Example**:
```html
<p>Hi {{customer.firstName}},</p>

<p>As a {{customer.tier}} member, you've earned an exclusive 
{{offer.discount}}% discount on your next booking to 
{{dynamic.recommendedRoute}}!</p>

<p>Use code <strong>{{offer.code}}</strong> at checkout.</p>
```

### A/B Testing

**Test Variants**:
```typescript
{
  campaignId: "CAMP123",
  variants: [
    {
      name: "Control",
      subject: "Save 20% on Summer Travel",
      trafficAllocation: 34,
      isControl: true
    },
    {
      name: "Variant A - Urgency",
      subject: "Last Chance: 20% Off Ends Sunday!",
      trafficAllocation: 33
    },
    {
      name: "Variant B - Personalized",
      subject: "{{customer.firstName}}, Your Exclusive 20% Discount",
      trafficAllocation: 33
    }
  ],
  successMetric: "CONVERSION_RATE",
  minConfidence: 0.95
}
```

**Statistical Significance**:
```typescript
// Automatically calculated
{
  variantA: {
    sent: 10000,
    conversions: 150,
    conversionRate: 0.015,
    confidenceLevel: 0.97,
    pValue: 0.023
  },
  variantB: {
    sent: 10000,
    conversions: 185,
    conversionRate: 0.0185,
    confidenceLevel: 0.98,
    pValue: 0.015,
    isWinner: true,
    lift: "+23.3%"
  }
}
```

### Preview & Testing

**Email Client Preview**:
- Gmail (Desktop, Mobile)
- Outlook (Desktop, Mobile)
- Apple Mail (Desktop, Mobile)
- Yahoo Mail
- Thunderbird

**Spam Score Check**:
- SpamAssassin score
- Blacklist check
- Authentication check (SPF, DKIM, DMARC)
- Content analysis
- Link reputation

## Campaign Automation

### Triggered Campaigns

**1. Abandoned Cart**

**Trigger**: User adds flight to cart but doesn't complete booking

**Sequence**:
```typescript
{
  trigger: {
    event: "CART_ABANDONED",
    delay: "1 hour"
  },
  actions: [
    {
      channel: "EMAIL",
      template: "abandoned-cart-1",
      subject: "Complete your booking to {{route}}",
      delay: "0 minutes"
    },
    {
      channel: "EMAIL",
      template: "abandoned-cart-2",
      subject: "Still thinking? Here's 10% off",
      delay: "24 hours",
      condition: "NOT_BOOKED"
    },
    {
      channel: "SMS",
      message: "Your {{route}} booking expires in 2 hours. Complete now: {{link}}",
      delay: "46 hours",
      condition: "NOT_BOOKED"
    }
  ]
}
```

**2. Post-Booking**

**Trigger**: Booking completed

**Sequence**:
```typescript
{
  trigger: {
    event: "BOOKING_COMPLETED",
    delay: "immediate"
  },
  actions: [
    {
      channel: "EMAIL",
      template: "booking-confirmation",
      delay: "0 minutes"
    },
    {
      channel: "EMAIL",
      template: "ancillary-upsell",
      delay: "3 hours"
    },
    {
      channel: "PUSH",
      message: "Add seat selection to your booking",
      delay: "1 day",
      condition: "NO_SEAT_SELECTED"
    },
    {
      channel: "EMAIL",
      template: "pre-departure",
      delay: "departure_date - 3 days"
    }
  ]
}
```

### Drip Campaigns

**New Customer Onboarding**:

```typescript
{
  name: "Welcome Series",
  trigger: {
    event: "FIRST_BOOKING"
  },
  sequence: [
    {
      day: 1,
      subject: "Welcome aboard! Here's what's next",
      template: "welcome-1"
    },
    {
      day: 3,
      subject: "Discover our mobile app",
      template: "welcome-2-app"
    },
    {
      day: 7,
      subject: "Join our loyalty program",
      template: "welcome-3-loyalty"
    },
    {
      day: 14,
      subject: "Your exclusive member discount",
      template: "welcome-4-offer"
    },
    {
      day: 30,
      subject: "We'd love your feedback",
      template: "welcome-5-survey"
    }
  ]
}
```

### Lifecycle Campaigns

**Birthday Campaign**:
```typescript
{
  name: "Birthday Offer",
  trigger: {
    type: "DATE_BASED",
    field: "customer.dateOfBirth",
    offset: "0 days" // On birthday
  },
  actions: [
    {
      channel: "EMAIL",
      template: "birthday-offer",
      subject: "Happy Birthday, {{customer.firstName}}! 🎂",
      offer: {
        code: "BDAY{{customer.id}}",
        discount: 15,
        validDays: 30
      }
    }
  ]
}
```

### Re-Engagement Campaigns

**Win-Back Sequence**:

```typescript
{
  name: "Win-Back Campaign",
  trigger: {
    segment: "At-Risk Customers"
  },
  sequence: [
    {
      day: 0,
      subject: "We miss you! Here's 20% off your next trip",
      template: "winback-1",
      offer: 20
    },
    {
      day: 7,
      subject: "Your routes are calling...",
      template: "winback-2",
      condition: "NOT_BOOKED"
    },
    {
      day: 14,
      subject: "Last chance: 25% off (expires soon)",
      template: "winback-3-final",
      offer: 25,
      condition: "NOT_BOOKED"
    }
  ]
}
```

## Offer Management

### Promotional Code Generation

**Code Formats**:
- PROMO2024 (static)
- SUMMER20 (descriptive)
- UNIQUE123ABC (unique per customer)
- {{SEGMENT}}{{DATE}} (dynamic)

**Generation Rules**:
```typescript
{
  prefix: "SUMMER",
  suffix: "2024",
  length: 8,
  includeChecksum: true,
  pattern: "ALPHANUMERIC",
  excludeAmbiguous: true, // Exclude 0, O, 1, I
  caseInsensitive: true
}
```

### Usage Tracking

Real-time tracking of:
- Total redemptions
- Redemptions by customer
- Revenue impact
- Average discount amount
- Popular routes/dates

### Redemption Limits

**Global Limits**:
- Maximum total uses (10,000)
- Maximum revenue impact ($500K)
- Expiration date

**Per-Customer Limits**:
- 1 use per customer
- 1 use per booking
- 2 uses per month

### Restrictions

**Route Restrictions**:
```typescript
{
  applicableRoutes: ["JFK-LAX", "JFK-SFO", "JFK-SEA"],
  excludedRoutes: ["JFK-LON"] // Higher yield route
}
```

**Date Restrictions**:
```typescript
{
  bookingWindow: {
    start: "2024-06-01",
    end: "2024-08-31"
  },
  travelWindow: {
    start: "2024-07-01",
    end: "2024-09-30"
  },
  blackoutDates: [
    { start: "2024-07-04", end: "2024-07-08" }
  ]
}
```

**Fare Class Restrictions**:
```typescript
{
  applicableFares: ["Y", "B", "M"], // Economy and mid-tier
  excludedFares: ["J", "F"] // Business and First
}
```

### Stackability Rules

```typescript
{
  stackable: false, // Cannot combine with other offers
  combineWith: ["LOYALTY10"], // Can combine with loyalty discount
  priority: 1 // If multiple apply, highest priority wins
}
```

## Customer Journey Mapping

### Visual Journey Builder

**Journey Components**:
- Entry point (segment, event, manual)
- Decision nodes (if/else branching)
- Wait nodes (time delays)
- Action nodes (send email, update segment)
- Split nodes (A/B testing)
- Exit conditions

**Example Journey**:
```
[Entry: New Customer]
    │
    ↓
[Wait: 1 day]
    │
    ↓
[Email: Welcome]
    │
    ├─→ [Opened?] ──Yes→ [Email: App Download]
    │                           │
    │                           ↓
    │                     [Wait: 3 days]
    │                           │
    └─→ [No] ──────────────────┤
                                ↓
                          [Email: Re-engage]
```

### Attribution Modeling

**First-Touch Attribution**:
- Credit to first campaign customer interacted with

**Last-Touch Attribution**:
- Credit to last campaign before conversion

**Multi-Touch Attribution**:
- Linear: Equal credit to all touchpoints
- Time decay: More credit to recent touchpoints
- U-shaped: More credit to first and last
- W-shaped: Credit to first, middle, last
- Data-driven: ML-based attribution

**Example**:
```typescript
{
  customerId: "CUST123",
  conversionValue: 500,
  touchpoints: [
    { campaign: "SUMMER24", channel: "EMAIL", timestamp: "2024-06-01", attribution: 125 },
    { campaign: "SUMMER24", channel: "SOCIAL", timestamp: "2024-06-05", attribution: 125 },
    { campaign: "FLASH72", channel: "SMS", timestamp: "2024-06-08", attribution: 125 },
    { campaign: "FLASH72", channel: "EMAIL", timestamp: "2024-06-09", attribution: 125 }
  ],
  attributionModel: "LINEAR"
}
```

## Personalization Engine

### ML-Powered Recommendations

**Next Best Offer (NBO)**:

**Algorithm**: Collaborative Filtering + Content-Based

**Input Features**:
- Purchase history
- Browse history
- Search queries
- Demographic data
- Segment membership
- Similar customer behavior

**Output**:
```typescript
{
  customerId: "CUST123",
  recommendations: [
    {
      type: "ROUTE",
      value: "JFK-MIA",
      confidence: 0.87,
      reasoning: "Frequently searched, popular in your segment"
    },
    {
      type: "ANCILLARY",
      value: "SEAT_EXTRA_LEGROOM",
      confidence: 0.73,
      reasoning: "Purchased on 80% of past bookings"
    },
    {
      type: "UPGRADE",
      value: "BUSINESS_CLASS",
      confidence: 0.65,
      reasoning: "High LTV, upcoming anniversary"
    }
  ]
}
```

### Real-Time Personalization

**Dynamic Content**:
```typescript
// Homepage banner personalized per visitor
{
  customerId: "CUST123",
  banner: {
    headline: "Welcome back, John!",
    subheadline: "Your favorite route NYC → LA is on sale",
    cta: "Book NYC → LA",
    image: "nyc-la-skyline.jpg",
    backgroundColor: "#1E40AF"
  }
}
```

### Behavioral Triggers

**Page View Triggers**:
- User views route details → Show personalized offer
- User views pricing → Show discount countdown
- User views ancillaries → Show bundle deal

**Search Triggers**:
- User searches route → Save for retargeting
- User searches dates → Show dynamic pricing
- Multiple searches → Show "popular" badge

**Engagement Triggers**:
- Email open → Update engagement score
- Link click → Show targeted landing page
- No activity 30 days → Trigger re-engagement

## Campaign Performance

### Real-Time Dashboard

**Key Metrics**:
- Sent: 50,000
- Delivered: 49,200 (98.4%)
- Opened: 12,300 (25%)
- Clicked: 2,460 (5%)
- Converted: 492 (1%)
- Revenue: $123,000
- ROI: 615% ($20K spend)

### Detailed Analytics

**Engagement Funnel**:
```
Sent:       50,000 (100%)
  ↓
Delivered:  49,200 (98.4%)
  ↓
Opened:     12,300 (25.0%)
  ↓
Clicked:     2,460 (5.0%)
  ↓
Converted:     492 (1.0%)
```

**Channel Performance**:
| Channel | Sent | Open Rate | Click Rate | Conversion | Revenue |
|---------|------|-----------|------------|------------|---------|
| Email | 40,000 | 24% | 4.5% | 0.9% | $90K |
| SMS | 8,000 | 95% | 12% | 1.8% | $28K |
| Push | 2,000 | 68% | 8% | 0.7% | $5K |

**Cohort Analysis**:
Track performance by customer cohort (Champions, Loyal, etc.)

### Benchmark Comparisons

Industry averages:
- Email open rate: 18-22%
- Email click rate: 2-3%
- SMS open rate: 98%
- SMS click rate: 8-12%
- Push notification open: 50-60%

## Compliance

### GDPR Consent Management

**Consent Capture**:
```typescript
{
  customerId: "CUST123",
  consents: [
    {
      channel: "EMAIL",
      consentGiven: true,
      consentDate: "2024-01-15",
      source: "registration_form",
      ipAddress: "192.168.1.1"
    },
    {
      channel: "SMS",
      consentGiven: true,
      consentDate: "2024-01-15",
      source: "checkout_optin"
    }
  ]
}
```

**Right to be Forgotten**:
- Delete customer data on request
- Anonymize historical records
- Remove from all segments
- Add to DNC list

### Do Not Contact (DNC) Lists

**Automatic Addition**:
- Hard bounces (email)
- Unsubscribe requests
- Spam complaints
- STOP/UNSTOP (SMS)

**Manual Addition**:
- Customer service request
- Legal requirement
- Internal policy

### Communication Preferences

**Preference Center**:
```typescript
{
  customerId: "CUST123",
  preferences: {
    email: {
      promotional: true,
      transactional: true,
      frequency: "WEEKLY"
    },
    sms: {
      promotional: false,
      transactional: true
    },
    push: {
      promotional: true,
      transactional: true
    },
    topics: ["deals", "new-routes", "loyalty-updates"],
    excludeTopics: ["surveys", "newsletters"]
  }
}
```

### Audit Logging

All marketing actions logged:
- Campaign sends
- Consent changes
- DNC additions
- Data access
- Data exports

## Installation & Setup

```bash
cd services/marketing-service
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations
npx prisma migrate dev

# Start service
npm run dev

# Production
npm run build
npm start
```

## Scripts

```bash
# Calculate customer segments
npm run segment:calculate

# Run RFM analysis
npm run rfm:analyze

# Trigger automated campaigns
npm run campaign:trigger
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Express.js + TypeScript |
| Database | PostgreSQL + Prisma |
| Queue | Bull (Redis) |
| Email | Sendgrid / Mailgun |
| SMS | Twilio |
| Push | Firebase Admin |
| Template Engine | Handlebars + MJML |
| ML | TensorFlow.js |
| Scheduling | node-cron |

## Performance Targets

- Segment calculation: <5 minutes for 1M customers
- Campaign send: 10,000 emails/minute
- Real-time personalization: <100ms response
- A/B test winner determination: 95% confidence

## License

UNLICENSED - Internal use only

## Support

- Marketing Team: marketing@airline.com
- Technical Support: tech@airline.com
