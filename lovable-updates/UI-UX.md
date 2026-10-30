# Aurora UI / UX — Locked Appearance

Approved look as of 2026-10-29. Reference captures: `screenshots/latest-2026-10-29/` (desktop + `-mobile`).
**Before changing any surface below, compare against its screenshot. Change only what the creator explicitly asks for.**

| Surface | Locked look | Screenshot |
| --- | --- | --- |
| Landing hero | Full-bleed NBA Josh slideshow, "Direct Your Visual Identity." | `landing.png` |
| Landing Perform Anywhere | Same shared Perform Anywhere block as `/perform-anywhere` (no color picker / depth box on landing) | `landing-perform.png` |
| Pick your studio | Swipeable row of 8 full studio photos, each opens that color studio | `landing-studios.png` |
| Feature cards | Scene Builder, Multi-angle, TikTok 30 cards under the studio row | `landing-studios.png` |
| Featured Artist | Original section layout; name is **NBA Josh** (never Kling) | — |
| Perform Anywhere | Performance / Get Ready With Me toggle, Studio performance + **Performance** slot, Scene references / Phone recording / Final render strip, Pick your world, depth guide | `perform-anywhere.png` |
| Studio Perform view | `/studio?mode=perform` reuses the exact same Perform Anywhere block | `studio-perform.png` |
| Get Ready With Me | You → Outfit → Dressed strip with NBA Josh photos, compact numbered slots | `grwm.png` |
| Car scene (Luxury Interior) | Couch → Maybach reference, compact slots, Identity defaults to NBA Josh | `car-scene.png` |

## Never touch without an explicit request
- Build a Scene and Two-angle workflow (layout and behavior).
- Perform Anywhere overall appearance.
- Wording: use "Performance", never "FG3".

## Removed on request — do not bring back
- Landing "Every tool you need. One balance." card grid.
- Landing "Create something new" tool directory.
- Landing color picker + depth box (they stay on `/perform-anywhere` only).
- Holographic Slider Studio banner (creator declined).

## Exact Remix restoration — 2026-10-30
- The creator corrected the source: **Remix of Aurora Video Agent** (`bb1a20ff-d34f-40ff-a266-9e8377053b7e`, snapshot `e5daa5e7`), not Studio Video Guide.
- Preserve its left control rail (compact icons on phones, expanded on desktop), original editor workspace and original Layers decomposition/output/storyboard layout. The earlier compact header/floating dock is superseded.
- Keep Chat, Video Agent, Canvas, Layers, Workflows, Perform, Tools plus Multi-Angle and TikTok30 shortcuts accessible.
- `/layers` opens the same Studio in Layers mode, not an iframe or the alternative AuroraLayersStudio layout. Layers-to-editor switching shares active media within that session.
- Perform Anywhere and landing appearance locks above remain unchanged. Layers saved shoots currently use browser-local storage; appearance verification is not proof of private-cloud saves or paid generation.
