/**
 * Jest Configuration for Shared Utils Package
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'shared-utils',
  testEnvironment: 'node',
};
