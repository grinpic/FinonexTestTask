import { browser } from '@wdio/globals';

export async function rotateToLandscape(): Promise<void> {
  await browser.setOrientation('LANDSCAPE');
  await browser.waitUntil(
    async () => {
      const rect = await browser.getWindowRect();
      return (
        (await browser.getOrientation()) === 'LANDSCAPE' &&
        rect.width > rect.height
      );
    },
    { timeoutMsg: 'Device did not switch to landscape' },
  );
}

export async function restoreAppInPortrait(): Promise<void> {
  try {
    await browser.setOrientation('PORTRAIT');
  } finally {
    await browser.updateSettings({ defaultActiveApplication: 'auto' });
    await browser.activateApp('com.saucelabs.SwagLabsMobileApp');
  }
}
