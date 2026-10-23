import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { compareImages, cropScreenshot } from '../support/image-comparison.js';

function whiteImage(width = 20, height = 20) {
  const image = new PNG({ width, height });
  image.data.fill(255);
  return image;
}

test('unchanged background passes, drawn and residual strokes fail the clean check', () => {
  const baseline = whiteImage();
  const drawn = whiteImage();
  for (let x = 0; x < 20; x++) drawn.data[x * 4 + 1] = 0;
  const residual = whiteImage();
  residual.data[1] = 0;
  const before = PNG.sync.write(baseline);
  assert.equal(compareImages(before, before).changedPixels, 0);
  assert.equal(compareImages(before, PNG.sync.write(drawn)).changedPixels, 20);
  assert.equal(
    compareImages(before, PNG.sync.write(residual)).changedPixels,
    1,
  );
});

test('small channel noise is tolerated but different image sizes are rejected', () => {
  const a = whiteImage();
  const b = whiteImage();
  b.data[0] = 245;
  assert.equal(
    compareImages(PNG.sync.write(a), PNG.sync.write(b)).changedPixels,
    0,
  );
  assert.throws(
    () => compareImages(PNG.sync.write(a), PNG.sync.write(whiteImage(10))),
    /dimensions changed/,
  );
});

test('crop scales logical coordinates and excludes pixels outside the canvas', () => {
  const image = whiteImage(40, 80);
  image.data[0] = 0;
  const cropped = PNG.sync.read(
    cropScreenshot(
      PNG.sync.write(image),
      { x: 5, y: 10, width: 10, height: 20 },
      { width: 20, height: 40 },
    ),
  );
  assert.equal(cropped.width, 20);
  assert.equal(cropped.height, 40);
  assert.ok(cropped.data.every((channel) => channel === 255));
  assert.throws(
    () =>
      cropScreenshot(
        PNG.sync.write(image),
        { x: -1, y: 0, width: 2, height: 2 },
        { width: 20, height: 40 },
      ),
    /outside/,
  );
});
