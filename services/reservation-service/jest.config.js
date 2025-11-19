/**
 * Jest Configuration for Reservation Service
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'reservation-service',
  testEnvironment: 'node',
};
