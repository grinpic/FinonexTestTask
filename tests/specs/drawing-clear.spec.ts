import { SideMenu } from '../components/side-menu.js';
import {
  expectCanvasChanged,
  expectCanvasRestored,
} from '../assertions/canvas.assertions.js';

describe('Drawing — clear canvas', () => {
  it('removes the drawn strokes and restores the initial canvas', async function () {
    this.timeout(300000);
    const drawing = await new SideMenu().openDrawing();
    const initialCanvas = await drawing.captureStableCanvas();

    await drawing.drawZigzag();
    const changedRatio = await expectCanvasChanged(drawing, initialCanvas);

    await drawing.clear();
    await expectCanvasRestored(drawing, initialCanvas, changedRatio);
  });
});
