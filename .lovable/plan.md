# TikTok30 as One-Person, 30-Shot Campaign + Context Lock

## Goal
The Director produces 30 different shots of one person (your chosen avatar/reference). Each shot gets its own outfit, location, and scene, and the face stays the same. A "Context Locked" step saves the character sheet before any generation starts, so you never have to repeat yourself.

## What will change

### 1. Context planning becomes step one of the production plan
- New first stage: **Context Lock**. Upload or pick an avatar. The Director builds a character sheet (front, side, back, close-up) and saves it to the project's private memory.
- A visible "Context Locked" badge, showing the saved character grid, appears in Canvas, Video Agent, and TikTok30.
- Every later step reads this saved context. The same Director is used everywhere, with no second agent.

### 2. TikTok30 = 30 shots, one person
- Inputs: text idea, avatar reference, optional song, and style tags (lifestyle, street, studio, night).
- The Director plans 30 unique entries. Each one sets an outfit, location, scene, pose, mood, and caption with hashtags. No hook framing anywhere.
- Output is a numbered 30-tile grid (1–30). Every tile keeps the locked identity.
- The count is fixed at 30 across the page, the homepage section, the generation logic, and the credit cost.
- Multi-angle photos stay in Colors and Perform Anywhere and are kept out of TikTok30.

### 3. Perform Anywhere feature photo
- Add the uploaded performer photo (mic, brick wall, chains) to the Perform Anywhere showcase.
- **Needs your confirmation:** this looks like a well-known artist. It's only safe to use if you have his permission to use his likeness in promotion. If you don't, I'll use Josh instead.

## Technical details
- Store the character sheet as project context rows in private studio storage, owned per creator. The Director's system prompt includes them on every call.
- Change the TikTok30 count constant to 30. Replace the generation schema's hook field with outfit, location, scene, and caption fields, and recompute the cost.
- Upload the performer photo as an app asset only after you confirm.
- Verify with the build log and a browser check of the TikTok30 page, the homepage section, and Perform Anywhere.
