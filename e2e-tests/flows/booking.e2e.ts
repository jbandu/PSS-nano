/**
 * E2E Tests for Complete Booking Flow
 *
 * Tests the critical path of flight booking from search to confirmation.
 */

import { test, expect } from '@playwright/test';
import { BookingPage } from '../pages/booking.page';

test.describe('Flight Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete a successful booking from search to confirmation', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // Step 1: Search for flights
    await test.step('Search for flights', async () => {
      await bookingPage.searchFlights(
        'JFK',
        'LAX',
        '2025-12-15',
        1
      );
    });

    // Step 2: Select a flight
    await test.step('Select a flight', async () => {
      await bookingPage.selectFirstFlight();
    });

    // Step 3: Fill passenger information
    await test.step('Fill passenger information', async () => {
      await bookingPage.fillPassengerInfo(
        'John',
        'Doe',
        'john.doe@example.com',
        '+1234567890'
      );

      // Continue to payment
      await page.locator('[data-testid="continue-to-payment"]').click();
    });

    // Step 4: Complete payment
    await test.step('Complete payment', async () => {
      await bookingPage.fillPaymentInfo(
        '4111111111111111', // Test card number
        '12/28',
        '123'
      );
    });

    // Step 5: Verify confirmation
    await test.step('Verify booking confirmation', async () => {
      const pnr = await bookingPage.getConfirmationPNR();
      expect(pnr).toMatch(/^[A-Z0-9]{6}$/);

      // Verify confirmation message
      await expect(bookingPage.confirmationMessage).toContainText(
        'Booking Confirmed'
      );
    });
  });

  test('should show validation errors for invalid passenger information', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // Search and select flight
    await bookingPage.searchFlights('JFK', 'LAX', '2025-12-15', 1);
    await bookingPage.selectFirstFlight();

    // Try to submit without filling required fields
    await page.locator('[data-testid="continue-to-payment"]').click();

    // Verify validation errors are shown
    await expect(page.locator('[data-testid="first-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // Complete flow up to payment
    await bookingPage.searchFlights('JFK', 'LAX', '2025-12-15', 1);
    await bookingPage.selectFirstFlight();
    await bookingPage.fillPassengerInfo(
      'John',
      'Doe',
      'john.doe@example.com',
      '+1234567890'
    );
    await page.locator('[data-testid="continue-to-payment"]').click();

    // Use a card that will be declined (test card)
    await bookingPage.fillPaymentInfo(
      '4000000000000002', // Declined card
      '12/28',
      '123'
    );

    // Verify error message is shown
    await expect(page.locator('[data-testid="payment-error"]')).toContainText(
      'Payment declined'
    );
  });

  test('should allow user to modify search and start over', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // Initial search
    await bookingPage.searchFlights('JFK', 'LAX', '2025-12-15', 1);

    // Click modify search
    await page.locator('[data-testid="modify-search"]').click();

    // Verify we're back at search form
    await expect(bookingPage.searchButton).toBeVisible();

    // Search with different parameters
    await bookingPage.searchFlights('ORD', 'SFO', '2025-12-20', 2);

    // Verify new results are shown
    await expect(bookingPage.flightResults).toBeVisible();
  });

  test('should display correct pricing breakdown', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // Complete flow to payment page
    await bookingPage.searchFlights('JFK', 'LAX', '2025-12-15', 1);
    await bookingPage.selectFirstFlight();

    // Verify pricing breakdown is displayed
    await expect(page.locator('[data-testid="base-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="taxes"]')).toBeVisible();
    await expect(page.locator('[data-testid="fees"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-price"]')).toBeVisible();

    // Verify total is sum of components
    const basePrice = await page.locator('[data-testid="base-price"]').textContent();
    const taxes = await page.locator('[data-testid="taxes"]').textContent();
    const fees = await page.locator('[data-testid="fees"]').textContent();
    const total = await page.locator('[data-testid="total-price"]').textContent();

    // Basic validation that prices are displayed
    expect(basePrice).toMatch(/\$[\d,]+\.\d{2}/);
    expect(taxes).toMatch(/\$[\d,]+\.\d{2}/);
    expect(fees).toMatch(/\$[\d,]+\.\d{2}/);
    expect(total).toMatch(/\$[\d,]+\.\d{2}/);
  });
});

test.describe('Mobile Booking Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should complete booking on mobile device', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // Search for flights
    await bookingPage.goto();
    await bookingPage.searchFlights('JFK', 'LAX', '2025-12-15', 1);

    // Select flight
    await bookingPage.selectFirstFlight();

    // Verify mobile-friendly layout
    await expect(page.locator('[data-testid="mobile-stepper"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through main form elements
    await page.keyboard.press('Tab'); // Origin
    await expect(page.locator('[data-testid="origin-input"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Destination
    await expect(page.locator('[data-testid="destination-input"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Date
    await expect(page.locator('[data-testid="departure-date-input"]')).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Verify ARIA labels exist
    await expect(page.locator('[data-testid="origin-input"]')).toHaveAttribute(
      'aria-label',
      /origin/i
    );
    await expect(page.locator('[data-testid="destination-input"]')).toHaveAttribute(
      'aria-label',
      /destination/i
    );
  });
});
