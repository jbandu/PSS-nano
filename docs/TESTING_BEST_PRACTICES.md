# Testing Best Practices Guide

## Overview

This guide outlines testing best practices for PSS-nano development.

## General Principles

### 1. Test Pyramid

Follow the testing pyramid:

- **70% Unit Tests** - Fast, isolated, test individual functions
- **20% Integration Tests** - Test component interactions
- **10% E2E Tests** - Test complete user flows

### 2. Write Tests First (TDD)

Consider Test-Driven Development:

1. Write failing test
2. Implement minimal code to pass
3. Refactor
4. Repeat

Benefits:
- Better design
- Higher coverage
- Living documentation
- Confidence in refactoring

### 3. Keep Tests Fast

- Unit tests should run in milliseconds
- Integration tests in seconds
- E2E tests in minutes
- Mock external dependencies
- Use parallel execution

### 4. Test Behavior, Not Implementation

```typescript
// ❌ Bad - Tests implementation details
it('should call getUserById with correct ID', () => {
  const spy = jest.spyOn(service, 'getUserById');
  component.loadUser(123);
  expect(spy).toHaveBeenCalledWith(123);
});

// ✅ Good - Tests behavior
it('should display user name when loaded', async () => {
  component.loadUser(123);
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Unit Testing Best Practices

### 1. One Assertion Per Test (Mostly)

```typescript
// ✅ Good
it('should return user email', () => {
  const user = new User({ email: 'test@example.com' });
  expect(user.getEmail()).toBe('test@example.com');
});

it('should capitalize user name', () => {
  const user = new User({ name: 'john' });
  expect(user.getName()).toBe('John');
});

// ⚠️ Acceptable - Related assertions
it('should create valid booking', () => {
  const booking = createBooking({ flightId: '123' });
  expect(booking.id).toBeDefined();
  expect(booking.status).toBe('pending');
  expect(booking.flightId).toBe('123');
});
```

### 2. Use Descriptive Test Names

```typescript
// ❌ Bad
it('should work', () => { ... });
it('test user creation', () => { ... });

// ✅ Good
it('should throw error when email is invalid', () => { ... });
it('should hash password before storing in database', () => { ... });
it('should return 401 when authentication token is missing', () => { ... });
```

### 3. Test Edge Cases

```typescript
describe('calculatePrice', () => {
  it('should calculate price for 1 passenger', () => { ... });
  it('should calculate price for 10 passengers', () => { ... });
  it('should calculate price for 0 passengers', () => { ... });
  it('should throw error for negative passengers', () => { ... });
  it('should handle decimal passengers gracefully', () => { ... });
});
```

### 4. Use Test Fixtures and Factories

```typescript
// test-setup/fixtures/user-factory.ts
export function createUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    ...overrides,
  };
}

// In tests
it('should validate user email', () => {
  const user = createUser({ email: 'invalid' });
  expect(() => validateUser(user)).toThrow();
});
```

### 5. Mock External Dependencies

```typescript
// ✅ Good - Mock database
jest.mock('@airline-ops/database-schemas', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// ✅ Good - Mock HTTP
jest.mock('axios');
axios.get.mockResolvedValue({ data: { flights: [] } });
```

## Integration Testing Best Practices

### 1. Test Realistic Scenarios

```typescript
// ✅ Good - Tests realistic flow
describe('Booking Flow Integration', () => {
  it('should create booking and process payment', async () => {
    // Create booking
    const booking = await createBooking({
      flightId: 'FL-123',
      passengerId: 'PAX-456',
    });

    // Process payment
    const payment = await processPayment({
      bookingId: booking.id,
      amount: booking.totalAmount,
      cardNumber: '4111111111111111',
    });

    // Verify booking is confirmed
    expect(booking.status).toBe('confirmed');
    expect(payment.status).toBe('completed');
  });
});
```

### 2. Use Real Database for Integration Tests

```typescript
// Setup test database
beforeAll(async () => {
  await prisma.$connect();
  await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Test with real database
it('should persist user to database', async () => {
  const user = await userService.create({
    email: 'test@example.com',
  });

  const found = await prisma.user.findUnique({
    where: { id: user.id },
  });

  expect(found).toBeDefined();
});
```

### 3. Test Error Handling

```typescript
describe('Payment Processing', () => {
  it('should handle declined payment', async () => {
    const result = await processPayment({
      cardNumber: '4000000000000002', // Declined card
    });

    expect(result.status).toBe('declined');
    expect(result.error).toBeDefined();
  });

  it('should rollback booking on payment failure', async () => {
    const bookingId = 'BKG-123';

    await expect(
      processPaymentWithRollback(bookingId, invalidCard)
    ).rejects.toThrow();

    const booking = await getBooking(bookingId);
    expect(booking.status).toBe('pending'); // Rolled back
  });
});
```

## E2E Testing Best Practices

### 1. Use Page Object Model

```typescript
// pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return this.page.textContent('[data-testid="error-message"]');
  }
}

// In test
test('should show error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login('invalid@example.com', 'wrong');

  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid credentials');
});
```

### 2. Use Data Test IDs

```typescript
// ✅ Good - Stable selectors
<button data-testid="submit-booking">Book Now</button>

// In test
await page.click('[data-testid="submit-booking"]');

// ❌ Bad - Fragile selectors
await page.click('.btn.btn-primary.booking-submit'); // Breaks if CSS changes
await page.click('text=Book Now'); // Breaks if text changes
```

### 3. Wait for Elements Properly

```typescript
// ❌ Bad - Arbitrary wait
await page.waitForTimeout(3000);

// ✅ Good - Wait for specific condition
await page.waitForSelector('[data-testid="flight-results"]');

// ✅ Good - Wait for network
await page.waitForResponse(resp =>
  resp.url().includes('/api/flights') && resp.status() === 200
);

// ✅ Good - Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/booking"]'),
]);
```

### 4. Handle Flaky Tests

```typescript
// ✅ Good - Retry flaky assertions
await expect(async () => {
  const text = await page.textContent('[data-testid="status"]');
  expect(text).toBe('Confirmed');
}).toPass({ timeout: 5000 });

// ✅ Good - Wait for stability
await page.waitForLoadState('networkidle');
```

## Load Testing Best Practices

### 1. Simulate Realistic User Behavior

```javascript
export default function() {
  // Realistic user flow
  group('User Journey', () => {
    // Search
    http.get(`${BASE_URL}/api/flights/search?...`);
    sleep(2); // User reads results

    // Select flight
    http.post(`${BASE_URL}/api/bookings`, ...);
    sleep(3); // User fills form

    // Payment
    http.post(`${BASE_URL}/api/payments`, ...);
    sleep(1);
  });

  // Random think time (2-5 seconds)
  sleep(Math.random() * 3 + 2);
}
```

### 2. Set Appropriate Thresholds

```javascript
export const options = {
  thresholds: {
    // Response time thresholds
    'http_req_duration': [
      'p(95)<2000',  // 95% under 2s
      'p(99)<5000',  // 99% under 5s
    ],
    // Error rate threshold
    'http_req_failed': ['rate<0.01'], // <1% errors
    // Custom metrics
    'booking_success_rate': ['rate>0.98'], // >98% success
  },
};
```

### 3. Ramp Up Gradually

```javascript
stages: [
  { duration: '2m', target: 100 },   // Warm up
  { duration: '5m', target: 100 },   // Stable
  { duration: '3m', target: 1000 },  // Ramp up
  { duration: '5m', target: 1000 },  // Peak
  { duration: '2m', target: 0 },     // Ramp down
]
```

## Security Testing Best Practices

### 1. Test Authentication & Authorization

```typescript
describe('Authorization', () => {
  it('should deny access without token', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .expect(401);
  });

  it('should deny access with user role to admin endpoint', async () => {
    const userToken = generateToken({ role: 'USER' });

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

### 2. Test Input Validation

```typescript
describe('Input Validation', () => {
  it('should reject SQL injection attempt', async () => {
    const response = await request(app)
      .post('/api/users/search')
      .send({ query: "'; DROP TABLE users; --" })
      .expect(400);
  });

  it('should sanitize XSS attempt', async () => {
    const response = await request(app)
      .post('/api/comments')
      .send({ text: '<script>alert("xss")</script>' })
      .expect(201);

    expect(response.body.data.text).not.toContain('<script>');
  });
});
```

### 3. Test Rate Limiting

```typescript
it('should rate limit excessive requests', async () => {
  // Make 100 requests
  const promises = Array(100).fill(null).map(() =>
    request(app).post('/api/auth/login').send({ email: 'test@example.com' })
  );

  const responses = await Promise.all(promises);

  // Some should be rate limited
  const rateLimited = responses.filter(r => r.status === 429);
  expect(rateLimited.length).toBeGreaterThan(0);
});
```

## Accessibility Testing Best Practices

### 1. Test Keyboard Navigation

```typescript
test('should be keyboard navigable', async ({ page }) => {
  await page.goto('/');

  // Tab through elements
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="origin-input"]')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="destination-input"]')).toBeFocused();

  // Submit with Enter
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-testid="results"]')).toBeVisible();
});
```

### 2. Test Screen Reader Support

```typescript
test('should have proper ARIA labels', async ({ page }) => {
  await page.goto('/');

  // Check form labels
  const originInput = page.locator('[data-testid="origin-input"]');
  await expect(originInput).toHaveAttribute('aria-label', /origin/i);

  // Check live regions
  await page.click('[data-testid="search-button"]');
  const results = page.locator('[aria-live="polite"]');
  await expect(results).toBeVisible();
});
```

### 3. Automated Accessibility Scanning

```typescript
import { checkAccessibility } from '../utils/accessibility';

test('should pass accessibility checks', async ({ page }) => {
  await page.goto('/');

  // Run axe-core scan
  await checkAccessibility(page, {
    wcagLevel: 'AA',
  });
});
```

## Common Anti-Patterns to Avoid

### ❌ Testing Implementation Details

```typescript
// Bad
it('should call setState', () => {
  const spy = jest.spyOn(component, 'setState');
  component.updateName('John');
  expect(spy).toHaveBeenCalled();
});

// Good
it('should update displayed name', () => {
  component.updateName('John');
  expect(component.getName()).toBe('John');
});
```

### ❌ Large Test Files

```typescript
// Bad - 1000+ lines in one file
describe('UserService', () => {
  // 50+ test cases
});

// Good - Split by functionality
// user-service.auth.test.ts
// user-service.profile.test.ts
// user-service.permissions.test.ts
```

### ❌ Shared State Between Tests

```typescript
// Bad
let user;

beforeAll(() => {
  user = createUser();
});

it('test 1', () => {
  user.name = 'Changed'; // Affects other tests!
});

// Good
beforeEach(() => {
  const user = createUser(); // Fresh for each test
});
```

### ❌ Testing Third-Party Code

```typescript
// Bad - Testing Express.js
it('should handle POST requests', () => {
  expect(app.post).toBeDefined();
});

// Good - Test your code
it('should create user via POST /api/users', async () => {
  const response = await request(app)
    .post('/api/users')
    .send({ email: 'test@example.com' });

  expect(response.status).toBe(201);
});
```

## Continuous Improvement

### Review Test Failures

- Don't ignore flaky tests
- Investigate and fix root cause
- Add tests for bugs found in production

### Monitor Test Performance

- Track test execution time
- Optimize slow tests
- Remove obsolete tests

### Update Tests with Code

- Tests are first-class code
- Refactor tests when refactoring code
- Keep tests maintainable

### Team Practices

- Code review tests thoroughly
- Pair on complex test scenarios
- Share testing knowledge
- Celebrate good test coverage

---

**Remember**: Good tests are:
- **Fast** - Run quickly
- **Independent** - Don't rely on other tests
- **Repeatable** - Same results every time
- **Self-validating** - Clear pass/fail
- **Timely** - Written with the code

Happy Testing! 🧪
