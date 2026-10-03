# Aurora Canvas Rebuild and Sign-In Repair

## Goal
Turn `/canvas` into a vivid, professional production workspace inspired by the uploaded node-editor reference, while preserving Aurora’s existing workflow engine. Josh becomes the reusable test character for reference-image, motion-control, and generation verification. Repair and verify sign-in before running authenticated generation tests.

## What will change

### 1. Repair sign-in
- Trace the unsupported-method failure across email/password, Google, and Apple.
- Keep only methods the hosted auth service confirms are enabled; remove the unsupported GitHub path from this managed setup.
- Fix redirect and error handling so failures appear clearly on the form instead of silently returning to sign-in.
- Verify account creation/sign-in, session persistence, sign-out, and return-to-Canvas behavior in the preview.

### 2. Rebuild Canvas presentation
- Preserve the production node graph, save/load, execution, private uploads, Comfy workflows, and generated-output handling.
- Replace the current sparse presentation with a full-viewport three-part workspace:
  - compact left tool rail and searchable node library;
  - expansive luminous graph stage with stronger connectors, minimap/zoom controls, selection states, and live execution signals;
  - contextual right inspector for the selected node, reference assignments, brief, and Aurora Director.
- Use layered glass surfaces, refracted highlights, solar gold/white energy, deep near-black contrast, crisp green execution paths, and restrained motion so it feels alive without hiding controls.
- Make desktop the dense editing experience and collapse the library/inspector into usable sheets on phones.

### 2a. Restore clear product boundaries
- Keep TikTok30 focused on one idea or hook becoming 30 coordinated social posts; rename unclear labels so the screen never implies it owns multi-angle photos.
- Keep multi-angle reference generation inside Colors and Perform Anywhere, where the resulting identity-consistent angles feed shot planning and generation.
- Remove or relocate any cross-linked cards, screenshots, or copy that currently makes these three workflows look merged.

### 3. Add reference-led direction
- Add explicit reference roles: Character, Motion, Depth, Wardrobe/Product, Environment, and Style.
- Let creators upload multiple references privately and assign each one a role.
- Add a “Build full brief” action that sends the selected references plus creator notes to the existing Aurora Director, producing a structured concept, character lock, environment, wardrobe, shot list, camera/motion plan, lighting, depth/compositing notes, continuity rules, sound direction, and model-ready prompts.
- Convert the accepted brief into editable Canvas nodes and connections instead of creating a second agent or separate editor.

### 4. Use Josh as the verification character
- Register the uploaded Josh portraits as the test reference set, with one clear primary character image and supporting identity/style frames.
- Add a Josh motion-control starter workflow that maps Character + Motion + optional Depth/Environment into the existing Seedance/ModelArk execution path.
- Preserve identity/wardrobe/scene constraints in generated prompts and clearly label provider-enforced limitations.

### 5. Verify the real flow
- Check the build and relevant focused tests.
- Test responsive Canvas rendering, node selection, uploads, role assignment, full-brief generation, graph creation, save/load, and execution error states.
- After sign-in works, run one authenticated Josh motion-control generation when credits/provider access permit; report any provider or credit blocker without substituting a different model.

## Technical details
- Refactor the oversized Canvas route into focused workspace, reference, inspector, and Director components while keeping the existing graph executor as the source of truth.
- Extend Canvas node data with reference roles and structured brief metadata; use the existing private `studio` storage ownership model.
- Extend the shared Aurora Director server function for multimodal brief generation rather than adding another agent.
- Use semantic design tokens in the global theme and existing design-system controls; no duplicated Canvas route or editor implementation.
- Update route metadata, roadmap status, and architecture notes only where this rebuild introduces a lasting rule.
