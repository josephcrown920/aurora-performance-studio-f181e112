import { chainOrder, type Board } from "@/lib/board-store";
import type { TimelineDoc } from "@/features/creative-studio/lib/timeline-state";

/** Add completed scenes once; preserve all existing manual edits. */
export function appendCanvasVideos(doc: TimelineDoc, board: Board): TimelineDoc {
  let start = Math.max(0, ...doc.clips.map(c => c.start + c.duration));
  const clips = [...doc.clips];
  for (const shot of chainOrder(board)) {
    const id = `canvas:${board.id}:${shot.id}`;
    if (!shot.videoUrl || shot.kind === "reference" || clips.some(c => c.id === id)) continue;
    const duration = Number.isFinite(shot.duration) && shot.duration > 0 ? shot.duration : 4;
    clips.push({ id, track: "V1", kind: "video", name: shot.title, src: shot.videoUrl, start, duration, sourceOffset: 0 });
    start += duration;
  }
  return { ...doc, clips, seconds: Math.max(doc.seconds, Math.ceil(start)) };
}