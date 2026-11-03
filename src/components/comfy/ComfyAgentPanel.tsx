// @ts-nocheck
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Workflow, Loader2, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listComfyTemplates, listComfyRuns, saveComfyTemplate, startComfyRun, getComfyRun, getComfyTemplate } from "@/lib/comfy.functions";
import { matchComfyTemplate, unfinishedRuns, finishedOutputs, detectComfyInputs } from "@/lib/comfy-agent-match";

/** Shared ComfyUI panel: lists saved workflows as runnable features, resumes unfinished runs, and hands outputs back. */
export function ComfyAgentPanel({ brief = "", source = "run", onOutput }: { brief?: string; source?: "run" | "canvas"; onOutput?: (o: { url: string; kind: string; name: string }) => void }) {
  const qc = useQueryClient();
  const listT = useServerFn(listComfyTemplates);
  const listR = useServerFn(listComfyRuns);
  const startFn = useServerFn(startComfyRun);
  const getRun = useServerFn(getComfyRun);
  const getT = useServerFn(getComfyTemplate);
  const templates = useQuery({ queryKey: ["comfy-templates"], queryFn: () => listT(), retry: false });
  const runs = useQuery({ queryKey: ["comfy-runs"], queryFn: () => listR(), retry: false, refetchInterval: 6000 });
  const [picked, setPicked] = useState<any>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const saveFn = useServerFn(saveComfyTemplate);
  const [making, setMaking] = useState(false);
  const [appName, setAppName] = useState("");
  const [graphText, setGraphText] = useState("");
  const makeApp = async () => {
    try {
      const graph = JSON.parse(graphText);
      const { inputs, kind } = detectComfyInputs(graph);
      if (!inputs.length) throw new Error("No prompt, image or seed nodes found. Use ComfyUI's 'Export (API)' file.");
      await saveFn({ data: { name: appName || "My ComfyUI app", kind, workflowJson: graph, declaredInputs: inputs, description: `${inputs.length} inputs, ${kind}` } });
      toast.success("App created"); setMaking(false); setGraphText(""); setAppName("");
      qc.invalidateQueries({ queryKey: ["comfy-templates"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "That file isn't a ComfyUI workflow"); }
  };
  const list = templates.data?.templates ?? [];
  const all = runs.data?.runs ?? [];
  const suggestion = brief ? matchComfyTemplate(brief, list) : null;
  const pending = unfinishedRuns(all);
  const done = finishedOutputs(all).slice(0, 6);
  const nameOf = (id: string) => list.find((t) => t.id === id)?.name ?? "ComfyUI";

  // Pick up unfinished runs: poll each until it finishes.
  useEffect(() => {
    if (!pending.length) return;
    const i = setInterval(() => { pending.forEach((r) => getRun({ data: { id: r.id } }).catch(() => {})); qc.invalidateQueries({ queryKey: ["comfy-runs"] }); }, 6000);
    return () => clearInterval(i);
  }, [pending.map((r) => r.id).join()]);

  const open = async (t: any) => {
    const { template } = await getT({ data: { id: t.id } });
    setPicked(template);
    const v: Record<string, unknown> = { ...(template.default_inputs ?? {}) };
    (template.declared_inputs ?? []).forEach((d) => { if (v[d.key] === undefined && d.default !== undefined) v[d.key] = d.default; if (d.type === "text" && !v[d.key] && brief) v[d.key] = brief; });
    setValues(v);
  };
  const run = async () => {
    setBusy(true);
    try {
      const r = await startFn({ data: { workflowId: picked.id, values, source } });
      if (r?.ok === false) toast.error(r.error); else toast.success(`${picked.name} started`);
      setPicked(null);
      qc.invalidateQueries({ queryKey: ["comfy-runs"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not start workflow"); }
    setBusy(false);
  };

  return (
    <section aria-label="ComfyUI workflows" className="space-y-3 rounded-xl border border-border bg-card/70 p-3 text-sm">
      <header className="flex items-center gap-2 font-semibold"><Workflow className="size-4 text-primary" /> ComfyUI workflows<Button size="sm" variant="ghost" className="ml-auto h-7 text-xs" onClick={() => setMaking((v) => !v)}><Plus className="size-3" /> Make an app</Button></header>
      {making && (
        <div className="space-y-2 rounded-lg border border-border p-2">
          <Input className="h-8" placeholder="App name" value={appName} onChange={(e) => setAppName(e.target.value)} />
          <textarea className="h-24 w-full rounded-md border border-border bg-background p-2 font-mono text-[11px]" placeholder="Paste ComfyUI workflow (Export API) here" value={graphText} onChange={(e) => setGraphText(e.target.value)} />
          <input type="file" accept=".json" className="text-xs" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setGraphText(await f.text()); }} />
          <Button size="sm" onClick={makeApp} disabled={!graphText}>Create app</Button>
        </div>
      )}
      {templates.isError && <p className="text-xs text-muted-foreground">Sign in to use your saved ComfyUI workflows.</p>}
      {suggestion && !picked && (
        <button type="button" onClick={() => open(suggestion)} className="w-full rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-left text-xs">
          Suggested for your brief: <b>{suggestion.name}</b>
        </button>
      )}
      {pending.length > 0 && <div className="space-y-1">{pending.map((r) => <p key={r.id} className="flex items-center gap-2 text-xs"><Loader2 className="size-3 animate-spin" /> Finishing {nameOf(r.workflow_id)}…</p>)}</div>}
      {done.length > 0 && onOutput && (
        <div className="flex flex-wrap gap-1.5">{done.map((r) => (
          <Button key={r.id} size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOutput({ url: r.output_url, kind: r.output_kind ?? "image", name: nameOf(r.workflow_id) })}>
            <Plus className="size-3" /> {nameOf(r.workflow_id)}
          </Button>
        ))}</div>
      )}
      {picked ? (
        <div className="space-y-2">
          <p className="font-medium">{picked.name}</p>
          {(picked.declared_inputs ?? []).map((d) => (
            <label key={d.key} className="block text-xs">{d.label}
              {d.type === "select" ? (
                <select className="mt-1 w-full rounded-md border border-border bg-background p-1.5" value={String(values[d.key] ?? "")} onChange={(e) => setValues({ ...values, [d.key]: e.target.value })}>
                  {(d.options ?? []).map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <Input className="mt-1 h-8" type={d.type === "number" || d.type === "seed" ? "number" : "text"} placeholder={d.placeholder ?? (d.type === "image" ? "Image link" : "")} value={String(values[d.key] ?? "")}
                  onChange={(e) => setValues({ ...values, [d.key]: d.type === "number" || d.type === "seed" ? Number(e.target.value) : e.target.value })} />
              )}
            </label>
          ))}
          <div className="flex gap-2"><Button size="sm" onClick={run} disabled={busy}>{busy ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />} Run</Button><Button size="sm" variant="ghost" onClick={() => setPicked(null)}>Cancel</Button></div>
        </div>
      ) : (
        <div className="grid gap-1.5">{list.slice(0, 12).map((t) => (
          <button key={t.id} type="button" onClick={() => open(t)} className="rounded-lg border border-border px-3 py-2 text-left hover:bg-accent">
            <span className="block text-xs font-medium">{t.name}</span>
            {t.description && <span className="block text-[11px] text-muted-foreground line-clamp-1">{t.description}</span>}
          </button>
        ))}{!templates.isError && !templates.isLoading && list.length === 0 && <p className="text-xs text-muted-foreground">No saved workflows yet. Import one on the ComfyUI page.</p>}</div>
      )}
    </section>
  );
}
