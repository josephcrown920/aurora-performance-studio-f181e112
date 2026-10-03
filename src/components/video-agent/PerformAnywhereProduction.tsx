import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Film, Loader2, LockKeyhole, Save, Sparkles, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getCanvasContext, saveCanvasContext } from "@/lib/canvas-context.functions";
import type { CanvasReference } from "@/lib/canvas-context";
import { loadAnywhereCampaign, planAnywhereCampaign, saveAnywherePlan, renderAnywhereShot, pollAnywhereShot } from "@/lib/perform-anywhere.functions";
import type { AnywhereCampaign } from "@/lib/perform-anywhere-plan";
import closeup from "@/assets/josh-reference/josh-closeup.jpeg.asset.json";
import portrait from "@/assets/josh-reference/josh-primary.webp.asset.json";

export function PerformAnywhereProduction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const getContext = useServerFn(getCanvasContext);
  const saveContext = useServerFn(saveCanvasContext);
  const load = useServerFn(loadAnywhereCampaign);
  const plan = useServerFn(planAnywhereCampaign);
  const save = useServerFn(saveAnywherePlan);
  const render = useServerFn(renderAnywhereShot);
  const poll = useServerFn(pollAnywhereShot);
  const context = useQuery({ queryKey: ["canvas-context", user?.id], queryFn: () => getContext({}), enabled: !!user });
  const production = useQuery({ queryKey: ["anywhere-production", user?.id], queryFn: () => load({}), enabled: !!user });
  const [campaign, setCampaign] = useState<AnywhereCampaign | null>(null);
  const [preferences, setPreferences] = useState("Josh performing in 30 cinematic worlds, streetwear to tailored fashion, varied daylight and night scenes, energetic performance, one person throughout.");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState(true);
  useEffect(() => { if (production.data) { setCampaign(production.data); setPreferences(production.data.preferences); } }, [production.data]);
  const action = async (name: string, work: () => Promise<void>) => {
    if (busy) return;
    setBusy(name); setError(null);
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : "The request failed."); }
    finally { setBusy(null); }
  };
  const saveJosh = () => action("josh", async () => {
    if (!user) throw new Error("Sign in first.");
    const references: CanvasReference[] = [];
    for (const [asset, name] of [[closeup, "Josh close-up"], [portrait, "Josh street portrait"]] as const) {
      const response = await fetch(asset.url);
      if (!response.ok) throw new Error("Josh's photo could not be opened.");
      const blob = await response.blob();
      const id = crypto.randomUUID();
      const path = `${user.id}/canvas/references/${id}.${asset.content_type === "image/webp" ? "webp" : "jpeg"}`;
      const { error: uploadError } = await supabase.storage.from("studio").upload(path, blob, { contentType: asset.content_type });
      if (uploadError) throw new Error(uploadError.message);
      references.push({ id, path, name, role: "identity", mediaType: asset.content_type });
    }
    const previous = context.data;
    await saveContext({ data: { characterName: "Josh", references: [...(previous?.references.filter((r) => r.role !== "identity") ?? []), ...references], intent: previous?.intent ?? preferences, brief: previous?.brief ?? null, motionTests: previous?.motionTests ?? [] } });
    await context.refetch();
  });
  const active = campaign ? Object.entries(campaign.renders).find(([, r]) => !["completed", "failed"].includes(r.status)) : undefined;
  useEffect(() => {
    if (!campaign || !active || error) return;
    const id = campaign.id, index = Number(active[0]);
    const timer = setTimeout(() => {
      poll({ data: { id, index } }).then((result) => setCampaign((c) => c?.id === id ? { ...c, renders: { ...c.renders, [index]: result } } : c)).catch((e) => setError(e instanceof Error ? e.message : "Could not check the render."));
    }, 8000);
    return () => clearTimeout(timer);
  }, [campaign, active, poll, error]);
  const hasJosh = context.data?.characterName === "Josh" && context.data.references.some((r) => r.role === "identity");
  const rendersStarted = !!campaign && Object.keys(campaign.renders).length > 0;
  const completed = campaign ? Object.entries(campaign.renders).filter(([, r]) => r.status === "completed") : [];
  const toTimeline = () => action("timeline", async () => {
    if (!campaign) return;
    const items = [];
    for (const [key] of completed.sort(([a], [b]) => Number(a) - Number(b))) {
      const result = await poll({ data: { id: campaign.id, index: Number(key) } });
      if (result.url) items.push({ name: `${Number(key) + 1}. ${campaign.plan.shots[Number(key)]?.title ?? "Josh"}`, src: result.url, kind: "video", start: items.length * 3, duration: 3 });
    }
    if (!items.length) throw new Error("No completed videos to import.");
    localStorage.setItem("aurora_pending_imports", JSON.stringify(items));
    await navigate({ to: "/video-agent/timeline" });
  });
  return <main className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-6xl space-y-8 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div><Link to="/video-agent" className="text-sm text-muted-foreground">Aurora Video Agent</Link><h1 className="mt-2 text-3xl font-semibold">Perform Anywhere</h1><p className="mt-2 text-muted-foreground">Josh · 30 outfits · 30 locations · 30 scenes</p></div>
        <div className="flex gap-4 text-sm"><Link to="/video-agent/music-video" className="text-primary">Music video</Link><Link to="/canvas" className="text-primary">References & brief</Link><Link to="/library" className="text-primary">My library</Link></div>
      </header>
      {!user && <p><Link to="/auth" className="text-primary underline">Sign in</Link> to save Josh and create your production.</p>}
      <section className="grid gap-8 border-b border-border pb-8 md:grid-cols-[260px_1fr]" aria-label="Character Context Lock">
        <div className="grid grid-cols-2 gap-2"><img src={closeup.url} alt="Josh confirmed close-up" className="aspect-[3/4] w-full rounded-md object-cover" /><img src={portrait.url} alt="Josh confirmed street portrait" className="aspect-[3/4] w-full rounded-md object-cover" /></div>
        <div className="space-y-4"><div className="flex items-center gap-2 text-sm text-primary"><LockKeyhole className="size-4" />01 / Context Lock</div><h2 className="text-2xl font-medium">One character. Every world.</h2><p className="text-sm text-muted-foreground">{hasJosh ? "Josh’s identity photos are saved privately." : "Josh’s confirmed performer photos"}</p>
          <Button variant="outline" disabled={!user || !!busy || context.isPending || hasJosh} onClick={saveJosh}><Save className="size-4" />{busy === "josh" ? "Saving Josh…" : hasJosh ? "Josh saved" : "Save Josh as main character"}</Button>
          <label className="block text-sm" htmlFor="anywhere-preferences">Production preferences</label><Textarea id="anywhere-preferences" rows={3} value={preferences} onChange={(e) => setPreferences(e.target.value)} />
          <Button disabled={!user || !hasJosh || !!busy || !!active} onClick={() => action("plan", async () => { const next = await plan({ data: { preferences } }); setCampaign(next); setSaved(true); })}>{busy === "plan" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{busy === "plan" ? "Director planning…" : campaign ? "Create new 30-shot plan" : "Director: plan 30 shots"}</Button>
        </div>
      </section>
      {context.error && <p role="alert" className="text-destructive">{context.error.message}</p>}
      {production.error && <p role="alert" className="text-destructive">{production.error.message}</p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {campaign && <>
        <section className="space-y-4" aria-label="Production brief"><p className="text-sm text-primary">02 / {campaign.plan.shots.length}-shot production</p><h2 className="text-2xl font-medium">{campaign.plan.title}</h2><p className="text-sm text-muted-foreground">{campaign.plan.characterLock}</p><Textarea aria-label="Creative brief" value={campaign.plan.creativeBrief} disabled={rendersStarted} onChange={(e) => { setSaved(false); setCampaign({ ...campaign, plan: { ...campaign.plan, creativeBrief: e.target.value } }); }} />
          <div className="flex flex-wrap items-center gap-4"><Button variant="outline" disabled={!!busy || saved || rendersStarted} onClick={() => action("save", async () => { await save({ data: { id: campaign.id, plan: campaign.plan } }); setSaved(true); })}><Save className="size-4" />{saved ? "Plan saved privately" : "Save approved plan"}</Button><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />Approve individual 3-second renders using AI credits</label></div>
          {campaign.blockedMessage && <p role="alert" className="text-destructive">{campaign.blockedMessage}</p>}
          {completed.length > 0 && <Button onClick={toTimeline} disabled={!!busy}><Scissors className="size-4" />Edit {completed.length} completed scenes</Button>}
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="30 shot plan">
          {campaign.plan.shots.map((shot, index) => { const result = campaign.renders[index]; return <article key={index} className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")} / 30</span><span className="text-xs text-primary">{result?.status ?? "Planned"}</span></div><h3 className="font-medium">{shot.title}</h3>
            {result?.url && <video src={result.url} controls playsInline className="aspect-[9/16] max-h-72 w-full rounded-md bg-muted" />}
            <dl className="space-y-2 text-sm">{(["outfit", "location", "scene", "camera"] as const).map((field) => <div key={field}><dt className="capitalize text-muted-foreground">{field}</dt><dd className="break-words">{shot[field]}</dd></div>)}</dl>
            {result?.error && <p className="text-sm text-destructive">{result.error}</p>}
            {!result && <Button variant="outline" className="w-full" disabled={!consent || !saved || !!busy || !!active || !!campaign.blockedMessage} onClick={() => action(`render-${index}`, async () => { const r = await render({ data: { id: campaign.id, index, consent: true } }); setCampaign((c) => c ? { ...c, renders: { ...c.renders, [index]: r } } : c); })}>{busy === `render-${index}` ? <Loader2 className="size-4 animate-spin" /> : <Film className="size-4" />}Render shot {index + 1}</Button>}
            {result && !["completed", "failed"].includes(result.status) && <p className="text-sm text-muted-foreground">Rendering · {Math.round(result.progress)}%</p>}
            {result?.videoId && <Link to="/library/$videoId" params={{ videoId: result.videoId }} className="text-sm text-primary">Open saved video</Link>}
          </article>; })}
        </section>
      </>}
    </div>
  </main>;
}