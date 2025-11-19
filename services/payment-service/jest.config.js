/**
 * Jest Configuration for Payment Service
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'payment-service',
  testEnvironment: 'node',
};
