import { $, browser } from '@wdio/globals';
import { DrawingScreen } from '../screens/drawing.screen.js';
import { AboutScreen } from '../screens/about.screen.js';

export class SideMenu {
  async open(): Promise<void> {
    const menu = await $('~test-Menu');
    await menu.waitForDisplayed();
    const position = await menu.getLocation();
    await browser.execute('mobile: tap', {
      x: position.x + 20,
      y: position.y + 30,
    });
    await $('~test-DRAWING').waitForDisplayed();
  }

  async openDrawing(): Promise<DrawingScreen> {
    await this.open();
    await this.tapItem('~test-DRAWING');
    const drawing = new DrawingScreen();
    await drawing.waitForLoaded();
    return drawing;
  }

  async openAbout(): Promise<AboutScreen> {
    await this.open();
    await this.tapItem('~test-ABOUT');
    const about = new AboutScreen();
    await about.waitForLoaded();
    return about;
  }
  private async tapItem(selector: string): Promise<void> {
    const item = await $(selector);
    await item.waitForDisplayed();
    let position = await item.getLocation();
    await browser.waitUntil(
      async () => {
        const current = await item.getLocation();
        const stable =
          current.x >= 0 &&
          current.x === position.x &&
          current.y === position.y;
        position = current;
        return stable;
      },
      { timeoutMsg: 'Drawer item did not finish sliding into the viewport' },
    );
    const size = await item.getSize();
    // Absolute coordinates work across local and cloud Appium versions.
    await browser.execute('mobile: tap', {
      x: Math.round(position.x + size.width / 2),
      y: Math.round(position.y + size.height / 2),
    });
  }
}
