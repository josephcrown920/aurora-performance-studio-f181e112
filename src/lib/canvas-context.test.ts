import { describe, expect, it } from "vitest";
import { assertCanvasPaths, motionReadiness, type CanvasReference } from "./canvas-context";
const ref = (role: CanvasReference["role"], mediaType: string, path = "owner/canvas/image.jpg"): CanvasReference => ({ id: "r", name: "reference", role, mediaType, path });
describe("Canvas private reference planning", () => {
  it("rejects another creator's references and traversal", () => {
    expect(() => assertCanvasPaths([ref("identity", "image/jpeg", "other/x.jpg")], "owner")).toThrow();
    expect(() => assertCanvasPaths([ref("identity", "image/jpeg", "owner/../x.jpg")], "owner")).toThrow();
    expect(() => assertCanvasPaths([ref("identity", "image/jpeg")], "owner")).not.toThrow();
  });
  it("does not mistake a screenshot for motion footage", () => {
    expect(motionReadiness([ref("identity", "image/jpeg"), ref("motion", "image/jpeg")]).motion).toBe(false);
    expect(motionReadiness([ref("identity", "image/jpeg"), ref("motion", "video/mp4")])).toEqual({ identity: true, motion: true, depth: false });
  });
});