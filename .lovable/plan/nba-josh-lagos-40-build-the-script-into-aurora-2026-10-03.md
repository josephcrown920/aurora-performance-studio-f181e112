# NBA Josh Lagos 40 — build the script into Aurora

Turn the uploaded script into a page in Aurora: Josh's locked look, the 40 Lagos locations and the song clip, with each video made, saved and timed inside Aurora rather than on your computer.

## What you'll get
- A new **Lagos 40** page.
- **Character Lock first.** Josh's full look comes from the script: locs with red tips, every tattoo (always readable, never mirrored), the NBA JOSH chain and the stud. You add his face and full-body photos. Every shot uses this lock.
- **40 location cards.** Each card shows the place, outfit, spot, mood, ending and background detail from the script. You can edit any card, turn it on or off, or redo it.
- **Song clip.** Upload the normal or slowed version and set its length (24s by default). The 8 lyric lines are split across the cuts.
- **Make videos.** Start with 1 or pick any number up to 40. Each one has a main shot plus story cuts, uses your Aura, and shows its progress. Finished videos are saved privately to your account.
- **Edit and export.** Open any finished video in the shared timeline with the song and lyric captions already lined up, then export it.

## Decisions
- Videos are made with Aurora's existing video tools and Aura credits. There is no separate ModelArk key. If you specifically want Seedance or Dola through ModelArk, tell me and I'll ask for your key.
- The script's "boot shot" opener becomes the main shot. The UI says "song clip", not "hook".
- Sign-in is not touched.

## Technical details
- Seed data: the character description, the 40-location list and the lyrics move into a typed data module for the feature. Nothing comes from the Python runtime.
- Storage: a campaign table scoped to its owner (with RLS and grants) holds per-card state and job ids. Reference photos and audio go in the existing private `layers-private`-style owner path.
- Rendering: an authenticated server function per card reserves credits with `reserveOrchestrateRecord` (video kind) and passes the face and body references plus the lock prompt. Status is polled from the `generations` row.
- Assembly: the result becomes a `TimelineDoc` (video clips, the song on the audio track, lyric text clips at evenly spaced cuts) sent to the shared `MultiTrackTimeline` through `aurora:apply-doc`. The client-side ffmpeg step from the script is dropped.
- The script's CSV log becomes a downloadable CSV of the campaign rows.
