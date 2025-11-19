# GDS Integration Service

Comprehensive Global Distribution System integration service providing connectivity to major GDS networks (Amadeus, Sabre, Travelport, and regional systems) for airline inventory distribution, booking management, ticketing, and settlement.

## Overview

The GDS Integration Service enables airlines to distribute inventory and manage bookings across traditional travel agency channels through industry-standard GDS platforms. This service handles real-time availability requests, PNR management, e-ticketing, fare distribution, and settlement processes.

```
┌─────────────────────────────────────────────────────────────────┐
│                    GDS Integration Service                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Amadeus    │  │    Sabre     │  │  Travelport  │          │
│  │  Connector   │  │  Connector   │  │  Connector   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│         ┌─────────────────┴─────────────────┐                   │
│         │      Message Router & Parser       │                   │
│         │   (Type A, Type B, EDIFACT)        │                   │
│         └─────────────────┬─────────────────┘                   │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────┐            │
│  │                                                  │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │            │
│  │  │Availability│ │   PNR    │ │ Ticketing│       │            │
│  │  │  Manager  │ │ Manager  │ │  Engine  │       │            │
│  │  └──────────┘ └──────────┘ └──────────┘       │            │
│  │                                                  │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │            │
│  │  │   Queue  │ │   Fare   │ │Settlement│       │            │
│  │  │  Manager │ │  Manager │ │  Engine  │       │            │
│  │  └──────────┘ └──────────┘ └──────────┘       │            │
│  └──────────────────────────────────────────────┘            │
│                           │                                      │
│         ┌─────────────────┴─────────────────┐                   │
│         │        RabbitMQ Message Queue      │                   │
│         │         Redis Cache Layer          │                   │
│         └─────────────────┬─────────────────┘                   │
│                           │                                      │
│         ┌─────────────────┴─────────────────┐                   │
│         │    Native PSS System Integration   │                   │
│         │  (Inventory, Reservation, Payment) │                   │
│         └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## Supported GDS Networks

### 1. **Amadeus**
- Market leader with 40%+ global market share
- Strong in Europe, Asia-Pacific
- Type A messaging (Cryptic format)
- SOAP/XML API support
- PNR structure: 6-character locator

### 2. **Sabre**
- Major presence in North America
- 35%+ market share
- Type A messaging
- SOAP/REST API support
- Host format compatibility

### 3. **Travelport**
- **Galileo**: Strong in North America, Europe
- **Apollo**: North American focus
- **Worldspan**: Delta heritage system
- Unified API across brands
- XML-based messaging

### 4. **Regional GDS**
- **Travelsky**: China market leader (90%+ domestic share)
- **Infini**: Japan market (ANA heritage)
- **Axess**: Japan market (JAL heritage)
- **Abacus**: Asia-Pacific multi-country

## Message Types Implementation

### Type A Messages (Interactive/Real-time)

Type A messages are cryptic, command-line style messages for real-time interactive transactions:

#### **PAOREQ - Availability Request**
```
Request Format:
AN25DECLAXLAX/A15JAN

Response:
1 UA 123 J4 C4 D4 Y9 15JAN DENLAX 0800 1030
2 AA 456 J9 C9 D9 Y9 15JAN DENLAX 1200 1430
3 DL 789 J2 C2 D0 Y9 15JAN DENLAX 1500 1730
```

**Features**:
- Real-time seat availability by booking class
- Availability codes: A1-A9 (1-9 seats), L (limited), R (request), Q (waitlist)
- Married segment logic for connections
- Minimum connect times validation
- Cache duration: 5-15 minutes

#### **ITAREQ/HWPREQ - Interactive Sell Request**
```
Request Format:
0UA1231J15JAN/DEN/LAX*1SMITH/JOHN MR

Response:
OK - SEGMENT CONFIRMED
UA 123 J 15JAN DENLAX HK1 0800 1030
PNR: ABC123
```

**Features**:
- Create booking in GDS
- Action codes: HK (holding confirmed), KK (confirmed), HL (holding waitlisted)
- Instant confirmation
- PNR creation with locator assignment

#### **TKTREQ - Ticketing Request**
```
Request Format:
TKTREQ:ABC123/TKT/ETICKET

Response:
TICKET ISSUED: 001-1234567890
E-TICKET NUMBER: 0011234567890
```

**Features**:
- Issue electronic tickets (13-digit number)
- EMD issuance for ancillaries
- Automatic fare calculation
- Ticket time limits enforcement

#### **SMPREQ - Seat Map Request**
```
Request Format:
SMPREQ:UA123/15JAN/DEN/LAX

Response:
[Seat map with A-F columns, rows 1-30]
Available: Green, Occupied: Red, Blocked: Gray
```

**Features**:
- Visual seat map display
- Seat characteristics (extra legroom, exit row, etc.)
- Real-time seat availability
- Seat fees display

#### **SBPREQ - Seat Assignment Request**
```
Request Format:
SBPREQ:ABC123/1/15A

Response:
SEAT ASSIGNED: 15A FOR SMITH/JOHN MR
```

**Features**:
- Assign seats to passengers
- Validate seat availability
- Update PNR with seat assignments
- Support bulk seat assignment

#### **PNRREQ - PNR Retrieval**
```
Request Format:
RT:ABC123

Response:
PNR: ABC123
1 SMITH/JOHN MR
1 UA 123 J 15JAN DENLAX HK1 0800 1030
TKT: 0011234567890
CONTACT: PHONE-555-1234
```

**Features**:
- Retrieve complete PNR details
- Display passenger names, segments, tickets
- Show SSRs, OSIs, remarks
- Queue placement information

### Type B Messages (Operational/Batch)

Type B messages are structured messages for operational and batch processing:

#### **SSR - Special Service Requests**
```
SSR WCHR UA 123 J 15JAN DENLAX NN1 SMITH/JOHN MR
SSR VGML UA 123 J 15JAN DENLAX HK1 SMITH/JOHN MR
SSR PETC UA 123 J 15JAN DENLAX HK1 SMITH/JOHN MR/DOG/5KG
```

**Common SSR Codes**:
- **Medical**: WCHR (wheelchair), BLND (blind), DEAF (deaf), DPNA (disabled passenger)
- **Meal**: VGML (vegetarian), HNML (Hindu), KSML (kosher), MOML (Muslim), DBML (diabetic)
- **Service**: PETC (pet in cabin), UMNR (unaccompanied minor), BIKE (bicycle), SURF (surfboard)
- **Documentation**: DOCS (travel documents), DOCO (other documents), DOCA (destination address)

#### **OSI - Other Service Information**
```
OSI UA PASSENGER REQUIRES ASSISTANCE
OSI UA CORPORATE ACCOUNT NUMBER 12345
OSI UA CONTACT PHONE +1-555-1234
```

**Features**:
- Free-text information to specific carriers
- Corporate booking references
- Special handling instructions
- Contact information

#### **Schedule Updates**
```
SCHEDULE UPDATE:
UA 123 DEN LAX
EFFECTIVE: 01JAN24
DEPARTURE: 0800 -> 0815 (NEW)
AIRCRAFT: 73H -> 73J (NEW)
```

**Features**:
- Schedule change notifications
- Aircraft type changes
- Frequency updates
- Seasonal variations

#### **Fare Updates**
```
FARE UPDATE:
UA DEN LAX
ECONOMY: 299.00 -> 349.00 USD
EFFECTIVE: 01FEB24
BOOKING CLASS: Y, B, M
```

**Features**:
- Fare change notifications
- Booking class updates
- Effective date management
- Currency changes

### EDIFACT Message Processing

UN/EDIFACT (Electronic Data Interchange For Administration, Commerce and Transport) is the international standard for structured data exchange:

#### **PAXLST - Passenger List Message**
```
UNH+1+PAXLST:D:02B:UN:IATA'
BGM+745+20240115UA123+9'
NAD+FL+++SMITH:JOHN:MR'
DTM+329:20240115:102'
LOC+125+DEN'
LOC+87+LAX'
UNT+8+1'
```

**Purpose**:
- Advance Passenger Information System (APIS)
- Customs and immigration pre-clearance
- Security screening
- Passenger manifest for authorities

**Data Elements**:
- Passenger full name and title
- Date of birth
- Nationality
- Passport number and expiry
- Destination address
- Flight details

#### **IFTMBC - Booking Confirmation**
```
UNH+1+IFTMBC:D:00B:UN:IATA'
BGM+335+ABC123+9'
RFF+TN:ABC123'
NAD+CZ+++SMITH:JOHN'
TDT+20+UA123'
LOC+125+DEN'
LOC+87+LAX'
UNT+10+1'
```

**Purpose**:
- Confirm booking creation
- PNR acknowledgment
- Segment confirmation
- Ticketing status

#### **IFTMBF - Firm Booking**
```
UNH+1+IFTMBF:D:00B:UN:IATA'
BGM+335+ABC123+4'
RFF+TN:ABC123'
DTM+137:20240115:102'
NAD+CZ+++SMITH:JOHN'
TDT+20+UA123+J'
QTY+46:1'
UNT+12+1'
```

**Purpose**:
- Confirm firm booking status
- Move from request to confirmed
- Update inventory allocation
- Trigger ticketing time limits

#### **IFTMCS - Space Cancellation**
```
UNH+1+IFTMCS:D:00B:UN:IATA'
BGM+335+ABC123+1'
RFF+TN:ABC123'
TDT+20+UA123'
QTY+46:0'
UNT+8+1'
```

**Purpose**:
- Cancel booking segments
- Release inventory
- Update PNR status
- Trigger refund processing

## Availability Distribution

### Real-time Inventory Synchronization

```typescript
// Availability synchronization flow
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   GDS       │─────>│   Cache     │─────>│  Inventory  │
│  Request    │      │   Layer     │      │   System    │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                     │
       │ Cache Miss         │                     │
       └────────────────────┴─────────────────────┘
                            │
                    Fetch from Backend
```

### Cache Strategy

**Cache Keys**:
```
gds:avail:{origin}:{dest}:{date}:{cabin}:{pax}
Example: gds:avail:DEN:LAX:20240115:Y:2
```

**Cache Duration**:
- High-demand routes: 5 minutes
- Medium-demand routes: 10 minutes
- Low-demand routes: 15 minutes
- Dynamic pricing routes: 3 minutes

**Cache Invalidation**:
- On booking creation (inventory change)
- On schedule change
- On fare update
- Manual flush by route

### Married Segment Logic

Married segments are flight connections that must be booked together:

```typescript
// Example: DEN-ORD-LAX must be booked as one itinerary
{
  "marriedSegmentId": "UA123-UA456",
  "segments": [
    {
      "flight": "UA123",
      "origin": "DEN",
      "destination": "ORD",
      "bookingClass": "Y"
    },
    {
      "flight": "UA456",
      "origin": "ORD",
      "destination": "LAX",
      "bookingClass": "Y"
    }
  ],
  "rule": "MUST_BOOK_TOGETHER",
  "availabilityCount": 4  // Minimum of both segments
}
```

**Rules**:
- Cannot book segments separately
- Availability is minimum of all segments
- Pricing may differ from sum of individual segments
- Through check-in and baggage handling

### Minimum Connect Times (MCT)

```typescript
// MCT validation
{
  "airport": "ORD",
  "domestic": {
    "sameTerminal": 45,      // minutes
    "differentTerminal": 60,
    "sameCarrier": 45,
    "differentCarrier": 60
  },
  "international": {
    "arrivalToDomestic": 90,
    "domesticToInternational": 120,
    "internationalToInternational": 120
  }
}
```

### Availability Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| A1-A9 | Available | Specific number of seats (1-9) |
| L | Limited | Less than 10 seats available |
| R | Request | On request, not guaranteed |
| Q | Waitlist | Waitlist only, no availability |
| C | Closed | Booking class closed |
| X | Cancelled | Flight cancelled |

## Booking Management

### GDS PNR Creation

**PNR Structure**:
```
ABC123                           (Locator)
1.SMITH/JOHN MR                  (Passenger 1)
2.SMITH/JANE MS                  (Passenger 2)
3.SMITH/TIMMY MSTR              (Passenger 3 - Child)
 1 UA 123 Y 15JAN DENLAX HK3 0800 1030  (Segment 1)
TKT/TIME LIMIT -  10JAN/2359    (Ticketing deadline)
SSR VGML UA 123 Y 15JAN HK1 SMITH/JOHN MR
CTCE SMITH/JOHN//john.smith@email.com
CTCM SMITH/JOHN//555-1234
AP DEN 303-555-0000 ACME TRAVEL
RM *CORPORATE BOOKING 12345
RM *SPECIAL ASSISTANCE REQUIRED
RCVD FROM - AGENT JD/12345
```

### PNR Import to Native System

**Bi-directional Sync**:

```typescript
// GDS → Native
{
  "syncType": "GDS_TO_NATIVE",
  "gdsPnr": "ABC123",
  "nativePnr": "XYZ789",
  "mapping": {
    "passengers": [
      {"gdsId": "1", "nativeId": "uuid-1"},
      {"gdsId": "2", "nativeId": "uuid-2"}
    ],
    "segments": [
      {"gdsSegment": "1", "nativeFlightId": "uuid-f1"}
    ]
  },
  "lastSync": "2024-01-15T10:30:00Z",
  "syncStatus": "SUCCESS"
}

// Native → GDS
{
  "syncType": "NATIVE_TO_GDS",
  "triggers": [
    "PAYMENT_RECEIVED",
    "SEAT_ASSIGNMENT",
    "SSR_ADDED",
    "ANCILLARY_PURCHASED"
  ],
  "updateFields": ["ticketNumber", "seatAssignment", "ssrList"]
}
```

### Queue Management

**Standard GDS Queues**:

| Queue | Purpose | Auto-Process | Priority |
|-------|---------|--------------|----------|
| 10 | Ticketing queue | Yes | High |
| 20 | Schedule changes | Yes | High |
| 30 | Waitlist confirmations | Yes | Medium |
| 40 | General inquiries | No | Low |
| 50 | Group bookings | No | Medium |
| 60 | Refunds | No | Medium |
| 70 | Customer service | No | Low |

**Queue Processing**:
```typescript
// Automated queue processing
{
  "queueNumber": "10",
  "queueCategory": "TICKETING",
  "autoProcessing": true,
  "processingInterval": 15,  // minutes
  "actions": [
    {
      "condition": "WITHIN_TIME_LIMIT",
      "action": "ISSUE_TICKET"
    },
    {
      "condition": "TIME_LIMIT_EXPIRED",
      "action": "CANCEL_PNR"
    }
  ]
}
```

### Name Changes and Modifications

**Allowed Modifications**:
- Minor spelling corrections (before ticketing)
- Title changes (MR/MS/MRS)
- Addition of middle names
- Formatting corrections

**Restricted Modifications**:
- Complete name changes (requires cancellation and rebooking)
- Name transfers (not permitted)
- Post-ticketing changes (airline approval required)

**Process**:
```typescript
{
  "modificationType": "NAME_CHANGE",
  "pnr": "ABC123",
  "passengerNumber": 1,
  "oldName": "SMYTH/JOHN MR",
  "newName": "SMITH/JOHN MR",
  "reason": "SPELLING_CORRECTION",
  "approvalRequired": false,
  "fee": 0
}
```

### Split/Divide PNR

**Split PNR Use Cases**:
- Separate passengers with different itineraries
- Group bookings with partial cancellations
- Different payment methods
- Agency splits

**Process**:
```
Original PNR: ABC123
Passengers: 1. SMITH/JOHN, 2. SMITH/JANE, 3. DOE/MARY

After Split:
PNR ABC123: 1. SMITH/JOHN, 2. SMITH/JANE
PNR DEF456: 1. DOE/MARY

Both PNRs retain original segments
```

## E-Ticketing

### Ticket Number Structure (13 digits)

```
001 - 1234567890 - 3
│    │           └─ Check digit (Luhn algorithm)
│    └─ Document number (10 digits)
└─ Airline code (3 digits)
```

**Example**:
- `001-1234567890-3` - American Airlines ticket
- `016-9876543210-1` - United Airlines ticket

### E-Ticket Issuance

**Issuance Process**:
```typescript
{
  "pnr": "ABC123",
  "passenger": "SMITH/JOHN MR",
  "ticketNumber": "001-1234567890-3",
  "issueDate": "2024-01-10",
  "issueLocation": "DEN",
  "validatingCarrier": "UA",
  "coupons": [
    {
      "couponNumber": 1,
      "status": "OPEN",
      "origin": "DEN",
      "destination": "LAX",
      "flight": "UA123",
      "class": "Y",
      "fareBasis": "YRT",
      "notValidBefore": "2024-01-15",
      "notValidAfter": "2024-01-15"
    }
  ],
  "fare": {
    "baseFare": 299.00,
    "taxes": [
      {"code": "US", "amount": 5.60},
      {"code": "XF", "amount": 4.50},
      {"code": "AY", "amount": 5.50},
      {"code": "ZP", "amount": 4.00}
    ],
    "total": 318.60,
    "currency": "USD"
  },
  "formOfPayment": "CC",
  "endorsements": "NON-REFUNDABLE"
}
```

### EMD Issuance (Electronic Miscellaneous Document)

**EMD Types**:
- **EMD-S**: Standalone services not linked to flights (lounge access, travel insurance)
- **EMD-A**: Associated with flights (baggage, seats, meals)

**EMD Structure**:
```typescript
{
  "emdNumber": "001-1234567891-2",
  "emdType": "EMD_A",
  "associatedTicket": "001-1234567890-3",
  "rfic": "0CC",  // Reason for Issuance Code
  "rfisc": "0DF", // Reason for Issuance Sub Code
  "serviceType": "PREPAID_BAGGAGE",
  "description": "1PC 23KG BAGGAGE",
  "amount": 35.00,
  "currency": "USD",
  "applicableSegments": [1]
}
```

**Common RFIC Codes**:
- 0CC: Prepaid baggage
- 0BI: Seat selection
- 0BS: Meal pre-order
- 0DA: Lounge access
- 0DW: Priority boarding

### Ticket Exchange

**Exchange Process**:
```typescript
{
  "originalTicket": "001-1234567890-3",
  "newTicket": "001-1234567899-1",
  "reason": "VOLUNTARY_CHANGE",
  "originalFare": 299.00,
  "newFare": 399.00,
  "additionalCollection": 100.00,
  "exchangeFee": 200.00,
  "totalDue": 300.00,
  "residualValue": 0,
  "changeDate": "2024-01-12"
}
```

### Refund Processing

**Refund Types**:
- **Voluntary**: Passenger-initiated cancellation
- **Involuntary**: Airline-initiated (schedule change, cancellation)
- **Partial**: Unused segments only
- **Full**: Complete ticket refund

**Refund Calculation**:
```typescript
{
  "ticketNumber": "001-1234567890-3",
  "refundType": "VOLUNTARY",
  "originalAmount": 318.60,
  "usedCoupons": 0,
  "refundableFare": 0,      // Non-refundable fare
  "refundableTaxes": 19.60, // Taxes always refundable
  "refundFee": 0,
  "totalRefund": 19.60,
  "refundMethod": "ORIGINAL_FORM_OF_PAYMENT"
}
```

### Void Ticket

**Void Rules**:
- Must be same day as issuance
- Before midnight (airline time zone)
- No segments used
- PNR still active

**Void Process**:
```typescript
{
  "ticketNumber": "001-1234567890-3",
  "issueDate": "2024-01-10",
  "voidDate": "2024-01-10",
  "reason": "DUPLICATE_ISSUANCE",
  "withinTimeLimit": true,
  "canVoid": true,
  "voidFee": 0
}
```

## Fare Distribution

### Fare Filing to ATPCO

ATPCO (Airline Tariff Publishing Company) is the industry standard for fare distribution:

**Fare Filing Process**:
```typescript
{
  "fareType": "PUBLIC",
  "carrier": "UA",
  "origin": "DEN",
  "destination": "LAX",
  "fareClass": "ECONOMY",
  "fareBasis": "YRT",
  "owrt": "RT",  // One-way or Round-trip
  "amount": 299.00,
  "currency": "USD",
  "effectiveDate": "2024-02-01",
  "discontinueDate": "2024-06-30",
  "travelDates": {
    "start": "2024-02-01",
    "end": "2024-06-30"
  },
  "bookingDates": {
    "start": "2024-01-15",
    "end": "2024-06-29"
  },
  "advancePurchase": 14,
  "minimumStay": "SATURDAY_NIGHT",
  "maximumStay": "30_DAYS",
  "penalties": {
    "change": 200.00,
    "cancel": "NON_REFUNDABLE"
  }
}
```

### SSIM/SLFM Formats

**SSIM** (Standard Schedules Information Manual):
```
3 UA 123 15JAN24 25JUN24 1234567 DEN 0800 LAX 1030 73J Y20C15J9F4
```

**SLFM** (Standard Load Factor Manual):
```
SLF UA DEN LAX 15JAN24 Y 85 C 92 J 88 F 100
```

### Private Fares for Corporates

**Corporate Fare Structure**:
```typescript
{
  "fareType": "CORPORATE",
  "corporateId": "ACME_CORP_12345",
  "accountCode": "UA_ACME_2024",
  "baseFare": 249.00,  // $50 discount from public
  "publicFare": 299.00,
  "discount": {
    "type": "PERCENTAGE",
    "value": 16.7
  },
  "minimumPax": 100,  // Annual commitment
  "validRoutes": ["DEN-*", "LAX-*"],  // All routes from DEN/LAX
  "blackoutDates": [],
  "upgradeEligibility": true,
  "changeFee": 0,  // Waived for corporate
  "refundable": true
}
```

### Negotiated Fares

**Tour Operator Fares**:
```typescript
{
  "fareType": "NEGOTIATED",
  "contractId": "TO_12345",
  "tourOperator": "Vacation Tours Inc",
  "netFare": 199.00,
  "publicFare": 299.00,
  "commission": 0,  // Net fare, no commission
  "minimumPax": 500,  // Annual commitment
  "blockSpace": true,
  "cancellationPenalty": {
    "30days": 0,
    "15days": 50,
    "7days": 100
  }
}
```

## Settlement Integration

### BSP (Billing and Settlement Plan)

BSP is IATA's system for settling transactions between airlines and travel agencies:

**Settlement Cycle**:
```
Monday:    Week 1 starts
Friday:    Week 1 ends (cut-off)
Tuesday:   Reporting deadline
Thursday:  Payment due from agencies
Friday:    Payment to airlines
```

**BSP Report Structure**:
```typescript
{
  "settlementPeriod": "2024-01",
  "weekNumber": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "reportDate": "2024-01-09",
  "paymentDueDate": "2024-01-11",
  "transactions": [
    {
      "type": "SALE",
      "ticketNumber": "001-1234567890-3",
      "issueDate": "2024-01-05",
      "agencyCode": "12345678",
      "agencyName": "Travel Agency Inc",
      "passengerName": "SMITH/JOHN MR",
      "route": "DEN-LAX",
      "baseFare": 299.00,
      "tax": 19.60,
      "total": 318.60,
      "commission": 26.91,  // 9% of base fare
      "commissionRate": 9.0,
      "netDue": 291.69
    }
  ],
  "summary": {
    "totalSales": 318600.00,  // 1000 tickets
    "totalCommission": 26910.00,
    "totalTax": 19600.00,
    "netRemittance": 291690.00
  }
}
```

### ARC (Airlines Reporting Corporation)

ARC is the North American equivalent of BSP:

**ARC Settlement**:
```typescript
{
  "settlementType": "ARC",
  "reportPeriod": "WEEKLY",
  "arcWeek": "202401",
  "carriers": ["UA", "AA", "DL"],
  "totalTransactions": 1500,
  "grossSales": 475800.00,
  "refunds": 15600.00,
  "netSales": 460200.00,
  "commission": 41418.00,
  "arcFee": 1500.00,  // $1 per ticket
  "netRemittance": 417282.00
}
```

### Automated Sales Reporting

**Daily Sales Report**:
```typescript
{
  "reportDate": "2024-01-15",
  "gdsBreakdown": {
    "AMADEUS": {
      "bookings": 450,
      "revenue": 142500.00,
      "commission": 12825.00
    },
    "SABRE": {
      "bookings": 380,
      "revenue": 120400.00,
      "commission": 10836.00
    },
    "TRAVELPORT": {
      "bookings": 170,
      "revenue": 53900.00,
      "commission": 4851.00
    }
  },
  "totalBookings": 1000,
  "totalRevenue": 316800.00,
  "totalCommission": 28512.00
}
```

### Commission Calculation

**Standard Commission Structure**:
```typescript
{
  "baseCommission": 9.0,  // 9% standard
  "overrides": [
    {
      "agencyCode": "12345678",
      "agencyName": "Top Agency Inc",
      "commissionRate": 12.0,  // Override for high-volume
      "reason": "VOLUME_INCENTIVE",
      "minimumMonthlyBookings": 500
    }
  ],
  "incentives": [
    {
      "type": "VOLUME_BONUS",
      "threshold": 1000,  // bookings/month
      "bonus": 2.0  // Additional 2%
    }
  ]
}
```

### ADM (Agency Debit Memo) Processing

**ADM Issuance**:
```typescript
{
  "admNumber": "ADM-UA-2024-00001",
  "admType": "ADM",
  "issueDate": "2024-01-20",
  "agencyCode": "12345678",
  "reason": "UNAUTHORIZED_REFUND",
  "relatedTicket": "001-1234567890-3",
  "amount": 318.60,
  "status": "ISSUED",
  "dueDate": "2024-02-20",
  "disputeDeadline": "2024-02-10"
}
```

**Common ADM Reasons**:
- Unauthorized refunds
- Churning (repeated bookings/cancellations)
- Fraudulent bookings
- Ticketing violations
- Commission abuse

## Agency Tools

### Agency Booking Interface

**Features**:
- Multi-GDS search
- Price comparison across GDS
- Fare rules display
- Seat maps
- Ancillary products
- Payment processing
- PNR management
- Queue management

### Private Fare Access

**Corporate Booking Tool**:
```typescript
{
  "agencyId": "12345678",
  "corporateAccess": [
    {
      "corporateId": "ACME_CORP",
      "accountCode": "UA_ACME_2024",
      "discount": 15.0,
      "routes": ["*"],  // All routes
      "upgradeEligibility": true
    }
  ],
  "negotiatedFares": [
    {
      "tourOperator": "Vacation Tours",
      "contractId": "TO_12345",
      "netFares": true,
      "blockSpace": true
    }
  ]
}
```

### Commission Tracking

**Real-time Commission Dashboard**:
```typescript
{
  "period": "2024-01",
  "totalBookings": 1200,
  "totalRevenue": 380400.00,
  "earnedCommission": 34236.00,
  "averageCommissionRate": 9.0,
  "topRoutes": [
    {
      "route": "DEN-LAX",
      "bookings": 200,
      "commission": 5382.00
    }
  ],
  "projectedMonthly": 51354.00
}
```

### Reporting Tools

**Standard Reports**:
- Daily sales summary
- Weekly performance
- Monthly commission statement
- Top routes by revenue
- Booking trends
- Cancellation analysis
- Agency productivity

### Self-Service Portal

**Portal Features**:
- Profile management
- Commission statements
- ADM/ACM tracking
- Training resources
- GDS certification status
- Support tickets
- News and updates

## Performance & Reliability

### Message Queuing

**RabbitMQ Implementation**:
```typescript
{
  "queues": {
    "availability": {
      "priority": "HIGH",
      "ttl": 30000,  // 30 seconds
      "maxRetries": 3
    },
    "booking": {
      "priority": "CRITICAL",
      "ttl": 120000,  // 2 minutes
      "maxRetries": 5,
      "deadLetterQueue": "booking_dlq"
    },
    "ticketing": {
      "priority": "HIGH",
      "ttl": 60000,
      "maxRetries": 3
    },
    "reporting": {
      "priority": "LOW",
      "ttl": 300000,  // 5 minutes
      "maxRetries": 1
    }
  }
}
```

### Retry Logic with Exponential Backoff

**Retry Strategy**:
```typescript
{
  "initialDelay": 1000,  // 1 second
  "maxDelay": 32000,     // 32 seconds
  "multiplier": 2,
  "maxRetries": 5,
  "retryableErrors": [
    "TIMEOUT",
    "CONNECTION_ERROR",
    "TEMPORARY_UNAVAILABLE",
    "RATE_LIMIT"
  ],
  "nonRetryableErrors": [
    "INVALID_REQUEST",
    "AUTHENTICATION_FAILED",
    "PNR_NOT_FOUND"
  ]
}

// Retry delays: 1s, 2s, 4s, 8s, 16s
```

### Circuit Breaker

**Circuit Breaker Pattern**:
```typescript
{
  "gdsProvider": "AMADEUS",
  "circuitBreaker": {
    "failureThreshold": 50,      // % of failures
    "sampleSize": 100,           // Requests to sample
    "openDuration": 60000,       // 1 minute open
    "halfOpenRequests": 10,      // Test requests
    "states": {
      "CLOSED": "Normal operation",
      "OPEN": "Stop sending requests",
      "HALF_OPEN": "Testing recovery"
    }
  }
}
```

### Performance Targets

**SLA Commitments**:
- **Response Time**: <2 seconds for 95th percentile
- **Availability**: 99.9% uptime (8.76 hours downtime/year)
- **Throughput**: 10,000 requests/minute
- **Cache Hit Rate**: >80% for availability requests
- **Error Rate**: <0.1%

## Monitoring

### GDS Connection Health

**Health Check Metrics**:
```typescript
{
  "gdsProvider": "AMADEUS",
  "healthChecks": [
    {
      "checkType": "CONNECTIVITY",
      "status": "HEALTHY",
      "responseTime": 45,  // ms
      "lastCheck": "2024-01-15T10:30:00Z"
    },
    {
      "checkType": "AUTHENTICATION",
      "status": "HEALTHY",
      "responseTime": 120,
      "lastCheck": "2024-01-15T10:30:00Z"
    },
    {
      "checkType": "AVAILABILITY_REQUEST",
      "status": "HEALTHY",
      "responseTime": 850,
      "lastCheck": "2024-01-15T10:29:00Z"
    }
  ],
  "overallStatus": "HEALTHY",
  "uptimePercentage": 99.95
}
```

### Message Volume by GDS

**Volume Tracking**:
```typescript
{
  "period": "2024-01-15",
  "gdsMetrics": [
    {
      "gds": "AMADEUS",
      "totalMessages": 45680,
      "byType": {
        "AVAILABILITY": 25000,
        "BOOKING": 8500,
        "TICKETING": 6800,
        "PNR_RETRIEVAL": 5380
      }
    },
    {
      "gds": "SABRE",
      "totalMessages": 38920,
      "byType": {
        "AVAILABILITY": 21000,
        "BOOKING": 7200,
        "TICKETING": 5800,
        "PNR_RETRIEVAL": 4920
      }
    }
  ]
}
```

### Response Time Tracking

**Latency Monitoring**:
```typescript
{
  "metric": "RESPONSE_TIME",
  "gds": "AMADEUS",
  "period": "LAST_HOUR",
  "statistics": {
    "p50": 650,   // 50th percentile: 650ms
    "p95": 1800,  // 95th percentile: 1.8s
    "p99": 2400,  // 99th percentile: 2.4s
    "max": 4200,
    "avg": 850
  },
  "slaCompliance": {
    "target": 2000,  // 2 seconds
    "compliance": 98.5  // %
  }
}
```

### Error Rate Monitoring

**Error Tracking**:
```typescript
{
  "period": "2024-01-15",
  "totalRequests": 84600,
  "errors": 42,
  "errorRate": 0.05,  // 0.05%
  "errorBreakdown": {
    "TIMEOUT": 18,
    "CONNECTION_ERROR": 12,
    "INVALID_RESPONSE": 8,
    "RATE_LIMIT": 4
  },
  "byGds": {
    "AMADEUS": {
      "requests": 45680,
      "errors": 20,
      "errorRate": 0.04
    },
    "SABRE": {
      "requests": 38920,
      "errors": 22,
      "errorRate": 0.06
    }
  }
}
```

### Revenue by GDS Channel

**Revenue Attribution**:
```typescript
{
  "period": "2024-01",
  "revenueByGds": [
    {
      "gds": "AMADEUS",
      "bookings": 12500,
      "passengers": 23400,
      "revenue": 7425000.00,
      "averageTicketValue": 317.31,
      "commission": 668250.00,
      "netRevenue": 6756750.00
    },
    {
      "gds": "SABRE",
      "bookings": 10200,
      "passengers": 19100,
      "revenue": 6069000.00,
      "averageTicketValue": 317.75,
      "commission": 546210.00,
      "netRevenue": 5522790.00
    }
  ],
  "totalRevenue": 13494000.00,
  "totalCommission": 1214460.00
}
```

## Compliance

### IATA Standards Compliance

**Standards Implemented**:
- **Resolution 780**: Passenger Service Conference (PSC) Resolutions
- **Resolution 788**: Ticketing authority
- **BCBP**: Bar Coded Boarding Pass
- **SSIM**: Standard Schedules Information Manual
- **PADIS**: Passenger and Airport Data Interchange Standards
- **IATA ONE Order**: Modern order management (future)

### GDS Certification Testing

**Certification Requirements**:

**Amadeus Certification**:
- API integration testing
- Message format validation
- PNR creation/retrieval
- Ticketing workflows
- Queue management
- Error handling

**Sabre Certification**:
- Host connectivity
- SOAP/REST API testing
- Booking flows
- Fare calculation
- EMD processing

**Travelport Certification**:
- Universal API integration
- Multi-host testing (Galileo, Apollo, Worldspan)
- Profile management
- Low fare search

### Regular Audit Compliance

**Audit Schedule**:
- Quarterly internal audits
- Annual external audits
- Penetration testing: Bi-annual
- Disaster recovery drills: Quarterly

**Audit Areas**:
- Transaction accuracy
- Commission calculation
- Settlement reconciliation
- Security compliance (PCI-DSS)
- Data privacy (GDPR)

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Prisma ORM
- **Message Queue**: RabbitMQ for reliable message delivery
- **Cache**: Redis for availability caching
- **Job Queue**: Bull for background processing

### GDS-Specific Libraries
- **XML Processing**: fast-xml-parser, xml2js
- **EDIFACT**: node-edifact, edifact-parser
- **SOAP**: node-soap for legacy GDS APIs
- **Encoding**: iconv-lite for character encoding

### Reliability & Performance
- **Circuit Breaker**: Opossum
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston with structured logging
- **Validation**: Joi for request validation

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env with GDS credentials
# AMADEUS_ENDPOINT=https://api.amadeus.com
# AMADEUS_OFFICE_ID=...
# SABRE_ENDPOINT=https://api.sabre.com
# SABRE_PCC=...

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Start queue worker
npm run queue:worker
```

## Configuration

### GDS Provider Setup

```typescript
// Example: Amadeus configuration
{
  "code": "AMADEUS",
  "name": "Amadeus GDS",
  "type": "AMADEUS",
  "endpoint": "https://api.amadeus.com/v1",
  "backupEndpoint": "https://api-backup.amadeus.com/v1",
  "isPrimary": true,
  "airlineCode": "UA",
  "officeId": "DENUA08AA",
  "credentials": {
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret",
    "clientId": "your-client-id"
  },
  "connectionTimeout": 30000,
  "readTimeout": 60000,
  "maxRetries": 3,
  "circuitBreakerThreshold": 50
}
```

## Testing with GDS Sandbox

All major GDS providers offer sandbox environments for testing:

### Amadeus Test Environment
- **Endpoint**: https://test.api.amadeus.com
- **Test Office ID**: LONVG08AA (example)
- **Test PNRs**: Pre-created test PNRs available
- **Test Cards**: Test credit card numbers provided

### Sabre Test Environment
- **Endpoint**: https://api.cert.sabre.com
- **Test PCC**: 6KHD (example)
- **Test Queues**: All queues available
- **Test Credentials**: Certification credentials

### Travelport Test Environment
- **Endpoint**: https://api.cert.travelport.com
- **Test Provider**: 1G (Galileo test)
- **Test Branch**: Test branch codes
- **Test Credentials**: Developer credentials

## API Endpoints

### Availability
```
POST /api/gds/availability
GET  /api/gds/availability/cache/stats
```

### Booking
```
POST /api/gds/booking/create
GET  /api/gds/booking/:pnr
PUT  /api/gds/booking/:pnr
POST /api/gds/booking/:pnr/sync
POST /api/gds/booking/:pnr/split
```

### Ticketing
```
POST /api/gds/ticket/issue
POST /api/gds/ticket/:ticketNumber/void
POST /api/gds/ticket/:ticketNumber/refund
POST /api/gds/ticket/:ticketNumber/exchange
POST /api/gds/emd/issue
```

### Queue Management
```
GET  /api/gds/queue/:queueNumber
POST /api/gds/queue/:queueNumber/place
POST /api/gds/queue/:queueNumber/remove
POST /api/gds/queue/:queueNumber/process
```

### Settlement
```
GET  /api/gds/settlement/:period
POST /api/gds/settlement/generate
GET  /api/gds/settlement/adm
POST /api/gds/settlement/adm/:admNumber/dispute
```

### Monitoring
```
GET  /api/gds/health
GET  /api/gds/metrics
GET  /api/gds/metrics/revenue
```

## Performance Targets

- **Response Time**: <2 seconds for 95% of requests
- **Availability**: 99.9% uptime
- **Throughput**: 10,000+ requests/minute
- **Cache Hit Rate**: >80% for availability
- **Error Rate**: <0.1%
- **Message Delivery**: 100% (no lost messages)

## Security

- **Authentication**: JWT tokens for API access
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS 1.3 for GDS communication
- **PII Protection**: Data masking in logs
- **Audit Logging**: All transactions logged
- **Rate Limiting**: Per-agency rate limits

## Support

For issues or questions:
- Internal Documentation: `/docs/gds-integration`
- GDS Support Contacts: See provider documentation
- IATA Standards: https://www.iata.org/en/programs/ops-infra/
- ATPCO: https://www.atpco.net/

---

**Note**: This is a critical distribution channel for airlines working with traditional travel agencies. While LCCs focus on direct channels, full-service carriers require robust GDS integration for global reach. Implementation requires GDS certification and ongoing compliance with IATA standards.
