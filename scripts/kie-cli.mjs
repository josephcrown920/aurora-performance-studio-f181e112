#!/usr/bin/env node
/** Minimal KIE API helper using official documented endpoints. No secret storage. */
const [command, ...args] = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(`--${name}`); return i < 0 ? undefined : args[i + 1]; };
if (!['models', 'status'].includes(command)) {
  console.log('KIE helper: kie models | kie status --task-id <id>\nRequires KIE_API_KEY in the environment. This helper never starts a paid generation.');
  process.exit(command && command !== '--help' ? 2 : 0);
}
const key = process.env.KIE_API_KEY;
if (!key) { console.error('KIE_API_KEY is not set. Configure it as a secret, not in source files.'); process.exit(2); }
let url;
if (command === 'models') url = 'https://api.kie.ai/openai/v1/models';
else {
  const taskId = option('task-id');
  if (!taskId) { console.error('Usage: kie status --task-id <id>'); process.exit(2); }
  url = `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;
}
const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`KIE ${response.status}: ${await response.text()}`);
console.log(JSON.stringify(await response.json(), null, 2));
