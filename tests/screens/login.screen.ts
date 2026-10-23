import { $, browser } from '@wdio/globals';
import { ProductsScreen } from './products.screen.js';

export class LoginScreen {
  private get standardUser() {
    return $('~test-standard_user');
  }
  private get loginButton() {
    return $('~test-LOGIN');
  }

  /** The sample app exposes a demo-account autofill control on its login screen. */
  async signInAsStandardUser(): Promise<ProductsScreen> {
    await this.loginButton.waitForDisplayed();
    const user = await this.standardUser;
    await browser.execute('mobile: scroll', {
      elementId: user.elementId,
      toVisible: true,
    });
    await user.click();
    const login = await this.loginButton;
    await browser.execute('mobile: scroll', {
      elementId: login.elementId,
      toVisible: true,
    });
    await login.click();
    const products = new ProductsScreen();
    await products.waitForLoaded();
    return products;
  }
}
