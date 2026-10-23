import { $, browser } from '@wdio/globals';
import { parsePrice } from '../support/price.js';

export interface Product {
  name: string;
  priceCents: number;
}

export class ProductsScreen {
  private get list() {
    return $('~test-PRODUCTS');
  }
  private get sortButton() {
    return $('~test-Modal Selector Button');
  }
  private get footer() {
    return $('~Terms of Service | Privacy Policy');
  }

  async waitForLoaded(): Promise<void> {
    await this.list.waitForDisplayed();
    await this.list.$('~test-Item title').waitForDisplayed();
  }

  async scrollToTop(): Promise<void> {
    for (let attempt = 0; attempt < 15; attempt++) {
      if (await this.list.$('~test-Item title').isDisplayed()) return;
      await this.swipe('down');
    }
    throw new Error('Could not return to the first product after 15 swipes');
  }

  async sortByPriceAscending(): Promise<void> {
    await this.sortButton.click();
    const option = $('~Price (low to high)');
    await option.waitForDisplayed();
    await option.click();
    await option.waitForDisplayed({ reverse: true });
    await this.waitForLoaded();
  }

  /** Read visual grid order (top-to-bottom, left-to-right), including off-screen rows. */
  async readEntireCatalog(): Promise<Product[]> {
    const products = new Map<string, Product>();
    for (let scroll = 0; scroll <= 15; scroll++) {
      const visible: Array<Product & { x: number; y: number }> = [];
      for (const card of await this.list.$$('~test-Item')) {
        const price = card.$('~test-Price');
        // Use price visibility: the title can be above the viewport on shorter iPhones.
        if (!(await price.isDisplayed())) continue;
        const name = (await card.$('~test-Item title').getText()).trim();
        if (!name) throw new Error('A product has an empty title');
        const location = await card.getLocation();
        visible.push({
          name,
          priceCents: parsePrice(await price.getText()),
          ...location,
        });
      }
      visible.sort((a, b) => a.y - b.y || a.x - b.x);
      for (const { name, priceCents } of visible) {
        const previous = products.get(name);
        if (previous && previous.priceCents !== priceCents) {
          throw new Error(`Price changed while reading ${name}`);
        }
        products.set(name, { name, priceCents });
      }
      if (await this.footer.isDisplayed()) return [...products.values()];
      if (scroll < 15) {
        // Half-page gestures retain overlap; bounded traversal cannot silently pass on a stuck list.
        await this.swipe('up');
      }
    }
    throw new Error(
      `Catalog footer not reached after 15 swipes; collected ${products.size} products`,
    );
  }

  private async swipe(direction: 'up' | 'down'): Promise<void> {
    const location = await this.list.getLocation();
    const size = await this.list.getSize();
    const x = Math.round(location.x + size.width / 2);
    const upper = Math.round(location.y + size.height * 0.3);
    const lower = Math.round(location.y + size.height * 0.8);
    await browser
      .action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y: direction === 'up' ? lower : upper })
      .down()
      .pause(100)
      .move({ x, y: direction === 'up' ? upper : lower, duration: 600 })
      .up()
      .perform(true);
  }
}
