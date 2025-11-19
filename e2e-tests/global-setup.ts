/**
 * Global Setup for E2E Tests
 *
 * Runs once before all tests.
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test suite...');

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Health check - ensure services are running
  try {
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:4001';
    console.log(`Checking health endpoint: ${baseURL}/health`);

    await page.goto(`${baseURL}/health`, { timeout: 30000 });
    console.log('✓ Application is healthy');
  } catch (error) {
    console.error('✗ Application health check failed:', error);
    console.error('Make sure the application is running before executing E2E tests');
  }

  // Create test user if needed
  // This would typically call your API to seed test data
  console.log('Setting up test data...');

  await browser.close();
  console.log('✓ Global setup complete\n');
}

export default globalSetup;
