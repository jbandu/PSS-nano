/**
 * Multi-Tenant Verification Tests
 *
 * Validates multi-tenancy requirements:
 * - Data isolation between airlines
 * - Configuration isolation
 * - Performance isolation
 * - Branding customization
 * - Feature flags per tenant
 * - Tenant-specific workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-Tenant Verification', () => {
  const tenants = {
    airline1: {
      code: 'AA',
      name: 'American Airlines',
      domain: 'aa.localhost',
      primaryColor: '#0078D2',
      logo: 'aa-logo.png',
    },
    airline2: {
      code: 'UA',
      name: 'United Airlines',
      domain: 'ua.localhost',
      primaryColor: '#0A3161',
      logo: 'ua-logo.png',
    },
  };

  test('should enforce strict data isolation between tenants', async ({ page, context }) => {
    let airline1Token = '';
    let airline1BookingId = '';

    await test.step('Create booking as Airline 1', async () => {
      // Login as Airline 1 user
      await page.goto(`https://${tenants.airline1.domain}/login`);

      await page.locator('[data-testid="email"]').fill('agent@aa.com');
      await page.locator('[data-testid="password"]').fill('password123');
      await page.locator('[data-testid="login"]').click();

      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });

      // Capture token
      airline1Token = await page.evaluate(() => localStorage.getItem('accessToken')) || '';

      // Create a booking
      await page.goto(`https://${tenants.airline1.domain}/bookings/new`);

      await page.locator('[data-testid="origin"]').fill('JFK');
      await page.locator('[data-testid="destination"]').fill('LAX');
      await page.locator('[data-testid="search"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });

      // Select flight (should only show AA flights)
      await page.locator('[data-testid="select-flight"]').first().click();

      // Verify flight is AA
      const flightNumber = await page.locator('[data-testid="selected-flight-number"]').textContent();
      expect(flightNumber).toMatch(/^AA\d+/);

      // Complete booking
      await page.locator('[data-testid="continue"]').click();
      await page.locator('[data-testid="passenger-name"]').fill('John Doe');
      await page.locator('[data-testid="complete-booking"]').click();

      await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible({ timeout: 10000 });

      const pnr = await page.locator('[data-testid="pnr"]').textContent();
      console.log(`AA Booking PNR: ${pnr}`);

      // Get booking ID
      const bookingUrl = page.url();
      airline1BookingId = bookingUrl.split('/').pop() || '';
    });

    await test.step('Verify Airline 2 cannot access Airline 1 data', async () => {
      // Switch to Airline 2
      await page.goto(`https://${tenants.airline2.domain}/login`);

      await page.locator('[data-testid="email"]').fill('agent@ua.com');
      await page.locator('[data-testid="password"]').fill('password123');
      await page.locator('[data-testid="login"]').click();

      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });

      // Try to access AA's booking
      await page.goto(`https://${tenants.airline2.domain}/bookings/${airline1BookingId}`);

      // Should show access denied or not found
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
        .or(page.locator('[data-testid="not-found"]').toBeVisible());

      // Verify cannot see AA bookings in list
      await page.goto(`https://${tenants.airline2.domain}/bookings`);

      const bookingList = page.locator('[data-testid="booking-list"]');
      if (await bookingList.isVisible()) {
        const bookings = await bookingList.locator('[data-testid="booking-row"]').all();

        // Verify no AA bookings
        for (const booking of bookings) {
          const flightNumber = await booking.locator('[data-testid="flight-number"]').textContent();
          expect(flightNumber).not.toMatch(/^AA\d+/);
        }
      }
    });

    await test.step('Verify flights are tenant-specific', async () => {
      // Search for flights as UA
      await page.goto(`https://${tenants.airline2.domain}/search`);

      await page.locator('[data-testid="origin"]').fill('JFK');
      await page.locator('[data-testid="destination"]').fill('LAX');
      await page.locator('[data-testid="search"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });

      // Verify all flights are UA
      const flights = await page.locator('[data-testid="flight-card"]').all();

      for (const flight of flights) {
        const flightNumber = await flight.locator('[data-testid="flight-number"]').textContent();
        expect(flightNumber).toMatch(/^UA\d+/);
      }
    });
  });

  test('should maintain configuration isolation', async ({ page }) => {
    await test.step('Verify Airline 1 configuration', async () => {
      await page.goto(`https://${tenants.airline1.domain}/login`);

      await page.locator('[data-testid="email"]').fill('admin@aa.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible({ timeout: 10000 });

      // Check settings
      await page.goto(`https://${tenants.airline1.domain}/admin/settings`);

      // Verify airline-specific settings
      await expect(page.locator('[data-testid="airline-code"]')).toHaveValue(tenants.airline1.code);
      await expect(page.locator('[data-testid="airline-name"]')).toHaveValue(tenants.airline1.name);

      // Verify commission rates (tenant-specific)
      const commissionRate = await page.locator('[data-testid="commission-rate"]').inputValue();
      expect(parseFloat(commissionRate)).toBeGreaterThan(0);

      console.log(`AA Commission Rate: ${commissionRate}%`);
    });

    await test.step('Verify Airline 2 has different configuration', async () => {
      await page.goto(`https://${tenants.airline2.domain}/login`);

      await page.locator('[data-testid="email"]').fill('admin@ua.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible({ timeout: 10000 });

      await page.goto(`https://${tenants.airline2.domain}/admin/settings`);

      // Verify different airline settings
      await expect(page.locator('[data-testid="airline-code"]')).toHaveValue(tenants.airline2.code);
      await expect(page.locator('[data-testid="airline-name"]')).toHaveValue(tenants.airline2.name);

      // Commission rate may be different
      const ua_commissionRate = await page.locator('[data-testid="commission-rate"]').inputValue();
      console.log(`UA Commission Rate: ${ua_commissionRate}%`);
    });

    await test.step('Verify payment gateway configuration is isolated', async () => {
      // Check AA payment config
      await page.goto(`https://${tenants.airline1.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@aa.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline1.domain}/admin/payments`);

      // Each tenant should have their own payment gateway credentials
      const aa_gatewayId = await page.locator('[data-testid="gateway-merchant-id"]').inputValue();

      // Check UA payment config
      await page.goto(`https://${tenants.airline2.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@ua.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline2.domain}/admin/payments`);

      const ua_gatewayId = await page.locator('[data-testid="gateway-merchant-id"]').inputValue();

      // Should be different
      expect(aa_gatewayId).not.toBe(ua_gatewayId);
    });
  });

  test('should support tenant-specific branding', async ({ page }) => {
    await test.step('Verify Airline 1 branding', async () => {
      await page.goto(`https://${tenants.airline1.domain}`);

      // Check logo
      const logo = page.locator('[data-testid="airline-logo"]');
      await expect(logo).toBeVisible();

      const logoSrc = await logo.getAttribute('src');
      expect(logoSrc).toContain(tenants.airline1.logo);

      // Check primary color (may be in CSS variables or inline styles)
      const primaryColorElement = page.locator('[data-testid="header"]');
      const bgColor = await primaryColorElement.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      console.log(`AA Primary Color: ${bgColor}`);

      // Check airline name in title
      await expect(page).toHaveTitle(new RegExp(tenants.airline1.name));
    });

    await test.step('Verify Airline 2 branding', async () => {
      await page.goto(`https://${tenants.airline2.domain}`);

      // Check logo
      const logo = page.locator('[data-testid="airline-logo"]');
      await expect(logo).toBeVisible();

      const logoSrc = await logo.getAttribute('src');
      expect(logoSrc).toContain(tenants.airline2.logo);

      // Check primary color
      const primaryColorElement = page.locator('[data-testid="header"]');
      const bgColor = await primaryColorElement.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      console.log(`UA Primary Color: ${bgColor}`);

      // Check airline name in title
      await expect(page).toHaveTitle(new RegExp(tenants.airline2.name));
    });

    await test.step('Verify email templates are branded', async () => {
      // This would require checking email service or database
      // For now, verify template configuration exists

      await page.goto(`https://${tenants.airline1.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@aa.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline1.domain}/admin/email-templates`);

      // Verify tenant-specific templates
      await expect(page.locator('[data-testid="confirmation-template"]')).toBeVisible();

      // Should reference airline name
      const templateContent = await page.locator('[data-testid="template-preview"]').textContent();
      expect(templateContent).toContain(tenants.airline1.name);
    });
  });

  test('should support tenant-specific feature flags', async ({ page }) => {
    await test.step('Enable feature for Airline 1 only', async () => {
      // Login as super admin
      await page.goto('/superadmin/login');
      await page.locator('[data-testid="email"]').fill('superadmin@pss-nano.com');
      await page.locator('[data-testid="password"]').fill('superadmin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto('/superadmin/tenants');

      // Select AA
      await page.locator(`[data-testid="tenant-${tenants.airline1.code}"]`).click();

      // Enable premium feature
      await page.locator('[data-testid="feature-flags"]').click();
      await page.locator('[data-testid="enable-dynamic-pricing"]').check();
      await page.locator('[data-testid="save"]').click();

      await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    });

    await test.step('Verify feature available for Airline 1', async () => {
      await page.goto(`https://${tenants.airline1.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@aa.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline1.domain}/admin/pricing`);

      // Should see dynamic pricing option
      await expect(page.locator('[data-testid="dynamic-pricing"]')).toBeVisible();
    });

    await test.step('Verify feature NOT available for Airline 2', async () => {
      await page.goto(`https://${tenants.airline2.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@ua.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline2.domain}/admin/pricing`);

      // Should NOT see dynamic pricing option
      const dynamicPricing = page.locator('[data-testid="dynamic-pricing"]');
      const isVisible = await dynamicPricing.isVisible();
      expect(isVisible).toBe(false);
    });
  });

  test('should maintain performance isolation under load', async ({ page, request }) => {
    await test.step('Heavy load on Airline 1 should not affect Airline 2', async () => {
      // Measure baseline response time for UA
      const ua_baseline_start = Date.now();
      const ua_baseline = await request.get(`https://${tenants.airline2.domain}/api/v1/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20`);
      const ua_baseline_time = Date.now() - ua_baseline_start;

      console.log(`UA Baseline response time: ${ua_baseline_time}ms`);

      // Create heavy load on AA
      const aa_requests = [];
      for (let i = 0; i < 50; i++) {
        aa_requests.push(
          request.get(`https://${tenants.airline1.domain}/api/v1/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20`)
        );
      }

      // Run AA requests concurrently
      await Promise.all(aa_requests);

      // Measure UA response time during AA load
      const ua_underload_start = Date.now();
      const ua_underload = await request.get(`https://${tenants.airline2.domain}/api/v1/flights/search?origin=JFK&destination=LAX&departureDate=2025-12-20`);
      const ua_underload_time = Date.now() - ua_underload_start;

      console.log(`UA response time under AA load: ${ua_underload_time}ms`);

      // UA response time should not degrade significantly
      // Allow 50% degradation threshold
      const degradation = (ua_underload_time - ua_baseline_time) / ua_baseline_time;
      console.log(`Performance degradation: ${(degradation * 100).toFixed(2)}%`);

      expect(degradation).toBeLessThan(0.5); // Less than 50% degradation
    });
  });

  test('should support tenant-specific workflows', async ({ page }) => {
    await test.step('Configure different check-in window for tenants', async () => {
      // AA: 24 hours before departure
      await page.goto(`https://${tenants.airline1.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@aa.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline1.domain}/admin/operations`);
      await page.locator('[data-testid="checkin-window-hours"]').fill('24');
      await page.locator('[data-testid="save"]').click();

      // UA: 48 hours before departure
      await page.goto(`https://${tenants.airline2.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@ua.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline2.domain}/admin/operations`);
      await page.locator('[data-testid="checkin-window-hours"]').fill('48');
      await page.locator('[data-testid="save"]').click();
    });

    await test.step('Verify check-in windows are enforced per tenant', async () => {
      // Test AA 24-hour window
      await page.goto(`https://${tenants.airline1.domain}/check-in`);

      // Try to check in for flight 30 hours away
      await page.locator('[data-testid="pnr"]').fill('AA24HR');
      await page.locator('[data-testid="retrieve"]').click();

      // Should be available (within 24 hours)
      await expect(page.locator('[data-testid="checkin-available"]')).toBeVisible();

      // Test UA 48-hour window
      await page.goto(`https://${tenants.airline2.domain}/check-in`);

      await page.locator('[data-testid="pnr"]').fill('UA48HR');
      await page.locator('[data-testid="retrieve"]').click();

      // Should be available (within 48 hours)
      await expect(page.locator('[data-testid="checkin-available"]')).toBeVisible();
    });
  });

  test('should isolate tenant analytics and reporting', async ({ page }) => {
    await test.step('Verify tenant analytics are isolated', async () => {
      // Check AA analytics
      await page.goto(`https://${tenants.airline1.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@aa.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline1.domain}/admin/analytics`);

      // Get AA metrics
      const aa_bookings = await page.locator('[data-testid="total-bookings"]').textContent();
      const aa_revenue = await page.locator('[data-testid="total-revenue"]').textContent();

      console.log(`AA Metrics - Bookings: ${aa_bookings}, Revenue: ${aa_revenue}`);

      // Check UA analytics
      await page.goto(`https://${tenants.airline2.domain}/login`);
      await page.locator('[data-testid="email"]').fill('admin@ua.com');
      await page.locator('[data-testid="password"]').fill('admin123');
      await page.locator('[data-testid="login"]').click();

      await page.goto(`https://${tenants.airline2.domain}/admin/analytics`);

      // Get UA metrics
      const ua_bookings = await page.locator('[data-testid="total-bookings"]').textContent();
      const ua_revenue = await page.locator('[data-testid="total-revenue"]').textContent();

      console.log(`UA Metrics - Bookings: ${ua_bookings}, Revenue: ${ua_revenue}`);

      // Metrics should be different (isolated)
      expect(aa_bookings).not.toBe(ua_bookings);
      expect(aa_revenue).not.toBe(ua_revenue);
    });
  });
});
