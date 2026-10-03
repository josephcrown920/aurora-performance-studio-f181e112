# Bring the supplied Aurora Layers studio into Aurora

## Result
Replace the current externally embedded Layers page with the supplied repository’s studio appearance inside Aurora. Keep existing sign-in unchanged; GitHub login is deferred as requested.

## Changes
- Bring over the supplied studio’s upload area, source/result comparison, named layer controls, identity lock, editable prompts, project actions and shot strip.
- Preserve its supplied visual styling within the Layers workspace without changing the rest of Aurora.
- Keep Aurora’s existing navigation and account session. Remove the external editor frame and cross-site session-token forwarding.
- Connect supported studio actions to Aurora’s existing editing services and private creator storage; show clear unavailable states for anything not supported rather than simulated success.
- Keep the existing shared LayersEditor and MultiTrackTimeline as the video-editing system; do not copy the repository’s competing director, production agent, account controls or landing page.

## Technical approach
- Add the imported presentation under a dedicated Layers feature with locally scoped style tokens.
- Adapt the repository’s image layer and shot data at the feature boundary; preserve the current shared timeline document and reversible video edits.
- Reuse existing authenticated server functions and storage conventions rather than importing the other project’s credentials, generated integrations, database assumptions or unauthenticated image endpoints.
- Update the Layers page’s metadata and document the feature boundary in AGENTS.md.

## Checks
Verify the signed-in Layers page, upload and layer-selection flow, existing timeline compatibility, mobile and desktop layouts, and current preview diagnostics. Report generation/export limitations if their real end-to-end checks cannot run.
