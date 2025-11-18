// Agent Types
export interface Agent {
  id: string;
  code: string;
  name: string;
  email: string;
  stationCode: string;
  terminalCode?: string;
  counterNumber?: string;
  role: AgentRole;
  permissions: string[];
}

export type AgentRole = 'agent' | 'supervisor' | 'gate_agent' | 'admin';

// Check-in Types
export interface CheckInTransaction {
  id: string;
  pnrLocator: string;
  flightId: string;
  status: CheckInStatus;
  passengers: PassengerCheckIn[];
  totalPassengers: number;
  startTime: number;
  completedTime?: number;
  checkInDuration?: number;
}

export type CheckInStatus = 'in_progress' | 'completed' | 'cancelled';

export interface PassengerCheckIn {
  id: string;
  passengerId: string;
  firstName: string;
  lastName: string;
  title?: string;
  passengerType: 'ADT' | 'CHD' | 'INF';
  sequenceNumber: number;
  ticketNumber?: string;
  frequentFlyerNumber?: string;
  frequentFlyerTier?: string;
  cabinClass: string;
  seatNumber?: string;
  seatType?: SeatType;
  baggageTags: BaggageTag[];
  totalBags: number;
  totalWeight: number;
  apisData?: APISData;
  apisStatus: APISStatus;
  checkInStatus: PassengerStatus;
  boardingPassNumber?: string;
}

export type SeatType = 'standard' | 'extra_legroom' | 'premium' | 'emergency_exit';
export type PassengerStatus = 'checked_in' | 'standby' | 'cancelled' | 'no_show';
export type APISStatus = 'not_required' | 'required' | 'collected' | 'submitted' | 'confirmed';

// Seat Types
export interface Seat {
  number: string;
  row: number;
  column: string;
  status: SeatStatus;
  type: SeatType;
  passenger?: {
    id: string;
    name: string;
  };
}

export type SeatStatus = 'available' | 'occupied' | 'selected' | 'blocked';

export interface SeatMap {
  flightId: string;
  aircraftType: string;
  rows: number;
  columns: string[];
  seats: Seat[][];
  lastUpdated: string;
}

// Baggage Types
export interface BaggageTag {
  id: string;
  tagNumber: string;
  sequenceNumber: number;
  weight: number;
  weightUnit: 'KG' | 'LBS';
  pieceCount: number;
  baggageType: BaggageType;
  origin: string;
  destination: string;
  connections: string[];
  status: BaggageStatus;
  isOverweight: boolean;
  isOversized: boolean;
  isFragile: boolean;
  isPriority: boolean;
  excessBaggageFee: number;
  feePaid: boolean;
}

export type BaggageType = 'checked' | 'carry_on' | 'cabin' | 'gate_check';
export type BaggageStatus = 'checked_in' | 'loaded' | 'in_transit' | 'arrived';

// APIS Types
export interface APISData {
  id: string;
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  nationality: string;
  expiryDate: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'X';
  placeOfBirth?: string;
  hasVisa: boolean;
  visaNumber?: string;
  visaType?: string;
  redressNumber?: string;
  knownTravelerNumber?: string;
  screeningStatus: ScreeningStatus;
}

export type ScreeningStatus = 'pending' | 'cleared' | 'selectee' | 'inhibited' | 'manual_review';

// Payment Types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptNumber?: string;
}

export type PaymentMethod = 'card' | 'cash' | 'voucher';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

// Hardware Types
export interface BluetoothDevice {
  id: string;
  name: string;
  type: DeviceType;
  isConnected: boolean;
  batteryLevel?: number;
}

export type DeviceType = 'scanner' | 'printer' | 'payment_terminal' | 'scale';

export interface ScanResult {
  data: string;
  type: ScanType;
  timestamp: number;
}

export type ScanType = 'barcode' | 'qr_code' | 'passport_mrz';

export interface PrintJob {
  id: string;
  type: PrintType;
  data: any;
  status: PrintStatus;
  deviceId?: string;
}

export type PrintType = 'bag_tag' | 'boarding_pass' | 'receipt';
export type PrintStatus = 'pending' | 'printing' | 'completed' | 'failed';

// Ancillary Types
export interface AncillaryProduct {
  id: string;
  code: string;
  name: string;
  description: string;
  category: AncillaryCategory;
  price: number;
  currency: string;
  available: boolean;
  eligibility?: string[];
}

export type AncillaryCategory =
  | 'baggage'
  | 'seat'
  | 'lounge'
  | 'priority_boarding'
  | 'meal'
  | 'wifi'
  | 'upgrade'
  | 'insurance';

// Queue Types
export interface QueueItem {
  id: string;
  pnrLocator: string;
  passengerName: string;
  flightId: string;
  priority: QueuePriority;
  queueType: QueueType;
  addedAt: number;
  estimatedTime?: number;
}

export type QueuePriority = 'urgent' | 'high' | 'normal' | 'low';
export type QueueType = 'check_in' | 'gate' | 'lounge' | 'customer_service';

// Offline Types
export interface OfflineTransaction {
  id: string;
  type: OfflineTransactionType;
  data: any;
  timestamp: number;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: number;
  error?: string;
}

export type OfflineTransactionType =
  | 'check_in'
  | 'seat_assignment'
  | 'baggage_tag'
  | 'payment'
  | 'apis_collection';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  PassengerSearch: undefined;
  CheckIn: { transactionId: string };
  SeatSelection: { transactionId: string; passengerId: string };
  BaggageProcessing: { transactionId: string; passengerId: string };
  APISCollection: { transactionId: string; passengerId: string };
  Payment: { transactionId: string; amount: number; description: string };
  AncillarySales: { transactionId: string; passengerId: string };
  QueueManagement: undefined;
  StandbyList: { flightId: string };
  Settings: undefined;
  DeviceManagement: undefined;
};
