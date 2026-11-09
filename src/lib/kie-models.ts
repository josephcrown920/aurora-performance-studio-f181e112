/** Explicit Kie allowlist. Only Seedance 2.0 Mini is authorized. */
export type KieModel = { id: string; label: string; kind: "image" | "video"; note: string };

export const KIE_IMAGE_MODELS: KieModel[] = [
  { id: "google/nano-banana", label: "Nano Banana", kind: "image", note: "Kie · fast, cheap images" },
  { id: "google/nano-banana-edit", label: "Nano Banana Edit", kind: "image", note: "Kie · edit with reference photos" },
];

export const KIE_VIDEO_MODELS: KieModel[] = [
  { id: "kling-2.6/text-to-video", label: "Kling 2.6", kind: "video", note: "Kie · text to video" },
  { id: "kling-2.6/image-to-video", label: "Kling 2.6 Image", kind: "video", note: "Kie · animate a photo" },
  { id: "grok-imagine/text-to-video", label: "Grok Imagine", kind: "video", note: "Kie · cheapest drafts" },
  { id: "grok-imagine/image-to-video", label: "Grok Imagine Image", kind: "video", note: "Kie · cheap photo animation" },
  { id: "hailuo/02-image-to-video-standard", label: "MiniMax Hailuo 02", kind: "video", note: "Kie · photo animation, not driving-video transfer" },
];

export const KIE_MOTION_MODEL = "kling-2.6/motion-control";
export const KIE_LIPSYNC_MODEL = "omnihuman-2-0";

const ALLOWED = new Set([...KIE_IMAGE_MODELS, ...KIE_VIDEO_MODELS].map((m) => m.id).concat(KIE_MOTION_MODEL, KIE_LIPSYNC_MODEL, "wan/2-2-animate-move", "bytedance/seedance-2-mini", "omnihuman-1-5"));

export function isAllowedKieModel(id: string) {
  return ALLOWED.has(id);
}
