/** Explicit Kie allowlist. Only Seedance 2.0 Mini is authorized. */
export type KieModel = { id: string; label: string; kind: "image" | "video"; note: string };

export const KIE_IMAGE_MODELS: KieModel[] = [
  { id: "google/nano-banana", label: "Nano Banana", kind: "image", note: "Kie · fast, cheap images" },
  { id: "google/nano-banana-edit", label: "Nano Banana Edit", kind: "image", note: "Kie · edit with reference photos" },
  { id: "nano-banana-pro", label: "Nano Banana Pro", kind: "image", note: "Kie · sharper detail and text" },
  { id: "flux-2/pro-text-to-image", label: "Flux 2 Pro", kind: "image", note: "Kie · photoreal images" },
  { id: "flux-2/pro-image-to-image", label: "Flux 2 Pro Edit", kind: "image", note: "Kie · edit with reference photos" },
  { id: "qwen/text-to-image", label: "Qwen Image", kind: "image", note: "Kie · cheap general images" },
  { id: "qwen/image-edit", label: "Qwen Image Edit", kind: "image", note: "Kie · cheap photo edits" },
  { id: "ideogram/v3-text-to-image", label: "Ideogram V3", kind: "image", note: "Kie · posters and typography" },
  { id: "gpt-image/1.5-text-to-image", label: "GPT Image 1.5", kind: "image", note: "Kie · prompt-faithful images" },
];

export const KIE_VIDEO_MODELS: KieModel[] = [
  { id: "kling-2.6/text-to-video", label: "Kling 2.6", kind: "video", note: "Kie · text to video" },
  { id: "kling-2.6/image-to-video", label: "Kling 2.6 Image", kind: "video", note: "Kie · animate a photo" },
  { id: "grok-imagine/text-to-video", label: "Grok Imagine", kind: "video", note: "Kie · cheapest drafts" },
  { id: "grok-imagine/image-to-video", label: "Grok Imagine Image", kind: "video", note: "Kie · cheap photo animation" },
  { id: "bytedance/seedance-2-mini", label: "Seedance 2.0 Mini", kind: "video", note: "Kie · 5-second text or first-frame video" },
  { id: "hailuo/02-image-to-video-standard", label: "MiniMax Hailuo 02", kind: "video", note: "Kie · photo animation, not driving-video transfer" },
];

export const KIE_MOTION_MODEL = "kling-2.6/motion-control";
export const KIE_LIPSYNC_MODEL = "omnihuman-2-0";

const ALLOWED = new Set([...KIE_IMAGE_MODELS, ...KIE_VIDEO_MODELS].map((m) => m.id).concat(KIE_MOTION_MODEL, KIE_LIPSYNC_MODEL, "wan/2-2-animate-move", "bytedance/seedance-2-mini", "omnihuman-1-5"));

export function isAllowedKieModel(id: string) {
  return ALLOWED.has(id);
}
