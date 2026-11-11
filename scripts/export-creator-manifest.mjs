#!/usr/bin/env node
/** Export a project-local, portable asset inventory without copying private media. */
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { join, relative, dirname, extname } from 'node:path';

const root = process.cwd();
const output = process.argv.includes('--output') ? process.argv[process.argv.indexOf('--output') + 1] : 'reports/creator-asset-manifest.json';
const allowed = new Set(['.mp4', '.mov', '.webm', '.png', '.jpg', '.jpeg', '.webp', '.wav', '.mp3', '.m4a']);
const results = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && allowed.has(extname(entry.name).toLowerCase())) {
      const file = await stat(path);
      results.push({ path: relative(root, path), bytes: file.size, extension: extname(entry.name).toLowerCase(), rightsStatus: 'unverified' });
    }
  }
}
await walk(join(root, 'public'));
results.sort((a, b) => a.path.localeCompare(b.path));
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ exportedAt: new Date().toISOString(), items: results }, null, 2) + '\n');
console.log(`Exported ${results.length} media records to ${output}. No media was uploaded or copied.`);
