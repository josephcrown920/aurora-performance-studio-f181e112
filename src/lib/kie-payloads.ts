import { z } from "zod";

export const KIE_PERFORMANCE_MODELS = [
  { id: "kling-2.6/motion-control", label: "Kling 2.6 · Motion Control" },
  { id: "wan/2-2-animate-move", label: "Wan 2.2 · Animate Move" },
  { id: "bytedance/seedance-2-mini", label: "Seedance 2.0 Mini · Video Reference" },
] as const;
export const kiePerformanceModelSchema = z.enum(["kling-2.6/motion-control", "wan/2-2-animate-move", "bytedance/seedance-2-mini"]);
export type KiePerformanceModel = z.infer<typeof kiePerformanceModelSchema>;

/** Official Kie createTask schemas; no invented depth/ending-frame conditioning. */
export function buildKiePerformanceInput(model: KiePerformanceModel, imageUrl: string, videoUrl: string, prompt?: string, duration = 5): Record<string, unknown> {
  kiePerformanceModelSchema.parse(model);
  z.string().url().parse(imageUrl);
  z.string().url().parse(videoUrl);
  if (model === "wan/2-2-animate-move") return { image_url: imageUrl, video_url: videoUrl, resolution: "720p", nsfw_checker: true };
  if (model === "bytedance/seedance-2-mini") return {
    prompt: prompt?.trim() || "Use image 1 as the character identity and video 1 as the performance movement reference. Keep the same person and outfit.",
    reference_image_urls: [imageUrl], reference_video_urls: [videoUrl],
    generate_audio: false, resolution: "480p", aspect_ratio: "9:16",
    duration: z.number().int().min(4).max(15).parse(duration), nsfw_checker: true,
  };
  return { prompt: prompt?.trim() || "Copy the reference body movement, preserving the person and outfit.", input_urls: [imageUrl], video_urls: [videoUrl], character_orientation: "video", mode: "720p" };
}

export function buildKiePortraitInput(model: "omnihuman-2-0" | "omnihuman-1-5", imageUrl: string, audioUrl: string): Record<string, unknown> {
  z.string().url().parse(imageUrl); z.string().url().parse(audioUrl);
  return model === "omnihuman-1-5"
    ? { image_url: imageUrl, audio_url: audioUrl, output_resolution: "720", prompt: "" }
    : { image_urls: [imageUrl], audio_url: audioUrl, prompt: "" };
}