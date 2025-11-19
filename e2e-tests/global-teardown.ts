/**
 * Global Teardown for E2E Tests
 *
 * Runs once after all tests.
 */

async function globalTeardown() {
  console.log('\n🧹 Cleaning up after E2E tests...');

  // Cleanup test data, close connections, etc.
  console.log('✓ Cleanup complete');
}

export default globalTeardown;
