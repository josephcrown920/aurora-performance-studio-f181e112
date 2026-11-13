import { describe, expect, it } from "bun:test";
import { finishingSource, validateFinishingInput } from "./genjutsu-finishing";

describe("Genjutsu finishing", () => {
  it("uses the completed motion video, not a reference portrait", () => {
    expect(finishingSource("completed.mp4", null)).toBe("completed.mp4");
  });
  it("allows a completed performance supplied by the artist", () => {
    expect(finishingSource("motion.mp4", "imported.mp4")).toBe("imported.mp4");
  });
  it("requires the replacement promotional song", () => {
    expect(() => validateFinishingInput("video.mp4", null, true)).toThrow("song");
  });
  it("requires permission for both performance and song", () => {
    expect(() => validateFinishingInput("video.mp4", "song.mp3", false)).toThrow("permission");
  });
  it("dispatches video relip rather than OmniHuman photo animation", () => {
    expect(validateFinishingInput("video.mp4", "song.mp3", true)).toEqual({ videoUrl: "video.mp4", audioUrl: "song.mp3", model: "fal-ai/sync-lipsync/v2" });
  });
});