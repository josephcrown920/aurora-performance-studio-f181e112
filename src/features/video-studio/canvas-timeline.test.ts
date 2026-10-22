import { describe, expect, test } from "bun:test";
import { emptyShot, type Board } from "@/lib/board-store";
import { emptyTimeline } from "@/features/creative-studio/lib/timeline-state";
import { appendCanvasVideos } from "./canvas-timeline";

const board: Board = { id: "board", title: "Cut", treatment: "", stylePreset: "", characters: [], updatedAt: "", edges: [{ id: "edge", from: "one", to: "two" }], shots: [emptyShot({ id: "two", videoUrl: "blob:two", duration: 6 }), emptyShot({ id: "one", videoUrl: "blob:one", duration: 4 }), emptyShot({ id: "preview", motionPreviewUrl: "blob:preview" })] };
describe("canvas to shared timeline", () => {
  test("completed scenes follow connector order and previews are excluded", () => {
    const result = appendCanvasVideos(emptyTimeline(), board);
    expect(result.clips.map(c => [c.src, c.start, c.duration])).toEqual([["blob:one", 0, 4], ["blob:two", 4, 6]]);
  });
  test("reopening preserves manual cuts and does not duplicate scenes", () => {
    const doc = emptyTimeline();
    doc.clips = [{ id: "manual", track: "V1", kind: "video", name: "Manual", start: 0, duration: 3, sourceOffset: 2, src: "blob:manual" }];
    const once = appendCanvasVideos(doc, board);
    expect(once.clips[0]).toEqual(doc.clips[0]);
    expect(once.clips[1]?.start).toBe(3);
    expect(appendCanvasVideos(once, board)).toEqual(once);
  });
});