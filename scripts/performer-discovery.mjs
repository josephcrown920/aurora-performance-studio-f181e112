#!/usr/bin/env node
/** Rights-aware performance-footage discovery via the official Pexels API.
 * Searches metadata only; never bypasses access controls or downloads footage.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const query = option('query', process.argv.slice(2).filter((x) => !x.startsWith('--'))[0]);
const output = option('output', 'reports/performer-videos.json');
const perPage = Math.min(80, Math.max(1, Number(option('limit', 20)) || 20));
const apiKey = process.env.PEXELS_API_KEY;

if (!query || !apiKey) {
  console.error('Usage: PEXELS_API_KEY=<key> npm run discover:performers -- --query "stage performance" --limit 20 --output reports/performer-videos.json');
  process.exit(2);
}

const endpoint = new URL('https://api.pexels.com/v1/videos/search');
endpoint.searchParams.set('query', query);
endpoint.searchParams.set('per_page', String(perPage));
const response = await fetch(endpoint, { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`Pexels search failed (${response.status})`);
const body = await response.json();
const results = (body.videos ?? []).map((video) => ({
  id: `pexels:${video.id}`,
  query,
  title: `Performance footage ${video.id}`,
  pageUrl: video.url,
  creator: video.user?.name ?? null,
  creatorUrl: video.user?.url ?? null,
  durationSeconds: video.duration,
  width: video.width,
  height: video.height,
  preview: video.image,
  // Pexels permits many free uses but the editor must review applicable restrictions.
  licensePage: 'https://www.pexels.com/license/',
  rightsReview: 'required-before-download-or-publication',
  source: 'Pexels official video API',
}));
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ searchedAt: new Date().toISOString(), query, results }, null, 2) + '\n');
console.log(`Saved ${results.length} discoverable videos to ${output}. Review licenses before use.`);
