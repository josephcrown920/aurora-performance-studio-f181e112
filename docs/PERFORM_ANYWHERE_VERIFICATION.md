# Perform Anywhere verification

Entry: `/video-agent/perform-anywhere`. Uses the shared Aurora Director planning skill and existing private scene renderer, not a second agent or TikTok30 workflow.

Verified in a signed-in session:
- Josh's saved identity references were available from private Canvas context.
- AI Gateway returned exactly 30 outfit/location/scene variations; all 30 cards survived reload.
- One approved 3-second portrait video completed and was saved privately.
- Download returned HTTP 200 with video/mp4; FFprobe identified H.264/AAC, 360×640, 3.008 seconds. FFmpeg decoded an inspected frame.
- Completed scene imported into the shared editor timeline, with no browser page errors.
- Completed preview URLs now refresh when loading the saved production.
- Four unit tests passed (plan validation/prompt semantics and private reference ownership/motion-input handling); build harness reported OK.

Limits:
- The remaining 29 shots were not rendered. Each shot requires explicit approval and uses AI credits.
- Sandbox Chromium reported media error code 4 and did not play the MP4; actual browser/device playback remains unverified despite valid decoded media.
- Full 30-shot face consistency, exact motion control, and depth conditioning are not proven by this single image-conditioned render.