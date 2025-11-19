/**
 * Data Integrity Verification Tests
 *
 * Validates data consistency across services:
 * - Booking to payment reconciliation
 * - Inventory synchronization across channels
 * - PNR consistency across systems
 * - Analytics data accuracy
 * - Baggage tracking accuracy
 * - Revenue accounting accuracy
 */

import { test, expect } from '@playwright/test';

test.describe('Data Integrity Verification', () => {

  test('should maintain booking-to-payment data integrity', async ({ page }) => {
    const bookingData = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-12-20',
      passenger: {
        firstName: 'DataTest',
        lastName: 'Integrity',
        email: 'data.integrity@test.com',
        phone: '+1234567890',
      },
      expectedBasePrice: 0,
      expectedTaxes: 0,
      expectedFees: 0,
      expectedTotal: 0,
    };

    let pnr = '';
    let bookingId = '';

    await test.step('Complete booking and capture pricing', async () => {
      await page.goto('/');

      // Search and select flight
      await page.locator('[data-testid="origin-input"]').fill(bookingData.origin);
      await page.locator('[data-testid="destination-input"]').fill(bookingData.destination);
      await page.locator('[data-testid="departure-date-input"]').fill(bookingData.departureDate);
      await page.locator('[data-testid="search-flights"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });

      // Select flight and capture base price
      await page.locator('[data-testid="flight-card"]').first().click();
      await page.locator('[data-testid="select-flight"]').first().click();

      // Capture pricing breakdown
      const basePriceText = await page.locator('[data-testid="base-price"]').textContent();
      const taxesText = await page.locator('[data-testid="taxes"]').textContent();
      const feesText = await page.locator('[data-testid="fees"]').textContent();
      const totalText = await page.locator('[data-testid="total-price"]').textContent();

      bookingData.expectedBasePrice = parseFloat(basePriceText?.replace(/[^0-9.]/g, '') || '0');
      bookingData.expectedTaxes = parseFloat(taxesText?.replace(/[^0-9.]/g, '') || '0');
      bookingData.expectedFees = parseFloat(feesText?.replace(/[^0-9.]/g, '') || '0');
      bookingData.expectedTotal = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');

      console.log('Captured pricing:', bookingData);

      // Verify total = base + taxes + fees
      const calculatedTotal = bookingData.expectedBasePrice + bookingData.expectedTaxes + bookingData.expectedFees;
      expect(Math.abs(calculatedTotal - bookingData.expectedTotal)).toBeLessThan(0.01);

      // Complete booking
      await page.locator('[data-testid="continue-to-passengers"]').click();

      await page.locator('[data-testid="first-name"]').fill(bookingData.passenger.firstName);
      await page.locator('[data-testid="last-name"]').fill(bookingData.passenger.lastName);
      await page.locator('[data-testid="email"]').fill(bookingData.passenger.email);
      await page.locator('[data-testid="phone"]').fill(bookingData.passenger.phone);

      await page.locator('[data-testid="continue-to-payment"]').click();

      // Verify pricing consistency on payment page
      const paymentTotal = await page.locator('[data-testid="payment-total"]').textContent();
      const paymentTotalAmount = parseFloat(paymentTotal?.replace(/[^0-9.]/g, '') || '0');

      expect(Math.abs(paymentTotalAmount - bookingData.expectedTotal)).toBeLessThan(0.01);

      // Process payment
      await page.locator('[data-testid="card-number"]').fill('4111111111111111');
      await page.locator('[data-testid="card-expiry"]').fill('12/28');
      await page.locator('[data-testid="card-cvv"]').fill('123');
      await page.locator('[data-testid="submit-payment"]').click();

      // Get PNR
      await expect(page.locator('[data-testid="confirmation-message"]')).toBeVisible({ timeout: 15000 });
      pnr = await page.locator('[data-testid="pnr"]').textContent() || '';

      console.log(`Booking created with PNR: ${pnr}`);
    });

    await test.step('Verify payment reconciliation', async () => {
      // Navigate to admin/finance section
      await page.goto('/admin/finance/transactions');

      // Search for transaction by PNR
      await page.locator('[data-testid="search-transactions"]').fill(pnr);
      await page.locator('[data-testid="search-submit"]').click();

      await expect(page.locator('[data-testid="transaction-row"]')).toBeVisible({ timeout: 10000 });

      // Verify transaction details match booking
      const transactionAmount = await page.locator('[data-testid="transaction-amount"]').textContent();
      const transactionAmountValue = parseFloat(transactionAmount?.replace(/[^0-9.]/g, '') || '0');

      expect(Math.abs(transactionAmountValue - bookingData.expectedTotal)).toBeLessThan(0.01);

      // Verify transaction status
      await expect(page.locator('[data-testid="transaction-status"]')).toContainText(/success|completed/i);

      // Verify PNR matches
      await expect(page.locator('[data-testid="transaction-reference"]')).toContainText(pnr);
    });

    await test.step('Verify revenue accounting accuracy', async () => {
      // Navigate to revenue report
      await page.goto('/admin/finance/revenue');

      // Filter by date
      await page.locator('[data-testid="date-filter"]').fill(bookingData.departureDate);
      await page.locator('[data-testid="apply-filter"]').click();

      // Verify booking appears in revenue
      const revenueTotal = await page.locator('[data-testid="total-revenue"]').textContent();
      const revenueTotalValue = parseFloat(revenueTotal?.replace(/[^0-9.]/g, '') || '0');

      // Should include our booking
      expect(revenueTotalValue).toBeGreaterThanOrEqual(bookingData.expectedTotal);

      // Check breakdown
      const baseRevenue = await page.locator('[data-testid="base-fare-revenue"]').textContent();
      const baseRevenueValue = parseFloat(baseRevenue?.replace(/[^0-9.]/g, '') || '0');

      expect(baseRevenueValue).toBeGreaterThanOrEqual(bookingData.expectedBasePrice);
    });
  });

  test('should maintain inventory synchronization across channels', async ({ page }) => {
    const flightNumber = 'AA100';
    let availableSeats = 0;

    await test.step('Check initial inventory on web channel', async () => {
      await page.goto('/');

      await page.locator('[data-testid="origin-input"]').fill('JFK');
      await page.locator('[data-testid="destination-input"]').fill('LAX');
      await page.locator('[data-testid="departure-date-input"]').fill('2025-12-20');
      await page.locator('[data-testid="search-flights"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });

      // Get available seats for specific flight
      const flightCard = page.locator(`[data-testid="flight-${flightNumber}"]`);
      const seatsText = await flightCard.locator('[data-testid="available-seats"]').textContent();
      availableSeats = parseInt(seatsText?.match(/\d+/)?.[0] || '0');

      console.log(`Initial available seats: ${availableSeats}`);
    });

    await test.step('Book a seat on web channel', async () => {
      await page.locator('[data-testid="flight-card"]').first().click();
      await page.locator('[data-testid="select-flight"]').first().click();

      await page.locator('[data-testid="continue-to-passengers"]').click();

      await page.locator('[data-testid="first-name"]').fill('Inventory');
      await page.locator('[data-testid="last-name"]').fill('Test');
      await page.locator('[data-testid="email"]').fill('inventory@test.com');
      await page.locator('[data-testid="phone"]').fill('+1234567890');

      await page.locator('[data-testid="continue-to-payment"]').click();

      await page.locator('[data-testid="card-number"]').fill('4111111111111111');
      await page.locator('[data-testid="card-expiry"]').fill('12/28');
      await page.locator('[data-testid="card-cvv"]').fill('123');
      await page.locator('[data-testid="submit-payment"]').click();

      await expect(page.locator('[data-testid="confirmation-message"]')).toBeVisible({ timeout: 15000 });
    });

    await test.step('Verify inventory updated on web channel', async () => {
      // Search again
      await page.goto('/');

      await page.locator('[data-testid="origin-input"]').fill('JFK');
      await page.locator('[data-testid="destination-input"]').fill('LAX');
      await page.locator('[data-testid="departure-date-input"]').fill('2025-12-20');
      await page.locator('[data-testid="search-flights"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });

      // Check updated available seats
      const flightCard = page.locator(`[data-testid="flight-${flightNumber}"]`);
      const newSeatsText = await flightCard.locator('[data-testid="available-seats"]').textContent();
      const newAvailableSeats = parseInt(newSeatsText?.match(/\d+/)?.[0] || '0');

      console.log(`Updated available seats: ${newAvailableSeats}`);

      // Should be reduced by 1
      expect(newAvailableSeats).toBe(availableSeats - 1);
    });

    await test.step('Verify inventory synced to agent channel', async () => {
      // Login as agent
      await page.goto('/agent/login');
      await page.locator('[data-testid="agent-username"]').fill('agent001');
      await page.locator('[data-testid="agent-password"]').fill('password123');
      await page.locator('[data-testid="agent-login"]').click();

      await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });

      // Search same flight
      await page.locator('[data-testid="menu-search"]').click();
      await page.locator('[data-testid="flight-number-search"]').fill(flightNumber);
      await page.locator('[data-testid="search"]').click();

      // Verify same inventory count
      await expect(page.locator('[data-testid="flight-details"]')).toBeVisible({ timeout: 10000 });
      const agentSeatsText = await page.locator('[data-testid="available-seats"]').textContent();
      const agentAvailableSeats = parseInt(agentSeatsText?.match(/\d+/)?.[0] || '0');

      expect(agentAvailableSeats).toBe(availableSeats - 1);
    });
  });

  test('should maintain PNR consistency across systems', async ({ page }) => {
    let pnr = '';
    const passengerData = {
      firstName: 'PNR',
      lastName: 'Consistency',
      email: 'pnr.test@example.com',
      phone: '+1234567890',
    };

    await test.step('Create booking and get PNR', async () => {
      await page.goto('/');

      // Complete booking flow
      await page.locator('[data-testid="origin-input"]').fill('JFK');
      await page.locator('[data-testid="destination-input"]').fill('LAX');
      await page.locator('[data-testid="departure-date-input"]').fill('2025-12-20');
      await page.locator('[data-testid="search-flights"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });
      await page.locator('[data-testid="select-flight"]').first().click();
      await page.locator('[data-testid="continue-to-passengers"]').click();

      await page.locator('[data-testid="first-name"]').fill(passengerData.firstName);
      await page.locator('[data-testid="last-name"]').fill(passengerData.lastName);
      await page.locator('[data-testid="email"]').fill(passengerData.email);
      await page.locator('[data-testid="phone"]').fill(passengerData.phone);

      await page.locator('[data-testid="continue-to-payment"]').click();

      await page.locator('[data-testid="card-number"]').fill('4111111111111111');
      await page.locator('[data-testid="card-expiry"]').fill('12/28');
      await page.locator('[data-testid="card-cvv"]').fill('123');
      await page.locator('[data-testid="submit-payment"]').click();

      await expect(page.locator('[data-testid="confirmation-message"]')).toBeVisible({ timeout: 15000 });

      pnr = await page.locator('[data-testid="pnr"]').textContent() || '';
      console.log(`PNR created: ${pnr}`);

      // Verify PNR format
      expect(pnr).toMatch(/^[A-Z0-9]{6}$/);
    });

    await test.step('Verify PNR in manage booking', async () => {
      await page.goto('/manage-booking');

      await page.locator('[data-testid="pnr-input"]').fill(pnr);
      await page.locator('[data-testid="last-name-input"]').fill(passengerData.lastName);
      await page.locator('[data-testid="search-booking"]').click();

      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });

      // Verify PNR matches
      await expect(page.locator('[data-testid="booking-pnr"]')).toContainText(pnr);

      // Verify passenger details match
      await expect(page.locator('[data-testid="passenger-name"]')).toContainText(passengerData.firstName);
      await expect(page.locator('[data-testid="passenger-name"]')).toContainText(passengerData.lastName);
      await expect(page.locator('[data-testid="contact-email"]')).toContainText(passengerData.email);
    });

    await test.step('Verify PNR in check-in system', async () => {
      await page.goto('/check-in');

      await page.locator('[data-testid="checkin-pnr"]').fill(pnr);
      await page.locator('[data-testid="checkin-lastname"]').fill(passengerData.lastName);
      await page.locator('[data-testid="retrieve-booking"]').click();

      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });

      // Verify same PNR and passenger data
      await expect(page.locator('[data-testid="pnr-display"]')).toContainText(pnr);
      await expect(page.locator('[data-testid="passenger-name"]')).toContainText(passengerData.lastName);
    });

    await test.step('Verify PNR in agent system', async () => {
      await page.goto('/agent/login');
      await page.locator('[data-testid="agent-username"]').fill('agent001');
      await page.locator('[data-testid="agent-password"]').fill('password123');
      await page.locator('[data-testid="agent-login"]').click();

      await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });

      // Search by PNR
      await page.locator('[data-testid="search-type"]').selectOption('pnr');
      await page.locator('[data-testid="search-input"]').fill(pnr);
      await page.locator('[data-testid="search"]').click();

      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });

      // Verify all details match
      await expect(page.locator('[data-testid="pnr-display"]')).toContainText(pnr);
      await expect(page.locator('[data-testid="passenger-firstname"]')).toHaveValue(passengerData.firstName);
      await expect(page.locator('[data-testid="passenger-lastname"]')).toHaveValue(passengerData.lastName);
    });
  });

  test('should maintain analytics data accuracy', async ({ page }) => {
    let initialBookingCount = 0;
    let initialRevenue = 0;

    await test.step('Capture initial analytics', async () => {
      // Login as admin
      await page.goto('/admin/login');
      await page.locator('[data-testid="admin-username"]').fill('admin');
      await page.locator('[data-testid="admin-password"]').fill('admin123');
      await page.locator('[data-testid="admin-login"]').click();

      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible({ timeout: 10000 });

      // Navigate to analytics
      await page.locator('[data-testid="menu-analytics"]').click();

      // Capture current metrics
      const bookingCountText = await page.locator('[data-testid="total-bookings-today"]').textContent();
      const revenueText = await page.locator('[data-testid="revenue-today"]').textContent();

      initialBookingCount = parseInt(bookingCountText?.replace(/[^0-9]/g, '') || '0');
      initialRevenue = parseFloat(revenueText?.replace(/[^0-9.]/g, '') || '0');

      console.log(`Initial: ${initialBookingCount} bookings, $${initialRevenue} revenue`);
    });

    let bookingAmount = 0;

    await test.step('Create new booking', async () => {
      await page.goto('/');

      await page.locator('[data-testid="origin-input"]').fill('JFK');
      await page.locator('[data-testid="destination-input"]').fill('LAX');
      await page.locator('[data-testid="departure-date-input"]').fill('2025-12-20');
      await page.locator('[data-testid="search-flights"]').click();

      await expect(page.locator('[data-testid="flight-results"]')).toBeVisible({ timeout: 10000 });

      // Capture booking amount
      await page.locator('[data-testid="select-flight"]').first().click();
      const totalText = await page.locator('[data-testid="total-price"]').textContent();
      bookingAmount = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');

      await page.locator('[data-testid="continue-to-passengers"]').click();

      await page.locator('[data-testid="first-name"]').fill('Analytics');
      await page.locator('[data-testid="last-name"]').fill('Test');
      await page.locator('[data-testid="email"]').fill('analytics@test.com');
      await page.locator('[data-testid="phone"]').fill('+1234567890');

      await page.locator('[data-testid="continue-to-payment"]').click();

      await page.locator('[data-testid="card-number"]').fill('4111111111111111');
      await page.locator('[data-testid="card-expiry"]').fill('12/28');
      await page.locator('[data-testid="card-cvv"]').fill('123');
      await page.locator('[data-testid="submit-payment"]').click();

      await expect(page.locator('[data-testid="confirmation-message"]')).toBeVisible({ timeout: 15000 });

      console.log(`Booking created for $${bookingAmount}`);
    });

    await test.step('Verify analytics updated', async () => {
      // Go back to analytics (refresh)
      await page.goto('/admin/analytics');

      // Wait for refresh
      await page.waitForTimeout(2000);

      await page.reload();

      // Check updated metrics
      const newBookingCountText = await page.locator('[data-testid="total-bookings-today"]').textContent();
      const newRevenueText = await page.locator('[data-testid="revenue-today"]').textContent();

      const newBookingCount = parseInt(newBookingCountText?.replace(/[^0-9]/g, '') || '0');
      const newRevenue = parseFloat(newRevenueText?.replace(/[^0-9.]/g, '') || '0');

      console.log(`Updated: ${newBookingCount} bookings, $${newRevenue} revenue`);

      // Verify booking count increased by 1
      expect(newBookingCount).toBe(initialBookingCount + 1);

      // Verify revenue increased by booking amount
      expect(Math.abs(newRevenue - (initialRevenue + bookingAmount))).toBeLessThan(0.01);
    });
  });

  test('should maintain baggage tracking accuracy', async ({ page }) => {
    let pnr = '';
    const baggageTags: string[] = [];

    await test.step('Check in passenger with baggage', async () => {
      // Login as agent
      await page.goto('/agent/login');
      await page.locator('[data-testid="agent-username"]').fill('agent001');
      await page.locator('[data-testid="agent-password"]').fill('password123');
      await page.locator('[data-testid="agent-station"]').selectOption('JFK');
      await page.locator('[data-testid="agent-login"]').click();

      await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });

      // Look up booking
      await page.locator('[data-testid="menu-checkin"]').click();
      await page.locator('[data-testid="search-input"]').fill('ABC123');
      await page.locator('[data-testid="search"]').click();

      await expect(page.locator('[data-testid="passenger-details"]')).toBeVisible({ timeout: 10000 });

      pnr = await page.locator('[data-testid="pnr-display"]').textContent() || '';

      // Start check-in
      await page.locator('[data-testid="start-checkin"]').click();
      await page.locator('[data-testid="confirm-checkin"]').click();

      // Process baggage
      await page.locator('[data-testid="process-baggage"]').click();
      await page.locator('[data-testid="bag-count"]').fill('2');

      // Tag bags
      await page.locator('[data-testid="bag-1-weight"]').fill('20');
      await page.locator('[data-testid="bag-1-tag"]').click();

      const tag1 = await page.locator('[data-testid="bag-1-tag-number"]').textContent();
      if (tag1) baggageTags.push(tag1);

      await page.locator('[data-testid="bag-2-weight"]').fill('18');
      await page.locator('[data-testid="bag-2-tag"]').click();

      const tag2 = await page.locator('[data-testid="bag-2-tag-number"]').textContent();
      if (tag2) baggageTags.push(tag2);

      console.log(`Baggage tags: ${baggageTags.join(', ')}`);

      await page.locator('[data-testid="print-bag-tags"]').click();
      await page.locator('[data-testid="complete-checkin"]').click();
    });

    await test.step('Verify baggage in flight manifest', async () => {
      await page.locator('[data-testid="menu-flights"]').click();
      await page.locator('[data-testid="search-flight"]').fill('AA100');
      await page.locator('[data-testid="search"]').click();

      await page.locator('[data-testid="view-passengers"]').click();

      // Find passenger
      const passengerRow = page.locator(`[data-testid="passenger-${pnr}"]`);
      await expect(passengerRow).toBeVisible();

      // Verify bag count
      await expect(passengerRow.locator('[data-testid="bags"]')).toContainText('2');

      // View baggage details
      await passengerRow.locator('[data-testid="view-baggage"]').click();

      // Verify bag tags
      for (const tag of baggageTags) {
        await expect(page.locator('[data-testid="baggage-list"]')).toContainText(tag);
      }
    });

    await test.step('Track baggage in baggage system', async () => {
      await page.goto('/baggage/tracking');

      // Search by tag number
      await page.locator('[data-testid="search-tag"]').fill(baggageTags[0]);
      await page.locator('[data-testid="search"]').click();

      await expect(page.locator('[data-testid="baggage-details"]')).toBeVisible({ timeout: 10000 });

      // Verify details match
      await expect(page.locator('[data-testid="tag-number"]')).toContainText(baggageTags[0]);
      await expect(page.locator('[data-testid="pnr"]')).toContainText(pnr);
      await expect(page.locator('[data-testid="flight"]')).toContainText('AA100');
      await expect(page.locator('[data-testid="weight"]')).toContainText('20');
      await expect(page.locator('[data-testid="status"]')).toContainText(/checked in|loaded/i);
    });
  });
});
