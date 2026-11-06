/** Cheap Kie.ai models Aurora is allowed to call. No Seedance / Seedream. */
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
];

export const KIE_MOTION_MODEL = "kling-2.6/motion-control";
export const KIE_LIPSYNC_MODEL = "omnihuman-2-0";

const ALLOWED = new Set([...KIE_IMAGE_MODELS, ...KIE_VIDEO_MODELS].map((m) => m.id).concat(KIE_MOTION_MODEL, KIE_LIPSYNC_MODEL));

export function isAllowedKieModel(id: string) {
  return ALLOWED.has(id) && !/seedance|seedream/i.test(id);
}
