import assert from 'node:assert/strict';
import { browser } from '@wdio/globals';
import type { AboutScreen } from '../screens/about.screen.js';
import { saveEvidence } from '../support/evidence.js';

type AboutLayout = Awaited<ReturnType<AboutScreen['layout']>>;

export async function capturePortraitLayout(
  about: AboutScreen,
): Promise<AboutLayout> {
  const portrait = await about.layout();
  assert.ok(
    portrait.window.height > portrait.window.width,
    'Start in portrait',
  );
  await saveEvidence(
    'about-portrait.png',
    Buffer.from(await browser.takeScreenshot(), 'base64'),
  );
  return portrait;
}

export async function expectUsableLandscape(
  about: AboutScreen,
  portrait: AboutLayout,
): Promise<void> {
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
}

export async function expectLandscapeOrientation(): Promise<void> {
  const rect = await browser.getWindowRect();
  assert.equal(await browser.getOrientation(), 'LANDSCAPE');
  assert.ok(
    rect.width > rect.height,
    'Landscape viewport must be wider than tall',
  );
}
