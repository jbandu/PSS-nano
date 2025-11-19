/**
 * Base Jest Configuration for Frontend Applications
 *
 * Used by Next.js apps (booking-engine, agent-portal, analytics-dashboard)
 * Extends the base config with DOM testing capabilities.
 */

const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,

  // Use jsdom for DOM testing
  testEnvironment: 'jsdom',

  // Setup files for React Testing Library
  setupFilesAfterEnv: [
    '<rootDir>/../../test-setup/jest.setup.js',
    '<rootDir>/../../test-setup/jest.setup.react.js',
  ],

  // Module name mapper for Next.js and CSS
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,

    // CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Static files
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/../../test-setup/fileMock.js',

    // Next.js specific
    '^next/router$': '<rootDir>/../../test-setup/mocks/next-router.js',
    '^next/navigation$': '<rootDir>/../../test-setup/mocks/next-navigation.js',
    '^next/image$': '<rootDir>/../../test-setup/mocks/next-image.js',
  },

  // Transform configuration for Next.js
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Coverage patterns for frontend
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
    '!src/types/**',
    '!src/app/layout.tsx', // Next.js root layout
    '!src/app/page.tsx', // Next.js root page (tested in E2E)
  ],
};
