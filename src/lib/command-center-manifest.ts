export type ProofStatus = "proven" | "needs-test" | "broken" | "ui-only" | "blocked";
export type Priority = "P0" | "P1" | "P2";

export type ProductSurface = {
  id: string;
  name: string;
  route: string | null;
  platform: "web" | "mobile";
  workflow?: string;
  evidenceKeys?: string[];
  blocker?: string;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  stages: string[];
  evidenceKeys?: string[];
  blocker?: string;
};

export const PRODUCT_SURFACES: ProductSurface[] = [
  { id: "landing", name: "Landing", route: "/", platform: "web" },
  { id: "pricing", name: "Pricing", route: "/billing", platform: "web", blocker: "Dedicated outcome-led pricing route is not present." },
  { id: "auth", name: "Auth", route: "/auth", platform: "web" },
  { id: "dashboard", name: "Dashboard", route: "/account", platform: "web" },
  { id: "director", name: "Aurora Director", route: "/director-room", platform: "web", evidenceKeys: ["Aurora agent (plan)"], workflow: "Director planning loop" },
  { id: "video-agent", name: "Video Agent", route: "/video-agent", platform: "web", evidenceKeys: ["Video Agent (HeyGen)"], workflow: "Agent video pipeline" },
  { id: "perform", name: "Perform Anywhere", route: "/motion", platform: "web", evidenceKeys: ["Perform Anywhere — Reshoot (Motion Transfer)"], workflow: "Performance transfer" },
  { id: "orchestrate", name: "Orchestrate", route: "/studio", platform: "web", evidenceKeys: ["Canvas pipeline (image→video)"], workflow: "Generation orchestrator" },
  { id: "music-video", name: "Music Video Studio", route: "/video-agent/music-video", platform: "web", blocker: "No full multi-shot assembled-video proof is recorded.", workflow: "Music video pipeline" },
  { id: "canvas", name: "Canvas", route: "/canvas", platform: "web", evidenceKeys: ["Canvas pipeline (image→video)"], workflow: "Executable node graph" },
  { id: "colors", name: "Colors Studio", route: "/colors", platform: "web", evidenceKeys: ["Colors studio"], workflow: "Colors performance" },
  { id: "production", name: "Production", route: "/content-machine", platform: "web", evidenceKeys: ["UGC talking ad (queued pipeline)", "Product demo (queued pipeline)"], workflow: "Campaign production" },
  { id: "tiktok30", name: "TikTok 30", route: "/spin", platform: "web", evidenceKeys: ["Spin carousel"], blocker: "Thirty valid exported deliverables require a dedicated proof run.", workflow: "TikTok30 batch" },
  { id: "puremix", name: "Puremix / Mastering", route: "/puremix", platform: "web", blocker: "No mastering output proof is recorded.", workflow: "Audio mastering" },
  { id: "gallery", name: "Gallery", route: "/gallery", platform: "web" },
  { id: "wardrobe", name: "Wardrobe", route: "/likeness", platform: "web", workflow: "Identity and wardrobe" },
  { id: "performances", name: "Performances", route: "/library", platform: "web", workflow: "Private creator library" },
  { id: "settings", name: "Settings", route: "/settings", platform: "web" },
  { id: "billing", name: "Billing", route: "/billing", platform: "web" },
  { id: "m-onboarding", name: "Onboarding", route: "/auth", platform: "mobile" },
  { id: "m-home", name: "Home", route: "/studio", platform: "mobile" },
  { id: "m-director", name: "Director", route: "/director-room", platform: "mobile", evidenceKeys: ["Aurora agent (plan)"] },
  { id: "m-perform", name: "Perform Anywhere", route: "/motion", platform: "mobile", evidenceKeys: ["Perform Anywhere — Reshoot (Motion Transfer)"] },
  { id: "m-camera", name: "Camera / Performance Capture", route: "/motion", platform: "mobile", blocker: "Device capture requires a physical-device proof." },
  { id: "m-gallery", name: "Gallery", route: "/gallery", platform: "mobile" },
  { id: "m-projects", name: "Projects", route: "/library", platform: "mobile" },
  { id: "m-profile", name: "Profile", route: "/account", platform: "mobile" },
  { id: "m-credits", name: "Credits", route: "/billing", platform: "mobile" },
];

export const PERFORMANCE_WORKFLOWS: WorkflowDefinition[] = [
  "White Cyclorama Studio", "Black / Shadow Studio", "Luxury Studio", "Car Interior",
  "Car + Exterior Lights", "Lamborghini Semi-Circle", "Rolling Car Performance", "Night Car",
  "Rooftop", "Street", "Concert", "Stage", "GRWM", "Clone Studio",
  "Clone Dance Formation", "Clone Street Takeover", "Surreal Multi-Performer", "Rotoscope Performance",
].map((name, index) => ({
  id: `performance-${index}`,
  name,
  stages: ["Inputs", "Reference / identity", "Model routing", "Generation", "Motion", "Compositing", "QC", "Output"],
  evidenceKeys: name === "White Cyclorama Studio" ? ["Colors studio"] : undefined,
  blocker: name.includes("Clone") || name.includes("Rotoscope") ? "Editable matte and compositing proof is not recorded." : undefined,
}));

export const SYSTEM_WORKFLOWS: WorkflowDefinition[] = [
  { id: "identity-guard", name: "Human Identity / Seedance Guard", stages: ["Detect human media", "Verify authorization", "Check provider eligibility", "Route eligible provider", "Retain provider asset ID", "Explain blocked action"], blocker: "Centralized cross-provider authorization proof is not recorded." },
  { id: "identity-vault", name: "Identity Vault", stages: ["Owner", "Authorization", "Verification", "Provider assets", "References", "Wardrobe", "Appearance rules", "Relevant directive injection"], blocker: "Vault architecture exists across likeness assets, but full directive-injection proof is not recorded." },
  { id: "clone", name: "Clone Engine", stages: ["Performance", "Identity", "Clone instances", "Segmentation", "Depth / occlusion", "Spatial composite", "Lighting / shadows", "Color / VFX", "Final composite"], blocker: "No editable-layer clone composite proof is recorded." },
  { id: "rotoscope", name: "Rotoscope System", stages: ["Subject segmentation", "Temporal tracking", "Matte refinement", "Hair detail", "Edge refinement", "Occlusion", "Alpha output", "Editable masks"], blocker: "No reusable temporal matte proof is recorded." },
  { id: "tiktok30-pipeline", name: "TikTok 30", stages: ["Campaign input", "30 planned variants", "30 real generations", "QC each output", "Metadata", "Export bundle"], evidenceKeys: ["Spin carousel"], blocker: "A carousel pass does not prove 30 valid deliverables." },
  { id: "music-proof", name: "Music Video Proof Test", stages: ["Song", "Audio / lyrics analysis", "Creative brief", "Concept", "Shot list", "Reference locks", "Generation", "Motion", "VFX", "Edit", "Beat sync", "Final export"], blocker: "No complete multi-shot rendered sequence proof is recorded." },
  { id: "canvas-proof", name: "Canvas Execution", stages: ["Node graph", "Inputs", "Generation / edit", "Motion", "Identity", "Effects / layers", "Provider execution", "Output", "Save", "Rerun"], evidenceKeys: ["Canvas pipeline (image→video)"], blocker: "Current smoke evidence covers image-to-video, not full Comfy import/save/rerun." },
  { id: "puremix-proof", name: "Puremix / Layers", stages: ["Audio", "Mastering", "Preview", "Export", "Layer visibility", "Ordering", "Opacity", "Transforms", "Masks", "Effects", "Editable composite"], blocker: "No end-to-end mastering and editable-composite proof is recorded." },
  { id: "colors-proof", name: "Colors Performance Proof Test", stages: ["Performer", "Color direction", "Performance", "Environment", "Generation", "Identity QC", "Color QC", "Video export"], evidenceKeys: ["Colors studio"], blocker: "Current smoke evidence is a still image, not an exportable performance video." },
  { id: "production-proof", name: "Production Proof Test", stages: ["Song / content", "Campaign direction", "Multiple finished assets", "Platform variants", "Captions / metadata", "Exported files"], evidenceKeys: ["UGC talking ad (queued pipeline)", "Product demo (queued pipeline)"], blocker: "Individual generation passes do not yet prove a complete campaign export." },
];

export const PROVIDERS = [
  { key: "ark", name: "ModelArk / Seedance", role: "Assistant, image, video and motion routing" },
  { key: "lovable", name: "AI Gateway", role: "Managed AI inference" },
  { key: "gemini", name: "Gemini", role: "Image and multimodal generation" },
  { key: "openrouter", name: "OpenRouter", role: "Language model routing" },
  { key: "openai", name: "OpenAI", role: "Language and media services" },
  { key: "fal", name: "fal", role: "Video and lip-sync inference" },
  { key: "replicate", name: "Replicate", role: "Model inference" },
  { key: "huggingface", name: "Hugging Face", role: "Open model inference" },
  { key: "sync", name: "Sync", role: "Lip sync" },
  { key: "kling", name: "Kling", role: "Video and frame interpolation" },
  { key: "heygen", name: "HeyGen", role: "Avatar and template video" },
] as const;

export const AGENTS = [
  { name: "Dola Seed Director", responsibility: "Creative direction and persistent project context", model: "Dola Seed 2.1 Turbo" },
  { name: "Video Agent", responsibility: "Shot planning, generation decisions and assembly", model: "Provider-routed" },
  { name: "Codex Agent", responsibility: "Reversible editor and timeline orchestration", model: "Local tool agent" },
  { name: "Aurora Orchestrator", responsibility: "Provider selection, generation and accounting", model: "Policy-routed" },
] as const;

export const SKILL_AUDIT = [
  { name: "Cinematic direction", consumers: "Director, Music Video, Video Agent" },
  { name: "Content & rollout", consumers: "Production, TikTok 30" },
  { name: "Prompt engineering", consumers: "Image, video and Canvas generation" },
  { name: "Songwriting", consumers: "Music Video and Director" },
  { name: "Rotoscope", consumers: "Clone, Car, Perform Anywhere, Music Video, Canvas, Layers, VFX", missing: true },
] as const;

export const DOCUMENTATION_AUDIT = [
  "Getting Started", "Video Agent", "Perform Anywhere", "Orchestrate", "Motion Control", "Style Transfer",
  "Identity", "Canvas", "Music Video Studio", "Colors", "Production", "TikTok 30", "Puremix", "Layers", "Troubleshooting",
] as const;

export const LAUNCH_GATES: Record<Priority, string[]> = {
  P0: ["Image generation", "Human reference routing", "Video generation", "Perform Anywhere", "Motion Control", "Music Video Studio", "Canvas", "Gallery", "Authentication", "Storage", "Export"],
  P1: ["TikTok 30", "Colors", "Production", "Puremix", "Layers", "Backup / restore", "Mobile"],
  P2: ["Additional environments", "Visual polish", "Advanced presets"],
};

export const EVIDENCE_ALIASES: Record<string, string[]> = {
  "Image generation": ["Image gen"],
  "Video generation": ["Video gen"],
  "Perform Anywhere": ["Perform Anywhere — Reshoot (Motion Transfer)"],
  "Motion Control": ["Motion control"],
  Canvas: ["Canvas pipeline (image→video)"],
  Colors: ["Colors studio"],
  Production: ["UGC talking ad (queued pipeline)", "Product demo (queued pipeline)"],
};
