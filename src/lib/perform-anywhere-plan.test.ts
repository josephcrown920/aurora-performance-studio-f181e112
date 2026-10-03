import { describe, it, expect } from "vitest";
import { validateAnywherePlan, anywhereShotPrompt } from "./perform-anywhere-plan";
const plan = { title: "Josh", characterLock: "Same face and hair", creativeBrief: "Cinematic", shots: Array.from({ length: 30 }, (_, i) => ({ title: `Shot ${i}`, outfit: `Outfit ${i}`, location: `Location ${i}`, scene: `Scene ${i}`, camera: "Medium tracking" })) };
describe("Perform Anywhere one-character production", () => {
  it("requires 30 different outfits, locations and scenes", () => {
    expect(validateAnywherePlan(plan).shots).toHaveLength(30);
    expect(() => validateAnywherePlan({ ...plan, shots: plan.shots.slice(0, 29) })).toThrow("exactly 30");
    for (const field of ["outfit", "location", "scene"]) {
      expect(() => validateAnywherePlan({ ...plan, shots: plan.shots.map((s) => ({ ...s, [field]: "Same" })) })).toThrow("different");
    }
  });
  it("locks identity without locking the original wardrobe", () => {
    const prompt = anywhereShotPrompt(plan, 0, "Josh");
    expect(prompt).toContain("One performer only: Josh");
    expect(prompt).toContain("NOT wardrobe or location constraints");
    expect(prompt).toContain("Change clothing to: Outfit 0");
    expect(() => anywhereShotPrompt(plan, 30, "Josh")).toThrow("Shot not found");
  });
});