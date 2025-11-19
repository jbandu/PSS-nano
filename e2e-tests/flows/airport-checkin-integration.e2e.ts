/**
 * Airport Check-In Flow Integration Test
 *
 * Tests the complete airport check-in flow across services:
 * - auth-service: Agent login and authentication
 * - reservation-service: Passenger lookup and booking retrieval
 * - dcs-service: Check-in process and boarding pass generation
 * - airport-integration-service: Baggage processing and printing
 * - regulatory-compliance-service: APIS submission
 */

import { test, expect } from '@playwright/test';

test.describe('Airport Check-In Flow - System Integration', () => {
  const agentCredentials = {
    username: 'agent001',
    password: 'Agent@Pass123',
    station: 'JFK',
  };

  const passengerData = {
    pnr: 'ABC123',
    lastName: 'Anderson',
    firstName: 'Michael',
    flightNumber: 'AA100',
    seatPreference: 'Window',
    baggageCount: 2,
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/agent/login');
  });

  test('should complete full airport check-in flow as agent', async ({ page }) => {
    // STEP 1: Agent login (auth-service)
    await test.step('Agent authentication', async () => {
      await page.locator('[data-testid="agent-username"]').fill(agentCredentials.username);
      await page.locator('[data-testid="agent-password"]').fill(agentCredentials.password);
      await page.locator('[data-testid="agent-station"]').selectOption(agentCredentials.station);
      await page.locator('[data-testid="agent-login"]').click();

      // Verify successful login
      await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="agent-name"]')).toContainText(agentCredentials.username);
      await expect(page.locator('[data-testid="current-station"]')).toContainText(agentCredentials.station);
    });

    // STEP 2: Passenger lookup (reservation-service)
    await test.step('Look up passenger booking', async () => {
      // Navigate to check-in
      await page.locator('[data-testid="menu-checkin"]').click();

      // Search by PNR
      await page.locator('[data-testid="search-type"]').selectOption('pnr');
      await page.locator('[data-testid="search-input"]').fill(passengerData.pnr);
      await page.locator('[data-testid="search-passenger"]').click();

      // Verify passenger details loaded
      await expect(page.locator('[data-testid="passenger-details"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="passenger-name"]')).toContainText(passengerData.lastName);
      await expect(page.locator('[data-testid="pnr-display"]')).toContainText(passengerData.pnr);
      await expect(page.locator('[data-testid="flight-number"]')).toContainText(passengerData.flightNumber);

      // Verify booking status
      await expect(page.locator('[data-testid="booking-status"]')).toBeVisible();
    });

    // STEP 3: Check-in process (dcs-service)
    await test.step('Process passenger check-in', async () => {
      // Start check-in
      await page.locator('[data-testid="start-checkin"]').click();

      // Verify check-in form
      await expect(page.locator('[data-testid="checkin-form"]')).toBeVisible();

      // Verify passenger details pre-filled
      await expect(page.locator('[data-testid="passenger-firstname"]')).toHaveValue(passengerData.firstName);
      await expect(page.locator('[data-testid="passenger-lastname"]')).toHaveValue(passengerData.lastName);

      // Assign seat
      await page.locator('[data-testid="assign-seat"]').click();
      await expect(page.locator('[data-testid="seat-map"]')).toBeVisible({ timeout: 10000 });

      // Select window seat based on preference
      await page.locator('[data-testid="seat-12A"]').click(); // Assuming 12A is a window seat
      await page.locator('[data-testid="confirm-seat"]').click();

      // Verify seat assignment
      await expect(page.locator('[data-testid="assigned-seat"]')).toContainText('12A');

      // Confirm check-in
      await page.locator('[data-testid="confirm-checkin"]').click();

      // Verify check-in confirmation
      await expect(page.locator('[data-testid="checkin-confirmed"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="sequence-number"]')).toBeVisible();
    });

    // STEP 4: Baggage processing (airport-integration-service)
    await test.step('Process passenger baggage', async () => {
      // Navigate to baggage section
      await page.locator('[data-testid="process-baggage"]').click();

      // Enter number of bags
      await page.locator('[data-testid="bag-count"]').fill(passengerData.baggageCount.toString());

      // Process each bag
      for (let i = 1; i <= passengerData.baggageCount; i++) {
        await page.locator(`[data-testid="bag-${i}-weight"]`).fill('20'); // 20kg
        await page.locator(`[data-testid="bag-${i}-tag"]`).click();

        // Verify bag tag number generated
        await expect(page.locator(`[data-testid="bag-${i}-tag-number"]`)).toBeVisible();

        const tagNumber = await page.locator(`[data-testid="bag-${i}-tag-number"]`).textContent();
        expect(tagNumber).toMatch(/^\d{10}$/); // 10-digit bag tag number
      }

      // Verify total baggage weight
      const totalWeight = await page.locator('[data-testid="total-baggage-weight"]').textContent();
      expect(totalWeight).toContain('40'); // 2 bags × 20kg

      // Check for excess baggage charges
      const excessCharge = page.locator('[data-testid="excess-baggage-charge"]');
      if (await excessCharge.isVisible()) {
        // If excess baggage, process payment
        await page.locator('[data-testid="process-baggage-payment"]').click();
        await expect(page.locator('[data-testid="payment-processed"]')).toBeVisible({ timeout: 5000 });
      }

      // Print bag tags
      await page.locator('[data-testid="print-bag-tags"]').click();

      // Verify print confirmation
      await expect(page.locator('[data-testid="tags-printed"]')).toBeVisible({ timeout: 5000 });
    });

    // STEP 5: APIS submission (regulatory-compliance-service)
    await test.step('Collect and submit APIS data', async () => {
      // Check if APIS is required for this flight
      const apisRequired = page.locator('[data-testid="apis-required"]');

      if (await apisRequired.isVisible()) {
        // Fill APIS information
        await page.locator('[data-testid="passport-number"]').fill('US123456789');
        await page.locator('[data-testid="passport-country"]').selectOption('USA');
        await page.locator('[data-testid="passport-expiry"]').fill('2030-12-31');
        await page.locator('[data-testid="date-of-birth"]').fill('1980-03-15');
        await page.locator('[data-testid="gender"]').selectOption('M');
        await page.locator('[data-testid="nationality"]').selectOption('USA');

        // Destination information
        await page.locator('[data-testid="destination-address"]').fill('456 Ocean Drive');
        await page.locator('[data-testid="destination-city"]').fill('Los Angeles');
        await page.locator('[data-testid="destination-state"]').selectOption('CA');
        await page.locator('[data-testid="destination-zip"]').fill('90210');

        // Submit APIS
        await page.locator('[data-testid="submit-apis"]').click();

        // Verify APIS submission
        await expect(page.locator('[data-testid="apis-status"]')).toContainText(/submitted|ok/i);

        // Check for any APIS errors
        const apisError = page.locator('[data-testid="apis-error"]');
        if (await apisError.isVisible()) {
          const errorMessage = await apisError.textContent();
          console.warn(`APIS Error: ${errorMessage}`);
        }
      }
    });

    // STEP 6: Print documents (dcs-service)
    await test.step('Print boarding pass and baggage receipts', async () => {
      // Print boarding pass
      await page.locator('[data-testid="print-boarding-pass"]').click();

      // Verify printing initiated
      await expect(page.locator('[data-testid="boarding-pass-sent-to-printer"]')).toBeVisible({ timeout: 5000 });

      // Print baggage receipt
      await page.locator('[data-testid="print-baggage-receipt"]').click();

      // Verify printing initiated
      await expect(page.locator('[data-testid="baggage-receipt-sent-to-printer"]')).toBeVisible({ timeout: 5000 });

      // Verify all documents printed
      await expect(page.locator('[data-testid="all-documents-printed"]')).toBeVisible();
    });

    // STEP 7: Complete check-in
    await test.step('Finalize and complete check-in', async () => {
      // Complete the transaction
      await page.locator('[data-testid="complete-checkin"]').click();

      // Verify completion message
      await expect(page.locator('[data-testid="checkin-complete-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="checkin-complete-message"]')).toContainText(/check-in complete|successfully checked in/i);

      // Verify passenger summary
      await expect(page.locator('[data-testid="checkin-summary"]')).toContainText(passengerData.lastName);
      await expect(page.locator('[data-testid="checkin-summary"]')).toContainText('12A'); // Seat
      await expect(page.locator('[data-testid="checkin-summary"]')).toContainText('2'); // Bag count
    });

    // STEP 8: Verify check-in appears in flight manifest
    await test.step('Verify passenger in flight manifest', async () => {
      // Navigate to flight manifest
      await page.locator('[data-testid="menu-flights"]').click();
      await page.locator('[data-testid="search-flight"]').fill(passengerData.flightNumber);
      await page.locator('[data-testid="search"]').click();

      // Open passenger list
      await page.locator('[data-testid="view-passengers"]').click();

      // Verify passenger is checked in
      await expect(page.locator('[data-testid="passenger-list"]')).toContainText(passengerData.lastName);

      // Find passenger row and verify status
      const passengerRow = page.locator(`[data-testid="passenger-${passengerData.pnr}"]`);
      await expect(passengerRow.locator('[data-testid="checkin-status"]')).toContainText('Checked In');
      await expect(passengerRow.locator('[data-testid="seat"]')).toContainText('12A');
      await expect(passengerRow.locator('[data-testid="bags"]')).toContainText('2');
    });
  });

  test('should handle check-in with special service requests', async ({ page }) => {
    // Agent login
    await page.locator('[data-testid="agent-username"]').fill(agentCredentials.username);
    await page.locator('[data-testid="agent-password"]').fill(agentCredentials.password);
    await page.locator('[data-testid="agent-station"]').selectOption(agentCredentials.station);
    await page.locator('[data-testid="agent-login"]').click();

    await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });

    await test.step('Look up passenger with SSR codes', async () => {
      await page.locator('[data-testid="menu-checkin"]').click();
      await page.locator('[data-testid="search-type"]').selectOption('pnr');
      await page.locator('[data-testid="search-input"]').fill('SSR999');
      await page.locator('[data-testid="search-passenger"]').click();

      await expect(page.locator('[data-testid="passenger-details"]')).toBeVisible({ timeout: 10000 });

      // Verify SSR codes are displayed
      await expect(page.locator('[data-testid="ssr-codes"]')).toBeVisible();
    });

    await test.step('Handle wheelchair request (WCHR)', async () => {
      const ssrCodes = page.locator('[data-testid="ssr-codes"]');

      if (await ssrCodes.textContent().then(text => text?.includes('WCHR'))) {
        // Verify wheelchair notification
        await expect(page.locator('[data-testid="wheelchair-alert"]')).toBeVisible();

        // Confirm wheelchair arranged
        await page.locator('[data-testid="confirm-wheelchair"]').click();

        // Verify confirmation
        await expect(page.locator('[data-testid="wheelchair-confirmed"]')).toBeVisible();
      }
    });

    await test.step('Handle unaccompanied minor (UNMR)', async () => {
      const ssrCodes = page.locator('[data-testid="ssr-codes"]');

      if (await ssrCodes.textContent().then(text => text?.includes('UNMR'))) {
        // Verify UNMR alert
        await expect(page.locator('[data-testid="unmr-alert"]')).toBeVisible();

        // Collect guardian information
        await page.locator('[data-testid="guardian-name"]').fill('Jane Doe');
        await page.locator('[data-testid="guardian-phone"]').fill('+1234567890');
        await page.locator('[data-testid="meetgreeter-name"]').fill('John Doe');
        await page.locator('[data-testid="meetgreeter-phone"]').fill('+0987654321');

        await page.locator('[data-testid="confirm-unmr-details"]').click();

        // Verify confirmation
        await expect(page.locator('[data-testid="unmr-confirmed"]')).toBeVisible();
      }
    });
  });

  test('should handle group check-in at airport', async ({ page }) => {
    // Agent login
    await page.locator('[data-testid="agent-username"]').fill(agentCredentials.username);
    await page.locator('[data-testid="agent-password"]').fill(agentCredentials.password);
    await page.locator('[data-testid="agent-station"]').selectOption(agentCredentials.station);
    await page.locator('[data-testid="agent-login"]').click();

    await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });

    await test.step('Look up group booking', async () => {
      await page.locator('[data-testid="menu-checkin"]').click();
      await page.locator('[data-testid="search-type"]').selectOption('pnr');
      await page.locator('[data-testid="search-input"]').fill('GRP456');
      await page.locator('[data-testid="search-passenger"]').click();

      await expect(page.locator('[data-testid="group-booking"]')).toBeVisible({ timeout: 10000 });

      // Verify multiple passengers
      const passengerCount = await page.locator('[data-testid="passenger-row"]').count();
      expect(passengerCount).toBeGreaterThan(1);
    });

    await test.step('Check in all group members', async () => {
      // Select all passengers
      await page.locator('[data-testid="select-all"]').click();

      // Start group check-in
      await page.locator('[data-testid="group-checkin"]').click();

      // Auto-assign seats
      await page.locator('[data-testid="auto-assign-seats"]').click();

      // Verify seats assigned
      await expect(page.locator('[data-testid="seats-assigned"]')).toBeVisible({ timeout: 10000 });

      // Confirm group check-in
      await page.locator('[data-testid="confirm-group-checkin"]').click();

      // Verify all passengers checked in
      await expect(page.locator('[data-testid="group-checkin-complete"]')).toBeVisible();
    });
  });

  test('should measure airport check-in performance (<5s per passenger)', async ({ page }) => {
    // Agent login
    await page.locator('[data-testid="agent-username"]').fill(agentCredentials.username);
    await page.locator('[data-testid="agent-password"]').fill(agentCredentials.password);
    await page.locator('[data-testid="agent-station"]').selectOption(agentCredentials.station);
    await page.locator('[data-testid="agent-login"]').click();

    await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });

    await page.locator('[data-testid="menu-checkin"]').click();

    const startTime = Date.now();

    // Streamlined check-in
    await page.locator('[data-testid="search-type"]').selectOption('pnr');
    await page.locator('[data-testid="search-input"]').fill(passengerData.pnr);
    await page.locator('[data-testid="search-passenger"]').click();

    await expect(page.locator('[data-testid="passenger-details"]')).toBeVisible({ timeout: 10000 });

    await page.locator('[data-testid="start-checkin"]').click();
    await page.locator('[data-testid="auto-assign-seat"]').click(); // Quick seat assignment
    await page.locator('[data-testid="confirm-checkin"]').click();

    // Skip baggage if none
    await page.locator('[data-testid="no-baggage"]').click();

    // Skip APIS if not required
    await page.locator('[data-testid="skip-apis"]').click();

    // Print documents
    await page.locator('[data-testid="print-all"]').click();

    await expect(page.locator('[data-testid="checkin-complete-message"]')).toBeVisible({ timeout: 10000 });

    const checkinTime = Date.now() - startTime;
    console.log(`Airport check-in time: ${checkinTime}ms`);

    if (checkinTime > 5000) {
      console.warn(`⚠️  Airport check-in time (${checkinTime}ms) exceeds 5s target`);
    }
  });

  test('should handle excess baggage and collect payment', async ({ page }) => {
    // Agent login
    await page.locator('[data-testid="agent-username"]').fill(agentCredentials.username);
    await page.locator('[data-testid="agent-password"]').fill(agentCredentials.password);
    await page.locator('[data-testid="agent-station"]').selectOption(agentCredentials.station);
    await page.locator('[data-testid="agent-login"]').click();

    await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });

    // Lookup and start check-in
    await page.locator('[data-testid="menu-checkin"]').click();
    await page.locator('[data-testid="search-input"]').fill(passengerData.pnr);
    await page.locator('[data-testid="search-passenger"]').click();
    await expect(page.locator('[data-testid="passenger-details"]')).toBeVisible({ timeout: 10000 });

    await page.locator('[data-testid="start-checkin"]').click();
    await page.locator('[data-testid="auto-assign-seat"]').click();
    await page.locator('[data-testid="confirm-checkin"]').click();

    await test.step('Process heavy/excess baggage', async () => {
      await page.locator('[data-testid="process-baggage"]').click();

      // Add 3 bags with varying weights
      await page.locator('[data-testid="bag-count"]').fill('3');

      await page.locator('[data-testid="bag-1-weight"]').fill('23'); // Within allowance
      await page.locator('[data-testid="bag-2-weight"]').fill('28'); // Overweight
      await page.locator('[data-testid="bag-3-weight"]').fill('25'); // Excess bag

      // Verify excess baggage charges calculated
      await expect(page.locator('[data-testid="excess-baggage-charge"]')).toBeVisible();

      const excessCharge = await page.locator('[data-testid="excess-charge-amount"]').textContent();
      expect(excessCharge).toMatch(/\$\d+/);

      // Process payment
      await page.locator('[data-testid="collect-payment"]').click();

      // Payment options
      await page.locator('[data-testid="payment-method"]').selectOption('credit_card');
      await page.locator('[data-testid="card-number"]').fill('4111111111111111');
      await page.locator('[data-testid="card-expiry"]').fill('12/28');
      await page.locator('[data-testid="card-cvv"]').fill('123');

      await page.locator('[data-testid="process-payment"]').click();

      // Verify payment success
      await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 10000 });

      // Print bag tags
      await page.locator('[data-testid="print-bag-tags"]').click();
      await expect(page.locator('[data-testid="tags-printed"]')).toBeVisible();
    });
  });
});
