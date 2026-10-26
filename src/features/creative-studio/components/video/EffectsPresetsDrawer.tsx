import { useState } from "react";
import { loadTimeline } from "@/features/creative-studio/lib/timeline-state";
import { clipAt } from "@/features/creative-studio/lib/board-timeline";
import { EFFECTS, LOOKS, VIDEO_PRESETS } from "@/features/creative-studio/lib/pro-presets";

/** One-click effects, color looks and pacing presets for the clip under the playhead. */
export function EffectsPresetsDrawer({ t }: { t: number }) {
  const [note, setNote] = useState("");
  const patchClip = (patch: { effect?: string; look?: string }, label: string) => {
    const doc = loadTimeline();
    const clip = clipAt(doc, t);
    if (!clip) { setNote("Move the playhead over a clip first."); return; }
    window.dispatchEvent(new CustomEvent("aurora:apply-doc", { detail: { ...doc, clips: doc.clips.map((c) => (c.id === clip.id ? { ...c, ...patch } : c)) } }));
    setNote(`${label} applied to ${clip.name}.`);
  };
  const applyPreset = (id: string) => {
    const p = VIDEO_PRESETS.find((v) => v.id === id);
    if (!p) return;
    const doc = loadTimeline();
    window.dispatchEvent(new CustomEvent("aurora:apply-doc", { detail: { ...doc, seconds: p.seconds, clips: doc.clips.map((c) => (c.track.startsWith("V") ? { ...c, look: p.look } : c)) } }));
    setNote(`${p.name}: ${p.seconds}s, ${p.ratio}, ${p.look} look on all video clips.`);
  };
  const chip = "rounded-md border border-border px-2 py-1 text-[11px] hover:bg-accent";
  return <details className="video-studio-layers"><summary>Effects & presets</summary>
    <div className="space-y-3 p-3">
      <div><p className="mb-1 text-xs font-semibold">Presets</p><div className="flex flex-wrap gap-1">{VIDEO_PRESETS.map((p) => <button key={p.id} type="button" className={chip} onClick={() => applyPreset(p.id)}>{p.name}</button>)}</div></div>
      <div><p className="mb-1 text-xs font-semibold">Looks</p><div className="flex flex-wrap gap-1">{LOOKS.map((l) => <button key={l.id} type="button" title={l.note} className={chip} onClick={() => patchClip({ look: l.id }, l.name)}>{l.name}</button>)}</div></div>
      <div><p className="mb-1 text-xs font-semibold">Effects</p><div className="flex flex-wrap gap-1">{EFFECTS.map((e) => <button key={e.id} type="button" className={chip} onClick={() => patchClip({ effect: e.id }, e.name)}>{e.name}</button>)}<button type="button" className={chip} onClick={() => patchClip({ effect: "", look: "" }, "Clear")}>Clear</button></div></div>
      {note && <p role="status" className="text-xs text-muted-foreground">{note}</p>}
    </div>
  </details>;
}
