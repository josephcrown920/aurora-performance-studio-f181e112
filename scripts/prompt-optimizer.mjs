#!/usr/bin/env node
/** Deterministic prompt refinement; no API key or paid inference required. */
import { writeFile } from 'node:fs/promises';

const arg = (key, fallback) => { const i = process.argv.indexOf(`--${key}`); return i < 0 ? fallback : process.argv[i + 1]; };
const original = arg('prompt', '');
const mode = arg('mode', 'video');
const output = arg('output', '');
if (!original.trim()) {
  console.error('Usage: npm run prompt:optimize -- --prompt "An artist on stage" --mode motion [--output prompt.json]');
  process.exit(2);
}
const guidance = {
  video: 'Describe subject, setting, action, shot size, camera trajectory, lighting, duration, and aspect ratio. Maintain temporal continuity.',
  image: 'Describe subject, composition, lighting, material texture, lens perspective, background, and aspect ratio.',
  motion: 'Preserve the uploaded performer identity, costume, body proportions, and source action. Change only the requested camera or performance motion; avoid morphing and drift.',
  lipsync: 'Preserve face, hairstyle, skin tone, and identity. Align visible mouth motion to supplied audio with natural phoneme timing; avoid flicker.',
  previz: 'Produce a low-cost draft with framing, camera blocking, depth separation, and motion intent before final rendering.',
};
if (!Object.hasOwn(guidance, mode)) throw new Error(`Unknown mode: ${mode}`);
const improved = `${original.trim()}\n\nDirection: ${guidance[mode]}\nQuality guardrails: coherent anatomy, stable identity, no unexpected text, no watermarks, no unintended scene cuts. Respect the rights and consent of all depicted people.`;
const result = { mode, original, optimized: improved, requiresHumanReview: true };
if (output) await writeFile(output, JSON.stringify(result, null, 2) + '\n');
console.log(improved);
