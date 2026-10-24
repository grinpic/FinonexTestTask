import assert from 'node:assert/strict';
import type { Product } from '../screens/products.screen.js';

const catalogSizeInRelease271 = 6;

export function expectCompleteCatalog(products: Product[]): void {
  assert.equal(
    products.length,
    catalogSizeInRelease271,
    'Read all six products',
  );
}

export function expectSameCatalog(before: Product[], after: Product[]): void {
  const byName = (items: Product[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name));
  assert.deepEqual(
    byName(after),
    byName(before),
    'Sorting must preserve products and prices',
  );
}

export function expectAscendingPrices(products: Product[]): void {
  const prices = products.map((product) => product.priceCents);
  assert.deepEqual(
    prices,
    [...prices].sort((a, b) => a - b),
    `Expected low-to-high prices, got: ${JSON.stringify(products)}`,
  );
}
