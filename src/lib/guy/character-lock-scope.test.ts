import { describe, it, expect, mock } from "bun:test";
const store: Record<string,string> = {};
const ls = { getItem:(k:string)=>store[k]??null, setItem:(k:string,v:string)=>{store[k]=v} };
(globalThis as any).localStorage = ls;
(globalThis as any).window = { localStorage: ls, dispatchEvent: () => true };
(globalThis as any).fetch = mock(async (url: string) => {
  if (String(url).startsWith("/api/guy/image")) return new Response(JSON.stringify({ data: [{ url: "https://x/img.png" }] }));
  return new Response(new Blob(["x"]));
});
const { saveCharacterLock } = await import("@/lib/guy/character-lock");
const { generateImage } = await import("@/lib/guy/generate");
saveCharacterLock({ on: true, name: "Josh", notes: "", refs: [{ id: "1", url: "https://x/face.png" }] });
describe("character lock scope", () => {
  it("does not block other tools (empty engine)", async () => {
    expect(await generateImage("bg", "")).toBe("https://x/img.png");
  });
  it("still enforces for Studio opt-in", async () => {
    await expect(generateImage("p", "", undefined, false, [], undefined, true)).rejects.toThrow();
  });
});
