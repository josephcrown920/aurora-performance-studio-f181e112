import { describe, expect, it } from "bun:test";
import { emptyShot } from "@/lib/board-store";
import { emptyTimeline } from "./timeline-state";
import { appendShotsToTimeline, clipAt } from "./board-timeline";

describe("canvas to timeline", () => {
  it("places shots with media back to back on main footage and skips empty shots", () => {
    const shots = [emptyShot({ title: "A", imageUrl: "a.png", duration: 3 }), emptyShot({ title: "Empty" }), emptyShot({ title: "B", videoUrl: "b.mp4", duration: 5 })];
    const { doc, added } = appendShotsToTimeline(emptyTimeline(), shots);
    expect(added).toBe(2);
    expect(doc.clips.map((c) => [c.start, c.duration, c.kind])).toEqual([[0, 3, "image"], [3, 5, "video"]]);
  });
  it("does not add the same media twice", () => {
    const shots = [emptyShot({ imageUrl: "a.png" })];
    const first = appendShotsToTimeline(emptyTimeline(), shots).doc;
    expect(appendShotsToTimeline(first, shots).added).toBe(0);
  });
  it("shows the top track at the playhead", () => {
    const doc = { ...emptyTimeline(), clips: [{ id: "1", track: "V1" as const, start: 0, duration: 5, name: "a", kind: "video" as const, src: "a" }, { id: "2", track: "V2" as const, start: 1, duration: 1, name: "b", kind: "image" as const, src: "b" }] };
    expect(clipAt(doc, 1.5)?.id).toBe("2");
    expect(clipAt(doc, 3)?.id).toBe("1");
  });
});