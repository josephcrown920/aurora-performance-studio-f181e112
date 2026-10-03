import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowUpRight, Loader2, ScanFace, FileText, Save, Play, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { getCanvasContext, saveCanvasContext, generateCanvasBrief, runCanvasMotionTest } from "@/lib/canvas-context.functions";
import { motionReadiness, type CanvasContext, type CanvasReference, type CanvasBrief } from "@/lib/canvas-context";
import joshCloseup from "@/assets/josh-reference/josh-closeup.jpeg.asset.json";
import joshPrimary from "@/assets/josh-reference/josh-primary.webp.asset.json";

type Props = {
  onApply: (brief: CanvasBrief, characterUrl: string) => void;
  onDirector: (context: string) => void;
  onContextChange: (context: string) => void;
};
const empty: CanvasContext = { characterName: "Josh", references: [], intent: "", brief: null, motionTests: [] };

export function CanvasProductionContext({ onApply, onDirector, onContextChange }: Props) {
  const { user } = useAuth();
  const get = useServerFn(getCanvasContext);
  const save = useServerFn(saveCanvasContext);
  const generate = useServerFn(generateCanvasBrief);
  const runMotion = useServerFn(runCanvasMotionTest);
  const saved = useQuery({ queryKey: ["canvas-context", user?.id], queryFn: () => get({}), enabled: !!user });
  const [project, setProject] = useState<CanvasContext>(empty);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState("Not saved");
  const [consent, setConsent] = useState(false);
  const [role, setRole] = useState<CanvasReference["role"]>("identity");
  const fileRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    onContextChange(JSON.stringify({ character: project.characterName, brief: project.brief, intent: project.intent, references: project.references.map(({ name, role }) => ({ name, role })) }).slice(0, 2400));
  }, [project, onContextChange]);
  useEffect(() => {
    if (!saved.isSuccess || loaded.current) return;
    loaded.current = true;
    if (saved.data) { setProject(saved.data); setSaveState("Saved privately"); }
  }, [saved.isSuccess, saved.data]);
  useEffect(() => {
    let active = true;
    const paths = [...project.references.map((r) => r.path), ...project.motionTests.flatMap((t) => t.videoPath ? [t.videoPath] : [])];
    Promise.all(paths.map(async (path) => {
      const { data } = await supabase.storage.from("studio").createSignedUrl(path, 3600);
      return [path, data?.signedUrl ?? ""] as const;
    })).then((pairs) => { if (active) setUrls(Object.fromEntries(pairs)); });
    return () => { active = false; };
  }, [project.references, project.motionTests]);
  const persist = async (next: CanvasContext) => {
    await save({ data: next });
    setSaveState("Saved privately");
  };
  const change = (next: CanvasContext) => { setProject(next); setSaveState("Unsaved changes"); };
  const action = async (label: string, work: () => Promise<void>) => {
    if (busy) return;
    setBusy(label); setError(null);
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(null); }
  };
  const upload = async (file: File, assignedRole: CanvasReference["role"]) => {
    if (!user) throw new Error("Sign in to save references.");
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) throw new Error("Choose an image or video.");
    if (file.size > (file.type.startsWith("image/") ? 12 : 100) * 1024 * 1024) throw new Error("File is too large (images: 12 MB, videos: 100 MB).");
    const id = crypto.randomUUID();
    const path = `${user.id}/canvas/references/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("studio").upload(path, file, { contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);
    return { id, path, name: file.name, role: assignedRole, mediaType: file.type } satisfies CanvasReference;
  };
  const addJosh = () => action("josh", async () => {
    const references: CanvasReference[] = [];
    for (const [asset, name] of [[joshCloseup, "Josh · close-up.jpeg"], [joshPrimary, "Josh · street portrait.webp"]] as const) {
      const response = await fetch(asset.url);
      if (!response.ok) throw new Error("Josh's photo could not be opened.");
      const blob = await response.blob();
      references.push(await upload(new File([blob], name, { type: asset.content_type }), "identity"));
    }
    const next = { ...project, characterName: "Josh", references: [...project.references.filter((r) => r.role !== "identity"), ...references] };
    setProject(next); await persist(next); toast.success("Josh saved as your main character");
  });
  const ready = motionReadiness(project.references);
  const identity = project.references.find((r) => r.role === "identity");
  const brief = project.brief;
  const briefField = (field: keyof Omit<CanvasBrief, "shots" | "questions">, value: string) => {
    if (brief) change({ ...project, brief: { ...brief, [field]: value } });
  };
  return <>
    <section className="control-references" aria-label="References">
      <div className="control-section-heading"><span>01 / References</span><ScanFace className="size-4" /></div>
      <div className="control-scroll">
        <div className="control-character-hero">
          <img src={identity ? urls[identity.path] : joshCloseup.url} alt="Josh character reference" />
          <div><span className="control-eyebrow">Main character</span><h2>{project.characterName}</h2><span className="text-xs text-muted-foreground">{identity ? "Identity reference saved" : "Reference ready to save"}</span></div>
        </div>
        <div className="flex items-center gap-2 mt-3"><Input aria-label="Character name" value={project.characterName} onChange={(e) => change({ ...project, characterName: e.target.value })} /><Button variant="outline" size="sm" onClick={addJosh} disabled={!!busy}>{busy === "josh" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Josh</Button></div>
        <div className="control-reference-grid">
          {project.references.map((ref) => <div className="control-ref" key={ref.id}>
            {ref.mediaType.startsWith("video/") ? <video src={urls[ref.path]} controls /> : <img src={urls[ref.path]} alt={ref.name} />}
            <div className="flex items-center gap-1 p-2"><select aria-label={`Role for ${ref.name}`} value={ref.role} onChange={(e) => change({ ...project, references: project.references.map((r) => r.id === ref.id ? { ...r, role: e.target.value as CanvasReference["role"] } : r) })}>{["identity", "wardrobe", "scene", "depth", "motion"].map((r) => <option key={r}>{r}</option>)}</select><Button variant="ghost" size="icon" aria-label={`Remove ${ref.name}`} onClick={() => change({ ...project, references: project.references.filter((r) => r.id !== ref.id) })}><Trash2 className="size-3" /></Button></div>
            <p className="text-xs text-muted-foreground truncate px-2 pb-2">{ref.name}</p>
          </div>)}
        </div>
        <div className="flex items-center gap-2 mt-4"><select aria-label="Upload reference role" value={role} onChange={(e) => setRole(e.target.value as CanvasReference["role"])}>{["identity", "wardrobe", "scene", "depth", "motion"].map((r) => <option key={r}>{r}</option>)}</select><Button variant="outline" size="sm" disabled={!!busy || project.references.length >= 12} onClick={() => fileRef.current?.click()}><Plus className="size-4" /> Add reference</Button></div>
        <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) action("upload", async () => { const ref = await upload(file, role); const next = { ...project, references: [...project.references, ref] }; setProject(next); await persist(next); }); }} />
        <div className="control-lock mt-6"><span className="control-eyebrow">Context lock</span><p className="text-sm mt-2">{brief?.characterLock || "Josh · preserve face, hair and character identity across every shot."}</p><div className="control-tags"><span>Identity</span><span>Wardrobe</span><span>Environment</span></div></div>
        <p className="text-xs text-muted-foreground mt-4">Depth maps guide planning; depth-conditioned rendering is not yet available.</p>
      </div>
    </section>
    <section className="control-brief" aria-label="Creative brief">
      <div className="control-section-heading"><span>02 / Creative brief</span><FileText className="size-4" /></div>
      <div className="control-scroll">
        <label className="control-eyebrow" htmlFor="canvas-intent">Narrative intent</label>
        <Textarea id="canvas-intent" value={project.intent} onChange={(e) => change({ ...project, intent: e.target.value })} placeholder="What happens? Describe the performance, world and mood…" rows={3} className="mt-3" />
        <Button className="w-full mt-3" disabled={!!busy || !ready.identity} onClick={() => action("brief", async () => { const generated = await generate({ data: project }); const next = { ...project, brief: generated }; setProject(next); await persist(next); })}>{busy === "brief" ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />} {brief ? "Regenerate brief" : "Generate full brief"}</Button>
        {error && <div role="alert" className="control-error mt-4">{error}</div>}
        {saved.isError && <div role="alert" className="control-error mt-4">Your saved project could not be loaded. <Button variant="ghost" size="sm" onClick={() => saved.refetch()}>Retry</Button></div>}
        {brief ? <div className="space-y-5 mt-6">
          {([["title", "Working title"], ["logline", "Story"], ["characterLock", "Character lock"], ["audience", "Audience"], ["tone", "Tone"], ["visualStyle", "Camera & lighting"], ["wardrobe", "Wardrobe"], ["environment", "Environment"], ["motionDirection", "Motion direction"], ["depthPlan", "Depth & compositing"]] as const).map(([key, label]) => <div key={key}><label className="control-eyebrow" htmlFor={`brief-${key}`}>{label}</label><Textarea id={`brief-${key}`} value={brief[key]} onChange={(e) => briefField(key, e.target.value)} rows={key === "title" ? 1 : 2} className="mt-2" /></div>)}
          <div className="control-section-heading !px-0"><span>Shot list / {brief.shots.length.toString().padStart(2, "0")}</span></div>
          {brief.shots.map((shot, index) => <div key={index} className="control-shot"><span className="control-eyebrow">{String(index + 1).padStart(2, "0")} / {shot.camera}</span><h3 className="text-sm font-medium mt-2">{shot.title}</h3><Textarea aria-label={`Shot ${index + 1} prompt`} rows={3} value={shot.prompt} className="mt-2" onChange={(e) => change({ ...project, brief: { ...brief, shots: brief.shots.map((s, i) => i === index ? { ...s, prompt: e.target.value } : s) } })} /></div>)}
          {brief.questions.map((question, i) => <p key={i} className="text-xs text-muted-foreground">{question}</p>)}
          <Button className="w-full" disabled={!identity || !!busy} onClick={() => action("apply", async () => { if (!identity) return; await persist(project); const { data, error: signError } = await supabase.storage.from("studio").createSignedUrl(identity.path, 3600); if (signError || !data) throw new Error("Could not open your character reference."); onApply(brief, data.signedUrl); toast.success("Approved shots added to the production graph"); })}>Approve & add shots <ArrowUpRight className="size-4" /></Button>
        </div> : <div className="control-empty-brief"><span className="control-eyebrow">Awaiting references</span><h3>Your vision.<br />A production-ready plan.</h3><div className="control-brief-lines"><i /><i /><i /></div></div>}
        <div className="control-motion mt-6"><div className="flex justify-between items-center"><span className="control-eyebrow">Motion test / 5s</span><span className="text-xs text-muted-foreground">Seedance</span></div>
          <div className="control-tags"><span>{ready.identity ? "Photo ready" : "Photo missing"}</span><span>{ready.motion ? "Video ready" : "Video missing"}</span></div>
          <label className="flex gap-2 mt-3 text-xs text-muted-foreground"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I have permission to use these references and approve a paid provider test.</label>
          {ready.depth && <p className="text-xs text-muted-foreground mt-3">Depth-conditioned motion is unsupported by this provider. Remove the depth reference to run a motion-only test; the brief retains your depth plan.</p>}
          <Button variant="outline" className="w-full mt-3" disabled={!!busy || !ready.identity || !ready.motion || ready.depth || !brief || !consent} onClick={() => action("motion", async () => {
            const id = crypto.randomUUID();
            try { const result = await runMotion({ data: { project, consent: true } }); const next: CanvasContext = { ...project, motionTests: [{ id, at: new Date().toISOString(), status: "passed" as const, videoPath: result.path, detail: `${result.provider} · ${Math.round(result.latencyMs / 1000)}s render` }, ...project.motionTests].slice(0, 20) }; setProject(next); await persist(next); }
            catch (e) { const detail = e instanceof Error ? e.message : "Motion test failed"; const next: CanvasContext = { ...project, motionTests: [{ id, at: new Date().toISOString(), status: "failed" as const, videoPath: null, detail }, ...project.motionTests].slice(0, 20) }; setProject(next); await persist(next); throw e; }
          })}>{busy === "motion" ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />} Run motion test</Button>
          {project.motionTests.map((test) => <div key={test.id} className="mt-4 text-xs"><strong>{test.status === "passed" ? "Rendered" : "Failed"}</strong><p className="text-muted-foreground mt-1">{test.detail}</p>{test.videoPath && urls[test.videoPath] && <video src={urls[test.videoPath]} controls className="w-full mt-2 rounded-lg" />}</div>)}
        </div>
        <div className="flex items-center justify-between gap-2 mt-5"><span className="text-xs text-muted-foreground">{saveState}</span><Button size="icon" variant="ghost" aria-label="Save project context" disabled={!!busy} onClick={() => action("save", () => persist(project))}><Save className="size-4" /></Button></div>
        <Button variant="outline" className="w-full mt-2" onClick={() => onDirector(JSON.stringify({ character: project.characterName, brief: project.brief, intent: project.intent, references: project.references.map(({ name, role }) => ({ name, role })) }).slice(0, 2400))}>Open Aurora Director <ArrowUpRight className="size-4" /></Button>
        {brief && <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => { if (!("speechSynthesis" in window)) { toast.error("Voice playback is unavailable in this browser."); return; } window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${brief.title}. ${brief.logline}. ${brief.motionDirection}`)); }}><Volume2 className="size-4" /> Read brief aloud</Button>}
      </div>
    </section>
  </>;
}