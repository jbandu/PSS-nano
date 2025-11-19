import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'getting-started',
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/microservices',
        'architecture/data-flow',
        'architecture/integration',
        'architecture/deployment',
        'architecture/security',
        'architecture/technology-stack',
      ],
    },
    {
      type: 'category',
      label: 'Services',
      items: [
        'services/catalog',
        'services/api-gateway',
        'services/auth-service',
        'services/reservation-service',
        'services/inventory-service',
        'services/payment-service',
        'services/notification-service',
        'services/pricing-service',
        'services/ancillary-service',
        'services/boarding-service',
        'services/dcs-service',
        'services/other-services',
      ],
    },
    {
      type: 'category',
      label: 'Data Model',
      items: [
        'data-model/overview',
        'data-model/entity-relationships',
        'data-model/schemas',
        'data-model/indexes',
        'data-model/retention-policies',
        'data-model/migrations',
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/overview',
        'security/authentication',
        'security/authorization',
        'security/secrets-management',
        'security/pii-handling',
        'security/vulnerability-reporting',
        'security/security-checklist',
      ],
    },
    'glossary',
  ],

  apiSidebar: [
    'api/overview',
    {
      type: 'category',
      label: 'Authentication API',
      items: [
        'api/auth/endpoints',
        'api/auth/authentication-guide',
        'api/auth/examples',
      ],
    },
    {
      type: 'category',
      label: 'Reservation API',
      items: [
        'api/reservation/endpoints',
        'api/reservation/examples',
      ],
    },
    {
      type: 'category',
      label: 'Inventory API',
      items: [
        'api/inventory/endpoints',
        'api/inventory/examples',
      ],
    },
    {
      type: 'category',
      label: 'Payment API',
      items: [
        'api/payment/endpoints',
        'api/payment/examples',
      ],
    },
    'api/rate-limiting',
    'api/error-codes',
    'api/postman-collections',
  ],

  guidesSidebar: [
    {
      type: 'category',
      label: 'Development',
      items: [
        'guides/development-setup',
        'guides/code-standards',
        'guides/debugging',
        'guides/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Git Workflow',
      items: [
        'guides/git-workflow',
        'guides/branch-naming',
        'guides/commit-messages',
        'guides/pull-requests',
        'guides/code-review',
      ],
    },
    {
      type: 'category',
      label: 'Testing',
      items: [
        'guides/testing',
        'guides/unit-testing',
        'guides/integration-testing',
        'guides/e2e-testing',
        'guides/load-testing',
        'guides/test-data',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'guides/deployment',
        'guides/environment-promotion',
        'guides/rollback',
        'guides/feature-flags',
        'guides/database-migrations',
        'guides/configuration-management',
      ],
    },
    {
      type: 'category',
      label: 'Monitoring & Operations',
      items: [
        'guides/monitoring',
        'guides/logging',
        'guides/tracing',
        'guides/debugging-production',
        'guides/performance-troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Integration Guides',
      items: [
        'guides/integrations/overview',
        'guides/integrations/gds',
        'guides/integrations/payment-gateway',
        'guides/integrations/email-sms',
        'guides/integrations/airport-systems',
        'guides/integrations/government-systems',
      ],
    },
    {
      type: 'category',
      label: 'Onboarding',
      items: [
        'guides/onboarding/overview',
        'guides/onboarding/day-1',
        'guides/onboarding/week-1',
        'guides/onboarding/week-2',
        'guides/onboarding/month-1',
      ],
    },
    'guides/faq',
    'contributing',
  ],
};

export default sidebars;
