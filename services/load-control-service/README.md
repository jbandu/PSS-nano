# Load Control Service

Aircraft weight and balance calculation service for flight safety and operational optimization.

## Overview

The Load Control Service is a **critical flight safety system** that calculates aircraft weight and center of gravity (CG) to ensure safe flight operations. This service integrates with DCS, baggage, fuel, and flight operations systems to provide real-time weight and balance calculations, load optimization, and IATA-compliant load sheet generation.

## 🔴 Safety Critical

This service directly impacts flight safety. All calculations must meet:
- FAA/EASA regulatory requirements
- Aircraft manufacturer specifications
- Airline operating procedures
- IATA standards

## Features

### 1. Weight Calculation

#### Passenger Weights
- **Standard weights** per IATA recommendations (adult, child, infant)
- **Seasonal adjustments** for winter clothing (+4kg)
- **Actual weights** from check-in scales (when available)
- **Gender-based** calculations (male/female averages)
- **Regional variations** support

#### Baggage Weights
- **Checked baggage** with actual weights from baggage system
- **Carry-on baggage** estimates
- **Special baggage** (sports equipment, oversized)
- **Excess baggage** tracking

#### Cargo Weights
- **Compartment-based** tracking (forward, aft, bulk)
- **Container weights** (LD3, LD3-45, LD2, etc.)
- **Bulk cargo** handling
- **Mail and freight** separation

#### Fuel Weights
- **Multi-tank** fuel distribution
- **Center tank** and wing tanks
- **Fuel sequence** tracking (burn order)
- **Taxi fuel** and trip fuel calculations
- **Reserve fuel** requirements

#### Operational Weights
- **Crew weights** (pilots + cabin crew)
- **Catering** by cabin class
- **Duty-free carts**
- **Galley equipment**
- **Emergency equipment**
- **Potable water** and lavatory fluids

### 2. Balance Calculation

#### Center of Gravity (CG)
- **CG position** calculation as % MAC (Mean Aerodynamic Chord)
- **Moment arm** calculations for all load items
- **CG envelope** validation against aircraft limits
- **Forward/aft balance** optimization
- **Lateral balance** enforcement (left/right wing weight difference)

#### CG Calculation Method

```
CG (% MAC) = ((Σ(Weight × Moment Arm)) / Total Weight - LEMAC) / MAC Length × 100

Where:
- LEMAC = Leading Edge of Mean Aerodynamic Chord
- MAC Length = Mean Aerodynamic Chord length
- Moment Arm = Distance from reference datum
```

#### CG Envelope Limits

Aircraft have forward and aft CG limits that vary by weight:

```
Boeing 737-800 Example:
Weight (kg)    Forward Limit    Aft Limit
40,000         8.0% MAC        35.0% MAC
62,000         12.0% MAC       36.0% MAC
79,000         15.0% MAC       37.0% MAC
```

The service interpolates between these points for accurate limit checking.

### 3. Load Planning

#### Passenger Distribution
- **Zone-based** seating distribution
- **Cabin class** separation (First, Business, Economy)
- **Moment arms** per seat row
- **Special seating** (exit rows, bassinet seats)

#### Cargo/Baggage Compartment Loading
- **Compartment capacity** limits (weight and volume)
- **Floor load limits** enforcement (kg/m²)
- **Container placement** optimization
- **Structural limits** validation

#### Fuel Distribution
- **Tank sequencing** (which tanks to use first)
- **Lateral balance** via symmetric wing tank loading
- **Center tank** usage for CG control
- **Fuel burn** impact on CG during flight

#### Ballast Requirements
- **Automatic ballast calculation** when CG out of limits
- **Ballast placement** recommendations
- **Water ballast** vs permanent ballast

### 4. Load Sheet Generation

#### IATA Standard Load Sheet
```
LOAD SHEET
-----------
Flight: AA100    Date: 18NOV25    Aircraft: B738    REG: N12345

WEIGHTS (KG)
Dry Operating Weight (DOW):      41,500
Passengers:          140  Adult    11,760
                      10  Child       350
                       5  Infant       50
Baggage:             155 Bags      3,565
Cargo:               Forward      2,000
                     Aft          1,500
                     Bulk           300
Zero Fuel Weight (ZFW):           60,025
Fuel:                Center       6,000
                     Left Wing    3,500
                     Right Wing   3,500
Takeoff Weight (TOW):             73,025

CENTER OF GRAVITY
ZFW CG:   24.5% MAC
TOW CG:   26.8% MAC
Limits:   12.0% - 36.0% MAC

COMPARTMENT LOADING
Forward:   2,000 kg  (Max: 10,000 kg)
Aft:       1,500 kg  (Max:  8,232 kg)
Bulk:        300 kg  (Max:  3,000 kg)

UNDERLOAD/OVERLOAD: NIL
```

#### Enhanced Digital Load Sheet
- **Real-time updates** during loading
- **Last-minute changes** tracking
- **Door closure snapshot**
- **Final trim** calculations

#### Pilot Briefing Information
- **Performance limitations** due to weight
- **Takeoff speeds** (V1, VR, V2)
- **Fuel burn estimates**
- **Alternate requirements**
- **Special considerations** (heavy cargo, CG near limits)

### 5. Aircraft Configurations

Pre-configured aircraft types with accurate data:

#### Boeing 737-800 (B738)
- **MTOW**: 79,016 kg
- **MLW**: 66,361 kg
- **MZFW**: 62,732 kg
- **Seats**: 189 (12 Business + 177 Economy)
- **Cargo**: 21,232 kg capacity
- **Fuel**: 26,022 kg capacity

#### Airbus A320-200 (A320)
- **MTOW**: 78,000 kg
- **MLW**: 67,400 kg
- **MZFW**: 62,500 kg
- **Seats**: 180 (12 Business + 168 Economy)
- **Cargo**: 19,900 kg capacity
- **Fuel**: 24,210 kg capacity

Each configuration includes:
- Detailed weight limits
- CG envelope (forward/aft limits by weight)
- Seating zones with moment arms
- Cargo compartment specifications
- Fuel tank configuration
- Empty operating weight and index

### 6. Operational Limits Enforcement

#### Maximum Takeoff Weight (MTOW)
- **Hard limit** enforcement
- **Runway-specific** MTOW (performance-limited)
- **Temperature-adjusted** MTOW
- **Altitude-adjusted** MTOW

#### Maximum Landing Weight (MLW)
- **Estimated landing weight** calculation
- **Fuel burn** estimation
- **Alternate fuel** consideration

#### Maximum Zero Fuel Weight (MZFW)
- **Payload limitation**
- **Structural limit** enforcement

#### Structural Limits
- **Floor load limits** per compartment
- **Maximum compartment** weights
- **Container limits**

#### CG Limits
- **Forward limit** checking
- **Aft limit** checking
- **In-flight CG shift** due to fuel burn

### 7. Load Optimization

#### Optimization Targets
- **Balance optimization** (CG centered)
- **Fuel efficiency** (minimize drag)
- **Turnaround time** (fastest loading)
- **Mixed** (balanced approach)

#### Passenger Reseating Suggestions
```typescript
{
  "recommendation": "RESEAT_PASSENGERS",
  "reason": "CG_AFT_OF_LIMIT",
  "passengers_to_move": [
    {
      "from_seat": "35A",
      "to_seat": "8A",
      "passenger": "John Smith",
      "weight_impact": -15.2 // kg·m moment change
    },
    // ...up to 10 passengers
  ],
  "cg_before": "37.2% MAC",
  "cg_after": "35.8% MAC",
  "within_limits": true
}
```

#### Cargo Redistribution
- **Move cargo** between compartments
- **Optimize container** placement
- **Ballast recommendations**

#### Fuel Load Optimization
- **Minimum required** fuel
- **CG optimization** via tank selection
- **Cost index** consideration

### 8. Integration Points

#### DCS Integration
```typescript
GET /api/dcs/flight/{flightId}/passenger-count
Response: {
  adults: 140,
  children: 10,
  infants: 5,
  total: 155,
  by_cabin: {
    business: 12,
    economy: 143
  },
  by_zone: {
    "1-5": 30,
    "6-15": 54,
    "16-25": 48,
    "26-35": 23
  }
}
```

#### Baggage System Integration
```typescript
GET /api/baggage/flight/{flightId}/weights
Response: {
  checked_bags: 155,
  total_weight_kg: 3565,
  by_compartment: {
    forward: 2000,
    aft: 1500,
    bulk: 65
  },
  heavy_bags: [
    { tag: "0001234567", weight: 32.5, compartment: "forward" }
  ]
}
```

#### Fuel System Integration
```typescript
GET /api/fuel/flight/{flightId}/uplift
Response: {
  total_kg: 13000,
  by_tank: {
    center: 6000,
    left_wing: 3500,
    right_wing: 3500
  },
  density: 0.8,  // kg/L
  temperature: 15  // °C
}
```

#### Flight Operations Integration
```typescript
POST /api/flight-ops/load-sheet
Body: {
  flight_id: "AA100-20251118",
  load_sheet: { ... },
  cg_position: 26.8,
  within_limits: true,
  warnings: [],
  clearance: "APPROVED"
}
```

### 9. Regulatory Compliance

#### FAA Requirements (14 CFR Part 121)
- § 121.135: Aircraft weight and balance program
- § 121.693: Load manifest
- Standard passenger weights (summer/winter)

#### EASA Requirements (EU-OPS)
- ORO.GEN.110: Operator responsibilities
- CAT.GEN.MPA.180: Mass and balance
- Standard masses for passengers and baggage

#### Airline-Specific Procedures
- Company-defined standard weights
- Seasonal weight adjustments
- Regional variations
- Special handling procedures

#### Aircraft Manufacturer Limits
- Boeing D6-XXXX Weight & Balance Manual
- Airbus AOM Weight & Balance
- Bombardier, Embraer specifications

### 10. Reporting & Analytics

#### Weight and Balance Trend Analysis
- **Historical CG** positions
- **Weight trends** over time
- **Payload efficiency**
- **Fuel efficiency correlation**

#### Loading Efficiency Metrics
- **Compartment utilization** percentage
- **Payload vs maximum** payload
- **Optimization opportunities**

#### Turnaround Time Impact
- **Loading time** vs weight/balance
- **Last-minute changes** frequency
- **Delay causes** related to weight/balance

## API Endpoints

### Weight & Balance Calculation

```http
POST /api/v1/load-control/calculate
Content-Type: application/json

{
  "flight_id": "AA100-20251118",
  "aircraft_type": "B738",
  "passengers": {
    "adults": 140,
    "children": 10,
    "infants": 5,
    "by_class": {
      "business": 12,
      "economy": 143
    },
    "by_zone": {
      "business": 12,
      "economy-front": 54,
      "economy-mid": 60,
      "economy-rear": 29
    }
  },
  "baggage": {
    "checked_bags": 155,
    "actual_weight_kg": 3565,
    "by_compartment": {
      "forward": 2000,
      "aft": 1500,
      "bulk": 65
    }
  },
  "cargo": {
    "forward": 0,
    "aft": 0,
    "bulk": 300
  },
  "fuel": {
    "center": 6000,
    "left_wing": 3500,
    "right_wing": 3500
  },
  "crew": {
    "pilots": 2,
    "cabin_crew": 5
  },
  "use_winter_weights": false,
  "taxi_fuel_kg": 200,
  "trip_fuel_kg": 10000
}

Response 200 OK:
{
  "weights": {
    "empty_operating_weight": 41500,
    "passengers": 12160,
    "baggage": 3565,
    "cargo": 300,
    "fuel": 13000,
    "operational": 780,
    "payload": 16025,
    "zero_fuel_weight": 58305,
    "ramp_weight": 71305,
    "takeoff_weight": 71105,
    "estimated_landing_weight": 61105,
    "units": "KG"
  },
  "balance": {
    "zfw_cg": 24.5,
    "tow_cg": 26.8,
    "cg_units": "MAC",
    "forward_limit": 12.0,
    "aft_limit": 36.0,
    "within_limits": true,
    "lateral_balance_kg": 0,
    "lateral_within_limits": true
  },
  "limits_check": {
    "mtow_ok": true,
    "mlw_ok": true,
    "mzfw_ok": true,
    "cg_ok": true,
    "all_limits_ok": true
  },
  "violations": [],
  "warnings": [
    "Close to MTOW limit (margin: 1911 kg)"
  ]
}
```

### Load Optimization

```http
POST /api/v1/load-control/optimize
Content-Type: application/json

{
  "flight_id": "AA100-20251118",
  "current_load": { ... },
  "optimization_target": "BALANCE",
  "allow_passenger_reseating": true,
  "max_passengers_to_reseat": 10
}

Response 200 OK:
{
  "optimization_applied": true,
  "changes": {
    "passenger_reseating": [
      {
        "passenger_id": "PAX123",
        "from_seat": "35A",
        "to_seat": "8A",
        "reason": "CG_OPTIMIZATION"
      }
    ],
    "cargo_redistribution": [
      {
        "from_compartment": "aft",
        "to_compartment": "forward",
        "weight_kg": 500
      }
    ]
  },
  "cg_before": 37.2,
  "cg_after": 35.8,
  "improvement_percent": 4.2
}
```

### Load Sheet Generation

```http
GET /api/v1/load-control/load-sheet/{flightId}
Accept: application/json

Response 200 OK:
{
  "flight_id": "AA100-20251118",
  "aircraft_type": "B738",
  "registration": "N12345",
  "date": "2025-11-18T10:00:00Z",
  "format": "IATA_STANDARD",
  "weights": { ... },
  "balance": { ... },
  "compartments": { ... },
  "clearance": "APPROVED",
  "generated_at": "2025-11-18T09:45:00Z",
  "generated_by": "SYSTEM"
}
```

```http
GET /api/v1/load-control/load-sheet/{flightId}
Accept: application/pdf

Response 200 OK (PDF document)
```

### Manual Override

```http
POST /api/v1/load-control/override
Content-Type: application/json

{
  "flight_id": "AA100-20251118",
  "override_type": "CG_POSITION",
  "calculated_value": 37.2,
  "override_value": 35.8,
  "justification": "Cargo moved from aft to forward compartment after calculation",
  "authority_level": "LOAD_MASTER",
  "authorized_by": "USER123"
}

Response 200 OK:
{
  "override_id": "OVR123",
  "approved": true,
  "audit_logged": true
}
```

## Configuration

See `.env.example` for all configuration options (150+ settings).

Key configurations:
- Weight standards (passenger, baggage, crew)
- CG calculation method
- Optimization settings
- Regulatory compliance
- Integration endpoints
- Safety margins
- Manual override policies

## Installation

```bash
cd services/load-control-service
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Algorithms

### CG Calculation Algorithm

```typescript
function calculateCG(loads: Load[], aircraftConfig: AircraftType): number {
  // Calculate total moment (weight × moment arm)
  const totalMoment = loads.reduce((sum, load) => {
    return sum + (load.weight * load.momentArm);
  }, 0);
  
  // Calculate total weight
  const totalWeight = loads.reduce((sum, load) => sum + load.weight, 0);
  
  // Calculate CG position from datum
  const cgFromDatum = totalMoment / totalWeight;
  
  // Convert to % MAC
  const cgPercent = ((cgFromDatum - aircraftConfig.cgEnvelope.macLeadingEdge) / 
                     aircraftConfig.cgEnvelope.macLength) * 100;
  
  return cgPercent;
}
```

### CG Limit Interpolation

```typescript
function interpolateCGLimit(weight: number, limits: CGLimit[]): number {
  // Sort limits by weight
  const sorted = limits.sort((a, b) => a.weight - b.weight);
  
  // Find surrounding limits
  let lowerLimit = sorted[0];
  let upperLimit = sorted[sorted.length - 1];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (weight >= sorted[i].weight && weight <= sorted[i + 1].weight) {
      lowerLimit = sorted[i];
      upperLimit = sorted[i + 1];
      break;
    }
  }
  
  // Linear interpolation
  const weightRange = upperLimit.weight - lowerLimit.weight;
  const cgRange = upperLimit.cgPosition - lowerLimit.cgPosition;
  const weightDiff = weight - lowerLimit.weight;
  
  return lowerLimit.cgPosition + (weightDiff / weightRange) * cgRange;
}
```

### Load Optimization Algorithm

```typescript
function optimizeLoad(currentLoad: LoadData): Optimization {
  const currentCG = calculateCG(currentLoad);
  const targetCG = (forwardLimit + aftLimit) / 2; // Center of envelope
  
  if (currentCG < forwardLimit) {
    // CG too far forward - move weight aft
    return suggestMoveWeightAft(currentLoad);
  } else if (currentCG > aftLimit) {
    // CG too far aft - move weight forward
    return suggestMoveWeightForward(currentLoad);
  }
  
  // Within limits - optimize for fuel efficiency
  return optimizeForFuelEfficiency(currentLoad);
}
```

## Safety & Validation

### Pre-Departure Checks
1. ✅ All weights within limits (MTOW, MLW, MZFW)
2. ✅ CG within envelope
3. ✅ Lateral balance acceptable
4. ✅ Compartment loads within limits
5. ✅ Floor loads within limits
6. ✅ Load sheet approved

### Critical Alerts
- 🔴 **MTOW EXCEEDED** - Cannot depart
- 🔴 **CG OUT OF LIMITS** - Cannot depart
- 🔴 **MZFW EXCEEDED** - Reduce payload
- 🟡 **Close to limit** - Warning only

## Performance

- Load calculation: <100ms
- CG calculation: <50ms
- Load sheet generation: <200ms
- Optimization: <500ms

## License

UNLICENSED - Internal use only

## Support

For questions or issues related to load control, contact:
- Flight Operations: ops@airline.com
- Load Control Team: loadcontrol@airline.com
- Technical Support: tech@airline.com

---

**⚠️ SAFETY NOTICE**: This system is critical to flight safety. Any modifications must be thoroughly tested and approved by the Chief Pilot and regulatory authorities before deployment.
