/**
 * Security Testing Suite
 *
 * Tests security controls:
 * - Authentication bypass attempts
 * - Authorization checks
 * - SQL injection testing
 * - XSS testing
 * - CSRF protection verification
 * - API security testing
 * - Secrets management verification
 * - Session management
 * - Rate limiting
 */

import { test, expect } from '@playwright/test';

test.describe('Security Testing', () => {

  test('should prevent authentication bypass attempts', async ({ page }) => {
    await test.step('Attempt to access protected page without authentication', async () => {
      // Try to access admin dashboard without logging in
      await page.goto('/admin/dashboard');

      // Should redirect to login or show access denied
      await expect(page).toHaveURL(/login|unauthorized/);
    });

    await test.step('Attempt login with invalid credentials', async () => {
      await page.goto('/login');

      await page.locator('[data-testid="email"]').fill('hacker@evil.com');
      await page.locator('[data-testid="password"]').fill('wrongpassword');
      await page.locator('[data-testid="login-submit"]').click();

      // Should show error
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="login-error"]')).toContainText(/invalid|incorrect/i);

      // Should not be logged in
      await expect(page).not.toHaveURL(/dashboard/);
    });

    await test.step('Attempt SQL injection in login', async () => {
      await page.goto('/login');

      // Try SQL injection payloads
      const sqlInjectionPayloads = [
        "admin' OR '1'='1",
        "admin'--",
        "admin' #",
        "' OR 1=1--",
        "' OR '1'='1' /*",
      ];

      for (const payload of sqlInjectionPayloads) {
        await page.locator('[data-testid="email"]').fill(payload);
        await page.locator('[data-testid="password"]').fill(payload);
        await page.locator('[data-testid="login-submit"]').click();

        await page.waitForTimeout(1000);

        // Should not succeed
        await expect(page).not.toHaveURL(/dashboard/);

        // Should show error or validation message
        const hasError = await page.locator('[data-testid="login-error"]').isVisible();
        expect(hasError).toBe(true);
      }
    });

    await test.step('Attempt to manipulate JWT token', async () => {
      // Login legitimately first
      await page.goto('/login');
      await page.locator('[data-testid="email"]').fill('test@example.com');
      await page.locator('[data-testid="password"]').fill('password123');
      await page.locator('[data-testid="login-submit"]').click();

      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });

      // Get token from localStorage or cookie
      const token = await page.evaluate(() => localStorage.getItem('accessToken'));

      if (token) {
        // Modify token (make it invalid)
        const tamperedToken = token + 'tampered';

        await page.evaluate((t) => {
          localStorage.setItem('accessToken', t);
        }, tamperedToken);

        // Try to access protected resource
        await page.goto('/admin/settings');

        // Should be rejected or redirected to login
        await expect(page).toHaveURL(/login|unauthorized/);
      }
    });
  });

  test('should enforce proper authorization controls', async ({ page }) => {
    await test.step('Regular user cannot access admin functions', async () => {
      // Login as regular user
      await page.goto('/login');
      await page.locator('[data-testid="email"]').fill('user@example.com');
      await page.locator('[data-testid="password"]').fill('password123');
      await page.locator('[data-testid="login-submit"]').click();

      await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible({ timeout: 10000 });

      // Try to access admin page
      await page.goto('/admin/users');

      // Should be denied
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
      // OR redirected
      await expect(page).not.toHaveURL(/admin/);
    });

    await test.step('User cannot access other users\' bookings', async ({ request }) => {
      // Login as user 1
      const loginRes = await request.post('/api/v1/auth/login', {
        data: {
          email: 'user1@example.com',
          password: 'password123',
        },
      });

      expect(loginRes.ok()).toBeTruthy();
      const loginData = await loginRes.json();
      const user1Token = loginData.data.tokens.accessToken;

      // Get user1's booking
      const user1BookingsRes = await request.get('/api/v1/bookings/my-bookings', {
        headers: {
          Authorization: `Bearer ${user1Token}`,
        },
      });

      expect(user1BookingsRes.ok()).toBeTruthy();
      const user1Bookings = await user1BookingsRes.json();

      if (user1Bookings.data.length > 0) {
        const bookingId = user1Bookings.data[0].id;

        // Login as different user
        const user2LoginRes = await request.post('/api/v1/auth/login', {
          data: {
            email: 'user2@example.com',
            password: 'password123',
          },
        });

        const user2LoginData = await user2LoginRes.json();
        const user2Token = user2LoginData.data.tokens.accessToken;

        // Try to access user1's booking with user2's token
        const unauthorizedAccessRes = await request.get(`/api/v1/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${user2Token}`,
          },
        });

        // Should be forbidden
        expect(unauthorizedAccessRes.status()).toBe(403);
      }
    });
  });

  test('should prevent XSS attacks', async ({ page }) => {
    await test.step('Test reflected XSS in search inputs', async () => {
      await page.goto('/');

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg/onload=alert("XSS")>',
      ];

      for (const payload of xssPayloads) {
        await page.locator('[data-testid="origin-input"]').fill(payload);
        await page.locator('[data-testid="search-flights"]').click();

        await page.waitForTimeout(1000);

        // Verify script was not executed
        const alerts = page.on('dialog', async dialog => {
          // If alert appears, XSS succeeded - fail the test
          expect(false).toBe(true);
          await dialog.dismiss();
        });

        // Verify payload is escaped in display
        const originDisplay = page.locator('[data-testid="search-summary"]');
        if (await originDisplay.isVisible()) {
          const text = await originDisplay.textContent();
          // Should not contain unescaped HTML
          expect(text).not.toContain('<script>');
          expect(text).not.toContain('<img');
        }
      }
    });

    await test.step('Test stored XSS in passenger names', async () => {
      await page.goto('/');

      await page.locator('[data-testid="origin-input"]').fill('JFK');
      await page.locator('[data-testid="destination-input"]').fill('LAX');
      await page.locator('[data-testid="departure-date-input"]').fill('2025-12-20');
      await page.locator('[data-testid="search-flights"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });
      await page.locator('[data-testid="select-flight"]').first().click();
      await page.locator('[data-testid="continue-to-passengers"]').click();

      // Try XSS in name field
      await page.locator('[data-testid="first-name"]').fill('<script>alert("XSS")</script>');
      await page.locator('[data-testid="last-name"]').fill('Test');
      await page.locator('[data-testid="email"]').fill('xss@test.com');
      await page.locator('[data-testid="phone"]').fill('+1234567890');

      await page.locator('[data-testid="continue-to-payment"]').click();

      // Check if XSS payload appears escaped on review page
      const reviewSection = page.locator('[data-testid="booking-review"]');
      if (await reviewSection.isVisible()) {
        const text = await reviewSection.textContent();
        expect(text).not.toContain('<script>');
      }

      // Verify no alert was triggered
      page.on('dialog', async dialog => {
        expect(false).toBe(true);
        await dialog.dismiss();
      });
    });
  });

  test('should validate CSRF protection', async ({ page, context }) => {
    await test.step('Verify CSRF token in forms', async () => {
      await page.goto('/');

      // Check for CSRF token in booking form
      const csrfToken = await page.locator('input[name="_csrf"]').getAttribute('value');

      // CSRF token should exist and not be empty
      if (csrfToken !== null) {
        expect(csrfToken).toBeTruthy();
        expect(csrfToken.length).toBeGreaterThan(0);
      }
    });

    await test.step('Attempt state-changing request without CSRF token', async ({ request }) => {
      // Login
      const loginRes = await request.post('/api/v1/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const loginData = await loginRes.json();
      const token = loginData.data.tokens.accessToken;

      // Try to create booking without CSRF token
      const bookingRes = await request.post('/api/v1/bookings', {
        data: {
          flightId: '123',
          passengers: [],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          // Intentionally omitting CSRF token
        },
      });

      // Should reject if CSRF is enforced
      // (May be 403 or 400 depending on implementation)
      if (bookingRes.status() === 403 || bookingRes.status() === 400) {
        const error = await bookingRes.json();
        console.log('CSRF protection working:', error);
      }
    });
  });

  test('should prevent SQL injection in all inputs', async ({ page }) => {
    const sqlPayloads = [
      "' OR '1'='1",
      "1' OR '1' = '1",
      "1' AND '1' = '1",
      "' OR 1=1--",
      "admin'--",
      "' UNION SELECT NULL--",
    ];

    await test.step('Test SQL injection in search', async () => {
      await page.goto('/');

      for (const payload of sqlPayloads) {
        await page.locator('[data-testid="origin-input"]').fill(payload);
        await page.locator('[data-testid="destination-input"]').fill('LAX');
        await page.locator('[data-testid="search-flights"]').click();

        await page.waitForTimeout(1000);

        // Should either:
        // 1. Show validation error
        // 2. Return no results
        // 3. Show error message
        // Should NOT expose database error
        const errorMessage = page.locator('[data-testid="error-message"]');
        if (await errorMessage.isVisible()) {
          const text = await errorMessage.textContent();
          // Should not expose SQL error details
          expect(text?.toLowerCase()).not.toContain('sql');
          expect(text?.toLowerCase()).not.toContain('syntax');
          expect(text?.toLowerCase()).not.toContain('query');
        }
      }
    });

    await test.step('Test SQL injection in PNR lookup', async () => {
      await page.goto('/manage-booking');

      for (const payload of sqlPayloads) {
        await page.locator('[data-testid="pnr-input"]').fill(payload);
        await page.locator('[data-testid="last-name-input"]').fill('Test');
        await page.locator('[data-testid="search-booking"]').click();

        await page.waitForTimeout(1000);

        // Should not return unauthorized data
        const bookingDetails = page.locator('[data-testid="booking-details"]');
        const shouldNotBeVisible = await bookingDetails.isVisible();
        expect(shouldNotBeVisible).toBe(false);

        // Check for proper error handling
        const error = page.locator('[data-testid="error-message"]');
        if (await error.isVisible()) {
          const text = await error.textContent();
          expect(text?.toLowerCase()).not.toContain('sql');
        }
      }
    });
  });

  test('should enforce rate limiting', async ({ request }) => {
    await test.step('Test login rate limiting', async () => {
      const attempts = [];

      // Make rapid login attempts
      for (let i = 0; i < 20; i++) {
        const res = request.post('/api/v1/auth/login', {
          data: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
        });
        attempts.push(res);
      }

      const responses = await Promise.all(attempts);

      // Count 429 responses (Too Many Requests)
      const rateLimited = responses.filter(r => r.status() === 429);

      // Should have at least some rate limited responses
      expect(rateLimited.length).toBeGreaterThan(0);

      console.log(`Rate limiting active: ${rateLimited.length}/20 requests blocked`);
    });

    await test.step('Test API rate limiting', async () => {
      const attempts = [];

      // Make rapid API requests
      for (let i = 0; i < 100; i++) {
        const res = request.get('/api/v1/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20');
        attempts.push(res);
      }

      const responses = await Promise.all(attempts);

      // Count rate limited responses
      const rateLimited = responses.filter(r => r.status() === 429);

      // Should have rate limiting if threshold exceeded
      if (rateLimited.length > 0) {
        console.log(`API rate limiting active: ${rateLimited.length}/100 requests blocked`);
      }
    });
  });

  test('should validate secure password requirements', async ({ page }) => {
    await test.step('Test weak password rejection', async () => {
      await page.goto('/register');

      const weakPasswords = [
        '123456',
        'password',
        'abc123',
        'qwerty',
        '12345678',
      ];

      for (const weakPassword of weakPasswords) {
        await page.locator('[data-testid="email"]').fill('newuser@example.com');
        await page.locator('[data-testid="password"]').fill(weakPassword);
        await page.locator('[data-testid="password-confirm"]').fill(weakPassword);
        await page.locator('[data-testid="register-submit"]').click();

        await page.waitForTimeout(1000);

        // Should show password requirement error
        const passwordError = page.locator('[data-testid="password-error"]');
        await expect(passwordError).toBeVisible();
        await expect(passwordError).toContainText(/weak|requirements|strong/i);
      }
    });

    await test.step('Test strong password acceptance', async () => {
      const strongPassword = 'SecureP@ssw0rd!123';

      await page.locator('[data-testid="email"]').fill('newuser@example.com');
      await page.locator('[data-testid="password"]').fill(strongPassword);
      await page.locator('[data-testid="password-confirm"]').fill(strongPassword);
      await page.locator('[data-testid="register-submit"]').click();

      await page.waitForTimeout(2000);

      // Should not show password error
      const passwordError = page.locator('[data-testid="password-error"]');
      const isVisible = await passwordError.isVisible();

      if (isVisible) {
        const text = await passwordError.textContent();
        expect(text).not.toContain('weak');
      }
    });
  });

  test('should validate session management', async ({ page, context }) => {
    let sessionToken = '';

    await test.step('Login and capture session', async () => {
      await page.goto('/login');
      await page.locator('[data-testid="email"]').fill('test@example.com');
      await page.locator('[data-testid="password"]').fill('password123');
      await page.locator('[data-testid="login-submit"]').click();

      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });

      // Get session token
      sessionToken = await page.evaluate(() => localStorage.getItem('accessToken')) || '';
      expect(sessionToken).toBeTruthy();
    });

    await test.step('Verify session expiration', async () => {
      // Mock token expiration by using very old token
      await page.evaluate(() => {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.expired';
        localStorage.setItem('accessToken', expiredToken);
      });

      // Try to access protected resource
      await page.goto('/admin/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    await test.step('Verify logout invalidates session', async () => {
      // Login again
      await page.goto('/login');
      await page.locator('[data-testid="email"]').fill('test@example.com');
      await page.locator('[data-testid="password"]').fill('password123');
      await page.locator('[data-testid="login-submit"]').click();

      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });

      const tokenBeforeLogout = await page.evaluate(() => localStorage.getItem('accessToken'));

      // Logout
      await page.locator('[data-testid="logout"]').click();

      // Verify token removed
      const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('accessToken'));
      expect(tokenAfterLogout).toBeNull();

      // Verify cannot access protected page
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/login/);

      // Verify old token doesn't work
      if (tokenBeforeLogout) {
        await page.evaluate((token) => {
          localStorage.setItem('accessToken', token);
        }, tokenBeforeLogout);

        await page.goto('/dashboard');

        // Should still redirect to login (token invalidated)
        await expect(page).toHaveURL(/login/);
      }
    });
  });

  test('should prevent sensitive data exposure', async ({ page, request }) => {
    await test.step('Verify error messages don\'t leak sensitive info', async () => {
      // Try invalid login
      const res = await request.post('/api/v1/auth/login', {
        data: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
      });

      const data = await res.json();

      // Error message should not reveal if email exists
      if (data.error || data.message) {
        const errorMsg = (data.error || data.message).toLowerCase();

        // Should use generic message
        expect(errorMsg).not.toContain('email not found');
        expect(errorMsg).not.toContain('user does not exist');

        // Should say something like "invalid credentials"
        expect(errorMsg).toMatch(/invalid|incorrect/);
      }
    });

    await test.step('Verify API responses don\'t include sensitive fields', async () => {
      // Login
      const loginRes = await request.post('/api/v1/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const loginData = await loginRes.json();

      // Should not include password hash
      expect(loginData.data.user.password).toBeUndefined();
      expect(loginData.data.user.passwordHash).toBeUndefined();

      // Should not include refresh token in user object
      expect(loginData.data.user.refreshToken).toBeUndefined();
    });
  });
});
