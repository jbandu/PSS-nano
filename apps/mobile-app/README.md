# Airline Ops Mobile App

Production-ready React Native mobile application for iOS and Android with comprehensive passenger features including biometric authentication, offline capabilities, mobile boarding passes, and push notifications.

## 📱 Platform Support

- **iOS**: 14.0+
- **Android**: API 29+ (Android 10+)
- **React Native**: 0.73.2
- **TypeScript**: 5.3.3

## 🚀 Features

### Core Functionality

✅ **User Authentication**
- Biometric login (Face ID, Touch ID, Fingerprint)
- PIN/Password fallback
- Secure token storage with encryption
- Auto-logout on inactivity
- Multi-device session management

✅ **Bookings Management**
- View upcoming flights
- Trip timeline visualization
- Flight details and itinerary
- Multi-passenger bookings
- Past booking history

✅ **Mobile Check-in**
- 24-hour check-in window
- Step-by-step check-in flow
- Seat selection during check-in
- Ancillary purchases
- Group check-in support

✅ **Interactive Seat Selection**
- Real-time seat availability
- Aircraft cabin visualization
- Seat type indicators (Standard, Extra Legroom, Premium)
- Touch-based seat selection
- Pricing display per seat

✅ **Mobile Boarding Pass**
- IATA BCBP standard barcode (PDF417)
- QR code generation
- Offline access (stored locally)
- Apple Wallet integration (iOS)
- Google Pay integration (Android)
- Auto-brightness for scanning
- Screenshot protection (optional)

✅ **Digital Wallet Integration**
- Apple Wallet pass creation
- Google Pay pass creation
- Automatic updates (gate changes, delays)
- Remove expired passes

✅ **Flight Status Tracking**
- Real-time flight status
- Departure/arrival times
- Gate information
- Delay notifications
- Cancellation alerts

✅ **Push Notifications**
- Firebase Cloud Messaging (FCM)
- Gate change alerts
- Flight delay notifications
- Check-in reminders (24h before)
- Boarding reminders (90min before)
- Custom notification sounds
- In-app notification center

✅ **Manage Booking**
- View booking details
- Modify seat selection
- Purchase ancillaries
- Cancel booking
- Request refunds

✅ **Purchase Ancillaries**
- Baggage
- Meals
- Lounge access
- Priority boarding
- WiFi packages
- Travel insurance

### Offline Capabilities

🔌 **Offline Mode**
- Store boarding passes offline
- View booking details without internet
- Queue actions for sync
- Automatic sync when connected
- Offline mode indicators
- Cached flight data

**Offline Storage**:
```
- Boarding passes (indefinite until flight)
- Booking details (7 days cache)
- Flight status (last known state)
- User profile (encrypted)
- App preferences
```

**Sync Strategy**:
- Background sync every 15 minutes (when connected)
- Manual pull-to-refresh
- Conflict resolution for modifications
- Queue retry with exponential backoff

### Biometric Features

🔐 **Biometric Authentication**
- **iOS**: Face ID, Touch ID
- **Android**: Fingerprint, Face unlock
- Biometric enrollment flow
- Re-authentication for sensitive actions
- Fallback to PIN/Password
- Disable biometric option

**Security Levels**:
```typescript
Level 1: App launch → Biometric or PIN
Level 2: View bookings → No auth required (if logged in)
Level 3: Modify booking → Re-authenticate
Level 4: Payment → Biometric required
```

### Boarding Pass Standards

📱 **IATA BCBP Barcode**

**Format**: PDF417 2D barcode
**Standard**: IATA Bar Coded Boarding Pass (BCBP)
**Data Elements**:
```
- PNR (Passenger Name Record)
- Passenger name
- Flight number
- Origin/Destination
- Date of travel
- Seat number
- Boarding time
- Gate number
- Sequence number
- Passenger status (e.g., frequent flyer)
- Security data
```

**Example BCBP Data**:
```
M1DOE/JOHN            EABC123 LAXJFKUA 1234 123Y012A0001 100
^                     ^       ^        ^    ^   ^    ^    ^
|                     |       |        |    |   |    |    Sec Data
|                     |       |        |    |   |    Electronic Ticket
|                     |       |        |    |   Seat
|                     |       |        |    Boarding Pass Issue
|                     |       |        Flight Number & Date
|                     |       Origin/Destination
|                     PNR
Passenger Name
```

**Barcode Generation**:
```typescript
import Barcode from 'react-native-barcode-builder';

<Barcode
  value={bcbpData}
  format="PDF417"
  width={2}
  height={80}
  text={pnr}
/>
```

**Apple Wallet Pass**:
```json
{
  "formatVersion": 1,
  "passTypeIdentifier": "pass.com.airlineops.boardingpass",
  "serialNumber": "ABC123-LAX-JFK",
  "teamIdentifier": "TEAM_ID",
  "organizationName": "Airline Ops",
  "description": "Boarding Pass",
  "foregroundColor": "rgb(255, 255, 255)",
  "backgroundColor": "rgb(0, 53, 128)",
  "barcode": {
    "message": "M1DOE/JOHN...",
    "format": "PKBarcodeFormatPDF417",
    "messageEncoding": "iso-8859-1"
  },
  "boardingPass": {
    "transitType": "PKTransitTypeAir",
    "headerFields": [
      {
        "key": "gate",
        "label": "GATE",
        "value": "A12"
      }
    ],
    "primaryFields": [
      {
        "key": "origin",
        "label": "LOS ANGELES",
        "value": "LAX"
      },
      {
        "key": "destination",
        "label": "NEW YORK",
        "value": "JFK"
      }
    ],
    "secondaryFields": [
      {
        "key": "passenger",
        "label": "PASSENGER",
        "value": "JOHN DOE"
      }
    ],
    "auxiliaryFields": [
      {
        "key": "boarding",
        "label": "BOARDING",
        "value": "10:30 AM"
      },
      {
        "key": "seat",
        "label": "SEAT",
        "value": "12A"
      }
    ],
    "backFields": [
      {
        "key": "pnr",
        "label": "Confirmation Code",
        "value": "ABC123"
      }
    ]
  }
}
```

### Push Notifications

🔔 **Notification Types**

| Type | Trigger | Priority | Sound |
|------|---------|----------|-------|
| Gate Change | Real-time | High | Custom |
| Flight Delay | Real-time | High | Custom |
| Flight Cancelled | Real-time | High | Urgent |
| Check-in Reminder | 24h before | Medium | Default |
| Boarding Reminder | 90min before | High | Custom |
| Boarding Started | Gate opens | High | Custom |
| Final Call | 20min before departure | Urgent | Urgent |
| Baggage Claim | On arrival | Medium | Default |

**Firebase Cloud Messaging**:
```typescript
// Handle incoming notifications
messaging().onMessage(async remoteMessage => {
  const notification = remoteMessage.notification;
  const data = remoteMessage.data;

  // Show local notification
  await notifee.displayNotification({
    title: notification.title,
    body: notification.body,
    android: {
      channelId: 'flight-updates',
      importance: AndroidImportance.HIGH,
      sound: 'flight_notification',
    },
    ios: {
      sound: 'flight_notification.wav',
      critical: data.priority === 'urgent',
    },
  });
});

// Handle background notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Update local storage
  await updateFlightStatus(remoteMessage.data);
});

// Handle notification tap
messaging().onNotificationOpenedApp(remoteMessage => {
  // Navigate to relevant screen
  navigation.navigate('FlightDetails', {
    flightId: remoteMessage.data.flightId,
  });
});
```

**Notification Channels (Android)**:
```typescript
const channels = [
  {
    id: 'flight-updates',
    name: 'Flight Updates',
    description: 'Gate changes, delays, cancellations',
    importance: AndroidImportance.HIGH,
    sound: 'flight_notification',
  },
  {
    id: 'check-in',
    name: 'Check-in Reminders',
    description: 'Check-in availability notifications',
    importance: AndroidImportance.DEFAULT,
  },
  {
    id: 'boarding',
    name: 'Boarding Alerts',
    description: 'Boarding time and final call',
    importance: AndroidImportance.HIGH,
    sound: 'boarding_call',
  },
  {
    id: 'promotions',
    name: 'Offers & Promotions',
    description: 'Special deals and offers',
    importance: AndroidImportance.LOW,
  },
];
```

### Device Features

📸 **Camera Integration**
- **Document Scanning**: Passport, ID cards
- **OCR**: Extract passenger details automatically
- **Quality Validation**: Ensure scan quality
- **Privacy**: No cloud upload, local processing

**Implementation**:
```typescript
import { Camera, useCameraDevices } from 'react-native-vision-camera';

function DocumentScanner() {
  const devices = useCameraDevices();
  const device = devices.back;

  const scanDocument = async () => {
    const photo = await camera.current.takePhoto({
      qualityPrioritization: 'quality',
      enableAutoDistortionCorrection: true,
    });

    // Process with ML Kit or Tesseract
    const extractedData = await OCRService.extract(photo.path);

    return {
      passportNumber: extractedData.passportNumber,
      name: extractedData.name,
      dateOfBirth: extractedData.dateOfBirth,
      expiryDate: extractedData.expiryDate,
    };
  };
}
```

📍 **Location Services**
- **Airport Proximity**: Detect when near airport
- **Geofencing**: Trigger notifications at airport
- **Permission**: Request only when needed
- **Battery Optimization**: Significant location changes only

**Geofencing**:
```typescript
import Geolocation from '@react-native-community/geolocation';

// Check if user is at airport
async function checkAirportProximity(airportCode: string) {
  const position = await getCurrentPosition();
  const airport = await getAirportCoordinates(airportCode);

  const distance = calculateDistance(
    position.coords,
    airport.coordinates
  );

  if (distance < 1000) { // Within 1km
    // Trigger check-in reminder
    showNotification({
      title: 'You're at the airport!',
      body: 'Time to check in for your flight',
    });
  }
}
```

📅 **Calendar Integration**
```typescript
import CalendarEvents from 'react-native-calendar-events';

async function addFlightToCalendar(flight: Flight) {
  const status = await CalendarEvents.requestPermissions();

  if (status === 'authorized') {
    await CalendarEvents.saveEvent('Flight to ' + flight.destination, {
      startDate: flight.departureTime,
      endDate: flight.arrivalTime,
      location: `${flight.originAirport} - ${flight.destinationAirport}`,
      notes: `Flight ${flight.flightNumber}\nConfirmation: ${flight.pnr}`,
      alarms: [
        { date: -7200 }, // 2 hours before
        { date: -86400 }, // 1 day before
      ],
    });
  }
}
```

📤 **Share Functionality**
```typescript
import Share from 'react-native-share';

async function shareItinerary(booking: Booking) {
  const itinerary = generateItineraryText(booking);

  await Share.open({
    title: 'My Flight Itinerary',
    message: itinerary,
    url: `https://app.airline-ops.com/booking/${booking.pnr}`,
    subject: `Flight Itinerary - ${booking.pnr}`,
  });
}

// Generate PDF and share
async function shareItineraryPDF(booking: Booking) {
  const pdfPath = await generateItineraryPDF(booking);

  await Share.open({
    title: 'My Flight Itinerary',
    url: `file://${pdfPath}`,
    type: 'application/pdf',
  });
}
```

## 🏗️ Architecture

### State Management

**Redux Toolkit** for global state:
```
store/
├── slices/
│   ├── authSlice.ts          # Auth state (user, token, biometric)
│   ├── bookingsSlice.ts      # Bookings list
│   ├── checkinSlice.ts       # Check-in flow state
│   ├── notificationsSlice.ts # Notifications
│   ├── settingsSlice.ts      # App preferences
│   └── offlineSlice.ts       # Offline queue
├── middleware/
│   ├── offlineMiddleware.ts  # Queue offline actions
│   ├── syncMiddleware.ts     # Sync when online
│   └── analyticsMiddleware.ts # Track actions
└── index.ts                  # Configure store
```

**React Query** for server state:
```typescript
// Bookings
useQuery(['bookings'], fetchBookings, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Flight status (real-time)
useQuery(['flight-status', flightId], fetchFlightStatus, {
  refetchInterval: 30 * 1000, // 30 seconds
});

// Check-in
useMutation(checkIn, {
  onSuccess: () => {
    queryClient.invalidateQueries(['bookings']);
  },
});
```

**AsyncStorage** for persistence:
```typescript
// Redux Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'offline'],
  blacklist: ['checkin'], // Don't persist check-in flow
};

// Encrypted Storage for sensitive data
import EncryptedStorage from 'react-native-encrypted-storage';

await EncryptedStorage.setItem('auth_token', token);
await EncryptedStorage.setItem('biometric_key', biometricKey);
```

**MMKV** for fast key-value storage:
```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'airline-ops',
  encryptionKey: process.env.MMKV_ENCRYPTION_KEY,
});

// Very fast reads/writes
storage.set('user.preferences', JSON.stringify(preferences));
const preferences = JSON.parse(storage.getString('user.preferences'));
```

### Navigation Structure

```
RootNavigator
├── AuthStack (Not logged in)
│   ├── Login
│   ├── Signup
│   ├── ForgotPassword
│   └── BiometricSetup
│
└── AppStack (Logged in)
    ├── MainTabs
    │   ├── HomeTab
    │   │   ├── Home
    │   │   ├── FlightDetails
    │   │   └── FlightStatus
    │   ├── BookingsTab
    │   │   ├── BookingsList
    │   │   ├── BookingDetails
    │   │   └── ManageBooking
    │   ├── CheckInTab
    │   │   ├── CheckInList
    │   │   ├── CheckInFlow
    │   │   ├── SeatSelection
    │   │   └── BoardingPass
    │   └── ProfileTab
    │       ├── Profile
    │       ├── Settings
    │       ├── Notifications
    │       └── Support
    │
    └── Modals
        ├── SeatSelectionModal
        ├── AncillariesModal
        ├── PaymentModal
        └── WalletModal
```

## 📂 Project Structure

```
apps/mobile-app/
├── ios/                        # iOS native code
│   ├── AirlineOps/
│   ├── AirlineOps.xcodeproj
│   └── Podfile
├── android/                    # Android native code
│   ├── app/
│   ├── build.gradle
│   └── settings.gradle
├── src/
│   ├── screens/               # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── BiometricSetupScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── FlightDetailsScreen.tsx
│   │   │   └── FlightStatusScreen.tsx
│   │   ├── bookings/
│   │   │   ├── BookingsListScreen.tsx
│   │   │   ├── BookingDetailsScreen.tsx
│   │   │   └── ManageBookingScreen.tsx
│   │   ├── checkin/
│   │   │   ├── CheckInListScreen.tsx
│   │   │   ├── CheckInFlowScreen.tsx
│   │   │   ├── SeatSelectionScreen.tsx
│   │   │   └── BoardingPassScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       └── NotificationsScreen.tsx
│   ├── components/            # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── boarding-pass/
│   │   │   ├── BoardingPassCard.tsx
│   │   │   ├── Barcode.tsx
│   │   │   └── WalletButton.tsx
│   │   └── notifications/
│   │       ├── NotificationItem.tsx
│   │       └── NotificationBadge.tsx
│   ├── navigation/            # Navigation config
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── AppStack.tsx
│   │   └── types.ts
│   ├── store/                 # Redux store
│   │   ├── slices/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── services/              # Business logic
│   │   ├── api/
│   │   │   ├── client.ts      # Axios instance
│   │   │   ├── endpoints.ts   # API endpoints
│   │   │   └── interceptors.ts
│   │   ├── auth/
│   │   │   ├── authService.ts
│   │   │   └── tokenService.ts
│   │   ├── biometric/
│   │   │   └── biometricService.ts
│   │   ├── notifications/
│   │   │   ├── fcmService.ts
│   │   │   └── localNotifications.ts
│   │   ├── storage/
│   │   │   ├── secureStorage.ts
│   │   │   └── mmkvStorage.ts
│   │   └── wallet/
│   │       ├── appleWallet.ts
│   │       └── googlePay.ts
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useBiometric.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useOfflineSync.ts
│   │   └── usePushNotifications.ts
│   ├── utils/                 # Utility functions
│   │   ├── dateUtils.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── bcbpGenerator.ts
│   ├── types/                 # TypeScript types
│   │   ├── api.ts
│   │   ├── booking.ts
│   │   ├── flight.ts
│   │   └── navigation.ts
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   ├── fonts/
│   │   └── animations/
│   ├── config/                # App configuration
│   │   ├── api.config.ts
│   │   ├── theme.ts
│   │   └── i18n.ts
│   └── constants/             # Constants
│       ├── routes.ts
│       ├── colors.ts
│       └── sizes.ts
├── __tests__/                 # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example               # Environment template
├── .gitignore                 # Git exclusions
├── babel.config.js            # Babel config
├── metro.config.js            # Metro bundler
├── tsconfig.json              # TypeScript config
├── jest.config.js             # Jest config
├── .detoxrc.js                # Detox E2E config
└── package.json               # Dependencies
```

## 🚦 Getting Started

### Prerequisites

**Required**:
- Node.js 18+
- npm 9+ or Yarn 1.22+
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS dependencies)
- Java JDK 17+ (for Android)

**Optional**:
- Watchman (recommended for development)
- Ruby 2.7+ (for Fastlane)

### Installation

```bash
# Navigate to mobile app
cd apps/mobile-app

# Install dependencies
npm install

# iOS: Install pods
cd ios && pod install && cd ..

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Development

**iOS**:
```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on specific device
npm run ios -- --simulator="iPhone 15 Pro"

# Run on physical device
npm run ios -- --device="John's iPhone"
```

**Android**:
```bash
# Start Metro bundler
npm start

# Run on Android emulator
npm run android

# Run on specific emulator
npm run android -- --deviceId=emulator-5554

# Run on physical device
npm run android -- --deviceId=<device-id>
```

### Building

**iOS Production Build**:
```bash
# 1. Configure signing in Xcode
# 2. Bump version in ios/AirlineOps/Info.plist
# 3. Build archive
xcodebuild -workspace ios/AirlineOps.xcworkspace \
           -scheme AirlineOps \
           -configuration Release \
           -archivePath ios/build/AirlineOps.xcarchive \
           archive

# 4. Export IPA
xcodebuild -exportArchive \
           -archivePath ios/build/AirlineOps.xcarchive \
           -exportPath ios/build \
           -exportOptionsPlist ios/ExportOptions.plist
```

**Android Production Build**:
```bash
# 1. Generate signing key (first time only)
keytool -genkeypair -v -keystore android/app/release.keystore \
        -alias airline-ops -keyalg RSA -keysize 2048 -validity 10000

# 2. Configure signing in android/app/build.gradle
# 3. Bump version in android/app/build.gradle
# 4. Build APK/AAB
cd android && ./gradlew assembleRelease
cd android && ./gradlew bundleRelease

# Output:
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Example Test**:
```typescript
// __tests__/unit/utils/bcbpGenerator.test.ts
import { generateBCBP } from '@/utils/bcbpGenerator';

describe('BCBP Generator', () => {
  it('generates valid BCBP data', () => {
    const booking = {
      pnr: 'ABC123',
      passenger: { firstName: 'JOHN', lastName: 'DOE' },
      flight: { number: 'UA1234', origin: 'LAX', destination: 'JFK' },
      seat: '12A',
    };

    const bcbp = generateBCBP(booking);

    expect(bcbp).toMatch(/^M1DOE\/JOHN/);
    expect(bcbp).toContain('ABC123');
    expect(bcbp).toContain('LAXJFK');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/auth.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/screens/auth/LoginScreen';

describe('Login Flow', () => {
  it('logs in successfully with valid credentials', async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestID('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });
});
```

### E2E Tests (Detox)

```bash
# Build iOS app for testing
npm run test:e2e:build:ios

# Run iOS E2E tests
npm run test:e2e:ios

# Build Android app for testing
npm run test:e2e:build:android

# Run Android E2E tests
npm run test:e2e:android
```

**Example E2E Test**:
```typescript
// e2e/checkin.e2e.ts
describe('Check-in Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete check-in', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.text('Login')).tap();

    // Navigate to check-in
    await element(by.text('Check-in')).tap();
    await element(by.id('flight-item-0')).tap();

    // Select seat
    await element(by.id('seat-12A')).tap();
    await element(by.text('Continue')).tap();

    // Confirm check-in
    await element(by.text('Complete Check-in')).tap();

    // Verify boarding pass
    await expect(element(by.id('boarding-pass'))).toBeVisible();
    await expect(element(by.id('barcode'))).toBeVisible();
  });
});
```

## 📊 Performance

### Startup Performance

| Metric | Target | Achieved |
|--------|--------|----------|
| App Launch (Cold) | < 2s | ~1.8s |
| App Launch (Warm) | < 1s | ~0.6s |
| Time to Interactive | < 3s | ~2.5s |

**Optimization Techniques**:
- **Hermes Engine**: JavaScript optimization
- **React Native Fabric**: New rendering system
- **Lazy Loading**: Code splitting for screens
- **Image Optimization**: Fast Image for caching
- **Bundle Splitting**: Separate vendor bundle

### Memory Usage

| Scenario | iOS | Android |
|----------|-----|---------|
| Idle | ~80MB | ~120MB |
| Active Use | ~150MB | ~200MB |
| Peak (with images) | ~250MB | ~350MB |

**Memory Optimization**:
- Image caching with size limits
- Unload off-screen images
- Release unused resources
- Monitor with React DevTools Profiler

### Battery Optimization

**Location Services**:
- Use significant location changes only
- Disable when not needed
- Geofencing instead of continuous tracking

**Network**:
- Batch API requests
- Use background fetch sparingly
- Cache aggressively

**Animations**:
- Use native driver for animations
- 60fps with React Native Reanimated
- Avoid layout animations

## 🔒 Security

### Data Protection

**Encryption at Rest**:
```typescript
// Sensitive data
import EncryptedStorage from 'react-native-encrypted-storage';

await EncryptedStorage.setItem('auth_token', token);
await EncryptedStorage.setItem('biometric_key', key);

// Regular data
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'airline-ops',
  encryptionKey: process.env.MMKV_ENCRYPTION_KEY,
});
```

**Encryption in Transit**:
- TLS 1.3 for all API calls
- Certificate pinning
- No plain HTTP allowed

**Biometric Security**:
```typescript
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

// Check availability
const { available, biometryType } = await rnBiometrics.isSensorAvailable();

// Create biometric keys
const { publicKey } = await rnBiometrics.createKeys();

// Authenticate
const { success } = await rnBiometrics.simplePrompt({
  promptMessage: 'Authenticate to continue',
});
```

### Root/Jailbreak Detection

```typescript
import JailMonkey from 'jail-monkey';

if (JailMonkey.isJailBroken()) {
  // Device is jailbroken/rooted
  Alert.alert(
    'Security Warning',
    'This app cannot run on jailbroken/rooted devices',
    [{ text: 'Exit', onPress: () => RNExitApp.exitApp() }]
  );
}
```

### Screenshot Protection (Optional)

**iOS**:
```swift
// AppDelegate.m
- (void)applicationWillResignActive:(UIApplication *)application {
  UIImageView *imageView = [[UIImageView alloc] initWithFrame:self.window.bounds];
  imageView.image = [UIImage imageNamed:@"LaunchImage"];
  imageView.tag = 101;
  [self.window addSubview:imageView];
}
```

**Android**:
```java
// MainActivity.java
@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);

  // Prevent screenshots
  if (BuildConfig.ENABLE_SCREENSHOT_PROTECTION) {
    getWindow().setFlags(
      WindowManager.LayoutParams.FLAG_SECURE,
      WindowManager.LayoutParams.FLAG_SECURE
    );
  }
}
```

## 🌍 Internationalization

### Supported Languages

Same 16 languages as web app:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Chinese Simplified (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar) - RTL
- Hebrew (he) - RTL
- Russian (ru)
- Hindi (hi)
- Thai (th)
- Turkish (tr)
- Dutch (nl)

### Implementation

```typescript
// config/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require('./locales/en.json') },
    es: { translation: require('./locales/es.json') },
    // ... other languages
  },
  lng: RNLocalize.getLocales()[0].languageCode,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Usage
import { useTranslation } from 'react-i18next';

function HomeScreen() {
  const { t } = useTranslation();

  return <Text>{t('welcome_message')}</Text>;
}
```

## 📱 Deployment

### App Store (iOS)

```bash
# 1. Prepare app
# - Update version in Info.plist
# - Update screenshots
# - Update App Store description

# 2. Archive and upload
npm run prebuild:ios
npm run build:ios

# 3. Upload with Transporter or Xcode
# 4. Submit for review in App Store Connect
```

### Google Play Store (Android)

```bash
# 1. Prepare app
# - Update versionCode and versionName in build.gradle
# - Update screenshots
# - Update Play Store description

# 2. Build AAB (recommended) or APK
npm run build:android

# 3. Upload to Play Console
# 4. Create release and submit for review
```

### OTA Updates (CodePush)

```bash
# Install CodePush CLI
npm install -g code-push-cli

# Login
code-push login

# Deploy update
code-push release-react AirlineOps-iOS ios
code-push release-react AirlineOps-Android android
```

## 🐛 Troubleshooting

### Common Issues

**iOS Build Fails**:
```bash
# Clean build folder
cd ios && rm -rf build && cd ..

# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

**Android Build Fails**:
```bash
# Clean gradle
cd android && ./gradlew clean && cd ..

# Clear gradle cache
rm -rf ~/.gradle/caches
```

**Metro Bundler Issues**:
```bash
# Clear cache
npm start -- --reset-cache

# Or
watchman watch-del-all
rm -rf $TMPDIR/react-*
```

**Dependencies Issues**:
```bash
# Clean install
rm -rf node_modules
npm install

# For iOS
cd ios && pod install && cd ..
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**React Native**: 0.73.2
**Platform**: iOS 14+, Android 10+
**Maintained By**: Mobile Team
