import { PNG } from 'pngjs';

/** Pixel comparison of two same-session, same-size PNGs; excludes small channel noise. */
export function compareImages(
  before: Buffer,
  after: Buffer,
  channelTolerance = 24,
) {
  const a = PNG.sync.read(before);
  const b = PNG.sync.read(after);
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(
      `Image dimensions changed: ${a.width}x${a.height} -> ${b.width}x${b.height}`,
    );
  }
  const diff = new PNG({ width: a.width, height: a.height });
  let changedPixels = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const changed = [0, 1, 2, 3].some(
      (channel) =>
        Math.abs(a.data[i + channel]! - b.data[i + channel]!) >
        channelTolerance,
    );
    if (changed) changedPixels++;
    diff.data[i] = 255;
    diff.data[i + 1] = changed ? 0 : 255;
    diff.data[i + 2] = changed ? 0 : 255;
    diff.data[i + 3] = 255;
  }
  return {
    changedPixels,
    changedRatio: changedPixels / (a.width * a.height),
    diff: PNG.sync.write(diff),
  };
}

/** Convert logical iOS coordinates to screenshot pixels; supports Retina/compatibility scaling. */
export function cropScreenshot(
  screenshot: Buffer,
  region: { x: number; y: number; width: number; height: number },
  viewport: { width: number; height: number },
): Buffer {
  const image = PNG.sync.read(screenshot);
  const sx = image.width / viewport.width;
  const sy = image.height / viewport.height;
  const x = Math.round(region.x * sx);
  const y = Math.round(region.y * sy);
  const width = Math.round(region.width * sx);
  const height = Math.round(region.height * sy);
  if (
    width <= 0 ||
    height <= 0 ||
    x < 0 ||
    y < 0 ||
    x + width > image.width ||
    y + height > image.height
  ) {
    throw new Error('Canvas crop is outside the screenshot');
  }
  const cropped = new PNG({ width, height });
  PNG.bitblt(image, cropped, x, y, width, height, 0, 0);
  return PNG.sync.write(cropped);
}
