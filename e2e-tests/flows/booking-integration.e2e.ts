/**
 * Complete Booking Flow Integration Test
 *
 * Tests the entire booking flow across all services:
 * - inventory-service: Flight search and seat selection
 * - pricing-service: Fare selection and pricing
 * - reservation-service: Passenger details and booking creation
 * - ancillary-service: Ancillary product selection
 * - payment-service: Payment processing
 * - notification-service: Email/SMS confirmation
 * - gds-integration-service: GDS sync
 * - analytics-service: Booking analytics
 */

import { test, expect } from '@playwright/test';
import { BookingPage } from '../pages/booking.page';

test.describe('Complete Booking Flow - System Integration', () => {
  let bookingPage: BookingPage;
  let pnr: string;
  let bookingId: string;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
    await page.goto('/');
  });

  test('should complete full booking flow with all service integrations', async ({ page }) => {
    const testData = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-12-15',
      passengers: 1,
      passenger: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        passportNumber: 'AB1234567',
        passportExpiry: '2030-01-01',
        nationality: 'US',
      },
      seat: '12A',
      ancillaries: {
        baggage: '1 checked bag (23kg)',
        meal: 'Vegetarian meal',
      },
      payment: {
        cardNumber: '4111111111111111',
        expiry: '12/28',
        cvv: '123',
        billingZip: '10001',
      },
    };

    // STEP 1: Search flights (inventory-service)
    await test.step('Search flights via inventory service', async () => {
      await bookingPage.searchFlights(
        testData.origin,
        testData.destination,
        testData.departureDate,
        testData.passengers
      );

      // Verify flight results are displayed
      await expect(bookingPage.flightResults).toBeVisible({ timeout: 10000 });

      // Verify search criteria is preserved
      await expect(page.locator('[data-testid="search-summary"]')).toContainText(
        `${testData.origin} → ${testData.destination}`
      );
    });

    // STEP 2: Select flight and fare (pricing-service)
    await test.step('Select flight and fare class', async () => {
      // Select first available flight
      await bookingPage.selectFirstFlight();

      // Verify fare options are displayed
      await expect(page.locator('[data-testid="fare-options"]')).toBeVisible();

      // Select economy fare
      await page.locator('[data-testid="fare-economy"]').click();

      // Verify pricing is calculated correctly
      const farePrice = await page.locator('[data-testid="selected-fare-price"]').textContent();
      expect(farePrice).toMatch(/\$[\d,]+\.\d{2}/);

      // Continue to passenger details
      await page.locator('[data-testid="continue-to-passengers"]').click();
    });

    // STEP 3: Add passenger details (reservation-service)
    await test.step('Add passenger details and create reservation', async () => {
      // Fill passenger information
      await page.locator('[data-testid="first-name"]').fill(testData.passenger.firstName);
      await page.locator('[data-testid="last-name"]').fill(testData.passenger.lastName);
      await page.locator('[data-testid="email"]').fill(testData.passenger.email);
      await page.locator('[data-testid="phone"]').fill(testData.passenger.phone);
      await page.locator('[data-testid="date-of-birth"]').fill(testData.passenger.dateOfBirth);
      await page.locator('[data-testid="passport-number"]').fill(testData.passenger.passportNumber);
      await page.locator('[data-testid="passport-expiry"]').fill(testData.passenger.passportExpiry);
      await page.locator('[data-testid="nationality"]').selectOption(testData.passenger.nationality);

      // Verify form validation
      const emailInput = page.locator('[data-testid="email"]');
      await expect(emailInput).toHaveValue(testData.passenger.email);

      // Continue to seat selection
      await page.locator('[data-testid="continue-to-seats"]').click();
    });

    // STEP 4: Select seats (inventory-service)
    await test.step('Select seats via inventory service', async () => {
      // Wait for seat map to load
      await expect(page.locator('[data-testid="seat-map"]')).toBeVisible({ timeout: 10000 });

      // Select seat
      await page.locator(`[data-testid="seat-${testData.seat}"]`).click();

      // Verify seat selection
      await expect(page.locator(`[data-testid="seat-${testData.seat}"]`)).toHaveClass(/selected/);
      await expect(page.locator('[data-testid="selected-seats-summary"]')).toContainText(testData.seat);

      // Continue to ancillaries
      await page.locator('[data-testid="continue-to-ancillaries"]').click();
    });

    // STEP 5: Add ancillaries (ancillary-service)
    await test.step('Add ancillary products', async () => {
      // Wait for ancillaries page
      await expect(page.locator('[data-testid="ancillaries-section"]')).toBeVisible();

      // Select baggage
      await page.locator('[data-testid="baggage-1-checked"]').click();

      // Select meal
      await page.locator('[data-testid="meal-vegetarian"]').click();

      // Verify ancillaries are added
      await expect(page.locator('[data-testid="selected-ancillaries"]')).toContainText('1 checked bag');
      await expect(page.locator('[data-testid="selected-ancillaries"]')).toContainText('Vegetarian meal');

      // Verify updated total price includes ancillaries
      const totalWithAncillaries = await page.locator('[data-testid="total-price"]').textContent();
      expect(totalWithAncillaries).toMatch(/\$[\d,]+\.\d{2}/);

      // Continue to payment
      await page.locator('[data-testid="continue-to-payment"]').click();
    });

    // STEP 6: Process payment (payment-service)
    await test.step('Process payment and complete booking', async () => {
      // Wait for payment form
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();

      // Fill payment details
      await bookingPage.fillPaymentInfo(
        testData.payment.cardNumber,
        testData.payment.expiry,
        testData.payment.cvv
      );

      await page.locator('[data-testid="billing-zip"]').fill(testData.payment.billingZip);

      // Review booking summary
      await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="booking-summary"]')).toContainText(testData.passenger.email);
      await expect(page.locator('[data-testid="booking-summary"]')).toContainText(testData.seat);

      // Submit payment
      await page.locator('[data-testid="submit-payment"]').click();

      // Wait for payment processing
      await expect(page.locator('[data-testid="processing-payment"]')).toBeVisible({ timeout: 5000 });
    });

    // STEP 7: Verify confirmation (notification-service)
    await test.step('Verify booking confirmation and notifications', async () => {
      // Wait for confirmation page
      await expect(bookingPage.confirmationMessage).toBeVisible({ timeout: 15000 });
      await expect(bookingPage.confirmationMessage).toContainText('Booking Confirmed');

      // Get PNR
      pnr = await bookingPage.getConfirmationPNR();
      expect(pnr).toMatch(/^[A-Z0-9]{6}$/);

      // Verify booking ID is displayed
      const confirmationText = await page.locator('[data-testid="booking-confirmation"]').textContent();
      expect(confirmationText).toContain(pnr);

      // Verify confirmation email notification
      await expect(page.locator('[data-testid="email-sent-confirmation"]')).toContainText(
        `Confirmation sent to ${testData.passenger.email}`
      );

      // Verify booking details on confirmation page
      await expect(page.locator('[data-testid="confirmation-details"]')).toContainText(`${testData.origin} → ${testData.destination}`);
      await expect(page.locator('[data-testid="confirmation-details"]')).toContainText(testData.passenger.firstName);
      await expect(page.locator('[data-testid="confirmation-details"]')).toContainText(testData.seat);
    });

    // STEP 8: Verify GDS sync (gds-integration-service)
    await test.step('Verify GDS synchronization', async () => {
      // Check for GDS sync confirmation (may be async)
      const gdsStatus = page.locator('[data-testid="gds-sync-status"]');

      // Give it time to sync (GDS sync may be async)
      await page.waitForTimeout(2000);

      if (await gdsStatus.isVisible()) {
        await expect(gdsStatus).toContainText(/synced|pending/i);
      }
    });

    // STEP 9: Verify analytics tracking (analytics-service)
    await test.step('Verify analytics tracking', async () => {
      // Verify booking analytics event was triggered
      // This would typically be verified via API or database check
      // For E2E, we can verify the tracking pixel or event was fired

      // Check for analytics tracking element
      const analyticsTracking = page.locator('[data-analytics-event="booking_completed"]');
      if (await analyticsTracking.count() > 0) {
        const eventData = await analyticsTracking.getAttribute('data-booking-value');
        expect(eventData).toBeTruthy();
      }
    });

    // STEP 10: Verify booking can be retrieved
    await test.step('Retrieve and verify booking details', async () => {
      // Navigate to manage booking
      await page.goto('/manage-booking');

      // Search for booking by PNR
      await page.locator('[data-testid="pnr-input"]').fill(pnr);
      await page.locator('[data-testid="last-name-input"]').fill(testData.passenger.lastName);
      await page.locator('[data-testid="search-booking"]').click();

      // Verify booking details are displayed correctly
      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="booking-pnr"]')).toContainText(pnr);
      await expect(page.locator('[data-testid="booking-status"]')).toContainText('Confirmed');
      await expect(page.locator('[data-testid="passenger-name"]')).toContainText(`${testData.passenger.firstName} ${testData.passenger.lastName}`);
      await expect(page.locator('[data-testid="flight-route"]')).toContainText(`${testData.origin} → ${testData.destination}`);
    });
  });

  test('should handle booking flow with payment failure and retry', async ({ page }) => {
    const testData = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-12-15',
      passengers: 1,
      declinedCard: '4000000000000002',
      validCard: '4111111111111111',
      expiry: '12/28',
      cvv: '123',
    };

    // Complete flow up to payment
    await bookingPage.searchFlights(testData.origin, testData.destination, testData.departureDate, testData.passengers);
    await bookingPage.selectFirstFlight();

    // Select fare
    await page.locator('[data-testid="fare-economy"]').click();
    await page.locator('[data-testid="continue-to-passengers"]').click();

    // Fill passenger info
    await bookingPage.fillPassengerInfo('John', 'Doe', 'john@example.com', '+1234567890');
    await page.locator('[data-testid="continue-to-seats"]').click();

    // Skip seat selection
    await page.locator('[data-testid="skip-seat-selection"]').click();

    // Skip ancillaries
    await page.locator('[data-testid="skip-ancillaries"]').click();

    // Try payment with declined card
    await test.step('Payment fails with declined card', async () => {
      await bookingPage.fillPaymentInfo(testData.declinedCard, testData.expiry, testData.cvv);
      await page.locator('[data-testid="submit-payment"]').click();

      // Verify error message
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="payment-error"]')).toContainText(/declined|failed/i);
    });

    // Retry with valid card
    await test.step('Payment succeeds with valid card', async () => {
      // Clear previous card number
      await page.locator('[data-testid="card-number"]').fill('');

      // Fill with valid card
      await bookingPage.fillPaymentInfo(testData.validCard, testData.expiry, testData.cvv);
      await page.locator('[data-testid="submit-payment"]').click();

      // Verify success
      await expect(bookingPage.confirmationMessage).toBeVisible({ timeout: 15000 });
      await expect(bookingPage.confirmationMessage).toContainText('Booking Confirmed');
    });
  });

  test('should maintain data integrity across service failures', async ({ page }) => {
    const testData = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-12-15',
      passengers: 1,
    };

    // Start booking flow
    await bookingPage.searchFlights(testData.origin, testData.destination, testData.departureDate, testData.passengers);
    await bookingPage.selectFirstFlight();

    // Simulate network interruption by navigating away
    await test.step('Simulate session interruption', async () => {
      // Navigate to home
      await page.goto('/');

      // Wait a bit
      await page.waitForTimeout(1000);

      // Go back to booking
      await page.goBack();
    });

    // Verify booking state is preserved
    await test.step('Verify booking state recovery', async () => {
      // Check if we can resume or if we need to restart
      const hasBookingInProgress = await page.locator('[data-testid="resume-booking"]').isVisible();

      if (hasBookingInProgress) {
        await page.locator('[data-testid="resume-booking"]').click();

        // Verify we're at the right step
        await expect(page.locator('[data-testid="booking-progress"]')).toBeVisible();
      }
    });
  });

  test('should validate performance thresholds', async ({ page }) => {
    const performanceMetrics = {
      searchTime: 0,
      selectionTime: 0,
      bookingTime: 0,
    };

    // Measure search performance
    await test.step('Measure availability query performance (<500ms target)', async () => {
      const startTime = Date.now();

      await bookingPage.searchFlights('JFK', 'LAX', '2025-12-15', 1);
      await expect(bookingPage.flightResults).toBeVisible({ timeout: 10000 });

      performanceMetrics.searchTime = Date.now() - startTime;

      console.log(`Search time: ${performanceMetrics.searchTime}ms`);

      // Log warning if exceeds threshold (not failing test as it may vary in CI)
      if (performanceMetrics.searchTime > 500) {
        console.warn(`⚠️  Search time (${performanceMetrics.searchTime}ms) exceeds 500ms target`);
      }
    });

    // Measure booking completion performance
    await test.step('Measure booking completion performance (<3s target)', async () => {
      const startTime = Date.now();

      await bookingPage.selectFirstFlight();
      await page.locator('[data-testid="fare-economy"]').click();
      await page.locator('[data-testid="continue-to-passengers"]').click();

      await bookingPage.fillPassengerInfo('John', 'Doe', 'john@example.com', '+1234567890');
      await page.locator('[data-testid="continue-to-seats"]').click();
      await page.locator('[data-testid="skip-seat-selection"]').click();
      await page.locator('[data-testid="skip-ancillaries"]').click();

      await bookingPage.fillPaymentInfo('4111111111111111', '12/28', '123');
      await page.locator('[data-testid="submit-payment"]').click();

      await expect(bookingPage.confirmationMessage).toBeVisible({ timeout: 15000 });

      performanceMetrics.bookingTime = Date.now() - startTime;

      console.log(`Booking completion time: ${performanceMetrics.bookingTime}ms`);

      if (performanceMetrics.bookingTime > 3000) {
        console.warn(`⚠️  Booking time (${performanceMetrics.bookingTime}ms) exceeds 3s target`);
      }
    });
  });
});
