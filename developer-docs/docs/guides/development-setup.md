# Development Setup Guide

## Prerequisites

Before setting up the PSS-nano development environment, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Recommended | Purpose |
|----------|----------------|-------------|----------|
| **Node.js** | 20.0.0 | 20.11.0+ | JavaScript runtime |
| **npm** | 10.0.0 | 10.2.0+ | Package manager |
| **Docker** | 24.0.0 | Latest | Containerization |
| **Docker Compose** | 2.20.0 | Latest | Multi-container orchestration |
| **Git** | 2.40.0 | Latest | Version control |
| **PostgreSQL** | 16.0 | 16.1+ | Database (optional if using Docker) |
| **Redis** | 7.0 | 7.2+ | Cache (optional if using Docker) |

### Optional but Recommended

- **VS Code** 1.85+ - Recommended IDE
- **Postman** or **Insomnia** - API testing
- **pgAdmin** or **DBeaver** - Database management
- **k6** - Load testing
- **kubectl** - Kubernetes CLI (for deployment)

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/jbandu/PSS-nano.git
cd PSS-nano

# Check out the develop branch (or your feature branch)
git checkout develop
```

### 2. Install Dependencies

```bash
# Install root dependencies (turborepo, etc.)
npm install

# This will install dependencies for all services and apps via turborepo
```

**Expected output:**
```
added 5000+ packages in 2m
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```env
# Node Environment
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pss_nano_dev?schema=public"
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/pss_nano_test?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# RabbitMQ Configuration
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
RABBITMQ_MANAGEMENT_URL="http://localhost:15672"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="1h"
JWT_REFRESH_EXPIRY="7d"

# API Gateway
API_GATEWAY_PORT=3000
API_GATEWAY_URL="http://localhost:3000"

# Service Ports
AUTH_SERVICE_PORT=3001
RESERVATION_SERVICE_PORT=3002
INVENTORY_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005

# Frontend Ports
BOOKING_ENGINE_PORT=4001
AGENT_PORTAL_PORT=4000

# External Services
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Configuration (Development - MailHog)
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@pss-nano.com"

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Observability
PROMETHEUS_PORT=9090
GRAFANA_PORT=3010
JAEGER_PORT=16686
LOKI_PORT=3100

# Feature Flags
ENABLE_MFA=true
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

### 4. Start Infrastructure Services

Start PostgreSQL, Redis, RabbitMQ, and observability stack using Docker Compose:

```bash
docker-compose up -d
```

**Verify services are running:**

```bash
docker-compose ps
```

**Expected output:**
```
NAME                       STATUS
pss-nano-postgres-1        Up
pss-nano-redis-1           Up
pss-nano-rabbitmq-1        Up
pss-nano-mailhog-1         Up
pss-nano-prometheus-1      Up
pss-nano-grafana-1         Up
pss-nano-loki-1            Up
pss-nano-jaeger-1          Up
```

**Access Infrastructure Services:**
- PostgreSQL: `localhost:5432` (postgres/postgres)
- Redis: `localhost:6379`
- RabbitMQ Management: http://localhost:15672 (guest/guest)
- MailHog: http://localhost:8025
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3010 (admin/admin)
- Jaeger: http://localhost:16686
- Loki: http://localhost:3100

### 5. Initialize the Database

```bash
# Navigate to database schemas package
cd packages/database-schemas

# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Seed the database with sample data
npx prisma db seed

# Return to root
cd ../..
```

**Verify database:**

```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/pss_nano_dev

# List tables
\dt

# Should see 40+ tables
```

### 6. Build Shared Packages

```bash
# Build all shared packages
npm run build:packages
```

This builds:
- `@pss-nano/database-schemas`
- `@pss-nano/shared-types`
- `@pss-nano/shared-utils`
- `@pss-nano/observability`

### 7. Start All Services

**Option A: Start all services (recommended for first-time setup)**

```bash
npm run dev
```

This starts all services in parallel:
- API Gateway (port 3000)
- Auth Service (port 3001)
- Reservation Service (port 3002)
- Inventory Service (port 3003)
- Payment Service (port 3004)
- Notification Service (port 3005)
- Booking Engine (port 4001)
- Agent Portal (port 4000)

**Option B: Start specific services**

```bash
# Start only backend services
npm run dev:services

# Start only frontend applications
npm run dev:apps

# Start a single service
cd services/reservation-service
npm run dev
```

### 8. Verify Installation

**Check service health:**

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Reservation Service
curl http://localhost:3002/health

# All should return: {"status":"UP"}
```

**Test API:**

```bash
# Register a test user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Should return JWT token
```

**Access Frontend Applications:**
- Booking Engine: http://localhost:4001
- Agent Portal: http://localhost:4000

## Development Workflow

### Working on a Microservice

```bash
# Navigate to service directory
cd services/reservation-service

# Install dependencies (if not already done)
npm install

# Start in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Working on a Frontend Application

```bash
# Navigate to app directory
cd apps/booking-engine

# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run tests
npm test

# Type check
npm run type-check
```

### Database Migrations

```bash
cd packages/database-schemas

# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Generate Prisma client after schema changes
npx prisma generate
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for all services
npm run test:services

# Run tests for all apps
npm run test:apps

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run load tests
cd load-tests
k6 run scenarios/booking-flow.js
```

## IDE Setup (VS Code)

### Recommended Extensions

Install the following VS Code extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "mikestead.dotenv",
    "christian-kohler.npm-intellisense",
    "orta.vscode-jest",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "jest.autoRun": "off",
  "jest.showCoverageOnLoad": false,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Reservation Service",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/services/reservation-service/src/index.ts",
      "preLaunchTask": "tsc: build - services/reservation-service/tsconfig.json",
      "outFiles": ["${workspaceFolder}/services/reservation-service/dist/**/*.js"],
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${relativeFile}", "--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs pss-nano-postgres-1

# Restart PostgreSQL
docker-compose restart postgres

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/pss_nano_dev -c "SELECT 1"
```

### Port Already in Use

**Problem:** Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change the port in .env
API_GATEWAY_PORT=3001
```

### Prisma Generate Fails

**Problem:** `prisma generate` fails

**Solution:**
```bash
# Clean Prisma cache
npx prisma generate --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Ensure correct DATABASE_URL in .env
echo $DATABASE_URL
```

### npm install Fails

**Problem:** `npm install` fails with permissions error

**Solution:**
```bash
# Use correct Node version
node -v  # Should be 20+
nvm use 20  # If using nvm

# Clear npm cache
npm cache clean --force

# Remove package-lock and node_modules
rm -rf node_modules package-lock.json
npm install
```

### RabbitMQ Connection Fails

**Problem:** Services can't connect to RabbitMQ

**Solution:**
```bash
# Check RabbitMQ status
docker-compose ps rabbitmq

# Check RabbitMQ logs
docker logs pss-nano-rabbitmq-1

# Restart RabbitMQ
docker-compose restart rabbitmq

# Access management UI
open http://localhost:15672
```

### Tests Failing

**Problem:** Tests fail unexpectedly

**Solution:**
```bash
# Use test database
export NODE_ENV=test
export DATABASE_URL=$DATABASE_URL_TEST

# Reset test database
cd packages/database-schemas
npx prisma migrate reset --force

# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose
```

## Environment-Specific Setup

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install node@20
brew install postgresql@16
brew install redis
brew install --cask docker

# Start services (if not using Docker)
brew services start postgresql@16
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Install PostgreSQL (optional)
sudo apt-get install postgresql-16

# Install Redis (optional)
sudo apt-get install redis-server
```

### Windows

```powershell
# Install using Chocolatey (recommended)
choco install nodejs-lts
choco install docker-desktop
choco install postgresql16
choco install redis

# Or use installers from official websites
# Node.js: https://nodejs.org/
# Docker Desktop: https://www.docker.com/products/docker-desktop
```

## Next Steps

Once your development environment is set up:

1. Read the [Code Standards](code-standards.md) guide
2. Review the [Architecture Overview](../architecture/overview.md)
3. Explore the [Service Catalog](../services/catalog.md)
4. Try the [Testing Guide](testing.md)
5. Check out the [Git Workflow](git-workflow.md)

## Quick Reference

```bash
# Start everything
npm run dev

# Stop all services
Ctrl+C (or docker-compose down for infrastructure)

# Reset database
cd packages/database-schemas && npx prisma migrate reset

# View logs
docker-compose logs -f

# Run tests
npm test

# Lint and format
npm run lint && npm run format

# Build for production
npm run build

# Clean everything
npm run clean
```

## Getting Help

If you encounter issues:
1. Check the [FAQ](faq.md)
2. Search existing GitHub issues
3. Ask in the team Slack channel
4. Create a new GitHub issue with the `setup` label
