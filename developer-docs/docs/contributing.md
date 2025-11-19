# Contributing to PSS-nano

Thank you for your interest in contributing to PSS-nano! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race or ethnicity
- Age
- Religion or lack thereof

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment of any kind
- Trolling, insulting, or derogatory comments
- Personal or political attacks
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

Before contributing, ensure you have:
1. Read the [Development Setup Guide](guides/development-setup.md)
2. Set up your local development environment
3. Familiarized yourself with the [Architecture](architecture/overview.md)
4. Reviewed the [Code Standards](guides/code-standards.md)

### Finding Work

1. **Good First Issues**: Look for issues labeled `good-first-issue`
2. **Help Wanted**: Check issues labeled `help-wanted`
3. **Bug Reports**: Issues labeled `bug` need fixes
4. **Features**: Issues labeled `enhancement` are feature requests

### Claiming an Issue

Before starting work:
1. Comment on the issue expressing your interest
2. Wait for assignment from a maintainer
3. Ask questions if anything is unclear
4. Start working only after assignment

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/PSS-nano.git
cd PSS-nano

# Add upstream remote
git remote add upstream https://github.com/jbandu/PSS-nano.git

# Verify remotes
git remote -v
```

### 2. Create a Branch

```bash
# Update your local main/develop
git checkout develop
git pull upstream develop

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 3. Make Changes

```bash
# Make your changes
# ...

# Add and commit
git add .
git commit -m "feat: add new booking feature"

# Keep your branch up to date
git fetch upstream
git rebase upstream/develop
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Check code coverage (must be > 80%)
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### 5. Push Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to GitHub and create a pull request
2. Fill out the PR template completely
3. Link related issues
4. Request reviews from maintainers
5. Respond to feedback promptly

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// ❌ Bad: Using 'any' type
function getUser(id: any): any {
  // ...
}

// ✅ Good: Proper typing
async function getUser(id: string): Promise<User> {
  // ...
}

// ✅ Good: Use enums for constants
enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

// ✅ Good: Use const for configuration
const CONFIG = {
  MAX_PASSENGERS: 9,
  BOOKING_TIMEOUT: 15 * 60 * 1000, // 15 minutes
} as const;
```

### Naming Conventions

```typescript
// Classes: PascalCase
class ReservationService {}

// Functions/methods: camelCase
function createBooking() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Interfaces: PascalCase with 'I' prefix (optional)
interface IBookingRequest {}
// Or without prefix
interface BookingRequest {}

// Types: PascalCase
type PaymentMethod = 'CARD' | 'PAYPAL' | 'BANK_TRANSFER';

// Files: kebab-case
// reservation-service.ts
// booking-controller.ts
```

### Code Organization

```typescript
// ✅ Good: Organized imports
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

import { BookingService } from './booking.service';
import { validateBooking } from './booking.validator';
import type { CreateBookingDTO } from './types';

// ✅ Good: Single responsibility
class BookingController {
  constructor(private bookingService: BookingService) {}

  async create(req: Request, res: Response) {
    // ...
  }
}

// ✅ Good: Separation of concerns
// controller.ts - HTTP layer
// service.ts - Business logic
// repository.ts - Data access
// validator.ts - Validation logic
// types.ts - Type definitions
```

### Error Handling

```typescript
// ✅ Good: Custom error classes
class BookingNotFoundError extends Error {
  constructor(bookingId: string) {
    super(`Booking not found: ${bookingId}`);
    this.name = 'BookingNotFoundError';
  }
}

// ✅ Good: Proper error handling
async function getBooking(id: string): Promise<Booking> {
  const booking = await db.booking.findUnique({ where: { id } });

  if (!booking) {
    throw new BookingNotFoundError(id);
  }

  return booking;
}

// ✅ Good: Error middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error', { error, path: req.path });

  if (error instanceof BookingNotFoundError) {
    return res.status(404).json({ error: error.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});
```

### Async/Await

```typescript
// ❌ Bad: Unhandled promise rejection
async function badExample() {
  const result = await fetchData(); // No error handling
  return result;
}

// ✅ Good: Proper error handling
async function goodExample() {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    logger.error('Failed to fetch data', { error });
    throw new DataFetchError('Unable to fetch data');
  }
}

// ✅ Good: Promise.all for parallel operations
async function parallelExample() {
  const [bookings, inventory, pricing] = await Promise.all([
    getBookings(),
    getInventory(),
    getPricing()
  ]);

  return { bookings, inventory, pricing };
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(reservation): add group booking support"

# Bug fix
git commit -m "fix(payment): resolve Stripe webhook validation"

# Breaking change
git commit -m "feat(api)!: change reservation API response format

BREAKING CHANGE: The reservation response now includes nested passenger objects instead of IDs."

# Multiple changes
git commit -m "feat(auth): add MFA support

- Implement TOTP-based two-factor authentication
- Add QR code generation for authenticator apps
- Update user schema with MFA fields
- Add MFA verification endpoint

Closes #123"
```

### Commit Best Practices

1. **Write clear, concise commit messages**
2. **One logical change per commit**
3. **Reference issues in commit body**
4. **Explain WHY, not just WHAT**
5. **Use imperative mood** ("add" not "added")

## Pull Request Process

### PR Template

When creating a PR, fill out the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

### PR Requirements

**Before submitting:**
1. ✅ All tests pass (`npm test`)
2. ✅ Code coverage > 80%
3. ✅ No linting errors (`npm run lint`)
4. ✅ Code formatted (`npm run format`)
5. ✅ Documentation updated
6. ✅ Changelog updated (if applicable)
7. ✅ Branch up to date with develop

### Review Process

1. **Automated Checks**: CI/CD runs automatically
2. **Code Review**: At least 2 approvals required
3. **Testing**: QA testing if needed
4. **Approval**: Maintainer approval
5. **Merge**: Squash and merge to develop

### Responding to Feedback

```bash
# Make requested changes
# ...

# Commit changes
git add .
git commit -m "fix: address review feedback"

# Push to update PR
git push origin feature/your-feature-name
```

### After Merge

```bash
# Update your local repository
git checkout develop
git pull upstream develop

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Testing Requirements

### Test Coverage

All contributions must include tests:

- **Unit Tests**: Cover all new functions/methods
- **Integration Tests**: Cover API endpoints
- **E2E Tests**: Cover critical user flows (if applicable)

**Minimum coverage: 80%**

### Writing Tests

```typescript
// Unit test example
describe('BookingService', () => {
  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        flightId: '123',
        passengers: [{ firstName: 'John', lastName: 'Doe' }]
      };

      const result = await bookingService.createBooking(bookingData);

      expect(result).toBeDefined();
      expect(result.pnrLocator).toHaveLength(6);
      expect(result.status).toBe('PENDING');
    });

    it('should throw error when flight not available', async () => {
      const bookingData = {
        flightId: 'invalid',
        passengers: []
      };

      await expect(bookingService.createBooking(bookingData))
        .rejects
        .toThrow('Flight not available');
    });
  });
});

// Integration test example
describe('POST /api/v1/reservations', () => {
  it('should create reservation and return 201', async () => {
    const response = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        flightId: '123',
        passengers: [{ firstName: 'John', lastName: 'Doe' }]
      })
      .expect(201);

    expect(response.body).toHaveProperty('pnrLocator');
    expect(response.body.status).toBe('PENDING');
  });
});
```

## Documentation

### Code Comments

```typescript
/**
 * Creates a new booking for the specified flight
 *
 * @param bookingData - The booking details
 * @returns The created PNR with 6-character locator
 * @throws {FlightNotAvailableError} When flight has no availability
 * @throws {InvalidPassengerError} When passenger data is invalid
 *
 * @example
 * const booking = await createBooking({
 *   flightId: 'FL123',
 *   passengers: [{ firstName: 'John', lastName: 'Doe' }]
 * });
 */
async function createBooking(bookingData: CreateBookingDTO): Promise<PNR> {
  // Implementation
}
```

### README Updates

If adding a new service:
1. Update main README.md
2. Create service-specific README.md
3. Update architecture documentation
4. Add to service catalog

### API Documentation

Update OpenAPI/Swagger specs for API changes:

```yaml
# openapi.yaml
/api/v1/reservations:
  post:
    summary: Create a new reservation
    tags:
      - Reservations
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateBookingRequest'
    responses:
      201:
        description: Booking created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BookingResponse'
```

## Issue Reporting

### Bug Reports

Include:
1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, etc.
6. **Screenshots**: If applicable
7. **Logs**: Relevant error logs

```markdown
### Bug Description
Payment fails when using PayPal

### Steps to Reproduce
1. Create a booking
2. Select PayPal as payment method
3. Click "Pay Now"
4. Error occurs

### Expected Behavior
Payment should process successfully

### Actual Behavior
Error: "PayPal gateway timeout"

### Environment
- OS: macOS 14.0
- Node.js: 20.11.0
- Browser: Chrome 120.0

### Logs
```
Error: PayPal gateway timeout
  at PaymentService.processPayment (payment.service.ts:45)
```
```

### Feature Requests

Include:
1. **Problem**: What problem does this solve?
2. **Proposed Solution**: Your suggested approach
3. **Alternatives**: Other approaches considered
4. **Additional Context**: Any other relevant info

## Getting Help

If you need help:
1. Check existing documentation
2. Search closed issues
3. Ask in discussions
4. Join our Slack channel
5. Tag maintainers in your issue

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Awarded contributor badge
- Invited to team events

Thank you for contributing to PSS-nano! 🚀
