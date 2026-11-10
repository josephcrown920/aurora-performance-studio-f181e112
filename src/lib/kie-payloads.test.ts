import { describe, expect, it } from "bun:test";
import { buildKiePerformanceInput, buildKiePortraitInput, kiePerformanceModelSchema } from "./kie-payloads";
import { isAllowedKieModel } from "./kie-models";

const photo = "https://example.com/creator.png";
const drive = "https://example.com/performance.mp4";
const audio = "https://example.com/hook.mp3";

describe("authorized Kie alternatives (local contracts, not provider proof)", () => {
  it("Wan forwards both the creator photo and driving video with moderation enabled", () => {
    expect(isAllowedKieModel("wan/2-2-animate-move")).toBe(true);
    expect(buildKiePerformanceInput("wan/2-2-animate-move", photo, drive)).toEqual({ image_url: photo, video_url: drive, resolution: "720p", nsfw_checker: true });
  });
  it("only Seedance 2.0 Mini is authorized, not other Seedance or Seedream tiers", () => {
    expect(isAllowedKieModel("bytedance/seedance-2-mini")).toBe(true);
    for (const model of ["seedance/2.0", "seedance-2.0-fast", "bytedance/seedance-2", "seedream/4.5"]) {
      expect(isAllowedKieModel(model)).toBe(false);
      expect(kiePerformanceModelSchema.safeParse(model).success).toBe(false);
    }
    const input = buildKiePerformanceInput("bytedance/seedance-2-mini", photo, drive, "Preserve my performance", 5);
    expect(input.reference_image_urls).toEqual([photo]);
    expect(input.reference_video_urls).toEqual([drive]);
    expect(input.duration).toBe(5);
    expect(input.nsfw_checker).toBe(true);
  });
  it("MiniMax photo animation cannot masquerade as driving-video transfer", () => {
    expect(isAllowedKieModel("hailuo/02-image-to-video-standard")).toBe(true);
    expect(kiePerformanceModelSchema.safeParse("hailuo/02-image-to-video-standard").success).toBe(false);
  });
  it("OmniHuman 1.5 uses the supplied portrait and hook", () => {
    expect(isAllowedKieModel("omnihuman-1-5")).toBe(true);
    expect(buildKiePortraitInput("omnihuman-1-5", photo, audio)).toEqual({ image_url: photo, audio_url: audio, output_resolution: "720", prompt: "" });
  });
  it("OmniHuman 2.0 uses the supplied portrait and hook", () => {
    expect(buildKiePortraitInput("omnihuman-2-0", photo, audio)).toEqual({ image_urls: [photo], audio_url: audio, prompt: "" });
  });
});