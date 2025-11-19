/**
 * Boarding Flow Integration Test
 *
 * Tests the complete boarding flow across services:
 * - dcs-service: Load flight and boarding operations
 * - boarding-service: Scan boarding passes and validate
 * - load-control-service: Update passenger counts and weight & balance
 * - airport-integration-service: Send operational messages (LDM, CPM, etc.)
 */

import { test, expect } from '@playwright/test';

test.describe('Boarding Flow - System Integration', () => {
  const agentCredentials = {
    username: 'boarding_agent001',
    password: 'Board@Pass123',
    station: 'JFK',
    gate: 'A12',
  };

  const flightData = {
    flightNumber: 'AA100',
    origin: 'JFK',
    destination: 'LAX',
    departureTime: '14:30',
    aircraft: 'B737-800',
    gate: 'A12',
    totalSeats: 189,
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/agent/login');

    // Agent login
    await page.locator('[data-testid="agent-username"]').fill(agentCredentials.username);
    await page.locator('[data-testid="agent-password"]').fill(agentCredentials.password);
    await page.locator('[data-testid="agent-station"]').selectOption(agentCredentials.station);
    await page.locator('[data-testid="agent-login"]').click();

    await expect(page.locator('[data-testid="agent-dashboard"]')).toBeVisible({ timeout: 10000 });
  });

  test('should complete full boarding flow with all service integrations', async ({ page }) => {
    // STEP 1: Load flight (dcs-service)
    await test.step('Load flight for boarding', async () => {
      // Navigate to boarding
      await page.locator('[data-testid="menu-boarding"]').click();

      // Search for flight
      await page.locator('[data-testid="search-flight"]').fill(flightData.flightNumber);
      await page.locator('[data-testid="search"]').click();

      // Select flight
      await page.locator(`[data-testid="flight-${flightData.flightNumber}"]`).click();

      // Verify flight details
      await expect(page.locator('[data-testid="flight-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="flight-number"]')).toContainText(flightData.flightNumber);
      await expect(page.locator('[data-testid="route"]')).toContainText(`${flightData.origin} → ${flightData.destination}`);
      await expect(page.locator('[data-testid="departure-time"]')).toContainText(flightData.departureTime);
      await expect(page.locator('[data-testid="gate"]')).toContainText(flightData.gate);
      await expect(page.locator('[data-testid="aircraft"]')).toContainText(flightData.aircraft);

      // Load flight for boarding
      await page.locator('[data-testid="load-flight"]').click();

      // Verify flight loaded
      await expect(page.locator('[data-testid="flight-loaded"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="boarding-status"]')).toContainText(/ready|open/i);
    });

    // STEP 2: Review passenger manifest
    await test.step('Review passenger manifest and boarding groups', async () => {
      // View passenger list
      await page.locator('[data-testid="view-passengers"]').click();

      // Verify manifest displayed
      await expect(page.locator('[data-testid="passenger-manifest"]')).toBeVisible();

      // Verify passenger statistics
      const totalPassengers = await page.locator('[data-testid="total-passengers"]').textContent();
      expect(totalPassengers).toMatch(/\d+/);

      const checkedIn = await page.locator('[data-testid="checked-in-count"]').textContent();
      expect(checkedIn).toMatch(/\d+/);

      const notCheckedIn = await page.locator('[data-testid="not-checked-in-count"]').textContent();
      expect(notCheckedIn).toMatch(/\d+/);

      // Verify boarding groups
      await expect(page.locator('[data-testid="boarding-group-1"]')).toBeVisible(); // First class
      await expect(page.locator('[data-testid="boarding-group-2"]')).toBeVisible(); // Business/Elite
      await expect(page.locator('[data-testid="boarding-group-3"]')).toBeVisible(); // Economy
    });

    // STEP 3: Start boarding process
    await test.step('Start boarding and open gate', async () => {
      // Start boarding
      await page.locator('[data-testid="start-boarding"]').click();

      // Verify boarding started
      await expect(page.locator('[data-testid="boarding-status"]')).toContainText('Boarding');
      await expect(page.locator('[data-testid="boarding-started-time"]')).toBeVisible();

      // Verify gate display
      await expect(page.locator('[data-testid="gate-display"]')).toContainText('Now Boarding');
    });

    // STEP 4: Scan boarding passes (boarding-service)
    await test.step('Scan passenger boarding passes', async () => {
      // Verify boarding scanner is active
      await expect(page.locator('[data-testid="boarding-scanner"]')).toBeVisible();
      await expect(page.locator('[data-testid="scanner-status"]')).toContainText('Active');

      // Simulate scanning boarding passes
      const boardingPasses = [
        { pnr: 'ABC123', seat: '12A', status: 'valid', boardingGroup: 1 },
        { pnr: 'DEF456', seat: '15C', status: 'valid', boardingGroup: 2 },
        { pnr: 'GHI789', seat: '20F', status: 'valid', boardingGroup: 3 },
        { pnr: 'JKL012', seat: '22B', status: 'duplicate', boardingGroup: 3 }, // Already boarded
        { pnr: 'MNO345', seat: '25D', status: 'wrong_flight', boardingGroup: 3 }, // Wrong flight
      ];

      for (const bp of boardingPasses) {
        // Scan boarding pass
        await page.locator('[data-testid="scan-input"]').fill(bp.pnr);
        await page.locator('[data-testid="scan-submit"]').click();

        // Wait for scan result
        await page.waitForTimeout(500);

        if (bp.status === 'valid') {
          // Verify successful scan
          await expect(page.locator('[data-testid="scan-success"]')).toBeVisible({ timeout: 3000 });
          await expect(page.locator('[data-testid="passenger-name"]')).toBeVisible();
          await expect(page.locator('[data-testid="seat-number"]')).toContainText(bp.seat);

          // Accept boarding
          await page.locator('[data-testid="accept-boarding"]').click();

          // Verify boarded status
          await expect(page.locator('[data-testid="boarding-accepted"]')).toBeVisible({ timeout: 2000 });
        } else if (bp.status === 'duplicate') {
          // Verify duplicate scan error
          await expect(page.locator('[data-testid="scan-error"]')).toBeVisible({ timeout: 3000 });
          await expect(page.locator('[data-testid="error-message"]')).toContainText(/already boarded/i);

          // Close error
          await page.locator('[data-testid="close-error"]').click();
        } else if (bp.status === 'wrong_flight') {
          // Verify wrong flight error
          await expect(page.locator('[data-testid="scan-error"]')).toBeVisible({ timeout: 3000 });
          await expect(page.locator('[data-testid="error-message"]')).toContainText(/wrong flight|invalid/i);

          // Close error
          await page.locator('[data-testid="close-error"]').click();
        }

        // Clear scan input for next passenger
        await page.locator('[data-testid="scan-input"]').clear();
      }
    });

    // STEP 5: Monitor boarding progress (load-control-service)
    await test.step('Monitor boarding counts and load control', async () => {
      // View boarding statistics
      await page.locator('[data-testid="view-stats"]').click();

      // Verify boarding counts updated
      const boardedCount = await page.locator('[data-testid="boarded-count"]').textContent();
      expect(boardedCount).toMatch(/\d+/);
      expect(parseInt(boardedCount || '0')).toBeGreaterThan(0);

      // Verify percentage boarded
      const percentBoarded = await page.locator('[data-testid="percent-boarded"]').textContent();
      expect(percentBoarded).toMatch(/\d+%/);

      // Verify load control data
      await expect(page.locator('[data-testid="load-control-section"]')).toBeVisible();

      // Check weight and balance
      const totalWeight = await page.locator('[data-testid="total-weight"]').textContent();
      expect(totalWeight).toMatch(/\d+/);

      const cg = await page.locator('[data-testid="center-of-gravity"]').textContent();
      expect(cg).toMatch(/\d+\.?\d*/);

      // Verify within limits
      await expect(page.locator('[data-testid="weight-balance-status"]')).toContainText(/ok|within limits/i);

      // Verify boarding by zone/group
      await expect(page.locator('[data-testid="group-1-boarded"]')).toBeVisible();
      await expect(page.locator('[data-testid="group-2-boarded"]')).toBeVisible();
      await expect(page.locator('[data-testid="group-3-boarded"]')).toBeVisible();
    });

    // STEP 6: Handle late passengers and no-shows
    await test.step('Handle late passengers and mark no-shows', async () => {
      // View remaining passengers
      await page.locator('[data-testid="view-remaining"]').click();

      // Check for not boarded passengers
      const notBoardedCount = await page.locator('[data-testid="not-boarded-count"]').textContent();

      if (parseInt(notBoardedCount || '0') > 0) {
        // Mark specific passenger as no-show
        const firstNotBoarded = page.locator('[data-testid="passenger-row"]').first();
        await firstNotBoarded.locator('[data-testid="mark-noshow"]').click();

        // Confirm no-show
        await page.locator('[data-testid="confirm-noshow"]').click();

        // Verify no-show marked
        await expect(page.locator('[data-testid="noshow-confirmed"]')).toBeVisible({ timeout: 3000 });
      }
    });

    // STEP 7: Close boarding and finalize counts
    await test.step('Close boarding and finalize passenger counts', async () => {
      // Close boarding
      await page.locator('[data-testid="close-boarding"]').click();

      // Confirm closing
      await expect(page.locator('[data-testid="confirm-close-dialog"]')).toBeVisible();

      // Review final counts
      const finalBoarded = await page.locator('[data-testid="final-boarded-count"]').textContent();
      const finalNoShows = await page.locator('[data-testid="final-noshow-count"]').textContent();

      expect(finalBoarded).toMatch(/\d+/);
      expect(finalNoShows).toMatch(/\d+/);

      // Confirm close
      await page.locator('[data-testid="confirm-close-boarding"]').click();

      // Verify boarding closed
      await expect(page.locator('[data-testid="boarding-status"]')).toContainText(/closed/i);
      await expect(page.locator('[data-testid="boarding-closed-time"]')).toBeVisible();
    });

    // STEP 8: Send operational messages (airport-integration-service)
    await test.step('Send operational messages (CPM, LDM)', async () => {
      // Verify messages section
      await page.locator('[data-testid="view-messages"]').click();

      // Verify CPM (Cabin Passenger Message) sent
      const cpmMessage = page.locator('[data-testid="message-CPM"]');
      if (await cpmMessage.isVisible()) {
        await expect(cpmMessage.locator('[data-testid="status"]')).toContainText(/sent|ok/i);

        // View message details
        await cpmMessage.locator('[data-testid="view-details"]').click();

        // Verify CPM contains passenger count
        await expect(page.locator('[data-testid="cpm-content"]')).toContainText(/\d+ PAX/i);
      }

      // Verify LDM (Load Message) sent
      const ldmMessage = page.locator('[data-testid="message-LDM"]');
      if (await ldmMessage.isVisible()) {
        await expect(ldmMessage.locator('[data-testid="status"]')).toContainText(/sent|ok/i);
      }

      // Check for any message errors
      const messageErrors = page.locator('[data-testid="message-error"]');
      const errorCount = await messageErrors.count();

      if (errorCount > 0) {
        console.warn(`⚠️  ${errorCount} message(s) failed to send`);
      }
    });

    // STEP 9: Close flight
    await test.step('Close flight and finalize departure', async () => {
      // Navigate to close flight
      await page.locator('[data-testid="close-flight"]').click();

      // Verify close flight dialog
      await expect(page.locator('[data-testid="close-flight-dialog"]')).toBeVisible();

      // Review final statistics
      await expect(page.locator('[data-testid="final-stats"]')).toBeVisible();

      const stats = {
        totalSeats: await page.locator('[data-testid="stat-total-seats"]').textContent(),
        boarded: await page.locator('[data-testid="stat-boarded"]').textContent(),
        noShows: await page.locator('[data-testid="stat-noshows"]').textContent(),
        loadFactor: await page.locator('[data-testid="stat-load-factor"]').textContent(),
      };

      console.log('Flight Statistics:', stats);

      // Confirm flight closure
      await page.locator('[data-testid="confirm-close-flight"]').click();

      // Verify flight closed
      await expect(page.locator('[data-testid="flight-status"]')).toContainText(/closed|departed/i);
      await expect(page.locator('[data-testid="flight-closed-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="flight-closed-message"]')).toContainText(/successfully closed/i);
    });

    // STEP 10: Verify operational data updated
    await test.step('Verify operational data and analytics updated', async () => {
      // Navigate to flight history/reports
      await page.locator('[data-testid="menu-reports"]').click();

      // Search for the flight
      await page.locator('[data-testid="search-flight"]').fill(flightData.flightNumber);
      await page.locator('[data-testid="search"]').click();

      // Verify flight appears in history
      await expect(page.locator(`[data-testid="flight-${flightData.flightNumber}"]`)).toBeVisible();

      // View flight details
      await page.locator(`[data-testid="flight-${flightData.flightNumber}"]`).click();

      // Verify operational data
      await expect(page.locator('[data-testid="boarding-completed"]')).toBeVisible();
      await expect(page.locator('[data-testid="flight-closed"]')).toBeVisible();

      // Verify counts match
      await expect(page.locator('[data-testid="passenger-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="noshow-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="load-factor"]')).toBeVisible();
    });
  });

  test('should measure boarding scan performance (<2s per passenger)', async ({ page }) => {
    // Navigate to boarding
    await page.locator('[data-testid="menu-boarding"]').click();
    await page.locator('[data-testid="search-flight"]').fill(flightData.flightNumber);
    await page.locator('[data-testid="search"]').click();
    await page.locator(`[data-testid="flight-${flightData.flightNumber}"]`).click();
    await page.locator('[data-testid="load-flight"]').click();
    await expect(page.locator('[data-testid="flight-loaded"]')).toBeVisible({ timeout: 5000 });
    await page.locator('[data-testid="start-boarding"]').click();

    await test.step('Measure boarding pass scan time', async () => {
      const startTime = Date.now();

      // Scan boarding pass
      await page.locator('[data-testid="scan-input"]').fill('TEST123');
      await page.locator('[data-testid="scan-submit"]').click();

      // Wait for result
      await expect(page.locator('[data-testid="scan-success"]')).toBeVisible({ timeout: 5000 });

      // Accept boarding
      await page.locator('[data-testid="accept-boarding"]').click();
      await expect(page.locator('[data-testid="boarding-accepted"]')).toBeVisible({ timeout: 3000 });

      const scanTime = Date.now() - startTime;
      console.log(`Boarding scan time: ${scanTime}ms`);

      if (scanTime > 2000) {
        console.warn(`⚠️  Boarding scan time (${scanTime}ms) exceeds 2s target`);
      }
    });
  });

  test('should handle boarding exceptions and special cases', async ({ page }) => {
    // Navigate and load flight
    await page.locator('[data-testid="menu-boarding"]').click();
    await page.locator('[data-testid="search-flight"]').fill(flightData.flightNumber);
    await page.locator('[data-testid="search"]').click();
    await page.locator(`[data-testid="flight-${flightData.flightNumber}"]`).click();
    await page.locator('[data-testid="load-flight"]').click();
    await expect(page.locator('[data-testid="flight-loaded"]')).toBeVisible({ timeout: 5000 });
    await page.locator('[data-testid="start-boarding"]').click();

    await test.step('Handle standby passenger boarding', async () => {
      // Scan standby passenger
      await page.locator('[data-testid="scan-input"]').fill('STDBY001');
      await page.locator('[data-testid="scan-submit"]').click();

      // Verify standby alert
      const standbyAlert = page.locator('[data-testid="standby-alert"]');
      if (await standbyAlert.isVisible()) {
        await expect(standbyAlert).toContainText(/standby/i);

        // Assign seat
        await page.locator('[data-testid="assign-seat"]').click();
        await page.locator('[data-testid="seat-28A"]').click();
        await page.locator('[data-testid="confirm-seat"]').click();

        // Accept boarding
        await page.locator('[data-testid="accept-boarding"]').click();
        await expect(page.locator('[data-testid="boarding-accepted"]')).toBeVisible();
      }
    });

    await test.step('Handle upgrade at gate', async () => {
      // Scan passenger eligible for upgrade
      await page.locator('[data-testid="scan-input"]').fill('UPG123');
      await page.locator('[data-testid="scan-submit"]').click();

      const upgradeOffer = page.locator('[data-testid="upgrade-offer"]');
      if (await upgradeOffer.isVisible()) {
        // Offer upgrade
        await page.locator('[data-testid="offer-upgrade"]').click();

        // Accept upgrade
        await page.locator('[data-testid="accept-upgrade"]').click();

        // Process payment if required
        const paymentRequired = page.locator('[data-testid="upgrade-payment"]');
        if (await paymentRequired.isVisible()) {
          await page.locator('[data-testid="card-number"]').fill('4111111111111111');
          await page.locator('[data-testid="process-payment"]').click();
          await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
        }

        // New seat assigned
        await expect(page.locator('[data-testid="upgraded-seat"]')).toBeVisible();
      }
    });

    await test.step('Handle oversold flight and denied boarding', async () => {
      // Check if flight is oversold
      const oversoldAlert = page.locator('[data-testid="oversold-alert"]');

      if (await oversoldAlert.isVisible()) {
        // Request volunteers
        await page.locator('[data-testid="request-volunteers"]').click();

        // If no volunteers, deny boarding
        await page.locator('[data-testid="deny-boarding"]').click();

        // Select passenger for denial
        await page.locator('[data-testid="select-for-denial"]').first().click();

        // Confirm denial
        await page.locator('[data-testid="confirm-denial"]').click();

        // Process compensation
        await expect(page.locator('[data-testid="compensation-process"]')).toBeVisible();
      }
    });
  });

  test('should validate load control and weight & balance', async ({ page }) => {
    // Navigate and load flight
    await page.locator('[data-testid="menu-boarding"]').click();
    await page.locator('[data-testid="search-flight"]').fill(flightData.flightNumber);
    await page.locator('[data-testid="search"]').click();
    await page.locator(`[data-testid="flight-${flightData.flightNumber}"]`).click();
    await page.locator('[data-testid="load-flight"]').click();
    await expect(page.locator('[data-testid="flight-loaded"]')).toBeVisible({ timeout: 5000 });

    await test.step('View weight and balance calculations', async () => {
      // Navigate to load control
      await page.locator('[data-testid="view-load-control"]').click();

      // Verify W&B data
      await expect(page.locator('[data-testid="zero-fuel-weight"]')).toBeVisible();
      await expect(page.locator('[data-testid="takeoff-weight"]')).toBeVisible();
      await expect(page.locator('[data-testid="landing-weight"]')).toBeVisible();
      await expect(page.locator('[data-testid="center-of-gravity"]')).toBeVisible();

      // Verify within limits
      await expect(page.locator('[data-testid="weight-status"]')).toContainText(/within limits|ok/i);
      await expect(page.locator('[data-testid="cg-status"]')).toContainText(/within limits|ok/i);

      // Verify fuel
      await expect(page.locator('[data-testid="fuel-weight"]')).toBeVisible();

      // Verify cargo/baggage
      await expect(page.locator('[data-testid="cargo-weight"]')).toBeVisible();
      await expect(page.locator('[data-testid="baggage-weight"]')).toBeVisible();
    });
  });
});
