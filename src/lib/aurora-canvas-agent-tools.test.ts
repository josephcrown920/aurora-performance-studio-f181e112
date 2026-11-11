import { describe, expect, test } from "bun:test";
import { executeAuroraCanvasAgentTool } from "./aurora-canvas-agent-tools.mjs";

describe("Aurora canvas agent tools (synced from auroraglobal.main)", () => {
  test("bullet time is not faked without a camera renderer", () => {
    expect(() => executeAuroraCanvasAgentTool({ tool: "aurora.vfx", action: "apply-pixel", input: { id: "bullet-time", frame: { width: 1, height: 1, data: new Uint8ClampedArray(4) } } })).toThrow(/camera-renderer/);
  });
  test("night vision renders locally", () => {
    const frame = { width: 1, height: 1, data: new Uint8ClampedArray([100, 100, 100, 255]) };
    executeAuroraCanvasAgentTool({ tool: "aurora.vfx", action: "apply-pixel", input: { id: "night-vision", frame } });
    expect(frame.data[1]).toBeGreaterThan(frame.data[0]);
  });
  test("Soul training needs at least 10 photos", () => {
    expect(executeAuroraCanvasAgentTool({ tool: "aurora.character", action: "validate-training", input: { images: [] } }).ok).toBe(false);
  });
  test("Omni plan without consent is refused", () => {
    expect(executeAuroraCanvasAgentTool({ tool: "aurora.character", action: "plan-omni", input: { model: "omnihuman-2-0", identityId: "x" } }).ok).toBe(false);
  });
});
