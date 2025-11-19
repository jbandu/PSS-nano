/**
 * E2E Accessibility Tests
 *
 * Tests WCAG 2.1 AA compliance across the platform.
 */

import { test, expect } from '@playwright/test';
import {
  setupAccessibilityTesting,
  checkAccessibility,
  getAccessibilityViolations,
  generateAccessibilityReport,
  accessibilityTests,
} from '../utils/accessibility';

test.describe('Accessibility - Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAccessibilityTesting(page);
  });

  test('should pass accessibility checks on home page', async ({ page }) => {
    await page.goto('/');

    // Run accessibility checks
    await checkAccessibility(page, {
      wcagLevel: 'AA',
    });

    // Get violations for reporting
    const violations = await getAccessibilityViolations(page);
    if (violations.length > 0) {
      console.log(generateAccessibilityReport(violations));
    }

    expect(violations.length).toBe(0);
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test tab order
    const interactiveElements = [
      '[data-testid="origin-input"]',
      '[data-testid="destination-input"]',
      '[data-testid="departure-date-input"]',
      '[data-testid="search-button"]',
    ];

    for (const selector of interactiveElements) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      console.log(`Focused: ${focused}`);
    }

    // Verify search button can be activated with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="flight-results"]')).toBeVisible();
  });

  test('should have proper ARIA labels on form inputs', async ({ page }) => {
    await page.goto('/');

    // Check origin input
    const hasAriaLabel = await accessibilityTests.testAriaLabels(
      page,
      '[data-testid="origin-input"]'
    );
    expect(hasAriaLabel).toBe(true);

    // Check all form inputs
    const formInputs = await page.locator('input').all();
    for (const input of formInputs) {
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const associatedLabel = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count();

      expect(
        ariaLabel || ariaLabelledby || associatedLabel > 0,
        'Input must have aria-label, aria-labelledby, or associated <label>'
      ).toBe(true);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const contrastViolations = await accessibilityTests.testColorContrast(page);

    if (contrastViolations.length > 0) {
      console.log('Color contrast violations:', contrastViolations);
    }

    expect(contrastViolations.length).toBe(0);
  });

  test('should have alt text for all images', async ({ page }) => {
    await page.goto('/');

    const altTextViolations = await accessibilityTests.testImageAltText(page);

    if (altTextViolations.length > 0) {
      console.log('Alt text violations:', altTextViolations);
    }

    expect(altTextViolations.length).toBe(0);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');

    const labelViolations = await accessibilityTests.testFormLabels(page);

    if (labelViolations.length > 0) {
      console.log('Form label violations:', labelViolations);
    }

    expect(labelViolations.length).toBe(0);
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/');

    // Check for live regions
    const liveRegions = await page.locator('[aria-live]').count();
    expect(liveRegions).toBeGreaterThan(0);

    // Check for status messages
    const statusElements = await page.locator('[role="status"], [role="alert"]').count();
    console.log(`Found ${statusElements} status/alert elements`);
  });

  test('should have accessible error messages', async ({ page }) => {
    await page.goto('/');

    // Submit form without filling required fields
    await page.click('[data-testid="search-button"]');

    // Wait for error messages
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });

    // Check if errors are associated with inputs
    const errorMessages = await page.locator('[data-testid="error-message"]').all();

    for (const error of errorMessages) {
      const describedBy = await error.getAttribute('id');
      expect(describedBy).toBeTruthy();

      // Verify input references this error
      const referencingInput = await page.locator(`[aria-describedby*="${describedBy}"]`).count();
      expect(referencingInput).toBeGreaterThan(0);
    }
  });

  test('should be navigable with screen reader', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading structure
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Only one h1 per page

    // Check for landmark regions
    const landmarks = {
      main: await page.locator('main, [role="main"]').count(),
      navigation: await page.locator('nav, [role="navigation"]').count(),
      banner: await page.locator('header, [role="banner"]').count(),
      contentinfo: await page.locator('footer, [role="contentinfo"]').count(),
    };

    expect(landmarks.main).toBeGreaterThan(0);
    console.log('Landmarks found:', landmarks);
  });
});

test.describe('Accessibility - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be accessible on mobile devices', async ({ page }) => {
    await setupAccessibilityTesting(page);
    await page.goto('/');

    await checkAccessibility(page);

    const violations = await getAccessibilityViolations(page);
    expect(violations.length).toBe(0);
  });

  test('should have touch-friendly targets', async ({ page }) => {
    await page.goto('/');

    // Check button sizes (should be at least 44x44px)
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
