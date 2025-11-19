# PSS-nano Testing Infrastructure

Comprehensive testing documentation for the Passenger Service System (PSS-nano).

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [API Testing](#api-testing)
7. [Load Testing](#load-testing)
8. [Security Testing](#security-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [CI/CD Integration](#cicd-integration)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Overview

PSS-nano uses a multi-layered testing approach to ensure reliability, performance, and security across the platform.

### Testing Pyramid

```
       /\
      /  \      E2E Tests (Playwright)
     /----\     Integration Tests (Supertest)
    /------\    Unit Tests (Jest)
   /--------\
```

### Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: Critical API endpoints
- **E2E Tests**: All major user flows
- **Load Tests**: 1000+ concurrent users
- **Security**: OWASP Top 10 compliance
- **Accessibility**: WCAG 2.1 AA compliance

---

## Testing Strategy

### Test Organization

```
PSS-nano/
├── test-setup/              # Global test configuration
│   ├── fixtures/            # Test data fixtures
│   ├── mocks/               # Mock implementations
│   └── utils/               # Test utilities
├── services/                # Backend services
│   └── [service]/
│       └── src/__tests__/
│           ├── unit/        # Unit tests
│           └── integration/ # Integration tests
├── apps/                    # Frontend applications
│   └── [app]/
│       └── src/__tests__/
├── e2e-tests/               # End-to-end tests
│   ├── flows/               # User flow tests
│   └── pages/               # Page object models
└── load-tests/              # Performance tests
    └── scenarios/           # Load test scenarios
```

---

## Unit Testing

### Framework: Jest + ts-jest

Unit tests focus on testing individual functions, classes, and components in isolation.

### Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests for specific service
npm run test:unit -- services/auth-service

# Run with coverage
npm run test:unit -- --coverage

# Watch mode
npm run test:unit -- --watch

# Update snapshots
npm run test:unit -- -u
```

### Writing Unit Tests

#### Example: Service Test

```typescript
// services/auth-service/src/__tests__/unit/auth.service.test.ts
import { AuthService } from '../../services/auth.service';
import { prismaMock } from '../../../../../test-setup/mocks/database.mock';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should register a new user', async () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: 'user-123', ...userData });

    // Act
    const result = await authService.register(userData);

    // Assert
    expect(result.user.email).toBe(userData.email);
    expect(result.tokens).toBeDefined();
  });
});
```

#### Example: Component Test

```typescript
// apps/booking-engine/src/__tests__/unit/SearchForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchForm } from '../../components/SearchForm';

describe('SearchForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<SearchForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/origin/i), {
      target: { value: 'JFK' },
    });
    fireEvent.change(screen.getByLabelText(/destination/i), {
      target: { value: 'LAX' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      origin: 'JFK',
      destination: 'LAX',
    });
  });
});
```

### Mocking Strategies

#### Database Mocking

```typescript
import { prismaMock } from '../test-setup/mocks/database.mock';

prismaMock.user.findUnique.mockResolvedValue({ id: '123', email: 'test@example.com' });
```

#### Redis Mocking

```typescript
import { redisMock } from '../test-setup/mocks/redis.mock';

redisMock.get.mockResolvedValue(JSON.stringify({ data: 'cached' }));
```

#### HTTP Mocking

```typescript
import { mockFetch } from '../test-setup/mocks/http.mock';

mockFetch.success({ data: 'response' }, 200);
```

---

## Integration Testing

Integration tests verify that different components work together correctly.

### Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run with database
docker-compose -f docker-compose.test.yml up -d
npm run test:integration
docker-compose -f docker-compose.test.yml down
```

### Example: API Integration Test

```typescript
import request from 'supertest';
import app from '../../index';

describe('POST /api/v1/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('newuser@example.com');
    expect(response.body.data.tokens).toBeDefined();
  });
});
```

---

## E2E Testing

### Framework: Playwright

E2E tests validate complete user workflows from the browser perspective.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific browser
npm run test:e2e -- --project=chromium

# Run specific test file
npm run test:e2e -- booking.e2e.ts

# Debug mode
npm run test:e2e -- --debug

# UI mode
npm run test:e2e:ui
```

### Page Object Model

```typescript
// e2e-tests/pages/booking.page.ts
export class BookingPage {
  constructor(private page: Page) {}

  async searchFlights(origin: string, destination: string) {
    await this.page.fill('[data-testid="origin-input"]', origin);
    await this.page.fill('[data-testid="destination-input"]', destination);
    await this.page.click('[data-testid="search-button"]');
  }

  async selectFirstFlight() {
    await this.page.click('[data-testid="select-flight-button"]');
  }
}
```

### Example: E2E Test

```typescript
import { test, expect } from '@playwright/test';
import { BookingPage } from '../pages/booking.page';

test('complete booking flow', async ({ page }) => {
  const bookingPage = new BookingPage(page);

  await page.goto('/');
  await bookingPage.searchFlights('JFK', 'LAX');
  await bookingPage.selectFirstFlight();

  await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
});
```

---

## API Testing

### Tools: Supertest + Jest

API tests verify HTTP endpoints, request/response handling, and error cases.

### Running API Tests

```bash
npm run test:api
```

### Example: REST API Test

```typescript
describe('Flight Search API', () => {
  it('should return flights for valid search', async () => {
    const response = await request(app)
      .get('/api/v1/flights/search')
      .query({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-15',
      })
      .expect(200);

    expect(response.body.data.flights).toBeInstanceOf(Array);
    expect(response.body.data.flights.length).toBeGreaterThan(0);
  });
});
```

---

## Load Testing

### Framework: k6

Load tests verify system performance under realistic and extreme loads.

### Running Load Tests

```bash
# Install k6
brew install k6  # macOS
# or
sudo apt-get install k6  # Linux

# Run booking flow load test
k6 run load-tests/scenarios/booking-flow.k6.js

# Run with custom VUs and duration
k6 run --vus 100 --duration 30s load-tests/scenarios/booking-flow.k6.js

# Run spike test
k6 run load-tests/scenarios/spike-test.k6.js

# Run stress test
k6 run load-tests/scenarios/stress-test.k6.js

# Run soak test (long duration)
k6 run load-tests/scenarios/soak-test.k6.js
```

### Available Load Test Scenarios

1. **Booking Flow** - Simulates complete booking process with 1000+ concurrent users
2. **Spike Test** - Tests sudden traffic spikes
3. **Stress Test** - Finds system breaking point
4. **Soak Test** - Tests stability over extended period (2+ hours)

### Performance Thresholds

```javascript
thresholds: {
  'http_req_duration': ['p(95)<2000'],  // 95% requests under 2s
  'http_req_failed': ['rate<0.01'],     // Error rate under 1%
}
```

---

## Security Testing

### Tools: OWASP ZAP + Snyk + CodeQL

Security tests identify vulnerabilities and ensure OWASP Top 10 compliance.

### Running Security Tests

```bash
# Run OWASP ZAP scan
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:4001 \
  -c .zap/rules.tsv

# Run Snyk vulnerability scan
npm run security:scan

# Check for secrets
npm run security:secrets
```

### Security Checklist

- [ ] SQL Injection protection
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Authentication bypass attempts
- [ ] Authorization testing
- [ ] Dependency vulnerabilities
- [ ] Secret scanning
- [ ] Security headers (Helmet)

---

## Accessibility Testing

### Tools: axe-core + Playwright

Accessibility tests ensure WCAG 2.1 AA compliance.

### Running Accessibility Tests

```bash
# Run accessibility tests
npm run test:a11y

# Run specific accessibility test
npm run test:e2e accessibility.e2e.ts
```

### Accessibility Checklist

- [ ] Keyboard navigation
- [ ] Screen reader support (ARIA labels)
- [ ] Color contrast (4.5:1 minimum)
- [ ] Form labels
- [ ] Image alt text
- [ ] Focus indicators
- [ ] Semantic HTML
- [ ] Heading hierarchy

---

## CI/CD Integration

### GitHub Actions Workflows

All tests run automatically on push and pull requests.

#### Workflow Triggers

- **Unit Tests**: Every push and PR
- **Integration Tests**: Every push and PR
- **E2E Tests**: Every push to main/develop + nightly
- **Security Tests**: Every push + weekly scan
- **Performance Tests**: Nightly + on-demand

#### Test Gates

Pull requests must pass:

1. ✅ All unit tests
2. ✅ All integration tests
3. ✅ Code coverage ≥ 80%
4. ✅ Type checking
5. ✅ Linting
6. ✅ No high-severity security issues

---

## Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test';

  // Act - Execute the code
  const result = functionUnderTest(input);

  // Assert - Verify the outcome
  expect(result).toBe('expected');
});
```

### 2. Test Naming

- **DO**: `should return user when valid credentials provided`
- **DON'T**: `test1` or `userTest`

### 3. Test Independence

- Each test should be independent
- Use `beforeEach` for setup
- Clean up with `afterEach`
- Don't rely on test execution order

### 4. Mocking

- Mock external dependencies (databases, APIs)
- Don't mock what you're testing
- Use factories for test data
- Keep mocks simple and focused

### 5. Coverage

- Aim for 80%+ coverage, but don't chase 100%
- Focus on critical paths
- Test edge cases and error handling
- Don't test trivial code

### 6. Performance

- Keep unit tests fast (<100ms each)
- Use parallel execution
- Mock expensive operations
- Clean up resources

### 7. Maintainability

- Use Page Object Model for E2E tests
- Extract common test utilities
- Keep tests DRY (but prefer clarity over DRY)
- Update tests when requirements change

---

## Troubleshooting

### Common Issues

#### Tests Failing Locally

```bash
# Clear Jest cache
npm run test:clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env.test
```

#### E2E Tests Timing Out

```bash
# Increase timeout
npx playwright test --timeout=60000

# Run in headed mode to debug
npx playwright test --headed --debug
```

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Restart database
docker-compose restart postgres

# Check database URL
echo $DATABASE_URL
```

#### Coverage Not Generating

```bash
# Run with coverage flag
npm run test:unit -- --coverage

# Check coverage directory
ls -la coverage/
```

### Getting Help

- Check [GitHub Issues](https://github.com/jbandu/PSS-nano/issues)
- Review test output for error messages
- Check CI/CD logs on GitHub Actions
- Consult testing framework documentation

---

## Quick Reference

```bash
# Unit tests
npm run test:unit                    # Run all unit tests
npm run test:unit -- --watch        # Watch mode
npm run test:unit -- --coverage     # With coverage

# Integration tests
npm run test:integration            # Run integration tests

# E2E tests
npm run test:e2e                    # Run E2E tests
npm run test:e2e:ui                 # UI mode
npm run test:e2e -- --headed        # Headed mode

# Load tests
k6 run load-tests/scenarios/booking-flow.k6.js

# All tests
npm run test                        # Run all test types
npm run test:ci                     # Run CI test suite
```

---

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [k6 Documentation](https://k6.io/docs/)
- [Testing Library](https://testing-library.com/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

**Last Updated**: 2025-11-19
**Version**: 1.0.0
**Maintained by**: PSS-nano Engineering Team
