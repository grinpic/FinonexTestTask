import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';

// Fetch only sessions from the explicitly selected build; never serialize credentials.
const buildName = process.argv[2];
if (!buildName)
  throw new Error(
    'Usage: node scripts/collect-browserstack-results.mjs <build-name>',
  );
const auth = Buffer.from(
  `${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}`,
).toString('base64');
async function get(path) {
  const response = await fetch(
    `https://api-cloud.browserstack.com/app-automate/${path}`,
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );
  if (!response.ok) throw new Error(`BrowserStack HTTP ${response.status}`);
  return response.json();
}
const builds = await get('builds.json?limit=100');
const build = builds
  .map((entry) => entry.automation_build)
  .find((entry) => entry.name === buildName);
if (!build) throw new Error(`Build not found: ${buildName}`);
const sessions = await get(`builds/${build.hashed_id}/sessions.json?limit=100`);
const results = sessions.map(({ automation_session: s }) => ({
  sessionId: s.hashed_id,
  name: s.name,
  device: s.device,
  os: s.os,
  osVersion: s.os_version,
  status: s.status,
  reason: s.reason,
  duration: s.duration,
  browserUrl: s.browser_url,
  videoUrl: s.video_url,
}));
await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/browserstack-results.json',
  JSON.stringify({ buildName, results }, null, 2),
);
await writeFile(
  `artifacts/${buildName.replace(/[^a-zA-Z0-9_-]/g, '_')}-results.json`,
  JSON.stringify({ buildName, results }, null, 2),
);
console.log(JSON.stringify({ buildName, results }, null, 2));
