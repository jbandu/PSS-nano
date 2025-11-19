/**
 * Web Check-In Flow Integration Test
 *
 * Tests the complete web check-in flow across services:
 * - auth-service: Passenger authentication
 * - reservation-service: Retrieve booking
 * - inventory-service: Select/change seats
 * - ancillary-service: Purchase ancillaries
 * - regulatory-compliance-service: Collect APIS data
 * - dcs-service: Generate boarding pass
 * - notification-service: Send confirmation
 */

import { test, expect } from '@playwright/test';

test.describe('Web Check-In Flow - System Integration', () => {
  const testBooking = {
    pnr: 'ABC123',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567890',
    flightNumber: 'AA100',
    departureDate: '2025-12-20',
    origin: 'JFK',
    destination: 'LAX',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/check-in');
  });

  test('should complete full web check-in flow with all service integrations', async ({ page }) => {
    // STEP 1: Authenticate passenger
    await test.step('Retrieve booking with PNR and last name', async () => {
      // Fill check-in form
      await page.locator('[data-testid="checkin-pnr"]').fill(testBooking.pnr);
      await page.locator('[data-testid="checkin-lastname"]').fill(testBooking.lastName);

      // Submit
      await page.locator('[data-testid="retrieve-booking"]').click();

      // Wait for booking details to load
      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });
    });

    // STEP 2: Verify booking details (reservation-service)
    await test.step('Verify retrieved booking details', async () => {
      // Verify flight information
      await expect(page.locator('[data-testid="flight-number"]')).toContainText(testBooking.flightNumber);
      await expect(page.locator('[data-testid="route"]')).toContainText(`${testBooking.origin} → ${testBooking.destination}`);

      // Verify passenger information
      await expect(page.locator('[data-testid="passenger-name"]')).toContainText(testBooking.lastName);

      // Verify PNR
      await expect(page.locator('[data-testid="pnr-display"]')).toContainText(testBooking.pnr);

      // Verify check-in is available
      await expect(page.locator('[data-testid="checkin-available"]')).toBeVisible();
    });

    // STEP 3: Select/change seats (inventory-service)
    await test.step('Select or change seat', async () => {
      // Click to select seat
      await page.locator('[data-testid="select-seat"]').click();

      // Wait for seat map
      await expect(page.locator('[data-testid="seat-map"]')).toBeVisible({ timeout: 10000 });

      // Select available seat
      await page.locator('[data-testid="seat-15C"]').click();

      // Verify seat selection
      await expect(page.locator('[data-testid="seat-15C"]')).toHaveClass(/selected/);
      await expect(page.locator('[data-testid="selected-seat-summary"]')).toContainText('15C');

      // Confirm seat selection
      await page.locator('[data-testid="confirm-seat"]').click();
    });

    // STEP 4: Purchase ancillaries (ancillary-service)
    await test.step('Purchase additional ancillaries', async () => {
      // Check if ancillaries page is shown
      const ancillariesSection = page.locator('[data-testid="ancillaries-section"]');

      if (await ancillariesSection.isVisible()) {
        // Add extra baggage
        await page.locator('[data-testid="add-baggage"]').click();

        // Add priority boarding
        await page.locator('[data-testid="add-priority-boarding"]').click();

        // Verify items added
        await expect(page.locator('[data-testid="cart-summary"]')).toContainText('Extra Baggage');
        await expect(page.locator('[data-testid="cart-summary"]')).toContainText('Priority Boarding');

        // View total
        const total = await page.locator('[data-testid="ancillaries-total"]').textContent();
        expect(total).toMatch(/\$[\d,]+\.\d{2}/);

        // Continue
        await page.locator('[data-testid="continue-to-apis"]').click();

        // Process payment for ancillaries
        await page.locator('[data-testid="card-number"]').fill('4111111111111111');
        await page.locator('[data-testid="card-expiry"]').fill('12/28');
        await page.locator('[data-testid="card-cvv"]').fill('123');
        await page.locator('[data-testid="pay-now"]').click();

        // Wait for payment confirmation
        await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 10000 });
      } else {
        // Skip ancillaries if not shown
        console.log('No ancillaries section shown, skipping');
      }
    });

    // STEP 5: Collect APIS data (regulatory-compliance-service)
    await test.step('Collect Advanced Passenger Information (APIS)', async () => {
      // Wait for APIS form
      await expect(page.locator('[data-testid="apis-form"]')).toBeVisible({ timeout: 10000 });

      // Fill APIS data
      await page.locator('[data-testid="passport-number"]').fill('AB1234567');
      await page.locator('[data-testid="passport-country"]').selectOption('US');
      await page.locator('[data-testid="passport-expiry"]').fill('2030-12-31');
      await page.locator('[data-testid="date-of-birth"]').fill('1985-05-15');
      await page.locator('[data-testid="gender"]').selectOption('M');
      await page.locator('[data-testid="nationality"]').selectOption('US');

      // Destination address (required for some countries)
      await page.locator('[data-testid="destination-address"]').fill('123 Main St');
      await page.locator('[data-testid="destination-city"]').fill('Los Angeles');
      await page.locator('[data-testid="destination-state"]').selectOption('CA');
      await page.locator('[data-testid="destination-zip"]').fill('90001');

      // Verify data validation
      const passportInput = page.locator('[data-testid="passport-number"]');
      await expect(passportInput).toHaveValue('AB1234567');

      // Submit APIS
      await page.locator('[data-testid="submit-apis"]').click();

      // Verify APIS submission
      await expect(page.locator('[data-testid="apis-submitted"]')).toBeVisible({ timeout: 5000 });
    });

    // STEP 6: Generate boarding pass (dcs-service)
    await test.step('Generate and download boarding pass', async () => {
      // Wait for boarding pass generation
      await expect(page.locator('[data-testid="boarding-pass-ready"]')).toBeVisible({ timeout: 15000 });

      // Verify boarding pass details
      await expect(page.locator('[data-testid="boarding-pass"]')).toContainText(testBooking.pnr);
      await expect(page.locator('[data-testid="boarding-pass"]')).toContainText(testBooking.flightNumber);
      await expect(page.locator('[data-testid="boarding-pass"]')).toContainText('15C'); // Seat number
      await expect(page.locator('[data-testid="boarding-pass"]')).toContainText(testBooking.lastName);

      // Verify barcode/QR code is present
      await expect(page.locator('[data-testid="boarding-pass-barcode"]')).toBeVisible();

      // Verify sequence number
      const sequenceNumber = await page.locator('[data-testid="sequence-number"]').textContent();
      expect(sequenceNumber).toMatch(/^\d{3,4}$/);

      // Verify boarding time
      await expect(page.locator('[data-testid="boarding-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="gate"]')).toBeVisible();

      // Download options should be available
      await expect(page.locator('[data-testid="download-pdf"]')).toBeVisible();
      await expect(page.locator('[data-testid="download-wallet"]')).toBeVisible();
    });

    // STEP 7: Send notifications (notification-service)
    await test.step('Verify check-in confirmation notifications', async () => {
      // Verify email notification
      await expect(page.locator('[data-testid="email-confirmation"]')).toContainText(
        `Boarding pass sent to ${testBooking.email}`
      );

      // Verify SMS option
      const smsOption = page.locator('[data-testid="send-sms"]');
      if (await smsOption.isVisible()) {
        // Send SMS with boarding pass
        await smsOption.click();

        await page.locator('[data-testid="mobile-number"]').fill(testBooking.phone);
        await page.locator('[data-testid="confirm-sms"]').click();

        // Verify SMS sent confirmation
        await expect(page.locator('[data-testid="sms-sent"]')).toBeVisible({ timeout: 5000 });
      }
    });

    // STEP 8: Verify check-in completion
    await test.step('Verify check-in completion status', async () => {
      // Navigate to manage booking
      await page.goto(`/manage-booking?pnr=${testBooking.pnr}`);

      // Verify check-in status
      await expect(page.locator('[data-testid="checkin-status"]')).toContainText('Checked In');

      // Verify seat assignment
      await expect(page.locator('[data-testid="assigned-seat"]')).toContainText('15C');

      // Verify boarding pass is accessible
      await expect(page.locator('[data-testid="view-boarding-pass"]')).toBeVisible();
    });
  });

  test('should handle web check-in within time window validation', async ({ page }) => {
    await test.step('Check-in too early should show appropriate message', async () => {
      // Use a booking with departure far in the future
      await page.locator('[data-testid="checkin-pnr"]').fill('XYZ789');
      await page.locator('[data-testid="checkin-lastname"]').fill('Johnson');
      await page.locator('[data-testid="retrieve-booking"]').click();

      // Verify check-in not available message
      const notAvailable = page.locator('[data-testid="checkin-not-available"]');
      if (await notAvailable.isVisible()) {
        await expect(notAvailable).toContainText(/check-in opens|not yet available/i);

        // Verify countdown or opening time is shown
        await expect(page.locator('[data-testid="checkin-opens-at"]')).toBeVisible();
      }
    });
  });

  test('should handle seat change during check-in', async ({ page }) => {
    // Start check-in
    await page.locator('[data-testid="checkin-pnr"]').fill(testBooking.pnr);
    await page.locator('[data-testid="checkin-lastname"]').fill(testBooking.lastName);
    await page.locator('[data-testid="retrieve-booking"]').click();

    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });

    await test.step('Select initial seat', async () => {
      await page.locator('[data-testid="select-seat"]').click();
      await expect(page.locator('[data-testid="seat-map"]')).toBeVisible({ timeout: 10000 });

      // Select seat
      await page.locator('[data-testid="seat-10A"]').click();
      await expect(page.locator('[data-testid="selected-seat-summary"]')).toContainText('10A');
      await page.locator('[data-testid="confirm-seat"]').click();
    });

    await test.step('Change seat selection', async () => {
      // Click change seat
      await page.locator('[data-testid="change-seat"]').click();

      // Wait for seat map
      await expect(page.locator('[data-testid="seat-map"]')).toBeVisible();

      // Current seat should be highlighted
      await expect(page.locator('[data-testid="seat-10A"]')).toHaveClass(/current-seat/);

      // Select different seat
      await page.locator('[data-testid="seat-12F"]').click();
      await expect(page.locator('[data-testid="selected-seat-summary"]')).toContainText('12F');
      await page.locator('[data-testid="confirm-seat"]').click();

      // Verify new seat is confirmed
      await expect(page.locator('[data-testid="seat-confirmation"]')).toContainText('12F');
    });
  });

  test('should measure check-in performance (<5s target)', async ({ page }) => {
    const startTime = Date.now();

    await page.locator('[data-testid="checkin-pnr"]').fill(testBooking.pnr);
    await page.locator('[data-testid="checkin-lastname"]').fill(testBooking.lastName);
    await page.locator('[data-testid="retrieve-booking"]').click();

    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });

    // Quick check-in flow (skip optional steps)
    await page.locator('[data-testid="quick-checkin"]').click();

    // Wait for boarding pass
    await expect(page.locator('[data-testid="boarding-pass-ready"]')).toBeVisible({ timeout: 15000 });

    const checkInTime = Date.now() - startTime;
    console.log(`Check-in completion time: ${checkInTime}ms`);

    if (checkInTime > 5000) {
      console.warn(`⚠️  Check-in time (${checkInTime}ms) exceeds 5s target`);
    }
  });

  test('should handle group check-in for multiple passengers', async ({ page }) => {
    const groupPNR = 'GRP456';

    await page.locator('[data-testid="checkin-pnr"]').fill(groupPNR);
    await page.locator('[data-testid="checkin-lastname"]').fill('Williams');
    await page.locator('[data-testid="retrieve-booking"]').click();

    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });

    await test.step('Verify multiple passengers displayed', async () => {
      // Should show all passengers in the booking
      const passengerCount = await page.locator('[data-testid="passenger-row"]').count();
      expect(passengerCount).toBeGreaterThan(1);

      // Verify select all option
      await expect(page.locator('[data-testid="select-all-passengers"]')).toBeVisible();
    });

    await test.step('Check in all passengers', async () => {
      // Select all passengers
      await page.locator('[data-testid="select-all-passengers"]').click();

      // Proceed with check-in
      await page.locator('[data-testid="checkin-selected"]').click();

      // Select seats for all passengers
      await expect(page.locator('[data-testid="seat-map"]')).toBeVisible({ timeout: 10000 });

      // Verify multiple seat selection
      await page.locator('[data-testid="seat-10A"]').click();
      await page.locator('[data-testid="seat-10B"]').click();
      await page.locator('[data-testid="seat-10C"]').click();

      await page.locator('[data-testid="confirm-seat"]').click();

      // Skip APIS for demo
      await page.locator('[data-testid="skip-apis"]').click();

      // Verify multiple boarding passes generated
      await expect(page.locator('[data-testid="boarding-pass"]')).toHaveCount(3);
    });
  });

  test('should validate APIS data requirements', async ({ page }) => {
    await page.locator('[data-testid="checkin-pnr"]').fill(testBooking.pnr);
    await page.locator('[data-testid="checkin-lastname"]').fill(testBooking.lastName);
    await page.locator('[data-testid="retrieve-booking"]').click();

    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });

    // Quick path to APIS
    await page.locator('[data-testid="select-seat"]').click();
    await page.locator('[data-testid="seat-15C"]').click();
    await page.locator('[data-testid="confirm-seat"]').click();
    await page.locator('[data-testid="skip-ancillaries"]').click();

    await test.step('Submit APIS with missing required fields', async () => {
      await expect(page.locator('[data-testid="apis-form"]')).toBeVisible();

      // Try to submit without filling required fields
      await page.locator('[data-testid="submit-apis"]').click();

      // Verify validation errors
      await expect(page.locator('[data-testid="passport-number-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="passport-expiry-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="nationality-error"]')).toBeVisible();
    });

    await test.step('Submit with valid APIS data', async () => {
      // Fill all required fields
      await page.locator('[data-testid="passport-number"]').fill('AB1234567');
      await page.locator('[data-testid="passport-country"]').selectOption('US');
      await page.locator('[data-testid="passport-expiry"]').fill('2030-12-31');
      await page.locator('[data-testid="date-of-birth"]').fill('1985-05-15');
      await page.locator('[data-testid="gender"]').selectOption('M');
      await page.locator('[data-testid="nationality"]').selectOption('US');
      await page.locator('[data-testid="destination-address"]').fill('123 Main St');
      await page.locator('[data-testid="destination-city"]').fill('Los Angeles');
      await page.locator('[data-testid="destination-state"]').selectOption('CA');
      await page.locator('[data-testid="destination-zip"]').fill('90001');

      await page.locator('[data-testid="submit-apis"]').click();

      // Verify successful submission
      await expect(page.locator('[data-testid="apis-submitted"]')).toBeVisible({ timeout: 5000 });
    });
  });
});
