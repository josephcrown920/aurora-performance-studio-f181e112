# Control glass Canvas verification

## Verified in the signed-in local preview

- Josh's two supplied identity photos copied to creator-owned private studio storage and saved as Canvas main-character references.
- Identity persisted after reloading `/canvas`.
- AI Gateway generated an editable full brief titled “Josh — Neon Rain”: character lock, wardrobe, world, camera/lighting, motion direction, depth/compositing plan, four shots, and approval questions.
- Approved brief created one character-reference node connected to four image-generation nodes. This verified graph handoff, not rendered shots.
- Canvas browser check had no page errors. The initial homepage navigation produced a separate landing-page hydration warning.
- Two unit tests passed for reference-path ownership/traversal and distinguishing still screenshots from motion video.
- Automated build harness reported `build OK` after the motion-result literal type correction.

## Unverified or blocked

- Shared Director chat returned ModelArk HTTP 403 and an unavailable free fallback. No paid fallback was used. Failed input is preserved and the UI displays the failure rather than claiming success.
- Browser speech-synthesis voice toggle is implemented; actual spoken Director output is unverified because chat providers failed.
- No motion generation was executed. A real performer motion-video upload and explicit paid-test consent are required.
- Depth screenshots support visual planning only. The current motion provider does not accept depth conditioning; motion tests are blocked while a depth reference is selected rather than silently ignoring it.
- No production deployment, mobile device test, or Play Console submission is proven by these Canvas checks.

## Next proof

Upload an authorized motion clip under the `motion` reference role, review the brief, remove depth input for a motion-only Seedance test, approve the paid test, and verify the private rendered video. Restore ModelArk/free routing before claiming Director chat and spoken responses are reliable.