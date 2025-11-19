/**
 * Jest Configuration for Notification Service
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'notification-service',
  testEnvironment: 'node',
};
