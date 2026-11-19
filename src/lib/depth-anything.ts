// Client-side depth estimation with Depth Anything V2 (small) via
// Transformers.js. Runs fully in the browser (WebGPU when a GPU adapter is
// really available, WASM otherwise) so a depth guide costs no Aura and needs
// no keys. The model is downloaded once and cached by the browser.

import { pipeline, RawImage, type DepthEstimationPipeline } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/depth-anything-v2-small";
type Device = "webgpu" | "wasm";

const estimators: Partial<Record<Device, Promise<DepthEstimationPipeline>>> = {};

async function hasWebGpuAdapter(): Promise<boolean> {
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu) return false;
    return !!(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

function getEstimator(device: Device): Promise<DepthEstimationPipeline> {
  let promise = estimators[device];
  if (!promise) {
    promise = pipeline("depth-estimation", MODEL_ID, { device }) as Promise<DepthEstimationPipeline>;
    promise.catch(() => { delete estimators[device]; });
    estimators[device] = promise;
  }
  return promise;
}

/** Grab the current (or first) frame of a video element as a data URL. */
export function videoFrameDataUrl(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

/** Load a video file/URL and capture a frame ~0.5s in as a PNG data URL. */
export function firstFrameDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.onloadeddata = () => { video.currentTime = Math.min(0.5, (video.duration || 1) / 2); };
    video.onseeked = () => { try { resolve(videoFrameDataUrl(video)); } catch (error) { reject(error); } };
    video.onerror = () => reject(new Error("Could not read a frame from that video"));
    video.src = src;
  });
}

async function run(device: Device, source: string) {
  const estimator = await getEstimator(device);
  const image = await RawImage.read(source);
  const result = await estimator(image);
  const depth = Array.isArray(result) ? result[0]?.depth : result.depth;
  if (!depth) throw new Error("Depth estimation returned no depth map");
  return depth;
}

/**
 * Estimate a depth map for an image (data URL, object URL, or same-origin URL)
 * and return it as a PNG blob plus an object URL for preview. Tries WebGPU only
 * when an adapter exists and falls back to WASM if GPU inference fails.
 */
export async function estimateDepthMap(source: string): Promise<{ blob: Blob; previewUrl: string }> {
  let depth;
  if (await hasWebGpuAdapter()) {
    try { depth = await run("webgpu", source); } catch { depth = await run("wasm", source); }
  } else {
    depth = await run("wasm", source);
  }
  // toCanvas() returns an OffscreenCanvas in modern browsers and an
  // HTMLCanvasElement elsewhere; encode either one.
  const canvas = depth.toCanvas() as HTMLCanvasElement | OffscreenCanvas;
  const blob = "convertToBlob" in canvas
    ? await canvas.convertToBlob({ type: "image/png" })
    : await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b: Blob | null) => (b ? resolve(b) : reject(new Error("Could not encode the depth map"))), "image/png");
      });
  return { blob, previewUrl: URL.createObjectURL(blob) };
}
