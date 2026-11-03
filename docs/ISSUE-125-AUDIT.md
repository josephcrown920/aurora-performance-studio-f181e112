# Issue #125 audit — 2026-11-03

## Checklist outcome

GitHub issue #125 updated successfully using Out's GitHub API: 2/39 checked, 37 open.

- Existing check: TikTok30 exact-30/no-TikTok50 correction.
- Added check: full native Layers interface restored instead of minimal embed.
- Layers generation proof gate remains unchecked. A source PNG export is not a generated output.
- Motion Control and Motion Transfer explicitly remain failed/unproven.

## Fresh evidence

66 automated checks passed: 19 identity/editor/color checks, 19 performance validation/motion contract checks, 5 Comfy matcher checks, 23 additional scene/preview/dispatch checks. The dispatch/provider checks use fixtures, not paid inference.

Signed-in browser: Layers upload, wardrobe target lock, source PNG download (171,760 bytes), timeline handoff and visible editor monitor verified. Studio, Perform Anywhere and Motion screens opened. Screenshots/scripts were temporary diagnostics, not customer renders.

No paid generation calls made. No new real performance output verified.

## Motion diagnosis

- Actual transfer paths forward the phone recording; still-only Animate is a different action.
- `src/routes/api/guy/video.ts` mixes first/last-frame roles with video references and omits explicit reference roles on its general ModelArk branch. `src/lib/byteplus-video-contract.ts` already rejects this mixture. Upstream causation is unproven.
- Signed-in `/motion` displays “No motion worker online”; removing the last frame cannot solve that.
- `workers/aurora_worker.py` MimicMotion inference does not consume the advertised depth, preserve-face, motion-type or camera controls. Audio preservation remains unproven.
- Previous ModelArk/Comfy billing blocks remain unresolved; no repeat paid probes or alternate-provider retries were made.

## Remaining launch requirements

Six human-reference/safety/routing checks; fourteen performance environments; eleven real-output proof gates; pricing, executable Canvas and PDF corrections; three rollback/restore/health checks.

## GitHub code sync

GitHub read of `src/components/guy/StudioModeDock.tsx` returned 404 on the repository default branch. The latest preview changes are not confirmed there. Issue updates are not a code push. Agent cannot inspect/change Lovable Git sync or run stateful Git commands; project owner must check Project settings → Git for the linked repository/branch and sync state. No code push claimed.