# Aurora creator toolkit

These commands are opt-in developer helpers. They do not deploy Aurora, charge generation credits, or download third-party videos automatically.

## Find performance-footage references

Obtain a Pexels API key and configure `PEXELS_API_KEY` as a secret in the execution environment.

```bash
npm run discover:performers -- --query "live musician performance" --limit 30 --output reports/performers.json
```

The JSON catalog includes the source page, creator, dimensions, duration, and a link to the Pexels license. Every result is marked `rightsReview: required-before-download-or-publication`. Verify model/property releases, trademarks, music rights, and any other restrictions before importing footage. Never scrape protected, paywalled, or unauthorized uploads.

## Optimize prompts

```bash
npm run prompt:optimize -- --prompt "Artist performing under red stage lights" --mode motion --output prompt.json
```

Modes: `video`, `image`, `motion`, `lipsync`, `previz`. This is a deterministic first pass. It does not make paid model calls or guarantee that every provider accepts the same prompt fields.

## Export a media manifest

```bash
npm run export:creator -- --output reports/assets.json
```

Exports file paths, file sizes, extensions, and unverified rights status as JSON. It does not upload or package originals; render/export of actual video projects remains a separate editor workflow.

## KIE API helper

```bash
KIE_API_KEY=<secret> node scripts/kie-cli.mjs models
KIE_API_KEY=<secret> node scripts/kie-cli.mjs status --task-id <id>
```

Set the key in the environment or a secret manager, **never in Git**. This is an Aurora-maintained wrapper for documented KIE endpoints, not an official KIE product. It deliberately has no paid-generation command.

## Other installed developer CLIs

`eas` (Expo builds), `appetize` (cloud simulators), `vercel`, `netlify`, `arkcli` (Volcengine Ark), and `openrouter` (DevTools) are separate developer-environment tools. Each requires its own provider login or credentials before cloud operations work.
