# Aurora test / issue comparison — November 10, 2026

Tested local revision: `2164728ca8fe916dfc73b1982fdb13085b6140b1` plus the added Kie payload regression test. This is not proof that this revision is published or synced to GitHub.

## Verified checks
- [x] Full existing suite executed: **1,613 pass, 91 fail, 1 unhandled error**, 1,704 tests across 153 files. This is a completed run, NOT a passing release gate.
- [x] Focused regression run: **32 pass, 0 fail**, nine files covering Kie allowlist/dispatch/payloads, mobile orientation, chat isolation, character-lock scope, identity contract, performance validation and mocked motion smoke integration.
- [x] Added five concrete tests for authorized Wan/Seedance Mini/MiniMax/OmniHuman contracts. These assert local request construction; they do not validate live provider schemas or successful renders.
- [x] Signed-in pages opened: `/motion`, `/lipsync`, `/reshoot`, `/soul`, `/spin`. No page errors observed. Screenshot review confirmed motion and lip-sync controls. No submission/output flow passed in this run.
- [x] Worker import audit passed: 30 native imports confined to documented Node-only files.
- [x] Latest preview compilation signal: `build OK`, November 10 at 06:54:56 UTC. No manual production build/typecheck was run; the managed build signal is not a production deployment test.
- [x] Database failure evidence recovered: motion generation `f51977fd-e016-4b2e-8964-71c94d677f96` failed with “No valid characters detected in the video”; lip-sync job `b4e304c5-5431-4e25-a1ee-7d0eef20afa5` failed with the provider's sensitive-content rejection. These are Aurora record IDs, not Kie task IDs.

## Failing / blocked launch gates
- [ ] Full suite green: failures include pricing/feature-detection expectations, missing music storage, credit integration, scene ownership fixtures, MCP visibility and protection/health checks. Unhandled error: missing `artifacts/web/.replit-artifact/artifact.toml`. Do not characterize all failures as harmless legacy pricing tests.
- [ ] Migration-file validation: `scripts/check-migrations.sh` exits 2 because `supabase/migrations` does not exist. This does not establish which live migrations are applied; the project also uses Drizzle.
- [ ] Alternative motion models through real UI: both existing `studio.functions.ts` calls to `renderMotionOnCloud` omit `model`, so the helper defaults to Kling. The helper allowlist alone does not complete Wan/Seedance Mini integration.
- [ ] OmniHuman 1.5 through real lip-sync UI: existing engine schema and runner still route `kie-omnihuman` to OmniHuman 2.0.
- [ ] MiniMax photo animation proven: allowlisted only; not driving-video motion transfer.
- [ ] Motion, lip-sync, TikTok30, multi-angle and Soul live generation outputs: no new paid calls were submitted. TikTok30/multi-angle/Soul must not be claimed as Kie jobs solely because Kie helpers exist elsewhere.
- [ ] Soul training: opening an empty Soul workspace is not LoRA training or generation proof.
- [ ] Real rendered output persisted and previewed/exported: not verified.
- [ ] Production build/deployment, rollback and restore proofs: not verified this run; nothing published.

## Launch comparison
GitHub #125 definition of done requires real UI → real pipeline → real provider → persisted output → preview/export. Therefore its existing 2/39 product checks remain checked, and **no new real-output gate is checked** from this run. GitHub #144's full-CI/e2e prerequisites remain failing; no paid jobs were submitted while those checks failed. No new provider spending incurred; the prior combined $3 limit remains in force.