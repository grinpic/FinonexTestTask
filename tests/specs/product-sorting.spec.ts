import assert from 'node:assert/strict';
import { ProductsScreen } from '../screens/products.screen.js';

const catalogSizeInRelease271 = 6;

describe('Products — sorting', () => {
  it('displays the complete catalog in ascending price order', async () => {
    const products = new ProductsScreen();
    const before = await products.readEntireCatalog();
    assert.equal(
      before.length,
      catalogSizeInRelease271,
      'Read every product before sorting',
    );

    await products.scrollToTop();
    await products.sortByPriceAscending();
    const after = await products.readEntireCatalog();
    assert.equal(
      after.length,
      catalogSizeInRelease271,
      'Read every product after sorting',
    );

    const byName = (items: typeof before) =>
      [...items].sort((a, b) => a.name.localeCompare(b.name));
    assert.deepEqual(
      byName(after),
      byName(before),
      'Sorting must preserve products and prices',
    );

    const prices = after.map((product) => product.priceCents);
    assert.deepEqual(
      prices,
      [...prices].sort((a, b) => a - b),
      `Expected low-to-high prices, got: ${JSON.stringify(after)}`,
    );
  });
});
