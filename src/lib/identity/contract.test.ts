import { describe, expect, it } from "bun:test";
import { assertIdentityRequest, decodeIdentity, encodeIdentity, expressionInstruction, identityPrompt, IdentityError } from "./contract";

describe("identity contract", () => {
  it("rejects identity jobs without a reference", () => {
    expect(() => assertIdentityRequest({ identityRequired: true }, "image", "seedream5pro", 0)).toThrow(IdentityError);
  });
  it("face swap image needs target and face", () => {
    expect(() => assertIdentityRequest({ identityRequired: true, faceSwapMode: true }, "image", "seedream5pro", 1)).toThrow(/target and the face/);
    expect(() => assertIdentityRequest({ identityRequired: true, faceSwapMode: true }, "image", "seedream5pro", 2)).not.toThrow();
  });
  it("rejects identity-blind models even when explicitly picked", () => {
    expect(() => assertIdentityRequest({ identityRequired: true }, "image", "sdxl", 1)).toThrow(/can't keep/);
    expect(() => assertIdentityRequest({ identityRequired: true }, "image", "flux11", 1)).toThrow(IdentityError);
    expect(() => assertIdentityRequest({ identityRequired: true }, "video", "veo31", 1)).toThrow(IdentityError);
    expect(() => assertIdentityRequest({ identityRequired: true }, "video", "seedance25", 1)).not.toThrow();
  });
  it("non-identity jobs pass through untouched", () => {
    expect(() => assertIdentityRequest({ identityRequired: false }, "image", "sdxl", 0)).not.toThrow();
    expect(identityPrompt({ identityRequired: false })).toBe("");
  });
  it("face swap prompt separates target composition from source identity", () => {
    const p = identityPrompt({ identityRequired: true, faceSwapMode: true });
    expect(p).toMatch(/Image 1 is the TARGET/);
    expect(p).toMatch(/Image 2 is the SOURCE IDENTITY/);
  });
  it("expression mode changes expression but locks features", () => {
    expect(expressionInstruction("happy")).toMatch(/smile.*face shape stay identical/);
    expect(identityPrompt({ identityRequired: true, expressionMode: "preserve" })).toMatch(/exact facial expression/);
  });
  it("settings survive encode/decode", () => {
    const s = { identityRequired: true, faceSwapMode: true, expressionMode: "serious" as const };
    expect(decodeIdentity(encodeIdentity(s))).toEqual(s);
    expect(decodeIdentity("{bad")).toBeUndefined();
  });
});
