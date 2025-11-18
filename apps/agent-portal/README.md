# Agent Portal - DCS (Departure Control System)

Modern Next.js 14 desktop application for airport check-in agents, providing a fast and intuitive interface for passenger check-in, seat assignment, baggage processing, and APIS data collection.

## Overview

The Agent Portal is the primary user interface for airport check-in operations. It connects to the DCS backend service via REST APIs and Socket.io for real-time updates, enabling agents to efficiently process passengers with a target check-in time of 5 seconds per passenger.

**Target Performance**:
- <5 seconds per passenger check-in
- <500ms seat map loading
- <1 second passenger lookup
- 100+ concurrent agent sessions

## Features

### Core Check-in Interface
- **Fast Login**: Agent credential authentication with station assignment
- **Passenger Search**: Quick search by PNR, name, or frequent flyer number
- **Quick Check-in**: Streamlined workflow optimized for speed
- **Multi-passenger Check-in**: Process multiple passengers simultaneously
- **Real-time Status**: Live check-in statistics and flight load

### Interactive Seat Map
- **Visual Seat Selection**: Interactive aircraft layout with real-time availability
- **Real-time Updates**: Socket.io for live seat map synchronization across agents
- **Seat Types**: Visual indicators for premium, extra legroom, emergency exit seats
- **Seat Blocking**: Automatic temporary blocks during selection
- **Multi-aircraft Support**: Configurable layouts for different aircraft types
- **Status Indicators**: Available, occupied, selected, blocked states
- **Passenger Assignment**: Visual confirmation of seat assignments

### Baggage Processing
- **Quick Bag Tag**: Streamlined baggage tag issuance
- **Weight Validation**: Automatic overweight detection
- **Special Handling**: Fragile, oversized, priority baggage flagging
- **Fee Calculation**: Automatic excess baggage fee calculation
- **Bag Tag Printing**: One-click PDF generation and printing
- **BSM Generation**: Automatic baggage source message creation

### APIS Data Collection
- **Document Capture**: Passport, visa, ID card information entry
- **OCR Support**: Passport scanning for automated data entry
- **Validation**: Real-time field validation and error checking
- **Timatic Integration**: Automatic visa requirement checking
- **Government Submission**: Direct APIS submission to government systems
- **Watchlist Screening**: Automated security screening feedback

### Multi-tasking & Queue Management
- **Multiple PNRs**: Handle up to 5 concurrent check-in transactions
- **Transaction Queue**: Priority-based transaction management
- **Task Switching**: Quick switching between active transactions
- **Session Persistence**: Automatic transaction recovery

### Payment Processing
- **Fee Collection**: Baggage fees, seat fees, upgrade fees
- **Payment Methods**: Card, cash, voucher support
- **Receipt Generation**: Automatic receipt printing
- **Transaction Tracking**: Complete payment audit trail

## Technology Stack

### Frontend
- **Framework**: Next.js 14.1 with App Router
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod validation
- **State Management**:
  - TanStack Query (React Query) for server state
  - Zustand for client state
- **Real-time**: Socket.io client
- **HTTP Client**: Axios

### Performance Optimizations
- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js Font optimization
- **Caching**: Aggressive client-side caching with React Query

## Installation

### Prerequisites
- Node.js 20+
- pnpm (workspace manager)
- DCS Service running on port 3010
- Socket.io server running on port 3011

### Setup

1. **Install dependencies**:
```bash
cd apps/agent-portal
pnpm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**:
```bash
pnpm dev
```

Application will be available at `http://localhost:3009`

4. **Build for production**:
```bash
pnpm build
pnpm start
```

## Configuration

### Environment Variables

**API Configuration**:
```env
NEXT_PUBLIC_DCS_SERVICE_URL=http://localhost:3010
NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:3011
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Agent Features**:
```env
NEXT_PUBLIC_ENABLE_MULTI_TASKING=true
NEXT_PUBLIC_MAX_CONCURRENT_PNRS=5
NEXT_PUBLIC_ENABLE_QUICK_CHECK_IN=true
NEXT_PUBLIC_ENABLE_GROUP_CHECK_IN=true
```

**Seat Map Configuration**:
```env
NEXT_PUBLIC_SEAT_MAP_REFRESH_INTERVAL=5000
NEXT_PUBLIC_ENABLE_SEAT_BLOCKING=true
NEXT_PUBLIC_SEAT_BLOCK_DURATION=300000
```

**Baggage Configuration**:
```env
NEXT_PUBLIC_ENABLE_BAGGAGE_TRACKING=true
NEXT_PUBLIC_ENABLE_BAG_TAG_PRINTING=true
NEXT_PUBLIC_MAX_BAGS_PER_PASSENGER=10
```

**APIS Configuration**:
```env
NEXT_PUBLIC_ENABLE_APIS=true
NEXT_PUBLIC_ENABLE_PASSPORT_SCAN=true
NEXT_PUBLIC_APIS_REQUIRED_ROUTES=US,CA,GB,AU,NZ
```

**Payment Configuration**:
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ACCEPTED_PAYMENT_METHODS=card,cash,voucher
NEXT_PUBLIC_PAYMENT_TIMEOUT=120000
```

**Performance Targets**:
```env
NEXT_PUBLIC_TARGET_CHECK_IN_TIME=5000
NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING=true
```

See `.env.example` for complete configuration options.

## Project Structure

```
apps/agent-portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page (passenger search)
│   │   ├── globals.css             # Global styles
│   │   └── check-in/
│   │       └── [id]/
│   │           └── page.tsx        # Check-in page
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── toaster.tsx
│   │   ├── providers.tsx           # App providers (Query, Socket)
│   │   ├── seat-map.tsx            # Interactive seat map
│   │   └── ...                     # Other components
│   └── lib/
│       ├── api.ts                  # API client & endpoints
│       ├── socket-context.tsx      # Socket.io context
│       └── utils.ts                # Utility functions
├── public/                         # Static assets
├── .env.example                    # Environment template
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json
└── README.md
```

## Usage Guide

### 1. Agent Login
1. Open Agent Portal at `http://localhost:3009`
2. Enter agent credentials
3. Select station/counter
4. Begin processing passengers

### 2. Passenger Search
**By PNR**:
1. Select "PNR" search type
2. Enter 6-character PNR (e.g., ABC123)
3. Click "Search Passenger"

**By Name**:
1. Select "Name" search type
2. Enter passenger last name
3. Click "Search Passenger"

**By Frequent Flyer Number**:
1. Select "Frequent Flyer" search type
2. Enter FFN
3. Click "Search Passenger"

### 3. Quick Check-in Flow

**Step 1: Verify Passenger Details**
- Review passenger information
- Confirm flight details
- Check booking class and fare

**Step 2: Assign Seat**
- Click on interactive seat map
- Select available seat
- Confirm seat assignment
- Real-time update to other agents

**Step 3: Process Baggage**
- Enter bag weight
- Select destination
- Click "Issue Bag Tag"
- Print bag tag PDF

**Step 4: Collect APIS (if required)**
- Scan passport (if OCR enabled)
- Review extracted data
- Correct any errors
- Submit to government systems

**Step 5: Collect Payment (if fees)**
- Review fees (baggage, seat, etc.)
- Select payment method
- Process payment
- Generate receipt

**Step 6: Issue Boarding Pass**
- Review complete check-in
- Click "Complete Check-in"
- Print boarding pass
- Hand documents to passenger

**Target Time**: <5 seconds for simple check-in, 30-60 seconds with ancillaries

### 4. Multi-tasking
- Use transaction queue for multiple passengers
- Switch between active transactions
- Priority handling for time-sensitive passengers
- Automatic transaction timeout handling

### 5. Seat Map Usage

**Seat Status Colors**:
- 🟢 Green: Available seat
- ⚪ Gray: Occupied seat
- 🔵 Blue: Selected seat
- 🟡 Yellow: Blocked by another agent

**Seat Type Indicators**:
- ★ Premium seat (extra fee)
- ⊕ Emergency exit (restrictions apply)

**Real-time Updates**:
- Seat selections appear instantly to all agents
- Automatic seat blocking during selection (5 minutes)
- Live passenger assignments
- Seat release notifications

### 6. Performance Tracking
The portal tracks:
- Check-in completion time per passenger
- Passengers processed per hour
- Average transaction time
- Fee collection totals
- Agent productivity metrics

## Components

### SeatMap Component
Interactive aircraft seat map with real-time updates.

**Props**:
```typescript
interface SeatMapProps {
  flightId: string;              // Flight identifier
  onSeatSelect?: (seat: Seat) => void;  // Seat selection callback
  selectedSeats?: string[];      // Currently selected seats
  className?: string;            // Additional CSS classes
}
```

**Usage**:
```tsx
import { SeatMap } from '@/components/seat-map';

<SeatMap
  flightId="AA100-2024-01-15-JFK-LAX"
  onSeatSelect={(seat) => console.log('Selected:', seat.number)}
  selectedSeats={['12A', '12B']}
/>
```

**Socket.io Events Handled**:
- `seat:map:update` - Full seat map refresh
- `seat:blocked` - Seat blocked notification
- `seat:released` - Seat released notification
- `seat:assigned` - Seat assigned notification

### API Client
Axios-based API client with automatic authentication and error handling.

**Usage**:
```typescript
import { checkInAPI, baggageAPI, apisAPI } from '@/lib/api';

// Start check-in
const result = await checkInAPI.startCheckIn({
  pnrLocator: 'ABC123',
  flightId: 'AA100-2024-01-15-JFK-LAX',
  agentId: 'agent-001',
  agentName: 'John Doe',
  stationCode: 'JFK',
  passengers: [...]
});

// Issue baggage tag
const tag = await baggageAPI.issueBaggageTag({
  passengerCheckInId: 'checkin-001',
  flightId: 'AA100-2024-01-15-JFK-LAX',
  weight: 20,
  origin: 'JFK',
  destination: 'LAX'
});

// Collect APIS
const apis = await apisAPI.collectAPISData({
  passengerCheckInId: 'checkin-001',
  documentType: 'P',
  documentNumber: '123456789',
  ...
});
```

### Socket Context
React context for Socket.io connection management.

**Usage**:
```typescript
import { useSocket } from '@/lib/socket-context';

function MyComponent() {
  const { socket, isConnected, joinFlight, leaveFlight } = useSocket();

  useEffect(() => {
    if (isConnected) {
      joinFlight('AA100-2024-01-15-JFK-LAX');

      socket?.on('passenger:checked-in', (data) => {
        console.log('Passenger checked in:', data);
      });

      return () => {
        leaveFlight('AA100-2024-01-15-JFK-LAX');
      };
    }
  }, [isConnected]);

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

## Keyboard Shortcuts

Agent portal supports keyboard shortcuts for efficiency:

- **Ctrl+F**: Focus passenger search
- **Ctrl+S**: Assign seat
- **Ctrl+B**: Process baggage
- **Ctrl+P**: Print boarding pass
- **Ctrl+N**: New transaction
- **Ctrl+Tab**: Switch between transactions
- **Esc**: Cancel current operation

## Offline Mode

The portal includes offline capabilities:
- Transaction queue persisted to localStorage
- Automatic sync when connection restored
- Offline indicator in UI
- Cached passenger data for recent searches

## Printing

### Boarding Pass Printing
- PDF generation via backend API
- Automatic print dialog
- Support for thermal and laser printers
- IATA BCBP standard barcode (PDF417)

### Bag Tag Printing
- 4x6 inch format
- PDF417 barcode
- IATA-compliant layout
- Queue support for batch printing

### Receipt Printing
- Payment receipts
- Fee breakdown
- Transaction summary

## Accessibility

The Agent Portal follows WCAG 2.1 AA standards:
- Keyboard navigation support
- Screen reader compatible
- High contrast mode
- Focus indicators
- ARIA labels

## Browser Support

- Chrome 90+ (recommended)
- Firefox 88+
- Edge 90+
- Safari 14+

**Recommended**: Latest Chrome for best performance

## Performance

### Optimization Strategies
- Route-based code splitting
- Image lazy loading
- Component lazy loading
- Debounced search inputs
- Optimistic UI updates
- Request deduplication
- Response caching

### Metrics
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1
- Time to Interactive (TTI): <3.5s

## Development

### Scripts
```bash
pnpm dev              # Start development server (port 3009)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript type checking
```

### Adding New Features
1. Create component in `src/components/`
2. Add page in `src/app/` if needed
3. Update API client in `src/lib/api.ts`
4. Add Socket.io events if real-time needed
5. Update documentation

### Testing
```bash
pnpm test             # Run unit tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:coverage    # Generate coverage report
```

## Troubleshooting

### Common Issues

**Socket.io Not Connecting**:
- Verify `NEXT_PUBLIC_SOCKET_IO_URL` is correct
- Check DCS service Socket.io server is running
- Review browser console for WebSocket errors
- Check firewall/proxy settings

**Slow Seat Map Loading**:
- Check Socket.io connection status
- Verify seat map cache configuration
- Review network latency to DCS service
- Check browser performance

**API Requests Failing**:
- Verify `NEXT_PUBLIC_DCS_SERVICE_URL` is correct
- Check DCS service is running and healthy
- Review network tab for error details
- Verify authentication token is valid

**Printing Not Working**:
- Check printer is connected and online
- Verify browser print permissions
- Try alternative print method
- Check PDF generation in network tab

## Security

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Session timeout handling

### Data Protection
- HTTPS only in production
- Secure headers (CSP, HSTS, etc.)
- XSS protection
- CSRF protection

### PII Handling
- No sensitive data in localStorage
- Automatic data clearing on logout
- Audit logging of PII access
- GDPR compliance

## Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3009
CMD ["pnpm", "start"]
```

### Environment Variables (Production)
Ensure these are set in production:
```env
NODE_ENV=production
NEXT_PUBLIC_DCS_SERVICE_URL=https://dcs-api.airline-ops.com
NEXT_PUBLIC_SOCKET_IO_URL=https://dcs-realtime.airline-ops.com
```

## Support & Training

### Agent Training
- Quick start guide included
- Video tutorials available
- Interactive demo mode
- Practice transactions

### Technical Support
- Email: support@airline-ops.com
- Documentation: https://docs.airline-ops.com
- Issue Tracker: https://github.com/airline-ops/pss-platform/issues

## License

Proprietary - Airline Operations Platform

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core check-in functionality
- Interactive seat map with real-time updates
- Baggage processing
- APIS data collection
- Multi-tasking support
- Performance optimizations
