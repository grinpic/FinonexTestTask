import { $, browser } from '@wdio/globals';
import { parsePrice } from '../support/price.js';

const MAX_SCROLLS = 15;

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

  async readEntireCatalog(): Promise<Product[]> {
    const catalog = new Map<string, Product>();
    for (let scroll = 0; scroll <= MAX_SCROLLS; scroll++) {
      const visibleProducts = await this.readVisibleProducts();
      this.mergeProducts(catalog, visibleProducts);

      if (await this.footer.isDisplayed()) return [...catalog.values()];
      if (scroll < MAX_SCROLLS) await this.swipe('up');
    }
    throw new Error(
      `Catalog footer not reached after ${MAX_SCROLLS} swipes; collected ${catalog.size} products`,
    );
  }

  private async readVisibleProducts(): Promise<Product[]> {
    const visible: Array<Product & { x: number; y: number }> = [];
    for (const card of await this.list.$$('~test-Item')) {
      const price = card.$('~test-Price');
      // A visible price can belong to a card whose title is above the viewport.
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
    return visible
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map(({ name, priceCents }) => ({ name, priceCents }));
  }

  private mergeProducts(
    catalog: Map<string, Product>,
    products: Product[],
  ): void {
    for (const product of products) {
      const previous = catalog.get(product.name);
      if (previous && previous.priceCents !== product.priceCents) {
        throw new Error(`Price changed while reading ${product.name}`);
      }
      catalog.set(product.name, product);
    }
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
