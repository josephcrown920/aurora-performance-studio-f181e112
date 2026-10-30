<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Reuse the Creative Studio `MultiTrackTimeline` and `LayersEditor` for music-video editing so manual and Codex-directed cuts share one editor system.
- Canvas now shares the Director’s Room board and React Flow graph editor by explicit creator request; Music Video Studio and standalone editor URLs remain retired. Preserve shared Layers/Lagos40 timelines.
- Studio uses the exact Remix of Aurora Video Agent side rail and workspace; Canvas remains a separate view and Home stays the landing page, preventing a different reference project from overwriting the creator’s editor.
- Director’s Room opens on the graph with optional inspector and Director panels; its Layers link opens the native /layers studio rather than the decorative shot-stack panel.
- Perform Anywhere uses the existing owner-scoped Build Your Scene draft for scene references, phone recording, and final-render previews so the compact strip reflects the actual workflow.
- Get Ready With Me is a Perform Anywhere experience using the same owner-scoped source draft and authenticated motion/reskin services; source clip length must not imply unsupported output duration.
- Keep the agent editor's layers and multi-track timeline synchronized; imported local media uses temporary browser URLs and needs reimport after refresh.
- Drive the Video Agent program monitor from the shared timeline document and source offsets, not a separate playlist; this keeps scrub/playback aligned with manual and agent edits.
- Store completed music-video scenes in each creator's private studio storage and resolve library watch pages from that creator's path; this prevents one creator from watching another's scene by guessing an ID.
- Keep Aurora Command Center statuses evidence-derived: only recorded successful workflow checks may produce PROVEN; this prevents UI-only claims from passing launch gates.
- Keep one shared Aurora Director implementation with skills, workflows, and providers beneath it; duplicate feature-specific directors create drift and are not separate agents.
- Keep Canvas reference roles and briefs in owner-scoped Canvas context; motion tests must reject unsupported depth conditioning rather than silently dropping it.
- Keep the Expo Android app and side apps under `artifacts/`, outside the web app's source; the root .easignore uploads only `artifacts/aurora-mobile` to EAS so the web bun.lock never reaches the mobile builder.

- Keep the native Layers image studio scoped to its feature and reuse authenticated credit-reserved generation, owner-scoped private Layers storage, and the existing TimelineDoc events; this avoids external session forwarding and competing video editors.
- /studio?mode=edit renders the ported Remix GUI Video Studio (src/features/guy-studio/GuyStudio.tsx, a plain component, not a route); Perform Anywhere lives in one shared PerformAnywhereWorkspace component reused by the landing page, /perform-anywhere, and the Video Studio's Perform view so its look can't drift.

- /layers opens GuyStudio in Layers mode with the same LayerStudio and asset callback as Studio; this preserves the original Remix appearance and one editor session rather than embedding or substituting another app.

- Identity contract: src/lib/identity/contract.ts is the single identity rule set; /api/guy/image and video face swap enforce it server-side so UI cannot bypass it.
