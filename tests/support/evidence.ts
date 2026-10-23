import { browser } from '@wdio/globals';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function saveEvidence(
  name: string,
  data: Buffer | string,
): Promise<void> {
  const directory = join('artifacts', browser.sessionId);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, name), data);
}
