# Aurora — Lovable Work Log & Developer Handoff

Snapshot date: 2026-10-05; latest work update: 2026-10-22. Read this first. It covers what the Lovable agent built and changed, where the work stopped, and what is still open.

## Screenshots
- `screenshots/pages/`: one desktop (1280px) capture per main page, signed out. Pages: home, studio, canvas, layers, lagos40, perform-anywhere, director-room, video-agent, motion, lipsync, library, colors, previs, tools, billing, auth, pricing, guides, contact, admin.
- `screenshots/perform-anywhere/`: the Performance mode (`01-*`), Get Ready With Me (`02-*`) and GRWM on mobile at 390px (`03-grwm-mobile.png`).
- To make new captures, run `python3 lovable-updates/snapshot.py` with the dev server on :8080.

## Timeline of work, start to finish
1. Removed the studio header background video banner.
2. Rebuilt Perform Anywhere: cleared out old photos and avatar shots, redesigned the pose/video and performance-shot steps, and restored the Perform Anywhere workflow.
3. Ran a motion-control test. Added a Codex-style "edit by chat" timeline to the music video section.
4. Removed the lyric video tool. Moved the theme to white plus dark purple with Higgsfield-style type. Made the workspace Director-first with a luminous glass canvas.
5. Exposed the ComfyUI workflow studio (`/comfy`, `/admin/comfy`).
6. Built a node-and-connector canvas in the style of Krea and Higgsfield to replace the old canvas (React Flow).
7. Built the video editor timeline GUI: ModelArk Dola Seed Pro/GLM orchestrator, drag-and-drop effects and the shared `MultiTrackTimeline`.
8. Did a publish-safety pass. Ran Perform Anywhere and Colors performance tests with uploaded clips. Swapped in the real Aurora logo.
9. Added in-app Colors performance generation (character photo plus performance clip leads to a preview video) and set the main avatar photo.
10. Pushed work to GitHub (`josephcrown920/Auroraglobal`) and moved testing into Aurora's own Video Agent.
11. Documented the limit that ModelArk/Seedance blocks real faces; only the verified-portrait flow works.
12. Added MCP agent integrations (`/mcp`, `/.well-known`, OAuth consent) and Apple sign-in.
13. Worked through repo merges (Auroraglobal and aurora-companion-hub).
14. Built the music video flow: song upload, performer reference, creative brief, generate, then preview in Video Agent (`/video-agent/music-video`). Tests waited on credits.
15. Followed the AI Video Editor Technical Specification checklist: VFX, background removal, layering and switches in the video studio.
16. Added glassmorphism, voice responses and a single Dola Seed-driven agentic editor and studio.
17. Added the Aurora Command Center (`/aurora-command-center`) with evidence-derived PROVEN statuses.
18. Fixed failing landing and affiliate/partner sections. Started the Expo Android app in `artifacts/` with an EAS workflow, plus Expo and ComfyUI routers.
19. Upscaled the Aurora logo. Added the TikTok30 rule (one person, 30 shots) and made Context Lock step one of every production plan.
20. Redesigned the canvas again to match the new reference design. Wired Perform Anywhere to confirmed performer photos (30 outfits, locations and scenes), then reverted that work at the user's request.
21. Fixed sign-in that loaded forever and the preview iframe handling for OAuth (Google and Apple), and enabled GitHub sign-in.
22. Wired in the external Layers repo (`auroras-layers`) as the native `/layers` image studio, with owner-scoped storage and credit reservation.
23. Built the character pipeline: reference photos, motion plan, scene breakdown and final render as one connected flow.
24. Added the generation script runner, with results saved to Admin assets.
25. Deleted the old canvas video agent. Added ModelArk image and video models and removed Seedream 5.9. Moved the phone-performance bar to the top.
26. Redesigned the Previs workspace and Director's Room. Built a new nodes/connectors canvas as the shared Home/Studio surface.
27. Fonts: Canela and Neue Montreal were requested. **They are not applied because no licensed files were provided.**
28. Added Get Ready With Me inside Perform Anywhere (`?experience=grwm`), with a Studio toolbar link and an Admin link.
29. Removed the homepage motion reel, the 30-day transformation section and the TikTok30 preview.
30. Wrote the final audit (see `/mnt/documents/Aurora-Final-Audit.md`).
31. Fixed `/studio` getting stuck on "Loading your studio" by removing the `manualChunks` setting in `vite.config.ts`, which caused a circular chunk crash.
32. Made 5 sample generations with Lovable tools outside the app (`/mnt/documents/aurora-test-generations/`). These do not prove the app's own generation works.
33. Removed the black "Untitled production" canvas from the homepage. `/` is the landing page again, and the canvas lives at `/studio`.
34. Created this handoff folder and its screenshots.
35. Added an iframe embed toggle for the external Layers app (`build-it-magic-49.lovable.app/embed`) so the Layers landing experience can be embedded with its own styling.
36. Replaced the "Neon street" example in Perform Anywhere with an FG3 phone recording slot: record from the phone camera or pick a video file, with inline playback. The Studio performance clip remains alongside it.
37. Fixed CLI sign-in (`aurora login`): the device-code lookup now uses the server admin client (pending unowned codes were invisible under RLS), the verification URL derives from the request origin instead of a dead hardcoded site, and the CLI default base URL points at this project. Local test of `/api/public/cli/device/start` returns a code and correct authorize URL. Full approve-and-generate flow not yet tested end to end; the CLI generates images only, not video/lip sync.
38. Fixed the landing-page balloon-head lip sync demo playing silently: the audio was routed through a Web Audio `MediaElementAudioSourceNode` while the AudioContext was still suspended (autoplay policy), swallowing all sound while the lips kept animating on the simulated fallback. The context now resumes before the source is created, and if it can't run, playback falls back to the plain audio element. Verified in the browser: "Play the hook" plays the track.
39. Fixed a blank-screen crash/hydration failure on the homepage: `shouldShowIntro()` read `localStorage` inside a `useState` initializer, so the server rendered no intro overlay while the client rendered one. The intro now starts hidden and is shown from a `useEffect`, so server and client first renders match. Verified: no page errors, page renders fully.
40. Investigated depth maps in Motion Control and Perform Anywhere: **depth-map conditioning is not implemented anywhere in those pipelines.** The only "depth" in the code is "depth of field" prompt text, and ControlNet/depth models are only listed in the ComfyUI admin studio (`/admin/comfy`), never passed to Segmind Seedance, BytePlus, or any generation call. Building it for real needs a depth-estimation step plus a provider that accepts depth input — see open items.

## Studio editor continuation — 2026-10-22
- `/studio` still opens the node canvas. Its **Video editor** link now opens `/studio?mode=edit`, through the actual lazy route rather than the previously unreachable non-lazy page.
- The editor reuses Aurora's `MultiTrackTimeline` and `LayersEditor`, with `ProgramMonitor`, sequential local-media imports using metadata durations, scrub/play/pause/mute and downloadable WebM export. This is a native integration, not a verbatim port of the Remix's separate server implementation.
- Entering the editor from Canvas appends completed `videoUrl` scenes in connector order. Stable scene IDs prevent duplicate imports; existing manually trimmed clips remain untouched. Motion previews and reference nodes are excluded. Editing is preserved in the shared timeline; timeline trims are not written back into the graph's shot definitions.
- Fixed the monitor's video registration so React updates do not pause/recreate the playing element every frame. The monitor follows both timeline seek and playhead events and honors source offsets.
- Verified with an actual two-second local video with audio: import, visible moving picture, unmuted playing video, pause, Layers panel, WebM download, Canvas → editor return and mobile overflow. Browser reported no page errors. Export has a 720×1280 video track and an audio track. Current renderer exports portrait WebM, not MP4 and not other aspect ratios.
- Focused checks: 36 tests passed (34 existing model-routing tests plus two new canvas handoff tests); latest automatic build reports build OK. `beam` already exists in the Ollama free allowlist.
- No paid generations were attempted; this local-media check does not verify authenticated generation, private-library persistence or provider availability. Local file URLs need reimport after refresh.
- Next priority remains real depth conditioning in Motion Control / Perform Anywhere. Appetize helper scripts were not found during this continuation; previous installation claims are not evidence of a working device-test setup. APPETIZE_API_TOKEN and OLLAMA_API_KEY remain pending from the creator.

## Where it stopped (open items)
- **Security:** the Canvas ARK and ComfyUI submit endpoints need in-handler auth, spending limits and safe error messages. After that, run a fresh security scan.
- **Export:** there is no single finished MP4 with the song. The export ZIP only contains frames and clips.
- **Real generation:** no signed-in run of upload → preview → approve → render → library has been done yet. Also untested: refunds, retries and privacy between users.
- **Director:** the last provider call returned 403. Retest it.
- **Tests:** one jobs/refund test is flaky because it depends on a narration credential. A full green build and test run is still needed.
- **Fonts:** waiting on the licensed Canela and Neue Montreal `.woff2` files.
- **Mobile:** Play Store internal testing and Apple Developer/App Store Connect access are external blockers.
- **Library import:** the 5 sample files are not in the private library yet, because no signed-in Aurora account matched.
- **Depth maps:** not wired into Motion Control or Perform Anywhere. To add them for real: (1) a depth-estimation step that renders a depth map from the reference image/scene, (2) a generation provider that accepts depth conditioning (e.g. a ControlNet depth model via the ComfyUI workers), (3) a visible depth-map preview in both UIs. Until then, per project rule, motion tests must reject unsupported depth conditioning rather than silently drop it.
- **CLI:** `aurora login` fix is in code but needs publish + an end-to-end approve-and-generate test (spends Aura).

## Rules to keep (see also AGENTS.md and project knowledge)
- One shared timeline and Layers editor. Do not build competing editors.
- Creator media stays in owner-scoped private storage. Credits are reserved on the server.
- Never run paid generations without explicit permission.

## Update 2026-10-29 — locked appearance (do not overwrite)
Screenshots of the current approved look: `screenshots/latest-2026-10-29/`. See `UI-UX.md` for the rules that protect them.
- FG3 label renamed to "Performance" everywhere.
- Featured Artist section kept in its original layout; only the name changed from Kling to NBA Josh.
- Landing page: Perform Anywhere embedded (shared component), "Pick your studio" row of 8 full studio photos, then Scene Builder / Multi-angle / TikTok 30 cards. Tool directory and "Every tool you need" card grid removed.
- Studio has a Perform view (`/studio?mode=perform`) using the same Perform Anywhere component.
- Get Ready With Me redesigned: You → Outfit → Dressed strip with NBA Josh photos.
- Car scene: Character Lock / Identity starts with NBA Josh's face for signed-in users; Interior and Window slots still empty.
- Colors studio accepts `?color=` so a chosen world opens pre-selected.
Open: Maybach photos in Interior/Window slots; real signed-in generation tests; licensed Canela/Neue Montreal fonts.

## Update 2026-10-29 — locked appearance
Current approved look and do-not-touch rules: `UI-UX.md`. Screenshots: `screenshots/latest-2026-10-29/` (see `SNAPSHOT.md`).
- FG3 renamed to "Performance"; Featured Artist kept as-is with name NBA Josh.
- Landing: shared Perform Anywhere block, 8 full studio photos, Scene Builder / Multi-angle / TikTok 30 cards; tool grid and tool directory removed.
- Studio Perform view (`/studio?mode=perform`) reuses Perform Anywhere.
- Get Ready With Me redesigned (You → Outfit → Dressed); car scene Identity starts with NBA Josh.
Open: Maybach photos in Interior/Window slots; signed-in generation tests; licensed fonts.
