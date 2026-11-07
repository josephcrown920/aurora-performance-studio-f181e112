import { describe, it, expect, mock } from "bun:test";

const motion = mock(async () => "motion-output");
const video = mock(async () => "video-output");
const lipSync = mock(async () => "lip-sync-output");
mock.module("@/lib/kie-client", () => ({ kieMotion: motion, kieVideo: video, kieLipSync: lipSync }));
mock.module("@/lib/guy/creative-context", () => ({ withCreativeContext: (text: string) => text }));
const { generateVideo } = await import("./generate");

describe("Kie editor reference dispatch", () => {
  it("a photo and driving video invoke motion transfer, not generic animation", async () => {
    const photo = new Blob(["photo"]), drive = new Blob(["drive"]);
    expect(await generateVideo("Follow my take", "kie:kling-2.6/text-to-video", "", { image: photo, video: drive })).toBe("motion-output");
    expect(motion.mock.calls[0]?.slice(0, 2)).toEqual([photo, drive]);
    expect(video).not.toHaveBeenCalled();
  });
  it("OmniHuman uses the supplied photo and audio", async () => {
    const photo = new Blob(["photo"]), audio = new Blob(["audio"]);
    expect(await generateVideo("Sing", "kie:omnihuman-2-0", "", { image: photo, audio })).toBe("lip-sync-output");
    expect(lipSync.mock.calls[0]?.slice(0, 2)).toEqual([photo, audio]);
  });
  it("unsupported depth input stops before any provider call", async () => {
    const before = motion.mock.calls.length;
    await expect(generateVideo("Follow", "kie:kling-2.6/text-to-video", "", { image: new Blob(), video: new Blob(), depth: new Blob() })).rejects.toThrow("does not support depth");
    expect(motion.mock.calls.length).toBe(before);
  });
});