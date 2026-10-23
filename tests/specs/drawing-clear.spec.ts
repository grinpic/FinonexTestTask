import assert from 'node:assert/strict';
import { browser } from '@wdio/globals';
import { SideMenu } from '../components/side-menu.js';
import { compareImages } from '../support/image-comparison.js';
import { saveEvidence } from '../support/evidence.js';

describe('Drawing — clear canvas', () => {
  it('removes the drawn strokes and restores the initial canvas', async function () {
    // Cloud transfers of Retina screenshots can take tens of seconds each.
    // Keep element and Clear assertion deadlines unchanged.
    this.timeout(300000);
    const drawing = await new SideMenu().openDrawing();
    const before = await drawing.captureStableCanvas();
    await saveEvidence('canvas-before.png', before);
    await drawing.drawZigzag();
    const drawn = await drawing.captureStableCanvas();
    await saveEvidence('canvas-drawn.png', drawn);
    const drawingChange = compareImages(before, drawn);
    await saveEvidence('canvas-drawn-diff.png', drawingChange.diff);
    assert.ok(
      drawingChange.changedRatio > 0.001,
      `Drawing must visibly change the canvas; changed ratio=${drawingChange.changedRatio}`,
    );

    await drawing.clear();
    let cleared = await drawing.captureCanvas();
    try {
      await browser.waitUntil(
        async () => {
          cleared = await drawing.captureCanvas();
          return compareImages(before, cleared).changedPixels === 0;
        },
        {
          timeout: 10000,
          timeoutMsg: 'Clear did not restore the original canvas',
        },
      );
    } finally {
      const comparison = compareImages(before, cleared);
      await saveEvidence('canvas-cleared.png', cleared);
      await saveEvidence('canvas-cleared-diff.png', comparison.diff);
      await saveEvidence(
        'canvas-comparison.json',
        JSON.stringify(
          {
            drawingChangedRatio: drawingChange.changedRatio,
            remainingChangedPixels: comparison.changedPixels,
          },
          null,
          2,
        ),
      );
    }
    assert.equal(
      compareImages(before, cleared).changedPixels,
      0,
      'No stroke pixels should remain after Clear',
    );
  });
});
