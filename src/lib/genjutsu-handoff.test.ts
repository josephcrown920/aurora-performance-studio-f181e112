import { describe, expect, it } from "bun:test";
import { putEditorHandoff, takeEditorHandoff } from "./genjutsu-handoff";

function mem() { const m = new Map<string, string>(); return { setItem: (k: string, v: string) => void m.set(k, v), getItem: (k: string) => m.get(k) ?? null, removeItem: (k: string) => void m.delete(k) }; }

describe("editor handoff", () => {
  it("hands a finished video to the editor exactly once", () => {
    const s = mem();
    putEditorHandoff({ url: "https://x.test/a.mp4", kind: "video", name: "a.mp4" }, s);
    expect(takeEditorHandoff(s)).toEqual({ url: "https://x.test/a.mp4", kind: "video", name: "a.mp4" });
    expect(takeEditorHandoff(s)).toBeNull();
  });
  it("rejects non-web URLs", () => {
    const s = mem();
    putEditorHandoff({ url: "javascript:alert(1)", kind: "video", name: "x" }, s);
    expect(takeEditorHandoff(s)).toBeNull();
  });
});
