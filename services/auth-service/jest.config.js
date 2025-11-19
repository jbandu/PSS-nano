/**
 * Jest Configuration for Auth Service
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'auth-service',
  testEnvironment: 'node',
};
