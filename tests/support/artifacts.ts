import { browser } from '@wdio/globals';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function captureFailure(title: string): Promise<void> {
  const directory = join(
    'artifacts',
    browser.sessionId,
    `${Date.now()}-${title.replace(/[^a-z0-9]+/gi, '-').slice(0, 80)}`,
  );
  await mkdir(directory, { recursive: true });
  // A screenshot failure must not prevent collecting the hierarchy (or mask the test failure).
  const results = await Promise.allSettled([
    browser.saveScreenshot(join(directory, 'screen.png')),
    browser
      .getPageSource()
      .then((source) => writeFile(join(directory, 'source.xml'), source)),
  ]);
  for (const result of results) {
    if (result.status === 'rejected')
      console.warn('Could not collect a failure artifact:', result.reason);
  }
}
