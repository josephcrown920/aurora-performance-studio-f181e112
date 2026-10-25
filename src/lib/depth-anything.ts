// Client-side depth estimation with Depth Anything V2 (small) via
// Transformers.js. Runs fully in the browser (WebGPU when available, WASM
// otherwise) so estimating a depth guide costs no Aura and needs no keys.
// The model is downloaded once and cached by the browser.

import { pipeline, RawImage, type DepthEstimationPipeline } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/depth-anything-v2-small";

let estimatorPromise: Promise<DepthEstimationPipeline> | null = null;

function getEstimator(): Promise<DepthEstimationPipeline> {
  if (!estimatorPromise) {
    estimatorPromise = (async () => {
      try {
        return (await pipeline("depth-estimation", MODEL_ID, { device: "webgpu" })) as DepthEstimationPipeline;
      } catch {
        return (await pipeline("depth-estimation", MODEL_ID, { device: "wasm" })) as DepthEstimationPipeline;
      }
    })();
    estimatorPromise.catch(() => { estimatorPromise = null; });
  }
  return estimatorPromise;
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

/**
 * Estimate a depth map for an image (data URL, object URL, or same-origin URL)
 * and return it as a PNG blob plus an object URL for preview.
 */
export async function estimateDepthMap(source: string): Promise<{ blob: Blob; previewUrl: string }> {
  const estimator = await getEstimator();
  const image = await RawImage.read(source);
  const result = await estimator(image);
  const depth = Array.isArray(result) ? result[0]?.depth : result.depth;
  if (!depth) throw new Error("Depth estimation returned no depth map");
  const canvas = depth.toCanvas();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode the depth map"))), "image/png");
  });
  return { blob, previewUrl: URL.createObjectURL(blob) };
}
