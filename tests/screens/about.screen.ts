import { $, browser } from '@wdio/globals';

/** In sample-app 2.7.1, ABOUT opens https://saucelabs.com in external Safari. */
export class AboutScreen {
  private get address() {
    return $(
      '-ios predicate string:(type == "XCUIElementTypeTextField" AND (name == "TabBarItemTitle" OR name == "URL" OR label == "Address")) OR (type == "XCUIElementTypeButton" AND label == "Address" AND name BEGINSWITH "UnifiedTabBarItemView")',
    );
  }
  private get webview() {
    return $('XCUIElementTypeWebView');
  }
  private get reload() {
    return $('~ReloadButton');
  }

  private async dismissNavigationTip(): Promise<void> {
    const tip = $('~View Bookmarks, Share Menu and Open Tabs');
    if (await tip.isDisplayed()) {
      await $('~TipView').$('~xmark.circle.fill').click();
    }
  }

  async revealNavigation(): Promise<void> {
    if (await this.address.isDisplayed()) return;
    const { width, height } = await browser.getWindowRect();
    // Safari can hide browser chrome in landscape; a downward swipe reveals it.
    await browser
      .action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(width * 0.8), y: Math.round(height * 0.3) })
      .down()
      .move({
        x: Math.round(width * 0.8),
        y: Math.round(height * 0.8),
        duration: 500,
      })
      .up()
      .perform(true);
    await this.address.waitForDisplayed();
  }

  async waitForLoaded(): Promise<void> {
    await browser.waitUntil(
      async () => {
        const active = (await browser.execute('mobile: activeAppInfo')) as {
          bundleId: string;
        };
        if (active.bundleId === 'com.apple.mobilesafari') return true;
        // Do not request an accessibility snapshot of the sample app while it is backgrounding.
        if (active.bundleId !== 'com.apple.springboard') return false;
        // Fresh iOS installations may show this system prompt before Safari opens.
        const searchPreference = $(
          '-ios predicate string:type == "XCUIElementTypeAlert" AND name == "Search Engine Preference"',
        );
        if (await searchPreference.isDisplayed()) {
          await searchPreference.$('~Continue').click();
        }
        return false;
      },
      { timeout: 20000, timeoutMsg: 'ABOUT did not open Safari' },
    );
    await browser.waitUntil(
      async () => {
        await this.dismissNavigationTip();
        return (
          (await this.address.isDisplayed()) &&
          (await this.reload.isDisplayed())
        );
      },
      {
        timeout: 45000,
        timeoutMsg: 'Safari navigation controls did not become available',
      },
    );
    await browser.waitUntil(
      async () => {
        const url = await this.address.getAttribute('value');
        return /saucelabs\.com/i.test(url ?? '');
      },
      { timeoutMsg: 'Safari did not navigate to the Sauce Labs domain' },
    );
    await this.webview.waitForDisplayed({ timeout: 45000 });
    await browser.waitUntil(
      async () => {
        for (const link of await this.webview.$$('XCUIElementTypeLink')) {
          if (await link.isDisplayed()) return true;
        }
        return false;
      },
      {
        timeout: 45000,
        timeoutMsg:
          'About website has no visible links; check network or browser error page',
      },
    );
  }

  async layout() {
    return {
      window: await browser.getWindowRect(),
      content: {
        ...(await this.webview.getLocation()),
        ...(await this.webview.getSize()),
      },
      address: {
        ...(await this.address.getLocation()),
        ...(await this.address.getSize()),
      },
      reload: {
        ...(await this.reload.getLocation()),
        ...(await this.reload.getSize()),
      },
      addressVisible: await this.address.isDisplayed(),
      reloadEnabled: await this.reload.isEnabled(),
    };
  }

  async reloadPage(): Promise<void> {
    await this.reload.click();
    await this.waitForLoaded();
  }
}
