import { describe, expect, it } from "vitest";
import { isChatOnly } from "./video-agent";
describe("isChatOnly", () => {
  it("treats hi as chat", () => expect(isChatOnly("Hi")).toBe(true));
  it("treats hello aurora! as chat", () => expect(isChatOnly("hello aurora!")).toBe(true));
  it("lets a real prompt generate", () => expect(isChatOnly("Rooftop drill visual at golden hour")).toBe(false));
});
