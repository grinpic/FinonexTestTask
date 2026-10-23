import { prepareSession } from '../tests/support/session-setup.js';
import { captureFailure } from '../tests/support/artifacts.js';

export const sharedConfig = {
  runner: 'local',
  specs: ['../tests/specs/**/*.spec.ts'],
  maxInstances: 1,
  framework: 'mocha',
  reporters: ['spec'],
  logLevel: 'warn',
  outputDir: './artifacts/logs',
  waitforTimeout: 15000,
  waitforInterval: 500,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,
  specFileRetries: 0,
  mochaOpts: { ui: 'bdd', timeout: 180000, retries: 0 },
  // Each spec contains one scenario and receives a fresh Appium session.
  before: prepareSession,
  afterTest: async (test, _context, { passed }) => {
    if (!passed) {
      try {
        await captureFailure(test.title);
      } catch (error) {
        console.warn('Artifact collection failed:', error);
      }
    }
  },
} satisfies Partial<WebdriverIO.Config>;
