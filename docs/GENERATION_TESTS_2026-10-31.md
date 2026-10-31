# Aurora generation smoke tests — 31 October 2026

Provider balance before: $5.94400. After: $5.69285.
Observed balance reduction: $0.25115, below the $1.00 limit.
No Seedream or Seedance calls. No automatic paid fallback.

IMPORTANT: These are direct provider generation samples, not end-to-end authenticated Aurora feature tests. Aurora's specialized workflows are not all connected to these models. No production model settings, library entries or UI were changed.

| Test | Output | Balance reduction | Result |
|---|---|---:|---|
| Generic image | 1 graffiti/microphone still | $0.001 | File produced; image inspected |
| Generic video | 5.07s 480p silent clip | $0.050 | File produced; poor prompt fidelity: street differs from Lagos brief and hand/camera appears |
| Multi-angle | 1 three-quarter reference portrait | $0.010 | File produced; not a full multi-angle set or automated identity validation |
| Scene Builder | 1 outdoor hanging-mic still | $0.010 | FAIL identity: face/hairstyle changed |
| GRWM | 1 fully dressed wardrobe still | $0.010 | FAIL identity: face/hairstyle changed; no motion render |
| Colors performance | 1 yellow studio microphone still | $0.010 | File produced; no performance motion or lip-sync transfer |
| Lip Sync | 2.07s phone clip + actual demo-hook audio | $0.120 | Audio-driven provider task completed; MP4 video/audio and mouth changes checked, perceptual sync accuracy not proven. Cost exceeded advertised 2s x $0.02 estimate; no retry |
| TikTok30 | 30 low-resolution reference shots | $0.030 | 30 files produced and contact sheet inspected; inconsistent faces and microphone placement. FAIL consistency; not the in-app campaign workflow |
| Face Swap | 1 two-reference image edit | $0.010 | FAIL source/target roles: output reproduced source scene instead of preserving wardrobe target. Video face swap NOT RUN: current app path uses excluded Seedance |
| Lyric video | 2s local MP4 + provider transcription | $0.00015 | Subtitle/audio render checked; automatically transcribed words need creator confirmation. Not word-timed karaoke or in-app lyric-worker verification |

Models: pruna/flux-2-klein-4b; pruna/p-image-edit; pruna/wan-t2v; pixverse/lip-sync; openai/gpt-transcribe.
Input: frame and first two seconds of uploaded NBA Josh phone recording; first two seconds of existing The One demo hook.

Follow-up blockers: owner-authenticated Aurora workflow checks; inexpensive identity-preserving adapters; non-Seedance video face-swap route; GRWM/Colors motion workers; lyric-worker deployment. These findings do not certify launch readiness.
