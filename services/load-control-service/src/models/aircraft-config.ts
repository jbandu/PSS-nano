/**
 * Aircraft Configuration Models
 * 
 * Defines the physical and operational characteristics of aircraft types.
 * Critical for accurate weight and balance calculations.
 */

export interface AircraftType {
  id: string;
  iataCode: string; // e.g., "738" for Boeing 737-800
  icaoCode: string; // e.g., "B738"
  manufacturer: string;
  model: string;
  variant?: string;
  
  // Weight Limits (kg)
  weights: AircraftWeights;
  
  // Center of Gravity Envelope
  cgEnvelope: CGEnvelope;
  
  // Seating Configuration
  seating: SeatingConfiguration;
  
  // Cargo Compartments
  cargo: CargoConfiguration;
  
  // Fuel Tanks
  fuel: FuelConfiguration;
  
  // Empty Operating Weight
  emptyOperatingWeight: number; // DOW - Dry Operating Weight (kg)
  emptyOperatingIndex: number; // Empty CG index
  
  // Additional characteristics
  passengerCapacity: number;
  crewCapacity: number;
}

export interface AircraftWeights {
  // Maximum weights
  maxTakeoffWeight: number; // MTOW (kg)
  maxLandingWeight: number; // MLW (kg)
  maxZeroFuelWeight: number; // MZFW (kg)
  maxRampWeight: number; // Maximum weight for taxi
  
  // Operating empty weight
  basicOperatingWeight: number; // BOW (kg)
  dryOperatingWeight: number; // DOW (kg)
  
  // Maximum payload
  maxPayload: number;
  maxFuelCapacity: number; // kg
}

export interface CGEnvelope {
  // CG limits as % MAC (Mean Aerodynamic Chord)
  forwardLimit: CGLimit[];
  aftLimit: CGLimit[];
  
  // Reference datum
  datum: number; // meters from nose
  
  // Mean Aerodynamic Chord
  macLength: number; // meters
  macLeadingEdge: number; // meters from datum
  
  // Units
  units: 'MAC' | 'METERS' | 'INCHES';
}

export interface CGLimit {
  weight: number; // kg
  cgPosition: number; // % MAC or meters/inches
}

export interface SeatingConfiguration {
  zones: SeatZone[];
  totalSeats: number;
  
  // Seat pitch (for weight distribution)
  economySeatPitch: number; // cm
  businessSeatPitch: number; // cm
  firstSeatPitch: number; // cm
}

export interface SeatZone {
  zoneId: string;
  name: string; // e.g., "Zone A", "Business Cabin"
  cabinClass: 'FIRST' | 'BUSINESS' | 'PREMIUM_ECONOMY' | 'ECONOMY';
  
  // Row range
  startRow: number;
  endRow: number;
  
  // Number of seats in this zone
  seatCount: number;
  
  // Station (distance from datum in meters)
  station: number;
  
  // Moment arm for CG calculation
  momentArm: number; // meters
}

export interface CargoConfiguration {
  compartments: CargoCompartment[];
  totalCapacity: number; // kg
  totalVolume: number; // cubic meters
}

export interface CargoCompartment {
  compartmentId: string;
  name: string; // e.g., "Forward Cargo", "Aft Cargo", "Bulk"
  
  // Position
  station: number; // meters from datum
  momentArm: number; // meters
  
  // Capacity
  maxWeight: number; // kg
  maxVolume: number; // cubic meters
  
  // Structural limits
  floorLoadLimit: number; // kg per square meter
  
  // Characteristics
  isHeated: boolean;
  isPressurized: boolean;
  isBulk: boolean; // Bulk vs containerized
  
  // Container specifications (if applicable)
  containerType?: string; // e.g., "LD3", "LD3-45", "LD2"
  maxContainers?: number;
}

export interface FuelConfiguration {
  tanks: FuelTank[];
  totalCapacity: number; // kg
  usableCapacity: number; // kg (excluding unusable fuel)
}

export interface FuelTank {
  tankId: string;
  name: string; // e.g., "Center Tank", "Left Wing", "Right Wing"
  
  // Position
  station: number; // meters from datum
  momentArm: number; // meters
  
  // Capacity
  maxCapacity: number; // kg
  usableCapacity: number; // kg
  
  // Fuel sequence (order of fuel usage)
  sequence: number;
  
  // Lateral position (for lateral balance)
  lateralPosition: 'CENTER' | 'LEFT' | 'RIGHT';
}

/**
 * Pre-configured aircraft types with accurate data
 */
export const AIRCRAFT_CONFIGURATIONS: Record<string, AircraftType> = {
  'B738': {
    id: 'b737-800',
    iataCode: '738',
    icaoCode: 'B738',
    manufacturer: 'Boeing',
    model: '737-800',
    weights: {
      maxTakeoffWeight: 79016,
      maxLandingWeight: 66361,
      maxZeroFuelWeight: 62732,
      maxRampWeight: 79244,
      basicOperatingWeight: 41413,
      dryOperatingWeight: 41500,
      maxPayload: 21232,
      maxFuelCapacity: 26022,
    },
    cgEnvelope: {
      forwardLimit: [
        { weight: 40000, cgPosition: 8.0 },
        { weight: 62000, cgPosition: 12.0 },
        { weight: 79000, cgPosition: 15.0 },
      ],
      aftLimit: [
        { weight: 40000, cgPosition: 35.0 },
        { weight: 62000, cgPosition: 36.0 },
        { weight: 79000, cgPosition: 37.0 },
      ],
      datum: 0,
      macLength: 3.759,
      macLeadingEdge: 12.946,
      units: 'MAC',
    },
    seating: {
      totalSeats: 189,
      economySeatPitch: 79,
      businessSeatPitch: 94,
      firstSeatPitch: 0,
      zones: [
        {
          zoneId: 'business',
          name: 'Business Class',
          cabinClass: 'BUSINESS',
          startRow: 1,
          endRow: 3,
          seatCount: 12,
          station: 6.0,
          momentArm: 6.0,
        },
        {
          zoneId: 'economy-front',
          name: 'Economy Front',
          cabinClass: 'ECONOMY',
          startRow: 7,
          endRow: 15,
          seatCount: 54,
          station: 11.0,
          momentArm: 11.0,
        },
        {
          zoneId: 'economy-mid',
          name: 'Economy Mid',
          cabinClass: 'ECONOMY',
          startRow: 16,
          endRow: 25,
          seatCount: 60,
          station: 16.0,
          momentArm: 16.0,
        },
        {
          zoneId: 'economy-rear',
          name: 'Economy Rear',
          cabinClass: 'ECONOMY',
          startRow: 26,
          endRow: 35,
          seatCount: 63,
          station: 22.0,
          momentArm: 22.0,
        },
      ],
    },
    cargo: {
      totalCapacity: 21232,
      totalVolume: 44.0,
      compartments: [
        {
          compartmentId: 'fwd',
          name: 'Forward Cargo',
          station: 8.5,
          momentArm: 8.5,
          maxWeight: 10000,
          maxVolume: 22.0,
          floorLoadLimit: 732,
          isHeated: true,
          isPressurized: true,
          isBulk: false,
          containerType: 'LD3-45',
          maxContainers: 3,
        },
        {
          compartmentId: 'aft',
          name: 'Aft Cargo',
          station: 24.0,
          momentArm: 24.0,
          maxWeight: 8232,
          maxVolume: 17.0,
          floorLoadLimit: 732,
          isHeated: true,
          isPressurized: true,
          isBulk: false,
          containerType: 'LD3-45',
          maxContainers: 2,
        },
        {
          compartmentId: 'bulk',
          name: 'Bulk Cargo',
          station: 28.0,
          momentArm: 28.0,
          maxWeight: 3000,
          maxVolume: 5.0,
          floorLoadLimit: 488,
          isHeated: false,
          isPressurized: true,
          isBulk: true,
        },
      ],
    },
    fuel: {
      totalCapacity: 26022,
      usableCapacity: 25900,
      tanks: [
        {
          tankId: 'center',
          name: 'Center Tank',
          station: 15.0,
          momentArm: 15.0,
          maxCapacity: 12700,
          usableCapacity: 12600,
          sequence: 2,
          lateralPosition: 'CENTER',
        },
        {
          tankId: 'left-wing',
          name: 'Left Main Wing',
          station: 15.2,
          momentArm: 15.2,
          maxCapacity: 6661,
          usableCapacity: 6650,
          sequence: 1,
          lateralPosition: 'LEFT',
        },
        {
          tankId: 'right-wing',
          name: 'Right Main Wing',
          station: 15.2,
          momentArm: 15.2,
          maxCapacity: 6661,
          usableCapacity: 6650,
          sequence: 1,
          lateralPosition: 'RIGHT',
        },
      ],
    },
    emptyOperatingWeight: 41500,
    emptyOperatingIndex: 20.5,
    passengerCapacity: 189,
    crewCapacity: 7,
  },
  
  'A320': {
    id: 'a320-200',
    iataCode: '320',
    icaoCode: 'A320',
    manufacturer: 'Airbus',
    model: 'A320-200',
    weights: {
      maxTakeoffWeight: 78000,
      maxLandingWeight: 67400,
      maxZeroFuelWeight: 62500,
      maxRampWeight: 78200,
      basicOperatingWeight: 42400,
      dryOperatingWeight: 42600,
      maxPayload: 19900,
      maxFuelCapacity: 24210,
    },
    cgEnvelope: {
      forwardLimit: [
        { weight: 40000, cgPosition: 16.0 },
        { weight: 60000, cgPosition: 21.0 },
        { weight: 78000, cgPosition: 25.0 },
      ],
      aftLimit: [
        { weight: 40000, cgPosition: 40.0 },
        { weight: 60000, cgPosition: 41.0 },
        { weight: 78000, cgPosition: 42.0 },
      ],
      datum: 0,
      macLength: 4.193,
      macLeadingEdge: 14.447,
      units: 'MAC',
    },
    seating: {
      totalSeats: 180,
      economySeatPitch: 76,
      businessSeatPitch: 97,
      firstSeatPitch: 0,
      zones: [
        {
          zoneId: 'business',
          name: 'Business Class',
          cabinClass: 'BUSINESS',
          startRow: 1,
          endRow: 4,
          seatCount: 12,
          station: 6.5,
          momentArm: 6.5,
        },
        {
          zoneId: 'economy-front',
          name: 'Economy Front',
          cabinClass: 'ECONOMY',
          startRow: 8,
          endRow: 17,
          seatCount: 60,
          station: 12.0,
          momentArm: 12.0,
        },
        {
          zoneId: 'economy-mid',
          name: 'Economy Mid',
          cabinClass: 'ECONOMY',
          startRow: 18,
          endRow: 26,
          seatCount: 54,
          station: 17.0,
          momentArm: 17.0,
        },
        {
          zoneId: 'economy-rear',
          name: 'Economy Rear',
          cabinClass: 'ECONOMY',
          startRow: 27,
          endRow: 36,
          seatCount: 54,
          station: 23.0,
          momentArm: 23.0,
        },
      ],
    },
    cargo: {
      totalCapacity: 19900,
      totalVolume: 37.4,
      compartments: [
        {
          compartmentId: 'fwd',
          name: 'Forward Cargo',
          station: 9.0,
          momentArm: 9.0,
          maxWeight: 9000,
          maxVolume: 21.2,
          floorLoadLimit: 750,
          isHeated: true,
          isPressurized: true,
          isBulk: false,
          containerType: 'LD3-45',
          maxContainers: 3,
        },
        {
          compartmentId: 'aft',
          name: 'Aft Cargo',
          station: 24.5,
          momentArm: 24.5,
          maxWeight: 7900,
          maxVolume: 13.2,
          floorLoadLimit: 750,
          isHeated: true,
          isPressurized: true,
          isBulk: false,
          containerType: 'LD3-45',
          maxContainers: 2,
        },
        {
          compartmentId: 'bulk',
          name: 'Bulk Cargo',
          station: 29.0,
          momentArm: 29.0,
          maxWeight: 3000,
          maxVolume: 3.0,
          floorLoadLimit: 500,
          isHeated: false,
          isPressurized: true,
          isBulk: true,
        },
      ],
    },
    fuel: {
      totalCapacity: 24210,
      usableCapacity: 24050,
      tanks: [
        {
          tankId: 'center',
          name: 'Center Tank',
          station: 15.5,
          momentArm: 15.5,
          maxCapacity: 6476,
          usableCapacity: 6400,
          sequence: 2,
          lateralPosition: 'CENTER',
        },
        {
          tankId: 'left-wing',
          name: 'Left Inner Wing',
          station: 15.7,
          momentArm: 15.7,
          maxCapacity: 4490,
          usableCapacity: 4450,
          sequence: 1,
          lateralPosition: 'LEFT',
        },
        {
          tankId: 'right-wing',
          name: 'Right Inner Wing',
          station: 15.7,
          momentArm: 15.7,
          maxCapacity: 4490,
          usableCapacity: 4450,
          sequence: 1,
          lateralPosition: 'RIGHT',
        },
        {
          tankId: 'left-outer',
          name: 'Left Outer Wing',
          station: 16.0,
          momentArm: 16.0,
          maxCapacity: 4377,
          usableCapacity: 4350,
          sequence: 3,
          lateralPosition: 'LEFT',
        },
        {
          tankId: 'right-outer',
          name: 'Right Outer Wing',
          station: 16.0,
          momentArm: 16.0,
          maxCapacity: 4377,
          usableCapacity: 4350,
          sequence: 3,
          lateralPosition: 'RIGHT',
        },
      ],
    },
    emptyOperatingWeight: 42600,
    emptyOperatingIndex: 28.5,
    passengerCapacity: 180,
    crewCapacity: 6,
  },
};

/**
 * Helper function to get aircraft configuration
 */
export function getAircraftConfig(aircraftType: string): AircraftType | null {
  return AIRCRAFT_CONFIGURATIONS[aircraftType] || null;
}

/**
 * Helper function to validate aircraft type
 */
export function isValidAircraftType(aircraftType: string): boolean {
  return aircraftType in AIRCRAFT_CONFIGURATIONS;
}
