# Boarding Service - Gate Boarding Operations

Real-time gate boarding management service with barcode scanning, zone-based boarding, biometric integration, and comprehensive analytics for on-time performance optimization.

## Overview

The Boarding Service manages all gate boarding operations from pre-boarding through door closure. It provides real-time boarding pass scanning with <2 second processing time, zone-based boarding management, duplicate prevention, and comprehensive analytics for operational efficiency.

**Target Performance**: <2 seconds boarding pass scan processing time

## Key Features

### 1. Boarding Management

#### Boarding Pass Scanning
- **Barcode Support**: PDF417, QR Code, Code 128, Aztec, Data Matrix
- **IATA BCBP Format**: Standard M-format boarding pass barcodes
- **Processing Time**: <2 seconds target from scan to validation
- **Consecutive Scans**: High-throughput scanning for rapid boarding
- **Validation**:
  - Barcode integrity check
  - Flight verification
  - Gate verification
  - Expiration check
  - Duplicate detection

#### Real-Time Passenger Count
- Live boarding progress tracking
- Cabin class breakdown (First, Business, Premium Economy, Economy)
- Expected vs. actual passenger counts
- No-show tracking
- Standby clearance tracking

#### Seat Verification
- Actual vs. expected seat matching
- Seat conflict detection
- Last-minute seat change tracking
- Upgrade verification

#### Duplicate Boarding Prevention
- Configurable duplicate detection window (default: 5 minutes)
- Duplicate scan alerting
- Rescan authorization workflow
- Audit trail for all scans

#### Boarding Priority Enforcement
- Zone-based boarding rules
- Priority group enforcement
- Elite status recognition
- Family boarding coordination

#### Special Needs Flagging
- Wheelchair passengers
- Unaccompanied minors (UMNR)
- Medical assistance requirements
- VIP handling
- Pet in cabin

### 2. Boarding Zones

#### Zone-Based Boarding Configuration
- **Configurable Zones**: 1-9 boarding zones per flight
- **Zone Sequencing**: Custom order per airline preference
- **Default Sequence**: Premium → Elite → Priority → General → Basic
- **Zone Eligibility**:
  - Cabin class matching
  - Fare class restrictions
  - Frequent flyer tier
  - Special conditions

#### Priority Boarding
- **First Class**: Zone 1 (pre-board)
- **Business Class**: Zone 1
- **Premium Economy**: Zone 2
- **Elite Platinum**: Zone 2
- **Elite Gold**: Zone 3
- **Elite Silver**: Zone 4
- **Disability**: Pre-board with priority
- **Family**: Configurable (default: Zone 2)
- **Military**: Priority boarding

#### Family Boarding
- Families with children under 2
- Board between premium and general zones
- Adjacent seat assignment verification
- Stroller handling coordination

#### Zone Sequencing
- Automated zone announcements
- Zone timing based on passenger count
- Dynamic zone adjustments
- Back-to-front optimization (optional)

#### Boarding Announcement Triggers
- Automated announcements when zone opens
- Final call announcements
- Delay announcements
- Gate change notifications

### 3. Gate Management

#### Flight Load at Gate
- **Passenger Counts**:
  - Total passengers
  - Boarded passengers
  - Remaining passengers
  - Standby passengers
  - No-show passengers
- **Cabin Breakdown**:
  - First class: Boarded vs. expected
  - Business class: Boarded vs. expected
  - Premium economy: Boarded vs. expected
  - Economy: Boarded vs. expected

#### Last-Minute Seat Changes
- Gate agent seat reassignment
- Upgrade processing
- Downgrade handling
- Seat swap coordination
- Weight and balance impact assessment

#### Standby Passenger Processing
- Priority-based standby list
- Automatic clearance when seats available
- Manual clearance workflow
- Upgrade vs. revenue seat management
- Denied boarding compensation calculation

#### Upgrade Processing at Gate
- Last-minute upgrade offers
- Revenue management integration
- Cabin class availability check
- Payment processing
- Boarding pass reissue

#### Weight and Balance Considerations
- Load sheet integration
- Weight distribution tracking
- Trim calculations
- Last-minute passenger moves for balance
- Cargo coordination

#### Door Closure Coordination
- Automated door closure warning (default: 10 minutes)
- Final manifest generation
- All passengers boarded verification
- Baggage reconciliation
- Departure clearance

### 4. Boarding Analytics

#### Boarding Speed Metrics
- **Passengers Per Minute**: Real-time calculation
- **Average Scan Interval**: Time between consecutive scans
- **Peak Boarding Speed**: Maximum throughput achieved
- **Processing Time**: Average barcode scan processing
- **Target Comparison**: Actual vs. target performance

#### On-Time Boarding Performance
- **Target Boarding Time**: Default 25 minutes
- **Actual Boarding Time**: Measured duration
- **Early Boarding**: Time ahead/behind schedule
- **Door Closure Time**: Scheduled vs. actual
- **On-Time Departure**: Impact of boarding on departure

#### Zone Effectiveness
- **Zone Compliance**: Passengers boarding in correct zone
- **Zone Violations**: Out-of-sequence boarding
- **Zone Duration**: Time spent boarding each zone
- **Zone Optimization**: Recommendations for improvement

#### Bottleneck Identification
- **Detection**: Automatic bottleneck detection
- **Location**: Which zone caused bottleneck
- **Duration**: How long bottleneck persisted
- **Cause**: Root cause analysis
- **Impact**: Effect on overall boarding time

#### Passenger Flow Optimization
- **Flow Score**: 0-100 rating of boarding efficiency
- **Queue Time**: Average time in boarding queue
- **Boarding Efficiency**: Percentage of optimal boarding
- **Recommendations**: AI-generated improvement suggestions

### 5. Operational Messaging

#### Gate Status Messages
- Gate assignment notifications
- Boarding start announcements
- Zone-by-zone announcements
- Final call warnings
- Door closure warnings

#### Boarding Completion Notification
- All passengers boarded confirmation
- Cabin crew notification
- Operations center notification
- Load planning update

#### Departure Ready Message
- All boarding complete
- Doors closed
- Load sheet finalized
- Clearance for pushback

#### No-Show Processing
- Automatic no-show marking (15 minutes before departure)
- Baggage offload coordination
- Standby passenger notification
- Revenue management update

#### Offload Coordination
- Passenger offload requests
- Medical emergencies
- Disruptive passenger removal
- Involuntary denied boarding

### 6. Display Integration

#### Gate Display Screens
- **Display Types**: LED, LCD, TV screens
- **Content**: Flight info, boarding status, zones
- **Update Rate**: Configurable (default: 5 seconds)
- **Multi-language**: Support for 8+ languages

#### Boarding Status Updates
- Current boarding zone
- Remaining passengers
- Boarding progress bar
- Estimated completion time

#### Passenger Notifications
- Personal name announcements
- Seat assignment displays
- Special assistance requests
- VIP notifications (discreet)

#### Queue Management Displays
- Virtual queue number
- Estimated wait time
- Zone opening times
- Service counter availability

### 7. Biometric Boarding

#### Facial Recognition Integration
- **Provider Support**: Vision-Box, SITA, NEC
- **Capture**: High-resolution facial image
- **Matching**: Against passport/visa photo
- **Confidence Score**: Minimum 95% threshold
- **Processing**: <1 second matching time

#### Touchless Boarding Flow
1. Passenger approaches biometric camera
2. Facial recognition capture
3. Match against travel document
4. Boarding pass validation
5. Automatic gate opening
6. Boarding confirmation

#### Document Verification
- Passport photo matching
- Visa verification
- Watch list screening
- Age verification

#### Biometric Matching
- One-to-one matching (boarding pass → photo)
- One-to-many matching (gallery search)
- Liveness detection (prevent photo spoofing)
- Fallback to manual verification

### 8. Special Handling

#### Priority Boarding Assistance
- Dedicated assistance lane
- Priority queue management
- Escort to aircraft
- Early boarding coordination

#### Wheelchair Boarding Coordination
- Pre-board timing
- Aisle wheelchair availability
- Seat assignment verification
- Onboard wheelchair stowage
- Deplaning assistance scheduling

#### Unaccompanied Minor Tracking
- UMNR identification at gate
- Parent/guardian handoff verification
- Cabin crew notification
- Seat assignment confirmation
- Receiving party coordination

#### VIP Handling
- Discreet VIP identification
- Dedicated boarding agent
- Lounge-to-gate escort
- Pre-board coordination
- Special service requests

### 9. APIs

#### Scan Boarding Pass API
```
POST /api/v1/boarding/scan
{
  "boardingPassNumber": "AA1234567",
  "barcodeData": "M1DOE/JOHN...",
  "gateNumber": "A12",
  "scannedBy": "agent-001"
}
```

**Response**:
```json
{
  "success": true,
  "scan": {
    "id": "scan-123",
    "isValid": true,
    "validationStatus": "VALID",
    "processingTime": 1850
  },
  "passenger": {
    "name": "John Doe",
    "seatNumber": "12A",
    "boardingZone": 3
  }
}
```

#### Boarding Status API
```
GET /api/v1/boarding/status/:flightId
```

**Response**:
```json
{
  "flightId": "AA100-2024-01-15",
  "gateNumber": "A12",
  "boardingStatus": "GENERAL_BOARDING",
  "currentZone": 3,
  "totalPassengers": 150,
  "boardedPassengers": 87,
  "remainingPassengers": 63,
  "boardingSpeed": 8.2,
  "estimatedCompletion": "2024-01-15T14:25:00Z"
}
```

#### Passenger Manifest API
```
GET /api/v1/boarding/manifest/:flightId
```

**Response**: Complete passenger list with boarding status

#### Gate Assignment API
```
POST /api/v1/boarding/gate/assign
{
  "flightId": "AA100",
  "gateNumber": "A12",
  "assignedBy": "ops-001"
}
```

#### Boarding Analytics API
```
GET /api/v1/boarding/analytics/:flightId
```

**Response**: Comprehensive boarding metrics and analytics

### 10. Hardware Integration

#### Boarding Pass Scanners
- **2D Barcode Readers**:
  - Zebra DS8100 Series
  - Honeywell Granit 1981i
  - Datalogic Gryphon GD4500
- **Connectivity**: USB, Bluetooth, WiFi
- **Scan Rate**: Up to 60 scans per second
- **Durability**: IP54 rated, drop resistant

#### Gate Displays
- **LED Displays**: 32-60 inch high-brightness
- **LCD/TV**: 42-75 inch commercial displays
- **Integration**: HDMI, DisplayPort, Network
- **Content**: HTML5, custom protocols
- **Updates**: WebSocket real-time updates

#### Biometric Cameras
- **Facial Recognition Cameras**:
  - Vision-Box Orchestra
  - NEC NeoFace
  - SITA Smart Path
- **Resolution**: 1080p minimum
- **Frame Rate**: 30 FPS
- **Lighting**: IR illumination for low light
- **Coverage**: 1-3 meter range

#### Door Sensors
- **Magnetic Sensors**: Door open/closed detection
- **Integration**: Building management system
- **Alerts**: Door ajar warnings
- **Automation**: Automatic door closure triggers

## Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- pnpm (workspace manager)

### Setup

1. **Install dependencies**:
```bash
cd services/boarding-service
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

See `.env.example` for complete configuration options.

### Key Settings

**Boarding Configuration**:
```env
TARGET_SCAN_PROCESSING_TIME_MS=2000
ENABLE_DUPLICATE_PREVENTION=true
DUPLICATE_SCAN_TIMEOUT_SECONDS=300
ENABLE_SEAT_VERIFICATION=true
ENABLE_PRIORITY_ENFORCEMENT=true
```

**Boarding Zones**:
```env
ENABLE_ZONE_BASED_BOARDING=true
DEFAULT_BOARDING_ZONES=5
ZONE_SEQUENCE=premium,elite,priority,general,basic
ENABLE_FAMILY_BOARDING=true
```

**Performance Targets**:
```env
TARGET_BOARDING_TIME_MINUTES=25
TARGET_PASSENGERS_PER_MINUTE=8
EARLY_BOARDING_MINUTES=40
FINAL_CALL_MINUTES=15
```

**Biometric Boarding**:
```env
ENABLE_BIOMETRIC_BOARDING=false
BIOMETRIC_CONFIDENCE_THRESHOLD=0.95
ENABLE_TOUCHLESS_BOARDING=false
```

## Usage Examples

### Start Boarding
```typescript
POST /api/v1/boarding/start
{
  "flightId": "AA100-2024-01-15-JFK-LAX",
  "gateNumber": "A12",
  "agentId": "agent-001"
}
```

### Scan Boarding Pass
```typescript
POST /api/v1/boarding/scan
{
  "boardingPassNumber": "AA1234567",
  "barcodeData": "M1DOE/JOHN          EABC123 JFKLAX AA 0100 015Y012A0001 148",
  "gateNumber": "A12",
  "scannedBy": "agent-001",
  "scannerDevice": "scanner-gate-a12"
}
```

### Complete Boarding
```typescript
POST /api/v1/boarding/complete
{
  "flightId": "AA100-2024-01-15-JFK-LAX",
  "gateNumber": "A12",
  "completedBy": "agent-001"
}
```

## Performance Metrics

### Target Metrics
- **Scan Processing Time**: <2 seconds
- **Boarding Time**: 25 minutes for 150 passengers
- **Boarding Speed**: 8 passengers per minute
- **Zone Compliance**: >90%
- **Duplicate Detection**: >99%
- **On-Time Boarding**: >95%

### Achieved Metrics (Industry Average)
- Scan processing: 1.8 seconds average
- Boarding time: 23 minutes average
- Boarding speed: 6.5 pax/min without zones, 8.2 pax/min with zones
- Zone compliance: 87% average
- Duplicate prevention: 99.7% effective

## WebSocket Events

### Client → Server
- `join:flight` - Join flight room for updates
- `join:gate` - Join gate room for updates

### Server → Client
- `boarding:scan` - New boarding pass scanned
- `boarding:status` - Boarding status updated
- `boarding:zone` - Zone announcement
- `gate:statistics` - Real-time statistics update

## Monitoring & Logging

### Metrics
- Boarding pass scans per minute
- Average processing time
- Duplicate scan rate
- Zone compliance rate
- On-time boarding percentage

### Logs
- All boarding scans (configurable)
- Validation failures
- Duplicate detections
- Zone violations
- Performance warnings

### Health Check
```
GET /health
```

Returns service status, database connectivity, Redis connectivity.

## Security

### Authentication
- JWT token-based authentication
- Agent role verification
- Audit logging for all scans

### Data Protection
- PII encryption at rest
- Secure barcode data handling
- Biometric data encryption
- GDPR compliance

### Audit Trail
- All boarding scans logged
- Agent actions tracked
- Configuration changes logged
- 365-day retention

## Troubleshooting

### Slow Scan Processing
- Check Redis connectivity
- Review database query performance
- Verify network latency to external services
- Check scanner hardware performance

### Duplicate False Positives
- Adjust `DUPLICATE_SCAN_TIMEOUT_SECONDS`
- Review duplicate detection logic
- Check system clock synchronization

### Zone Violations
- Verify zone configuration
- Review priority group settings
- Check fare class mappings
- Adjust zone sequence

## Support

For technical support:
- Email: support@airline-ops.com
- Documentation: https://docs.airline-ops.com
- Issue Tracker: https://github.com/airline-ops/pss-platform/issues

## License

Proprietary - Airline Operations Platform
