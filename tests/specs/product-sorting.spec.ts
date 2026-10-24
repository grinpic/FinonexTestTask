import { ProductsScreen } from '../screens/products.screen.js';
import {
  expectCompleteCatalog,
  expectSameCatalog,
  expectAscendingPrices,
} from '../assertions/products.assertions.js';

describe('Products — sorting', () => {
  it('displays the complete catalog in ascending price order', async () => {
    const products = new ProductsScreen();
    const before = await products.readEntireCatalog();
    expectCompleteCatalog(before);

    await products.scrollToTop();
    await products.sortByPriceAscending();
    const after = await products.readEntireCatalog();

    expectCompleteCatalog(after);
    expectSameCatalog(before, after);
    expectAscendingPrices(after);
  });
});
