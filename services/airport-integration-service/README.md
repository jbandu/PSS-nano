# Airport Integration Service

Comprehensive airport operational systems integration service providing connectivity to common-use platforms (CUTE/CUPPS/CUSS), baggage handling systems, biometric gates, FIDS, gate management, AODB, ground handling, security screening, immigration/customs (APIS), and SITA Type B messaging.

## Overview

The Airport Integration Service enables airlines to operate efficiently at airports worldwide by integrating with critical airport systems and infrastructure. This service handles check-in operations, baggage processing, biometric boarding, flight information displays, gate assignments, turnaround coordination, security screening, customs/immigration, and operational messaging.

```
┌─────────────────────────────────────────────────────────────────┐
│                Airport Integration Service                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Common-Use Platforms (CUTE/CUPPS/CUSS)           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │Check-In  │ │ Boarding │ │Ticketing │ │ Baggage  │   │  │
│  │  │Counters  │ │  Gates   │ │ Counters │ │   Drop   │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Self-Service Systems (CUSS 2.0)                  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │ Kiosks   │ │ Bag Drop │ │Biometric │ │ Mobile   │   │  │
│  │  │          │ │          │ │  Gates   │ │Check-In  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    Baggage Handling System (BHS) - Type B Messages       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │   BSM    │ │   BPM    │ │   BTM    │ │   BUM    │   │  │
│  │  │ Source   │ │ Process  │ │ Transfer │ │  Unload  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    Airport Operations (AODB, Gates, FIDS, Ground)        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │Gate Mgmt │ │   FIDS   │ │Turnaround│ │ Resource │   │  │
│  │  │          │ │ Displays │ │   Mgmt   │ │Allocation│   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    Government Systems (APIS, Security, Customs)          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │   APIS   │ │ Security │ │ Customs  │ │Immigration│  │
│  │  │ Manifest │ │Screening │ │   Decl   │ │  Control │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         SITA Type B Operational Messaging                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │   MVT    │ │   LDM    │ │   CPM    │ │   PSM    │   │  │
│  │  │Movement  │ │   Load   │ │Passenger │ │ Special  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Common-Use Platforms

### CUTE (Common Use Terminal Equipment)

CUTE provides shared terminal equipment that multiple airlines can use for check-in, boarding, and other passenger processing operations.

**Providers**:
- SITA (Market leader, 400+ airports)
- ARINC (Strong in North America)
- Rockwell Collins (ARINC heritage)
- Amadeus (Integrated with reservations)
- RESA (European focus)

**Session Management**:
```typescript
{
  "sessionId": "CUTE-DEN-C12-20240115-001",
  "workstationId": "DEN-T1-C12",
  "airlineCode": "UA",
  "agentId": "AG12345",
  "terminalId": "T1",
  "counterNumber": "C12",
  "sessionType": "CHECK_IN",
  "startedAt": "2024-01-15T08:00:00Z",
  "status": "ACTIVE",
  "transactionCount": 45
}
```

**Transaction Types**:
- Check-in processing
- Seat assignment
- Baggage tag printing
- Boarding pass issuance
- Passenger lookup
- Flight information
- Special services (SSR)
- Payment processing

### CUPPS (Common Use Passenger Processing System)

Next-generation common-use platform with enhanced capabilities:

**Features**:
- Web-based interface
- Multi-airline workstation sharing
- Real-time resource allocation
- Self-service integration
- Mobile agent applications
- Cloud-based deployment

### CUSS (Common Use Self-Service)

IATA standard for self-service kiosks enabling multi-airline usage:

**CUSS 2.0 Features**:
- Platform-independent API
- Support for boarding pass printing
- Bag tag printing
- Payment processing
- Biometric enrollment/verification
- Accessibility features
- Multi-language support
- Mobile integration

**Kiosk Workflow**:
```typescript
// Check-in flow
1. Welcome screen → 2. Booking retrieval (PNR/Scan)
3. Passenger verification → 4. Seat selection
5. Baggage declaration → 6. Payment (if needed)
7. Boarding pass print → 8. Bag tags print
9. Receipt/Summary → 10. Session complete
```

**Session Tracking**:
```typescript
{
  "kioskId": "DEN-T1-K05",
  "sessionId": "CUSS-20240115-K05-001",
  "airlineCode": "UA",
  "pnr": "ABC123",
  "startedAt": "2024-01-15T08:30:00Z",
  "duration": 180,  // seconds
  "language": "en",
  "steps": [
    {"step": "BOOKING_RETRIEVAL", "timestamp": "..."},
    {"step": "SEAT_SELECTION", "timestamp": "..."},
    {"step": "BOARDING_PASS_PRINT", "timestamp": "..."}
  ],
  "status": "COMPLETED",
  "outcome": "SUCCESS",
  "boardingPassesPrinted": 2,
  "bagTagsPrinted": 3
}
```

### Self-Service Bag Drop (SSBD)

Automated baggage acceptance with weight/dimension capture:

**Features**:
- Automated weight scale (±0.5kg accuracy)
- 3D dimension capture
- Boarding pass scanner
- Bag tag printer/scanner
- Overweight/oversized detection
- Payment terminal integration
- Conveyor integration with BHS

**Transaction Flow**:
```typescript
{
  "bagDropId": "DEN-T1-BD02",
  "pnr": "ABC123",
  "passengerName": "SMITH/JOHN MR",
  "flightNumber": "UA123",
  "bagTagNumber": "0017654321",
  "weightCaptured": 22.5,  // kg
  "widthCaptured": 55,     // cm
  "heightCaptured": 40,
  "depthCaptured": 20,
  "isOverweight": false,
  "isOversized": false,
  "status": "ACCEPTED",
  "processingTime": 45  // seconds
}
```

## Baggage Handling System (BHS)

### Type B Messages

**BSM - Baggage Source Message**:
Sent when baggage is accepted at check-in or transfer point.

```
BSM
UA123/15JAN.DENLAX
.N0017654321/0001
.P/SMITH/JOHN MR ABC123
.1/20K
.D/DENLAX
```

**Message Structure**:
- Line 1: Flight number and date
- Line 2: Bag tag number (10 digits)
- Line 3: Passenger name and PNR
- Line 4: Number of pieces and weight
- Line 5: Routing (origin-destination)

**BPM - Baggage Process Message**:
Reports baggage processing events (sorted, loaded, etc.).

```
BPM
UA123/15JAN.DENLAX
.N0017654321
.PLD/15JAN0945
```

**BTM - Baggage Transfer Message**:
For transfer baggage routing.

```
BTM
UA123/15JAN.DENLAX.UA456/15JAN.LAXSFO
.N0017654321
.P/SMITH/JOHN MR ABC123
.D/DENSFO
```

**BUM - Baggage Unload Message**:
Confirms baggage unloaded at destination.

```
BUM
UA123/15JAN.DENLAX
.N0017654321
.ULD/15JAN1045
```

**BNS - Baggage Not Seen**:
Reports missing baggage.

### Bag Tag Pool Management

**IATA 10-Digit Format**:
```
0 01 7654321
│ │  │
│ │  └─ Serial number (7 digits)
│ └─ Airline code (2 digits, e.g., 001=AA, 016=UA)
└─ Check digit (Luhn algorithm)
```

**Pool Allocation**:
```typescript
{
  "airlineCode": "UA",
  "poolIdentifier": "UA-DEN-2024-01",
  "startRange": 1000000,
  "endRange": 1999999,
  "currentNumber": 1234567,
  "totalCapacity": 1000000,
  "usedCount": 234567,
  "availableCount": 765433,
  "status": "ACTIVE",
  "allocatedDate": "2024-01-01",
  "expiryDate": "2024-12-31"
}
```

### Baggage Tracking Events

**IATA Event Codes**:
- **BTA**: Baggage tag attached (check-in)
- **BTL**: Bag tag loaded
- **BTP**: Bag tag process (sorted)
- **BTD**: Bag tag delivered
- **BTM**: Bag tag mishandled
- **BTF**: Bag tag found
- **BTR**: Bag tag reconciled

**Tracking Flow**:
```typescript
[
  {"event": "ACCEPTANCE", "location": "DEN", "time": "08:00"},
  {"event": "SORTING", "location": "DEN-BHS", "time": "08:15"},
  {"event": "LOADING", "location": "DEN-GATE-B15", "time": "08:45"},
  {"event": "ARRIVAL", "location": "LAX-CAROUSEL-3", "time": "10:30"},
  {"event": "CLAIM", "location": "LAX", "time": "10:45"}
]
```

## Biometric Systems

### Biometric Gate Types

**Use Cases**:
- **Check-in**: Initial enrollment, identity verification
- **Bag Drop**: Verify passenger identity for bag acceptance
- **Security**: TSA PreCheck, CLEAR integration
- **Boarding Gate**: Biometric boarding (face = boarding pass)
- **Customs/Immigration**: Automated border control
- **Lounge Access**: VIP/premium passenger verification

### Biometric Enrollment

**Process**:
```typescript
{
  "enrollmentId": "BIO-20240115-001",
  "pnr": "ABC123",
  "passengerName": "SMITH/JOHN MR",
  "flightNumber": "UA123",
  "flightDate": "2024-01-15",
  "biometricType": "FACE",
  "faceImageHash": "sha256:abc123...",
  "qualityScore": 0.95,      // 0-1 scale
  "livenessScore": 0.98,     // Anti-spoofing
  "enrolledAt": "2024-01-15T08:00:00Z",
  "expiresAt": "2024-01-15T23:59:59Z",
  "consentGiven": true,
  "status": "ACTIVE"
}
```

**Quality Metrics**:
- Face detection confidence: >90%
- Image quality score: >85%
- Liveness detection: >95%
- Pose angle: ±15 degrees
- Lighting: Adequate

### Biometric Verification

**Matching Process**:
```typescript
{
  "verificationId": "VERIFY-20240115-001",
  "pnr": "ABC123",
  "checkpointType": "BOARDING_GATE",
  "biometricType": "FACE",
  "matchScore": 0.92,        // 0-1 scale
  "threshold": 0.85,         // Configurable
  "matchResult": "MATCH",
  "processingTime": 850,     // milliseconds
  "verifiedAt": "2024-01-15T09:00:00Z",
  "fallbackToManual": false
}
```

**False Accept Rate (FAR)**: <0.01% (1 in 10,000)
**False Reject Rate (FRR)**: <1% (1 in 100)
**Processing Time**: <1 second

### Privacy & Compliance

**GDPR Compliance**:
- Explicit consent required
- Purpose limitation (boarding only)
- Data minimization
- Storage limitation (delete after flight)
- Right to withdraw consent
- Data encryption at rest and in transit

**Biometric Template Storage**:
- Encrypted with AES-256
- Never stored as images
- Hash-based matching
- Temporary storage only
- Automatic deletion post-flight

## Flight Information Display System (FIDS)

### Display Types

**Departures Board**:
```
DEPARTURES                                         15:30

FLIGHT  TIME  DESTINATION   STATUS      GATE    TERMINAL
UA 123  16:00 LOS ANGELES   ON TIME     B15     T1
AA 456  16:15 CHICAGO       DELAYED     B22     T1
DL 789  16:30 NEW YORK      BOARDING    A10     T2
SW 234  16:45 PHOENIX       CHECK-IN    B5      T1
```

**Arrivals Board**:
```
ARRIVALS                                           15:30

FLIGHT  TIME  FROM          STATUS      CAROUSEL TERMINAL
UA 234  15:45 SAN FRANCISCO LANDED      3        T1
AA 567  16:00 DALLAS        ON TIME     5        T1
DL 890  16:15 ATLANTA       DELAYED     -        T2
```

**Gate Display**:
```
┌─────────────────────────────────────────┐
│  GATE B15         UNITED AIRLINES       │
│                                         │
│  UA 123           LOS ANGELES (LAX)     │
│                                         │
│  BOARDING TIME:   15:30                 │
│  DEPARTURE TIME:  16:00                 │
│                                         │
│  STATUS:          NOW BOARDING          │
│                   ZONE 1                │
│                                         │
│  SEAT ROWS:       1-9                   │
└─────────────────────────────────────────┘
```

### Update Triggers

- Schedule changes
- Gate assignments
- Delay notifications
- Boarding announcements
- Cancellations
- Carousel assignments
- Check-in counter assignments

## Gate Management

### Gate Assignment

**Dynamic Gate Allocation**:
```typescript
{
  "gateNumber": "B15",
  "flightNumber": "UA123",
  "flightDate": "2024-01-15",
  "aircraftType": "B738",
  "scheduledArrival": "14:30",
  "scheduledDeparture": "16:00",
  "estimatedDeparture": "16:15",
  "assignedAt": "2024-01-15T06:00:00Z",
  "assignmentType": "SCHEDULED",
  "priority": 5,
  "isDelayed": true,
  "delayMinutes": 15,
  "delayReason": "LATE_INCOMING_AIRCRAFT",
  "status": "BOARDING"
}
```

**Gate Status**:
- **AVAILABLE**: No flight assigned
- **ASSIGNED**: Flight assigned, not yet arrived
- **OCCUPIED**: Aircraft at gate
- **BOARDING**: Boarding in progress
- **CLEANING**: Post-departure cleaning
- **MAINTENANCE**: Gate under maintenance
- **BLOCKED**: Temporarily unavailable

### Gate Constraints

**Aircraft Size Categories**:
- **A**: Small regional (ERJ, CRJ)
- **B**: Narrowbody short (A320, B737)
- **C**: Narrowbody long (A321, B757)
- **D**: Widebody medium (B767, A330)
- **E**: Widebody large (B777, A350)
- **F**: Super large (A380, B747)

**Gate Compatibility**:
```typescript
{
  "gateNumber": "B15",
  "gateType": "CONTACT",        // With jetbridge
  "hasJetBridge": true,
  "hasBiometric": true,
  "capacity": 180,              // passengers
  "aircraftSizeCategory": "C",  // Up to B757/A321
  "isDomestic": true,
  "isInternational": false
}
```

## Airport Operational Database (AODB)

### Flight Record

**Comprehensive Flight Data**:
```typescript
{
  "flightId": "UA123-20240115",
  "flightNumber": "UA123",
  "flightDate": "2024-01-15",
  "origin": "DEN",
  "destination": "LAX",
  "aircraftType": "B738",
  "aircraftRegistration": "N12345",

  // Scheduled times
  "scheduledDeparture": "16:00",
  "scheduledArrival": "17:30",

  // Estimated times
  "estimatedDeparture": "16:15",
  "estimatedArrival": "17:45",

  // Actual times (IATA standards)
  "aobt": "16:18",  // Actual Off-Block Time
  "atot": "16:25",  // Actual Take-Off Time
  "aibt": "17:42",  // Actual In-Block Time
  "aldt": "17:35",  // Actual Landing Time

  // Resources
  "gate": "B15",
  "stand": "B15",
  "terminal": "T1",
  "carouselNumber": "3",
  "checkInCounters": ["C10", "C11", "C12"],

  // Passenger counts
  "passengerCapacity": 175,
  "checkedInCount": 168,
  "boardedCount": 165,
  "baggageCount": 145,

  // Status
  "status": "DEPARTED",
  "delayCode": "93",  // Late incoming aircraft
  "delayMinutes": 15
}
```

### IATA Delay Codes

**Major Categories**:
- **01-09**: Passenger and baggage
- **11-18**: Cargo and mail
- **21-29**: Aircraft and equipment
- **31-39**: Technical and aircraft equipment
- **41-48**: Damage to aircraft
- **51-58**: Flight operations
- **61-68**: Weather
- **71-77**: Air traffic control
- **81-88**: Airport and government
- **91-99**: Reactionary (knock-on delays)

**Common Delay Codes**:
- **11**: Late check-in
- **14**: Baggage processing
- **31**: Aircraft defect
- **63**: Airport facilities
- **69**: Weather at destination
- **71**: ATC restrictions
- **93**: Late incoming aircraft (most common)

## Ground Handling & Turnaround

### Turnaround Coordination

**Turnaround Checklist**:
```typescript
{
  "flightNumber": "UA123",
  "aircraftRegistration": "N12345",
  "checklistType": "SHORT_HAUL",  // <60 minutes
  "targetDuration": 45,  // minutes
  "items": [
    {"task": "Chocks and cones", "status": "COMPLETED", "time": "14:32"},
    {"task": "Passenger deplaning", "status": "COMPLETED", "time": "14:35"},
    {"task": "Cargo unload", "status": "COMPLETED", "time": "14:40"},
    {"task": "Catering", "status": "IN_PROGRESS", "time": null},
    {"task": "Cleaning", "status": "IN_PROGRESS", "time": null},
    {"task": "Fueling", "status": "PENDING", "time": null},
    {"task": "Cargo loading", "status": "PENDING", "time": null},
    {"task": "Passenger boarding", "status": "PENDING", "time": null},
    {"task": "Final checks", "status": "PENDING", "time": null},
    {"task": "Pushback", "status": "PENDING", "time": null}
  ]
}
```

### Resource Allocation

**Ground Support Equipment (GSE)**:
```typescript
{
  "flightNumber": "UA123",
  "resources": [
    {"type": "GROUND_POWER_UNIT", "status": "ALLOCATED"},
    {"type": "AIR_STARTER_UNIT", "status": "ALLOCATED"},
    {"type": "POTABLE_WATER_TRUCK", "status": "COMPLETED"},
    {"type": "LAVATORY_SERVICE", "status": "COMPLETED"},
    {"type": "FUEL_TRUCK", "status": "IN_PROGRESS"},
    {"type": "CATERING_TRUCK", "status": "IN_PROGRESS"},
    {"type": "PASSENGER_STAIRS", "status": "ALLOCATED"},
    {"type": "TOW_TRUCK", "status": "REQUESTED"},
    {"type": "BAGGAGE_CART", "quantity": 3, "status": "ALLOCATED"}
  ]
}
```

## Security Screening

### TSA Integration

**Security Lanes**:
```typescript
{
  "laneNumber": "T1-SEC-01",
  "laneType": "STANDARD",
  "status": "OPEN",
  "capacity": 120,  // passengers/hour
  "currentWaitTime": 15,  // minutes
  "lastUpdated": "2024-01-15T08:30:00Z"
}
```

**Special Lanes**:
- **TSA PreCheck**: Expedited screening, keep shoes/belt on
- **CLEAR**: Biometric identity verification
- **Priority**: First class, elite status
- **Family**: Families with children

### Security Screening Record

```typescript
{
  "pnr": "ABC123",
  "passengerName": "SMITH/JOHN MR",
  "flightNumber": "UA123",
  "boardingPass": "M1SMITH/JOHN...",
  "knownTravelerNumber": "1234567890",  // TSA PreCheck
  "isSelectee": false,  // SSSS flag
  "isTsaPreCheck": true,
  "screeningResult": "CLEARED",
  "screenedAt": "2024-01-15T08:00:00Z",
  "processingTime": 45  // seconds
}
```

## Immigration & Customs (APIS)

### PAXLST - Passenger List Message

**IATA Format**:
```
APIS MESSAGE
PAXLST
UA/123/15JAN/DENLAX
.P/SMITH/JOHN/MR
.D/15JAN1985/M/USA
.N/P/123456789/USA/15JAN2025
.A/123 MAIN ST/DENVER/CO/80202/USA
```

**Message Elements**:
- Passenger full name
- Date of birth, gender
- Nationality
- Passport number and expiry
- Destination address

### Document Validation

```typescript
{
  "pnr": "ABC123",
  "passengerName": "SMITH/JOHN MR",
  "documentType": "PASSPORT",
  "documentNumber": "123456789",
  "issuingCountry": "USA",
  "nationality": "USA",
  "dateOfBirth": "1985-01-15",
  "gender": "M",
  "expiryDate": "2025-01-15",
  "destination": "LAX",
  "validatedAt": "2024-01-15T06:00:00Z",
  "validatedBy": "TIMATIC",
  "validationResult": "VALID"
}
```

## SITA Type B Messaging

### MVT - Movement Message

Reports actual departure/arrival times:

```
MVT
UA123/15JAN DENLAX
AD15JAN1618/AB15JAN1625
```

- **AD**: Actual departure time (off-block)
- **AB**: Actual take-off time (airborne)

At destination:
```
MVT
UA123/15JAN DENLAX
AA15JAN1735/AI15JAN1742
```

- **AA**: Actual arrival time (touchdown)
- **AI**: Actual in-block time

### LDM - Load Message

Manifest and load data:

```
LDM
UA123/15JAN DENLAX
-DENLAX.B738.N12345
.PAXDEP165/PAXARR0/PAXTHRU0
.BAGDEP145/BAGARR0/BAGTHRU0
.CARGODEP1250KG/CARGOARR0
.MAILDEP250KG/MAILARR0
```

### CPM - Current Passenger Message

Boarding count:

```
CPM
UA123/15JAN DENLAX
.PAXBRD165/PAXCAP175
```

- **PAXBRD**: Passengers boarded
- **PAXCAP**: Aircraft capacity

### PSM - Passenger Service Message

Special handling requirements:

```
PSM
UA123/15JAN DENLAX
.WCHR/2 WHEELCHAIRS
.UMNR/1 UNACCOMPANIED MINOR
.PETC/1 PET IN CABIN
```

### SLS - Seat Loading Summary

Seat allocation by cabin:

```
SLS
UA123/15JAN DENLAX
.Y/SEE150/CAP162
.C/SEE8/CAP12
.F/SEE4/CAP4
```

### ASM - Ad-Hoc Schedule Message

Schedule changes:

```
ASM
UA123/15JAN DENLAX
.DEP1600/1615 DELAYED
.REASON LATE INCOMING AIRCRAFT
.NEW GATE B20
```

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for REST APIs
- **Database**: PostgreSQL with Prisma ORM
- **Message Queue**: RabbitMQ + MQTT for airport systems
- **Cache**: Redis for session management
- **Job Queue**: Bull for background processing

### Airport System Protocols
- **TCP/IP**: CUTE/CUPPS workstation communication
- **UDP**: Real-time FIDS updates
- **MQTT**: IoT device communication (sensors, kiosks)
- **SOAP/XML**: Legacy airport system APIs
- **REST**: Modern API integration

### Biometric Processing
- **Face Recognition**: Azure Cognitive Services / face-api.js
- **Image Processing**: Sharp for image optimization
- **Encryption**: AES-256 for biometric templates

### Hardware Integration
- **Printers**: Thermal printers (boarding pass, bag tags)
- **Scanners**: Barcode/QR code scanners
- **Scales**: Weight scales via serial/USB
- **Kiosks**: CUSS-compliant platforms
- **SerialPort**: Node SerialPort for hardware communication

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure airport systems
# CUTE_ENDPOINT=tcp://cute.airport.local:1234
# BHS_ENDPOINT=tcp://bhs.airport.local:5678
# SITA_ADDRESS=DENUA

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Start workers
npm run worker:bhs      # Baggage message processor
npm run worker:fids     # FIDS updater
npm run worker:aodb     # AODB sync
npm run worker:messaging # SITA messaging
```

## API Endpoints

### Common-Use Platforms
```
POST /api/cute/session/start
POST /api/cute/session/end
POST /api/cute/transaction
GET  /api/counters/status
```

### Self-Service
```
POST /api/kiosk/session/start
POST /api/kiosk/checkin
POST /api/kiosk/print/boardingpass
POST /api/bagdrop/accept
```

### Baggage
```
POST /api/baggage/bsm
POST /api/baggage/track
GET  /api/baggage/:tagNumber/status
```

### Biometrics
```
POST /api/biometric/enroll
POST /api/biometric/verify
DELETE /api/biometric/:enrollmentId
```

### Gates
```
GET  /api/gates/available
POST /api/gates/assign
PUT  /api/gates/:gateNumber/status
```

### FIDS
```
POST /api/fids/update
GET  /api/fids/displays
```

### SITA Messaging
```
POST /api/sita/mvt
POST /api/sita/ldm
POST /api/sita/cpm
```

## Performance Targets

- **CUTE Response Time**: <200ms
- **Kiosk Transaction**: <30 seconds end-to-end
- **Bag Drop Processing**: <45 seconds
- **Biometric Verification**: <1 second
- **FIDS Update Propagation**: <2 seconds
- **Gate Assignment**: <500ms
- **BHS Message Processing**: <100ms
- **Availability**: 99.95% uptime

## Security

- **Authentication**: Multi-factor for agent access
- **Authorization**: Role-based access control
- **Encryption**: TLS 1.3 for all communications
- **Biometric Data**: AES-256 encryption, auto-delete
- **Audit Logging**: All transactions logged
- **Network Segmentation**: Isolated airport networks

## Compliance

- **IATA Standards**: Full compliance with IATA specifications
- **CUSS 2.0**: Certified for common-use kiosks
- **BCBP**: Bar Coded Boarding Pass format
- **Type B Messaging**: IATA cargo messaging standards
- **Biometric Privacy**: GDPR, CCPA, local regulations
- **Airport Security**: TSA, EU regulations

---

**Note**: Airport integration is critical for operational efficiency. This service provides the foundational connectivity to airport infrastructure enabling seamless passenger processing, baggage handling, and operational coordination.
