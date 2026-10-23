import { browser } from '@wdio/globals';
import { environment } from './environment.js';
import { sharedConfig } from './wdio.shared.conf.js';
import { deviceMatrix } from './device-matrix.js';

const devices =
  process.env.IOS_MATRIX === 'true' ? deviceMatrix : [environment];

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  user: environment.username,
  key: environment.accessKey,
  hostname: 'hub-cloud.browserstack.com',
  protocol: 'https',
  port: 443,
  path: '/wd/hub',
  capabilities: devices.map((device) => ({
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': device.deviceName,
    'appium:platformVersion': device.platformVersion,
    'appium:app': environment.appId,
    'appium:noReset': false,
    'appium:language': 'en',
    'appium:locale': 'en_US',
    'appium:orientation': 'PORTRAIT',
    'bstack:options': {
      projectName: 'Finonex mobile exercise',
      buildName: environment.buildName,
      sessionName: `${device.deviceName} / iOS ${device.platformVersion}`,
      video: true,
      debug: true,
    },
  })),
  afterTest: async (test, context, result) => {
    await sharedConfig.afterTest(test, context, result);
    await browser.execute(
      `browserstack_executor: ${JSON.stringify({
        action: 'setSessionName',
        arguments: { name: test.title },
      })}`,
    );
  },
  after: async (result) => {
    await browser.execute(
      `browserstack_executor: ${JSON.stringify({
        action: 'setSessionStatus',
        arguments: {
          status: result === 0 ? 'passed' : 'failed',
          reason:
            result === 0
              ? 'All assertions passed'
              : 'Test or hook failed; inspect logs and artifacts',
        },
      })}`,
    );
  },
};
