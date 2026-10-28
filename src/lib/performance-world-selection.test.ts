import { describe, expect, test } from "bun:test";
import { COLOR_PRESETS } from "./colors.presets";
import { resolvePerformanceColor } from "./performance-world-selection";

describe("Perform Anywhere world handoff", () => {
  test("preserves each of the twelve selected color worlds", () => {
    expect(COLOR_PRESETS).toHaveLength(12);
    for (const preset of COLOR_PRESETS) expect(resolvePerformanceColor(preset.id)).toBe(preset.id);
  });
  test("falls back safely for an unknown world", () => {
    expect(resolvePerformanceColor("not-a-world")).toBe("royal-blue");
  });
});