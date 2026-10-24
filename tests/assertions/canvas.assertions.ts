import assert from 'node:assert/strict';
import { browser } from '@wdio/globals';
import { DrawingScreen } from '../screens/drawing.screen.js';
import { compareImages } from '../support/image-comparison.js';
import { saveEvidence } from '../support/evidence.js';

export async function expectCanvasChanged(
  drawing: DrawingScreen,
  before: Buffer,
): Promise<number> {
  await saveEvidence('canvas-before.png', before);
  const drawn = await drawing.captureStableCanvas();
  await saveEvidence('canvas-drawn.png', drawn);
  const drawingChange = compareImages(before, drawn);
  await saveEvidence('canvas-drawn-diff.png', drawingChange.diff);
  assert.ok(
    drawingChange.changedRatio > 0.001,
    `Drawing must visibly change the canvas; changed ratio=${drawingChange.changedRatio}`,
  );

  return drawingChange.changedRatio;
}

export async function expectCanvasRestored(
  drawing: DrawingScreen,
  before: Buffer,
  drawingChangedRatio: number,
): Promise<void> {
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
          drawingChangedRatio,
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
}
