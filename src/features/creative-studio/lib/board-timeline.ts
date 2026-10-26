import type { ShotNode } from "@/lib/board-store";
import { newId, type Clip, type TimelineDoc } from "./timeline-state";

/** Appends canvas shots with media to the shared timeline in graph order. */
export function appendShotsToTimeline(doc: TimelineDoc, shots: ShotNode[]): { doc: TimelineDoc; added: number } {
  let cursor = doc.clips.filter((c) => c.track === "V1").reduce((end, c) => Math.max(end, c.start + c.duration), 0);
  const existing = new Set(doc.clips.map((c) => c.src).filter(Boolean));
  const clips: Clip[] = [];
  for (const shot of shots) {
    const src = shot.videoUrl || shot.motionPreviewUrl || shot.imageUrl;
    if (!src || existing.has(src)) continue;
    const duration = Math.max(0.5, shot.duration || 4);
    clips.push({ id: newId(), track: "V1", start: +cursor.toFixed(3), duration, name: shot.title || "Canvas shot", kind: src === shot.imageUrl ? "image" : "video", src, prompt: shot.prompt || undefined });
    existing.add(src);
    cursor += duration;
  }
  return { doc: { ...doc, seconds: Math.max(doc.seconds, Math.ceil(cursor)), clips: [...doc.clips, ...clips] }, added: clips.length };
}

/** Topmost visible picture clip at time t (V4 over V1). */
export function clipAt(doc: TimelineDoc, t: number): Clip | null {
  return ["V4", "V3", "V2", "V1"].map((track) => doc.clips.find((c) => c.track === track && c.src && c.kind !== "audio" && t >= c.start && t < c.start + c.duration)).find(Boolean) ?? null;
}