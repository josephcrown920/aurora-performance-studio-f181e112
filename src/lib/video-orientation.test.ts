import { describe, expect, it } from "bun:test";
import { readVideoRotation } from "./video-orientation";

const ONE = 0x10000;
// Builds a minimal moov > trak > tkhd (version 0) with a given matrix a/b/c/d.
function clip(a: number, b: number, c: number, d: number, width = 1280, height = 720) {
  const tkhdBody = 84;
  const tkhd = new DataView(new ArrayBuffer(8 + tkhdBody));
  tkhd.setUint32(0, 8 + tkhdBody);
  [..."tkhd"].forEach((ch, i) => tkhd.setUint8(4 + i, ch.charCodeAt(0)));
  const m = 8 + 40;
  tkhd.setInt32(m, a); tkhd.setInt32(m + 4, b); tkhd.setInt32(m + 12, c); tkhd.setInt32(m + 16, d);
  tkhd.setUint32(m + 32, 0x40000000);
  tkhd.setUint32(m + 36, width * ONE); tkhd.setUint32(m + 40, height * ONE);
  const wrap = (name: string, inner: ArrayBuffer) => {
    const out = new Uint8Array(8 + inner.byteLength);
    new DataView(out.buffer).setUint32(0, out.byteLength);
    [...name].forEach((ch, i) => (out[4 + i] = ch.charCodeAt(0)));
    out.set(new Uint8Array(inner), 8);
    return out.buffer;
  };
  return wrap("moov", wrap("trak", tkhd.buffer));
}

describe("readVideoRotation", () => {
  it("reads an iPhone portrait clip saved sideways as 90", () => {
    expect(readVideoRotation(clip(0, ONE, -ONE, 0))).toBe(90);
  });
  it("reads an upright clip as 0", () => {
    expect(readVideoRotation(clip(ONE, 0, 0, ONE))).toBe(0);
  });
  it("reads upside-down and 270 clips", () => {
    expect(readVideoRotation(clip(-ONE, 0, 0, -ONE))).toBe(180);
    expect(readVideoRotation(clip(0, -ONE, ONE, 0))).toBe(270);
  });
  it("ignores audio tracks with no picture size", () => {
    expect(readVideoRotation(clip(0, ONE, -ONE, 0, 0, 0))).toBe(0);
  });
});
