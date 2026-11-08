/**
 * Phone clips (iPhone .mov/.mp4) often store a sideways picture plus a rotation
 * tag. Browsers honour the tag, but motion models like Kling ignore it and see
 * the performer sideways. These helpers detect the tag and re-record the clip
 * upright before upload.
 */

const CONTAINERS = new Set(["moov", "trak"]);

/** Reads the video track rotation (0/90/180/270) from an MP4/MOV header. */
export function readVideoRotation(buffer: ArrayBuffer): 0 | 90 | 180 | 270 {
  const view = new DataView(buffer);
  const type = (at: number) => String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));
  const walk = (start: number, end: number): 0 | 90 | 180 | 270 | null => {
    let at = start;
    while (at + 8 <= end) {
      let size = view.getUint32(at);
      const name = type(at + 4);
      let header = 8;
      if (size === 1) {
        if (at + 16 > end) return null;
        size = Number(view.getBigUint64(at + 8));
        header = 16;
      } else if (size === 0) size = end - at;
      if (size < header || at + size > end) return null;
      if (CONTAINERS.has(name)) {
        const found = walk(at + header, at + size);
        if (found !== null) return found;
      } else if (name === "tkhd") {
        const body = at + header;
        const version = view.getUint8(body);
        const matrix = body + (version === 1 ? 52 : 40);
        if (matrix + 44 > at + size) return null;
        const width = view.getUint32(matrix + 36);
        const height = view.getUint32(matrix + 40);
        if (width && height) {
          const a = view.getInt32(matrix);
          const b = view.getInt32(matrix + 4);
          if (b > 0) return 90;
          if (b < 0) return 270;
          return a < 0 ? 180 : 0;
        }
      }
      at += size;
    }
    return null;
  };
  return walk(0, buffer.byteLength) ?? 0;
}

function recorderType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  for (const t of ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4;codecs=avc1", "video/mp4"]) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return null;
}

/**
 * Returns the clip unchanged when it is already upright; otherwise re-records
 * it in real time as an upright MP4 (the picture the creator actually sees).
 */
export async function normalizeUprightVideo(file: File, onProgress?: (message: string) => void): Promise<File> {
  if (typeof document === "undefined") return file;
  const rotation = readVideoRotation(await file.arrayBuffer());
  if (rotation === 0) return file;
  const mime = recorderType();
  if (!mime) throw new Error("This browser can't straighten sideways phone clips. Try Safari or Chrome.");
  onProgress?.("Straightening your phone clip…");

  const src = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = src;
  video.playsInline = true;
  video.muted = false;
  video.preload = "auto";
  try {
    await new Promise<void>((res, rej) => {
      video.onloadedmetadata = () => res();
      video.onerror = () => rej(new Error("Could not read that clip"));
    });
    // Browsers report the displayed (already upright) size.
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round((video.videoWidth * scale) / 2) * 2;
    canvas.height = Math.round((video.videoHeight * scale) / 2) * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not straighten that clip");
    const stream = canvas.captureStream(30);
    let audioCtx: AudioContext | null = null;
    try {
      audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      audioCtx.createMediaElementSource(video).connect(dest);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch { /* silent clip is fine for motion */ }
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise<void>((res) => { recorder.onstop = () => res(); });
    let raf = 0;
    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      raf = requestAnimationFrame(draw);
    };
    video.currentTime = 0;
    recorder.start(250);
    draw();
    await video.play().catch(async () => { video.muted = true; await video.play(); });
    await new Promise<void>((res) => { video.onended = () => res(); });
    cancelAnimationFrame(raf);
    recorder.stop();
    await done;
    stream.getTracks().forEach((t) => t.stop());
    await audioCtx?.close().catch(() => undefined);
    const blob = new Blob(chunks, { type: "video/mp4" });
    if (!blob.size) throw new Error("Could not straighten that clip");
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "performance"}-upright.mp4`, { type: "video/mp4" });
  } finally {
    URL.revokeObjectURL(src);
  }
}
