import 'dotenv/config';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { sharedConfig } from './wdio.shared.conf.js';

const udid = process.env.IOS_SIMULATOR_UDID;
const app = process.env.IOS_SIMULATOR_APP;
if (!udid || !app) {
  throw new Error(
    'Set IOS_SIMULATOR_UDID and IOS_SIMULATOR_APP (path to the simulator .app).',
  );
}
if (!existsSync(resolve(app)))
  throw new Error(`Simulator app not found: ${app}`);

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  // First run includes building WebDriverAgent with Xcode.
  connectionRetryTimeout: 600000,
  connectionRetryCount: 0,
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:udid': udid,
      'appium:app': resolve(app),
      'appium:noReset': false,
      'appium:fullReset': false,
      // Set the app language without restarting iOS services and invalidating WDA.
      'appium:processArguments': {
        args: ['-AppleLanguages', '(en)', '-AppleLocale', 'en_US'],
      },
      'appium:orientation': 'PORTRAIT',
      'appium:wdaLaunchTimeout': 120000,
      'appium:showXcodeLog': true,
      'appium:simulatorStartupTimeout': 300000,
    },
  ],
};
