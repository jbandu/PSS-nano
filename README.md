# Airline Operational Intelligence Platform

A modern, scalable monorepo architecture for airline operations management, built with microservices, TypeScript, and cloud-native technologies.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Admin Portal    │              │  Booking Engine   │         │
│  │   (Next.js)      │              │   (Next.js)       │         │
│  └────────┬─────────┘              └────────┬──────────┘         │
└───────────┼────────────────────────────────┼────────────────────┘
            │                                │
            └────────────────┬───────────────┘
                             │
            ┌────────────────▼────────────────┐
            │       API Gateway (3000)         │
            │  - Routing                      │
            │  - Load Balancing               │
            │  - Rate Limiting                │
            └────────────────┬────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐  ┌─────────▼────────┐  ┌──────▼────────┐
│ Auth Service  │  │ Reservation      │  │  Inventory    │
│    (3001)     │  │   Service        │  │   Service     │
│               │  │    (3002)        │  │    (3003)     │
└───────┬───────┘  └─────────┬────────┘  └──────┬────────┘
        │                    │                   │
        │          ┌─────────▼────────┐          │
        │          │  Payment Service │          │
        │          │      (3004)      │          │
        │          └─────────┬────────┘          │
        │                    │                   │
        │          ┌─────────▼────────┐          │
        │          │ Notification     │          │
        │          │   Service        │          │
        │          │     (3005)       │          │
        │          └─────────┬────────┘          │
        │                    │                   │
        └────────────────────┼───────────────────┘
                             │
        ┌────────────────────┼───────────────────┐
        │                    │                   │
┌───────▼────────┐  ┌────────▼────────┐  ┌──────▼────────┐
│   PostgreSQL   │  │     Redis       │  │   RabbitMQ    │
│     (5432)     │  │     (6379)      │  │  (5672/15672) │
└────────────────┘  └─────────────────┘  └───────────────┘
```

## 📦 Project Structure

```
airline-ops-platform/
├── packages/                   # Shared libraries
│   ├── shared-types/          # TypeScript interfaces & types
│   ├── shared-utils/          # Common utilities
│   └── database-schemas/      # Prisma schemas & client
│
├── services/                   # Microservices
│   ├── api-gateway/           # Main API gateway (Port 3000)
│   ├── auth-service/          # Authentication & authorization (Port 3001)
│   ├── reservation-service/   # Booking management (Port 3002)
│   ├── inventory-service/     # Seat inventory (Port 3003)
│   ├── payment-service/       # Payment processing (Port 3004)
│   └── notification-service/  # Email/SMS notifications (Port 3005)
│
├── apps/                       # Frontend applications
│   ├── admin-portal/          # Admin dashboard (Port 4000)
│   └── booking-engine/        # Customer booking app (Port 4001)
│
├── infrastructure/             # Infrastructure as Code
│   ├── kubernetes/            # K8s manifests
│   └── terraform/             # AWS/GCP resources
│
├── scripts/                    # Utility scripts
│   ├── setup.sh               # Initial setup
│   └── init-db.sql           # Database initialization
│
├── docker-compose.yml          # Local development stack
├── turbo.json                  # Turborepo configuration
└── package.json                # Root package configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** & Docker Compose
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PSS-nano
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

   This script will:
   - Install all dependencies
   - Start Docker containers (PostgreSQL, Redis, RabbitMQ, MailHog)
   - Generate Prisma client
   - Push database schema
   - Seed initial data
   - Build shared packages

4. **Start development servers**
   ```bash
   npm run dev
   ```

### Manual Setup (Alternative)

```bash
# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Generate Prisma client
cd packages/database-schemas
npx prisma generate
npx prisma db push
npx prisma db seed
cd ../..

# Build packages
npm run build

# Start services
npm run dev
```

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start all services in watch mode
npm run build            # Build all packages and services
npm run test             # Run tests
npm run lint             # Lint code
npm run format           # Format code with Prettier
npm run typecheck        # Type check all packages
npm run clean            # Clean build artifacts

# Docker commands
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:logs      # View Docker logs

# Database commands
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

### Service Endpoints

| Service | Port | Health Check | Description |
|---------|------|--------------|-------------|
| API Gateway | 3000 | `/health` | Main entry point |
| Auth Service | 3001 | `/health` | Authentication |
| Reservation Service | 3002 | `/health` | Booking management |
| Inventory Service | 3003 | `/health` | Seat inventory |
| Payment Service | 3004 | `/health` | Payment processing |
| Notification Service | 3005 | `/health` | Notifications |
| Admin Portal | 4000 | - | Admin dashboard |
| Booking Engine | 4001 | - | Customer booking |

### Infrastructure Services

| Service | Port | UI | Credentials |
|---------|------|----|----|
| PostgreSQL | 5432 | - | airlineops / devpassword123 |
| Redis | 6379 | - | - |
| RabbitMQ | 5672, 15672 | http://localhost:15672 | airlineops / devpassword123 |
| MailHog | 1025, 8025 | http://localhost:8025 | - |

## 📚 API Documentation

### Authentication Service

#### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Reservation Service

#### Create Reservation
```bash
POST /api/v1/reservations
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "flightId": "uuid",
  "cabinClass": "ECONOMY",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "passportNumber": "AB123456"
    }
  ]
}
```

#### Get Reservation by PNR
```bash
GET /api/v1/reservations/pnr/:pnr
Authorization: Bearer <token>
```

## 🗄️ Database Schema

The platform uses PostgreSQL with Prisma ORM. Key entities:

- **Users** - User accounts and authentication
- **Flights** - Flight schedules and details
- **Seats** - Individual seat information
- **Inventory** - Cabin-wise seat inventory
- **Reservations** - Booking records
- **Passengers** - Passenger information
- **Payments** - Payment transactions
- **Notifications** - Notification history

### Migrations

```bash
# Create a new migration
cd packages/database-schemas
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
cd packages/shared-utils
npm test

# Run tests for specific service
cd services/auth-service
npm test
```

## 🚢 Deployment

### Docker Build

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply configurations
kubectl apply -f infrastructure/kubernetes/

# Check deployment status
kubectl get pods -n airline-ops
```

## 🔐 Security

- **JWT** authentication with access & refresh tokens
- **Helmet.js** for HTTP security headers
- **CORS** configuration
- **Rate limiting** on auth endpoints
- **Password hashing** with bcrypt
- **SQL injection** protection via Prisma
- **Environment variables** for sensitive data

## 📊 Monitoring & Observability

Health check endpoints are available at `/health` for all services:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## 🛠️ Technology Stack

### Backend
- **Node.js 20+** - Runtime
- **TypeScript 5+** - Programming language
- **Express.js** - Web framework
- **Prisma** - ORM
- **JWT** - Authentication
- **Joi** - Validation

### Frontend
- **Next.js 14** - React framework
- **TailwindCSS** - Styling
- **React Query** - Data fetching

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Caching & sessions
- **RabbitMQ** - Message queue
- **Docker** - Containerization
- **Kubernetes** - Orchestration

### DevOps
- **Turborepo** - Monorepo build system
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Terraform** - Infrastructure as Code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Team

- Development Team: Airline Ops Platform
- Contact: dev@airlineops.com

## 🔗 Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

---

**Version**: 1.0.0
**Last Updated**: 2024-01-01
