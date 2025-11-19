/**
 * Accessibility Testing Utilities
 *
 * Integrates axe-core with Playwright for automated accessibility testing.
 */

import { Page } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

/**
 * Accessibility test configuration
 */
export interface A11yConfig {
  /**
   * WCAG level to test against (A, AA, AAA)
   */
  wcagLevel?: 'A' | 'AA' | 'AAA';

  /**
   * Tags to include in the test
   */
  includeTags?: string[];

  /**
   * Tags to exclude from the test
   */
  excludeTags?: string[];

  /**
   * Rules to disable
   */
  disableRules?: string[];

  /**
   * Selectors to exclude from testing
   */
  exclude?: string[];
}

/**
 * Default accessibility configuration
 */
const DEFAULT_CONFIG: A11yConfig = {
  wcagLevel: 'AA',
  includeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  disableRules: [],
  exclude: [],
};

/**
 * Inject axe-core into the page
 */
export async function setupAccessibilityTesting(page: Page): Promise<void> {
  await injectAxe(page);
}

/**
 * Run accessibility checks on the current page
 */
export async function checkAccessibility(
  page: Page,
  config: A11yConfig = {}
): Promise<void> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  await checkA11y(
    page,
    undefined,
    {
      runOnly: {
        type: 'tag',
        values: fullConfig.includeTags!,
      },
      rules: Object.fromEntries(
        (fullConfig.disableRules || []).map((rule) => [rule, { enabled: false }])
      ),
    },
    true,
    'v2'
  );
}

/**
 * Get accessibility violations from the page
 */
export async function getAccessibilityViolations(
  page: Page,
  config: A11yConfig = {}
) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  return await getViolations(page, undefined, {
    runOnly: {
      type: 'tag',
      values: fullConfig.includeTags!,
    },
    rules: Object.fromEntries(
      (fullConfig.disableRules || []).map((rule) => [rule, { enabled: false }])
    ),
  });
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(violations: any[]): string {
  if (violations.length === 0) {
    return '✅ No accessibility violations found!';
  }

  let report = `❌ Found ${violations.length} accessibility violation(s):\n\n`;

  violations.forEach((violation, index) => {
    report += `${index + 1}. ${violation.id} - ${violation.description}\n`;
    report += `   Impact: ${violation.impact}\n`;
    report += `   Help: ${violation.help}\n`;
    report += `   Affected nodes: ${violation.nodes.length}\n`;

    violation.nodes.forEach((node: any, nodeIndex: number) => {
      report += `     ${nodeIndex + 1}) ${node.html}\n`;
      report += `        ${node.failureSummary}\n`;
    });

    report += '\n';
  });

  return report;
}

/**
 * Common accessibility tests
 */
export const accessibilityTests = {
  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(page: Page, selectors: string[]): Promise<void> {
    for (const selector of selectors) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      console.log(`Focused element: ${focusedElement}`);
    }
  },

  /**
   * Test screen reader announcements
   */
  async testAriaLabels(page: Page, selector: string): Promise<boolean> {
    const ariaLabel = await page.getAttribute(selector, 'aria-label');
    const ariaLabelledby = await page.getAttribute(selector, 'aria-labelledby');
    const ariaDescribedby = await page.getAttribute(selector, 'aria-describedby');

    return !!(ariaLabel || ariaLabelledby || ariaDescribedby);
  },

  /**
   * Test color contrast
   */
  async testColorContrast(page: Page): Promise<any[]> {
    const violations = await getAccessibilityViolations(page, {
      includeTags: ['cat.color'],
    });

    return violations.filter((v) => v.id === 'color-contrast');
  },

  /**
   * Test form labels
   */
  async testFormLabels(page: Page): Promise<any[]> {
    const violations = await getAccessibilityViolations(page, {
      includeTags: ['cat.forms'],
    });

    return violations.filter((v) => v.id === 'label');
  },

  /**
   * Test image alt text
   */
  async testImageAltText(page: Page): Promise<any[]> {
    const violations = await getAccessibilityViolations(page, {
      includeTags: ['cat.text-alternatives'],
    });

    return violations.filter((v) => v.id === 'image-alt');
  },
};
