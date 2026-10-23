import { $, browser } from '@wdio/globals';
import { compareImages, cropScreenshot } from '../support/image-comparison.js';

export class DrawingScreen {
  private get root() {
    return $('~test-DRAWING-SCREEN');
  }
  private get surface() {
    return this.root.$('XCUIElementTypeWebView');
  }

  async waitForLoaded(): Promise<void> {
    await this.root.waitForDisplayed();
    await this.surface.waitForDisplayed();
    await $('~test-CLEAR').waitForDisplayed();
  }

  async captureCanvas(): Promise<Buffer> {
    const location = await this.surface.getLocation();
    const size = await this.surface.getSize();
    // Pinned signature-pad CSS reserves 75 logical points below the drawing body.
    // Explicit crop is necessary: WDA may return a full-screen image for a WebView screenshot.
    const region = {
      x: location.x + 1,
      y: location.y + 1,
      width: size.width - 2,
      height: size.height - 76,
    };
    return cropScreenshot(
      Buffer.from(await browser.takeScreenshot(), 'base64'),
      region,
      await browser.getWindowRect(),
    );
  }

  async captureStableCanvas(): Promise<Buffer> {
    let previous = await this.captureCanvas();
    await browser.waitUntil(
      async () => {
        const current = await this.captureCanvas();
        const stable = compareImages(previous, current).changedPixels === 0;
        previous = current;
        return stable;
      },
      { timeoutMsg: 'Drawing surface did not stabilize' },
    );
    return previous;
  }

  async drawZigzag(): Promise<void> {
    const location = await this.surface.getLocation();
    const size = await this.surface.getSize();
    const point = (x: number, y: number) => ({
      x: Math.round(location.x + size.width * x),
      y: Math.round(location.y + size.height * y),
    });
    await browser
      .action('pointer', { parameters: { pointerType: 'touch' } })
      .move(point(0.25, 0.25))
      .down()
      .pause(100)
      .move({ ...point(0.7, 0.35), duration: 500 })
      .move({ ...point(0.3, 0.5), duration: 500 })
      .move({ ...point(0.7, 0.6), duration: 500 })
      .up()
      .perform(true);
  }

  async clear(): Promise<void> {
    await $('~test-CLEAR').click();
  }
}
