import assert from 'node:assert/strict';
import { browser } from '@wdio/globals';
import { SideMenu } from '../components/side-menu.js';
import { saveEvidence } from '../support/evidence.js';

describe('About — screen rotation', () => {
  afterEach(async () => {
    // Restore orientation even when a navigation or layout assertion fails.
    try {
      await browser.setOrientation('PORTRAIT');
    } finally {
      await browser.updateSettings({ defaultActiveApplication: 'auto' });
      await browser.activateApp('com.saucelabs.SwagLabsMobileApp');
    }
  });

  it('rotates About to landscape and keeps its content and controls usable', async () => {
    const about = await new SideMenu().openAbout();
    const portrait = await about.layout();
    assert.ok(
      portrait.window.height > portrait.window.width,
      'Start in portrait',
    );
    await saveEvidence(
      'about-portrait.png',
      Buffer.from(await browser.takeScreenshot(), 'base64'),
    );

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
    await about.revealNavigation();
    await about.waitForLoaded();
    const landscape = await about.layout();
    await saveEvidence(
      'about-landscape.png',
      Buffer.from(await browser.takeScreenshot(), 'base64'),
    );
    await saveEvidence(
      'about-layout.json',
      JSON.stringify({ portrait, landscape }, null, 2),
    );
    assert.ok(
      landscape.content.width > portrait.content.width,
      'Web content should expand after rotation',
    );
    for (const [name, rect] of Object.entries({
      address: landscape.address,
      reload: landscape.reload,
    })) {
      assert.ok(
        rect.width > 0 &&
          rect.height > 0 &&
          rect.x >= 0 &&
          rect.y >= 0 &&
          rect.x + rect.width <= landscape.window.width + 1 &&
          rect.y + rect.height <= landscape.window.height + 1,
        `${name} must remain inside the viewport`,
      );
    }
    assert.ok(
      landscape.addressVisible && landscape.reloadEnabled,
      'Navigation controls remain available',
    );
    // A real UI interaction after rotation, followed by loaded website checks.
    await about.reloadPage();
    assert.equal(await browser.getOrientation(), 'LANDSCAPE');
  });
});
