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
- Retired Canvas, Music Video Studio, and standalone editor URLs redirect to Studio; never restore those screens without a new request. Keep shared Layers/Lagos40 timeline modules intact.
- Perform Anywhere uses the existing owner-scoped Build Your Scene draft for scene references, phone recording, and final-render previews so the compact strip reflects the actual workflow.
- Keep the agent editor's layers and multi-track timeline synchronized; imported local media uses temporary browser URLs and needs reimport after refresh.
- Drive the Video Agent program monitor from the shared timeline document and source offsets, not a separate playlist; this keeps scrub/playback aligned with manual and agent edits.
- Store completed music-video scenes in each creator's private studio storage and resolve library watch pages from that creator's path; this prevents one creator from watching another's scene by guessing an ID.
- Keep Aurora Command Center statuses evidence-derived: only recorded successful workflow checks may produce PROVEN; this prevents UI-only claims from passing launch gates.
- Keep one shared Aurora Director implementation with skills, workflows, and providers beneath it; duplicate feature-specific directors create drift and are not separate agents.
- Keep Canvas reference roles and briefs in owner-scoped Canvas context; motion tests must reject unsupported depth conditioning rather than silently dropping it.
- Keep the Expo Android app and side apps under `artifacts/`, outside the web app's source; the root .easignore uploads only `artifacts/aurora-mobile` to EAS so the web bun.lock never reaches the mobile builder.

- Keep the native Layers image studio scoped to its feature and reuse authenticated credit-reserved generation, owner-scoped private Layers storage, and the existing TimelineDoc events; this avoids external session forwarding and competing video editors.
