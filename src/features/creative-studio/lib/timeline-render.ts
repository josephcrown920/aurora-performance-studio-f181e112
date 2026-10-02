// Browser renderer: plays the shared timeline document into a canvas + mixed
// audio and records it as a downloadable WebM. Runs in real time.
import type { TimelineDoc, Clip } from "./timeline-state";

const W = 720, H = 1280, FPS = 30;

function filterFor(clip: Clip) {
  if (clip.effect === "bw" || clip.look === "noir") return "grayscale(1) contrast(1.1)";
  if (clip.effect === "vhs" || clip.look === "vhs") return "saturate(1.4) contrast(1.15) sepia(0.2)";
  if (clip.effect === "blur") return "blur(2px)";
  return "none";
}

/** Key out the background by sampling the frame corners (solid/cyclorama backdrops). */
function removeBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const pts = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
  const ref = [0, 1, 2].map((c) => pts.reduce((s, p) => s + d[p + c], 0) / pts.length);
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.abs(d[i] - ref[0]) + Math.abs(d[i + 1] - ref[1]) + Math.abs(d[i + 2] - ref[2]);
    if (dist < 70) d[i + 3] = 0;
    else if (dist < 110) d[i + 3] = Math.round(((dist - 70) / 40) * 255);
  }
  ctx.putImageData(img, 0, 0);
}

function load<T extends HTMLMediaElement>(el: T, src: string) {
  el.crossOrigin = "anonymous";
  el.preload = "auto";
  el.src = src;
  return new Promise<T>((res, rej) => {
    el.oncanplay = () => res(el);
    el.onerror = () => rej(new Error(`Could not load ${src.slice(0, 60)} — reimport it`));
  });
}

export async function renderTimeline(doc: TimelineDoc, onProgress?: (p: number) => void): Promise<Blob> {
  const clips = doc.clips.filter((c) => c.src);
  if (!clips.length) throw new Error("Timeline is empty — add clips first");
  const end = Math.max(...clips.map((c) => c.start + c.duration));
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const scratch = document.createElement("canvas");
  scratch.width = W; scratch.height = H;
  const sctx = scratch.getContext("2d", { willReadFrequently: true })!;

  const actx = new AudioContext();
  const dest = actx.createMediaStreamDestination();
  const media = new Map<string, HTMLMediaElement | HTMLImageElement>();
  for (const c of clips) {
    if (c.kind === "image") {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = c.src!;
      await img.decode().catch(() => { throw new Error(`Could not load image ${c.name}`); });
      media.set(c.id, img);
    } else {
      const el = await load(c.kind === "audio" ? new Audio() : document.createElement("video"), c.src!);
      if (el instanceof HTMLVideoElement) el.playsInline = true;
      try { actx.createMediaElementSource(el).connect(dest); } catch { /* cross-origin audio stays silent */ }
      media.set(c.id, el);
    }
  }

  const stream = canvas.captureStream(FPS);
  dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m));
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: "video/webm" })); });
  rec.start(250);
  const t0 = performance.now();

  await new Promise<void>((resolve) => {
    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      onProgress?.(Math.min(1, t / end));
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
      // Lower tracks first (V1 under V4); audio managed alongside.
      const ordered = [...clips].sort((a, b) => a.track.localeCompare(b.track));
      for (const c of ordered) {
        const el = media.get(c.id)!;
        const active = t >= c.start && t < c.start + c.duration;
        if (el instanceof HTMLMediaElement) {
          if (!active) { if (!el.paused) el.pause(); continue; }
          const target = (c.sourceOffset ?? 0) + t - c.start;
          if (Math.abs(el.currentTime - target) > 0.3) el.currentTime = target;
          if (el.paused) void el.play().catch(() => {});
        }
        if (!active || c.kind === "audio" || c.track.startsWith("A")) continue;
        const target = c.effect === "bgremove" ? sctx : ctx;
        target.save();
        target.filter = filterFor(c);
        if (c.effect === "bgremove") sctx.clearRect(0, 0, W, H);
        const src = el as CanvasImageSource & { videoWidth?: number; naturalWidth?: number; videoHeight?: number; naturalHeight?: number };
        const sw = src.videoWidth || src.naturalWidth || W, sh = src.videoHeight || src.naturalHeight || H;
        const s = Math.max(W / sw, H / sh);
        target.drawImage(src, (W - sw * s) / 2, (H - sh * s) / 2, sw * s, sh * s);
        target.restore();
        if (c.effect === "bgremove") { removeBackground(sctx, W, H); ctx.drawImage(scratch, 0, 0); }
        if (c.effect === "flash" && t - c.start < 0.15) { ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fillRect(0, 0, W, H); }
      }
      if (t >= end) return resolve();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  rec.stop();
  media.forEach((el) => el instanceof HTMLMediaElement && el.pause());
  const blob = await done;
  void actx.close();
  return blob;
}

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
