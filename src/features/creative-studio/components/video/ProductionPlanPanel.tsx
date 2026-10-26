import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Board, ShotNode } from "@/lib/board-store";
import { chainOrder } from "@/lib/board-store";
import { loadTimeline, type TimelineDoc } from "@/features/creative-studio/lib/timeline-state";
import { EFFECTS, LOOKS } from "@/features/creative-studio/lib/pro-presets";
import { planProduction, type ProductionPlan } from "@/lib/production-plan.functions";

/** AI Director: reads canvas + timeline, proposes a plan; nothing changes until Apply. */
export function ProductionPlanPanel({ board, onUpdateShot }: { board: Board; onUpdateShot: (id: string, patch: Partial<ShotNode>) => void }) {
  const run = useServerFn(planProduction);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [undoShots, setUndoShots] = useState<{ id: string; patch: Partial<ShotNode> }[] | null>(null);
  const [undoDoc, setUndoDoc] = useState<TimelineDoc | null>(null);

  const generate = async () => {
    setBusy(true); setError("");
    try {
      const shots = chainOrder(board).filter((s) => s.kind !== "reference");
      const doc = loadTimeline();
      const res = await run({ data: {
        brief: board.title ?? "",
        characters: board.shots.filter((s) => s.kind === "reference").map((s) => s.prompt).join("; ").slice(0, 2000),
        shots: shots.slice(0, 40).map((s) => ({ id: s.id, title: s.title.slice(0, 200), prompt: (s.prompt || "").slice(0, 1000), action: (s.action || "").slice(0, 600), frame: (s.frame || "").slice(0, 200), duration: s.duration || 5 })),
        clips: doc.clips.slice(0, 120).map((c) => ({ id: c.id, track: c.track, start: c.start, duration: c.duration, name: c.name.slice(0, 200), effect: c.effect ?? null, look: c.look ?? null })),
        effects: EFFECTS.map((e) => e.id), looks: LOOKS.map((l) => l.id),
      } });
      if (res.error || !res.plan) throw new Error(res.error || "No plan returned.");
      setPlan(res.plan);
    } catch (e) { setError(e instanceof Error && /unauth/i.test(e.message) ? "Sign in to use the AI Director." : e instanceof Error ? e.message : "Planning failed."); }
    finally { setBusy(false); }
  };

  const applyShots = () => {
    if (!plan) return;
    const prev = plan.shots.flatMap((p) => { const s = board.shots.find((x) => x.id === p.id); return s ? [{ id: s.id, patch: { action: s.action, frame: s.frame, shotType: s.shotType, mood: s.mood, duration: s.duration, prompt: s.prompt } }] : []; });
    plan.shots.forEach((p) => onUpdateShot(p.id, { action: p.action, frame: p.frame, shotType: p.shotType, mood: p.mood, duration: p.duration, prompt: p.motionPrompt, previsApproved: false }));
    setUndoShots(prev);
  };
  const applyEdits = () => {
    if (!plan) return;
    const doc = loadTimeline();
    setUndoDoc(doc);
    const clips = doc.clips.map((c) => { const e = plan.edits.find((x) => x.id === c.id); return e ? { ...c, ...(e.start != null ? { start: Math.max(0, e.start) } : {}), ...(e.duration != null ? { duration: Math.max(0.2, e.duration) } : {}), ...(e.effect ? { effect: e.effect } : {}), ...(e.look ? { look: e.look } : {}) } : c; });
    window.dispatchEvent(new CustomEvent("aurora:apply-doc", { detail: { ...doc, clips } }));
  };

  return <section className="aurora-glass aurora-director-panel" aria-label="AI production plan">
    <header className="aurora-director-head"><div><b>AI Director plan</b><small>Reads your canvas + timeline</small></div></header>
    <Button size="sm" disabled={busy} onClick={() => void generate()}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />}{plan ? "Re-plan" : "Plan my production"}</Button>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {plan && <div className="space-y-3 text-xs">
      <p className="italic">{plan.logline}</p>
      {!!plan.continuity.length && <div><b>Continuity</b><ul className="list-disc pl-4">{plan.continuity.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
      <div><b>Shots ({plan.shots.length})</b><ol className="list-decimal pl-4">{plan.shots.map((s) => <li key={s.id}>{board.shots.find((x) => x.id === s.id)?.title}: {s.motionPrompt} <span className="text-muted-foreground">· {s.frame} · {s.duration}s</span></li>)}</ol>
        <div className="aurora-director-row"><Button size="sm" variant="outline" disabled={!plan.shots.length} onClick={applyShots}><Check />Apply to canvas</Button>{undoShots && <Button size="sm" variant="ghost" onClick={() => { undoShots.forEach((u) => onUpdateShot(u.id, u.patch)); setUndoShots(null); }}><Undo2 />Undo</Button>}</div></div>
      <div><b>Timeline edits ({plan.edits.length})</b><ul className="list-disc pl-4">{plan.edits.map((e, i) => <li key={i}>{e.reason}</li>)}</ul>
        <div className="aurora-director-row"><Button size="sm" variant="outline" disabled={!plan.edits.length} onClick={applyEdits}><Check />Apply to timeline</Button>{undoDoc && <Button size="sm" variant="ghost" onClick={() => { window.dispatchEvent(new CustomEvent("aurora:apply-doc", { detail: undoDoc })); setUndoDoc(null); }}><Undo2 />Undo</Button>}</div></div>
    </div>}
  </section>;
}
