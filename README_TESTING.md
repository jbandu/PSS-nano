# PSS-nano Testing Infrastructure

## 🎯 Overview

Comprehensive testing infrastructure for the PSS-nano platform, covering unit, integration, E2E, load, security, and accessibility testing.

## ✅ Testing Stack

| Test Type | Framework | Coverage |
|-----------|-----------|----------|
| **Unit Tests** | Jest + ts-jest | 80%+ target |
| **Integration Tests** | Supertest + Jest | Critical paths |
| **E2E Tests** | Playwright | Major user flows |
| **Component Tests** | React Testing Library | UI components |
| **API Tests** | Supertest | REST endpoints |
| **Load Tests** | k6 | 1000+ concurrent users |
| **Security Tests** | OWASP ZAP + Snyk | OWASP Top 10 |
| **Accessibility** | axe-core | WCAG 2.1 AA |
| **Mobile Tests** | Detox (planned) | React Native apps |

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

## 📁 Project Structure

```
PSS-nano/
├── test-setup/                    # Global test configuration
│   ├── fixtures/                  # Test data (passengers, flights, bookings)
│   ├── mocks/                     # Mock implementations (DB, Redis, RabbitMQ, HTTP)
│   ├── utils/                     # Test helpers and utilities
│   ├── jest.setup.js              # Jest global setup
│   └── jest.setup.react.js        # React Testing Library setup
├── services/                      # Backend microservices
│   └── [service-name]/
│       └── src/__tests__/
│           ├── unit/              # Unit tests for this service
│           └── integration/       # Integration tests
├── apps/                          # Frontend applications
│   └── [app-name]/
│       └── src/__tests__/         # Component tests
├── e2e-tests/                     # End-to-end tests
│   ├── flows/                     # User flow tests
│   ├── pages/                     # Page Object Models
│   ├── utils/                     # E2E utilities
│   ├── global-setup.ts            # E2E global setup
│   └── global-teardown.ts         # E2E cleanup
├── load-tests/                    # Performance tests
│   └── scenarios/                 # k6 test scenarios
├── .github/workflows/             # CI/CD pipelines
│   ├── test-unit.yml              # Unit test workflow
│   ├── test-integration.yml       # Integration test workflow
│   ├── test-e2e.yml               # E2E test workflow
│   ├── test-security.yml          # Security scanning
│   └── test-performance.yml       # Load testing
├── .zap/                          # OWASP ZAP configuration
├── jest.config.base.js            # Base Jest config
├── jest.config.frontend.js        # Frontend Jest config
├── playwright.config.ts           # Playwright config
└── docs/
    ├── TESTING.md                 # Comprehensive testing guide
    └── TESTING_BEST_PRACTICES.md  # Best practices guide
```

## 🧪 Test Types

### 1. Unit Tests

**Location**: `services/[service]/src/__tests__/unit/`

**Run**: `npm run test:unit`

**Example**:
```typescript
describe('AuthService', () => {
  it('should register a new user', async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'SecurePass123!',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.tokens).toBeDefined();
  });
});
```

**Coverage**: Run with `npm run test:unit -- --coverage`

### 2. Integration Tests

**Location**: `services/[service]/src/__tests__/integration/`

**Run**: `npm run test:integration`

**Example**:
```typescript
describe('POST /api/v1/auth/register', () => {
  it('should register a new user via API', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'new@example.com', password: 'pass123' })
      .expect(201);

    expect(response.body.data.user).toBeDefined();
  });
});
```

### 3. E2E Tests

**Location**: `e2e-tests/flows/`

**Run**: `npm run test:e2e`

**Example**:
```typescript
test('complete booking flow', async ({ page }) => {
  const bookingPage = new BookingPage(page);

  await bookingPage.searchFlights('JFK', 'LAX', '2025-12-15');
  await bookingPage.selectFirstFlight();
  await bookingPage.completeBooking();

  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
});
```

**Debug**: `npm run test:e2e:debug`

### 4. Load Tests

**Location**: `load-tests/scenarios/`

**Run**: `npm run load:booking`

**Scenarios**:
- `booking-flow.k6.js` - Complete booking simulation (1000+ users)
- `spike-test.k6.js` - Sudden traffic spike
- `stress-test.k6.js` - Find breaking point
- `soak-test.k6.js` - Extended duration (2+ hours)

**Example**:
```bash
# Run booking flow load test
k6 run load-tests/scenarios/booking-flow.k6.js

# Custom parameters
k6 run --vus 500 --duration 10m load-tests/scenarios/booking-flow.k6.js
```

### 5. Security Tests

**Location**: `.github/workflows/test-security.yml`

**Run**: Manual via GitHub Actions or locally:

```bash
# Dependency scan
npm run security:scan

# OWASP ZAP scan (requires Docker)
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable \
  zap-baseline.py -t http://localhost:4001 -c .zap/rules.tsv
```

### 6. Accessibility Tests

**Location**: `e2e-tests/flows/accessibility.e2e.ts`

**Run**: `npm run test:a11y`

**Tests**:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Form labels
- Image alt text

## 📊 Test Coverage

### Current Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: 100% of critical API endpoints
- **E2E Tests**: All major user flows
- **Load Tests**: 1000+ concurrent users
- **Security**: OWASP Top 10 compliance
- **Accessibility**: WCAG 2.1 AA compliance

### View Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## 🔄 CI/CD Integration

All tests run automatically via GitHub Actions:

### Triggers

- **On every push**: Unit tests, integration tests, linting
- **On PR**: All tests + coverage check (must be ≥80%)
- **Nightly**: E2E tests, security scans
- **Weekly**: Full security audit
- **On-demand**: Load tests

### Required Checks

Pull requests must pass:
- ✅ Unit tests
- ✅ Integration tests
- ✅ Coverage ≥80%
- ✅ TypeScript compilation
- ✅ Linting
- ✅ No high-severity security issues

## 🛠️ Test Data

### Fixtures

Pre-built test data available in `test-setup/fixtures/`:

```typescript
import {
  generatePassenger,
  generateFlight,
  generateBooking,
  SAMPLE_PASSENGERS,
  TEST_PAYMENT_CARDS,
} from '../test-setup/fixtures';

const passenger = generatePassenger();
const flight = generateFlight({ origin: 'JFK', destination: 'LAX' });
const booking = generateBooking();
```

### Mocks

Mock implementations for external dependencies:

```typescript
import { prismaMock } from '../test-setup/mocks/database.mock';
import { redisMock } from '../test-setup/mocks/redis.mock';
import { channelMock } from '../test-setup/mocks/rabbitmq.mock';
import { mockFetch } from '../test-setup/mocks/http.mock';
```

## 📖 Documentation

- **[Complete Testing Guide](docs/TESTING.md)** - Comprehensive testing documentation
- **[Best Practices](docs/TESTING_BEST_PRACTICES.md)** - Testing best practices and patterns

## 🎓 Examples

### Unit Test Example

```typescript
// services/auth-service/src/__tests__/unit/auth.service.test.ts
describe('AuthService.login', () => {
  it('should return tokens for valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.tokens.accessToken).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
// services/auth-service/src/__tests__/integration/auth.api.test.ts
describe('POST /api/v1/auth/login', () => {
  it('should login and return tokens', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'pass123' })
      .expect(200);

    expect(response.body.data.tokens).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
// e2e-tests/flows/booking.e2e.ts
test('should complete booking', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="origin"]', 'JFK');
  await page.fill('[data-testid="destination"]', 'LAX');
  await page.click('[data-testid="search"]');

  await expect(page.locator('[data-testid="results"]')).toBeVisible();
});
```

## 🐛 Troubleshooting

### Tests Failing Locally

```bash
# Clear cache
npm run test:clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### E2E Tests Timing Out

```bash
# Increase timeout
npx playwright test --timeout=60000

# Run in headed mode
npm run test:e2e:headed
```

### Database Connection Issues

```bash
# Check PostgreSQL
pg_isready -h localhost -p 5432

# Restart services
docker-compose restart
```

## 📈 Performance

### Test Execution Times

- Unit tests: ~30 seconds (1500+ tests)
- Integration tests: ~2 minutes
- E2E tests: ~15 minutes (all browsers)
- Load tests: Varies (5 min - 2 hours)

### Optimization Tips

- Run tests in parallel: `--max-workers=4`
- Use watch mode for development: `npm run test:watch`
- Run specific tests: `npm test -- auth.service.test.ts`

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD)
2. Maintain 80%+ coverage
3. Add E2E tests for user-facing changes
4. Update documentation
5. Ensure all CI checks pass

## 📞 Support

- Check **[docs/TESTING.md](docs/TESTING.md)** for detailed guides
- Review **[docs/TESTING_BEST_PRACTICES.md](docs/TESTING_BEST_PRACTICES.md)** for patterns
- Check [GitHub Issues](https://github.com/jbandu/PSS-nano/issues)
- Review CI/CD logs on GitHub Actions

---

## Test Command Reference

```bash
# Unit Tests
npm run test:unit                    # Run all unit tests
npm run test:unit -- --watch        # Watch mode
npm run test:unit -- --coverage     # With coverage
npm run test:unit -- auth.service   # Specific test

# Integration Tests
npm run test:integration            # Run all integration tests

# E2E Tests
npm run test:e2e                    # Run E2E tests
npm run test:e2e:ui                 # UI mode
npm run test:e2e:headed             # Headed mode
npm run test:e2e:debug              # Debug mode
npm run test:a11y                   # Accessibility tests

# Load Tests
npm run load:booking                # Booking flow load test
npm run load:spike                  # Spike test
npm run load:stress                 # Stress test
npm run load:soak                   # Soak test

# Security
npm run security:scan               # Dependency scan

# All Tests
npm test                            # Unit + Integration
npm run test:all                    # All test types
npm run test:ci                     # CI test suite
```

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-11-19
**Maintained by**: PSS-nano Engineering Team
