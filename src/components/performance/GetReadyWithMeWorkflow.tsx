import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Download, Loader2, Shirt, Upload } from "lucide-react";
import grwmFace from "@/assets/nba-josh/portrait.jpg.asset.json";
import grwmFit from "@/assets/nba-josh/black-outfit.png.asset.json";
import grwmFull from "@/assets/nba-josh/grwm-dressed-wardrobe.jpg";

import { EnvironmentGrid } from "@/components/performance/EnvironmentPicker";
import { GRWM_ENVIRONMENTS } from "@/lib/environment-presets";
const GRWM_SCENES = GRWM_ENVIRONMENTS;

function GrwmFrame({ src, label, highlight }: { src: string; label: string; highlight?: boolean }) {
  return <figure className={`relative overflow-hidden rounded-lg border ${highlight ? "border-primary" : "border-border"}`}>
    <img src={src} alt={`NBA Josh example: ${label}`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
    <figcaption className="absolute inset-x-0 bottom-0 bg-background/80 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-foreground">{label}</figcaption>
  </figure>;
}
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { normalizeUprightVideo } from "@/lib/video-orientation";
import { generateMimicMotion, generatePerformanceReskin, listGenerations } from "@/lib/studio.functions";
import { loadPerformanceVariant, savePerformanceVariant, type PerformanceVariantPayload } from "@/lib/performance-variant.functions";
import { computeCost } from "@/lib/pricing";
import { REANGLE_PRESETS } from "@/lib/performance-variant-workflows";

type Transform = "sync" | "transfer";

export function GetReadyWithMeWorkflow() {
  const { user, loading } = useAuth();
  const load = useServerFn(loadPerformanceVariant);
  const save = useServerFn(savePerformanceVariant);
  const sync = useServerFn(generatePerformanceReskin);
  const transfer = useServerFn(generateMimicMotion);
  const list = useServerFn(listGenerations);
  const [draft, setDraft] = useState<PerformanceVariantPayload | null>(null);
  const [revision, setRevision] = useState(0);
  const [transform, setTransform] = useState<Transform>("sync");
  const [outfit, setOutfit] = useState("");
  const [location, setLocation] = useState<string>(GRWM_SCENES[0].prompt);
  const [sceneId, setSceneId] = useState<string>("wardrobe");
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState<{ id: string; preview: boolean; previewId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadLock = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [depth, setDepth] = useState<{ url: string; preview: string } | null>(null);
  const [depthBusy, setDepthBusy] = useState(false);
  const history = useQuery({ queryKey: ["grwm-generations", user?.id], queryFn: () => list(), enabled: !!user, refetchInterval: job ? 4000 : false });

  useEffect(() => {
    if (!user) { setDraft(null); return; }
    let cancelled = false;
    load({ data: { kind: "build_scene", mode: "anywhere" } }).then(result => {
      if (cancelled) return;
      setRevision(result.revision);
      setDraft(result.payload ?? {
        version: 1, kind: "build_scene", mode: "anywhere", references: {}, settings: {},
        selectedAngles: REANGLE_PRESETS.slice(0, 3).map(preset => preset.id), base: null, angles: [], motions: [],
        phoneVideoUrl: null, angleVideoOverrides: {}, motionDirections: {}, audioUrl: null,
      });
    }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not restore your scene"); });
    return () => { cancelled = true; };
  }, [user?.id]);

  async function upload(file: File, slot: "identity" | "outfit" | "phone") {
    if (!user || !draft || uploadLock.current) return;
    uploadLock.current = true; setUploading(true); setError(null);
    let uploadedPath: string | null = null;
    try {
      if (slot === "phone") {
        const duration = await videoDuration(file);
        if (duration > 30.5) throw new Error("Choose a dressing clip of 30 seconds or less.");
        file = await normalizeUprightVideo(file);
      }
      const path = `${user.id}/performance-variants/build_scene/grwm-${slot}-${crypto.randomUUID()}.${file.name.split(".").pop() || "mp4"}`;
      const uploaded = await supabase.storage.from("studio").upload(path, file, { contentType: file.type, upsert: false });
      if (uploaded.error) throw uploaded.error;
      uploadedPath = path;
      const signed = await supabase.storage.from("studio").createSignedUrl(path, 86400);
      if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("Could not load the uploaded clip");
      const next = slot === "phone" ? { ...draft, phoneVideoUrl: signed.data.signedUrl, motions: [] } : { ...draft, references: { ...draft.references, [slot]: signed.data.signedUrl }, motions: [] };
      const saved = await save({ data: { expectedRevision: revision, payload: next } });
      setDraft(saved.payload); setRevision(saved.revision); setJob(null);
      if (!saved.ok) { await supabase.storage.from("studio").remove([path]); toast.error("Your scene changed elsewhere; try the upload again."); }
    } catch (e) {
      if (uploadedPath) await supabase.storage.from("studio").remove([uploadedPath]);
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally { uploadLock.current = false; setUploading(false); }
  }

  const current = history.data?.items.find(item => item.id === job?.id);
  const completed = !!current?.result_video_url && ["succeeded", "complete"].includes(current.status ?? "");
  const failed = current?.status === "failed" || current?.status === "cancelled";
  const running = !!job && !completed && !failed;
  const target = draft?.base?.approved ? draft.base.url : draft?.references.identity;
  const previewCost = Math.max(1, Math.ceil(computeCost({ features: transform === "sync" ? ["video", "motion"] : ["motion"] }).total * 0.5));
  const fullCost = computeCost({ features: transform === "sync" ? ["video", "motion"] : ["motion"] }).total;
  const mutation = useMutation({
    mutationFn: async (full: boolean) => {
      if (!draft?.phoneVideoUrl || !target) throw new Error("Add your character photo and dressing clip first.");
      if (depth) throw new Error("Remove the depth guide before rendering: Kie motion models do not accept depth conditioning.");
      const confirmPreviewId = full && job?.preview && completed ? job.id : undefined;
      if (full && !confirmPreviewId) throw new Error("Review a completed preview first.");
      const prompt = `Get Ready With Me in a ${location}. The final shot ends fully dressed in this scene. Preserve the recorded dressing gestures and timing, character identity and fixed camera. No captions or added dialogue.`;
      const params = { motionType: "faithful" as const, cameraMovement: "static" as const, frames: 240, fps: 16, preserveFace: true };
      return transform === "sync"
        ? sync({ data: { performanceVideoUrl: draft.phoneVideoUrl, avatarImageUrl: target, outfit: outfit || undefined, location: location || undefined, prompt, params, confirmPreviewId } })
        : transfer({ data: { imageUrl: target, drivingVideoUrl: draft.phoneVideoUrl, prompt, params, confirmPreviewId } });
    },
    onMutate: () => setError(null),
    onSuccess: result => { setJob({ id: result.generationId, preview: result.preview }); void history.refetch(); },
    onError: e => setError(e instanceof Error ? e.message : "Render failed"),
  });
  const [autoRender, setAutoRender] = useState(false);
  useEffect(() => {
    if (!autoRender) return;
    setAutoRender(false);
    if (!draft?.phoneVideoUrl || !target) { toast.message("Scene set. Add your photo and dressing clip to render it."); return; }
    if (!mutation.isPending) mutation.mutate(false);
  }, [autoRender, draft?.phoneVideoUrl, target, mutation]);
  function changeInputs(action: () => void) { action(); setJob(null); setError(null); }
  async function buildDepth() {
    if (!user || !videoRef.current) return;
    setDepthBusy(true); setError(null);
    try {
      const { estimateDepthMap, videoFrameDataUrl } = await import("@/lib/depth-anything");
      const { blob, previewUrl } = await estimateDepthMap(videoFrameDataUrl(videoRef.current));
      const path = `${user.id}/performance-variants/build_scene/grwm-depth-${crypto.randomUUID()}.png`;
      const up = await supabase.storage.from("studio").upload(path, blob, { contentType: "image/png", upsert: false });
      if (up.error) throw up.error;
      const signed = await supabase.storage.from("studio").createSignedUrl(path, 86400);
      if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("Could not load the depth guide");
      setDepth({ url: signed.data.signedUrl, preview: previewUrl }); setJob(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Depth guide failed"); }
    finally { setDepthBusy(false); }
  }

  const busy = uploading || running || mutation.isPending;
  return <section aria-label="Get Ready With Me" className="space-y-5">
    <div className="overflow-hidden rounded-2xl border border-primary/40 bg-card">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 p-3">
        <GrwmFrame src={grwmFace.url} label="You" />
        <span className="text-primary">→</span>
        <GrwmFrame src={grwmFit.url} label="Outfit" />
        <span className="text-primary">→</span>
        <GrwmFrame src={grwmFull} label="Dressed" highlight />
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-border px-4 py-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Genjutsu</p><h2 className="flex items-center gap-2 font-display text-3xl text-foreground"><Shirt className="size-6" />Get Ready With Me</h2></div>
        <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground">Clip ≤ 30s</span>
      </div>
    </div>
    {loading ? <Loader2 className="animate-spin" /> : !user ? <Button asChild className="w-full"><Link to="/auth" search={{ next: "/perform-anywhere?experience=grwm" }}>Sign in to create</Link></Button> : !draft ? <p role="status">{error ?? "Loading your scene…"}</p> : <>
      <div className="grid grid-cols-3 gap-2">
        {(["identity", "outfit"] as const).map((slot, i) => <label key={slot} className="group flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-xl border border-border bg-card p-2 transition hover:border-primary">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">0{i + 1}</span>
          <span className="truncate text-xs font-semibold">{slot === "identity" ? "Character Lock" : "Outfit"}</span>
          {draft.references[slot] ? <img src={draft.references[slot] ?? ""} alt={slot} className="aspect-[3/4] w-full rounded-lg object-cover" /> : <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-muted"><Upload className="size-4 text-muted-foreground" /></div>}
          <input aria-label={`Upload ${slot} photo`} type="file" accept="image/*" disabled={busy} className="sr-only" onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file, slot); e.target.value = ""; }} />
        </label>)}
        <label className="flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-xl border border-border bg-card p-2 transition hover:border-primary">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">03</span>
          <span className="truncate text-xs font-semibold">Dressing clip</span>
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-lg bg-muted text-center text-[10px] text-muted-foreground">{draft.phoneVideoUrl ? <><Check className="size-4 text-primary" />Clip added</> : <><Upload className="size-4" />Phone video</>}</div>
          <input aria-label="Upload dressing clip" type="file" accept="video/*" disabled={busy} className="sr-only" onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file, "phone"); e.target.value = ""; }} />
        </label>
      </div>
      {draft.phoneVideoUrl && <video ref={videoRef} src={draft.phoneVideoUrl} crossOrigin="anonymous" controls playsInline preload="metadata" aria-label="Your dressing clip" className="max-h-80 w-full bg-muted" />}
      {draft.phoneVideoUrl && <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        {depth ? <img src={depth.preview} alt="Depth guide" className="h-24 w-16 rounded object-cover" /> : <div className="flex h-24 w-16 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">Depth</div>}
        <div className="min-w-0 flex-1 space-y-1"><p className="text-sm font-semibold">Depth guide · Depth Anything → Genjutsu</p><p className="text-xs text-muted-foreground">Builds a reference depth map. Kie motion models do not support depth conditioning.</p>
          {depth && <Button size="sm" variant="outline" onClick={() => { setDepth(null); setJob(null); }}>Remove depth guide</Button>}<Button size="sm" variant="outline" disabled={depthBusy || running || mutation.isPending} onClick={() => void buildDepth()}>{depthBusy ? <><Loader2 className="animate-spin" />Building…</> : depth ? "Rebuild depth guide" : "Build depth guide"}</Button></div>
      </div>}
      <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-widest text-primary">Scene · final environment</p>
        <div role="group" aria-label="Scene"><EnvironmentGrid presets={GRWM_ENVIRONMENTS} selectedId={sceneId} disabled={running || mutation.isPending} onPick={(scene) => changeInputs(() => { setSceneId(scene.id); setLocation(scene.prompt); })} /></div></div>
      <div role="group" aria-label="Transformation" className="grid grid-cols-2 gap-2">{(["sync", "transfer"] as const).map(value => <Button key={value} variant={transform === value ? "default" : "outline"} aria-pressed={transform === value} disabled={running || mutation.isPending} onClick={() => changeInputs(() => setTransform(value))}>{value === "sync" ? "Motion Sync" : "Motion Transfer"}</Button>)}</div>
      {transform === "sync" && <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Outfit<input aria-label="Target outfit" value={outfit} disabled={running || mutation.isPending} onChange={e => changeInputs(() => setOutfit(e.target.value))} className="mt-1 w-full rounded border border-border bg-background p-2" /></label><label className="text-sm font-medium">Scene details<input aria-label="Target location" value={location} disabled={running || mutation.isPending} onChange={e => changeInputs(() => { setSceneId("custom"); setLocation(e.target.value); })} className="mt-1 w-full rounded border border-border bg-background p-2" /></label></div>}
      <p className="text-xs text-muted-foreground">Kie motion preview: 4 seconds. Approved render: 5 seconds.</p>
      {(error || failed) && <p role="alert" className="text-sm text-destructive">{error ?? current?.error ?? "Render did not complete."}</p>}
      {uploading && <p role="status" className="text-sm">Saving upload…</p>}
      {running && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />{current?.status ?? "Queued"}</p>}
      {completed && <video src={current.result_video_url ?? ""} controls playsInline aria-label={job?.preview ? "GRWM motion preview" : "GRWM final render"} className="max-h-96 w-full bg-muted" />}
      <div className="flex flex-wrap gap-2"><Button disabled={!draft.phoneVideoUrl || !target || uploading || running || mutation.isPending} onClick={() => mutation.mutate(false)}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Generate preview · {previewCost} Aura</Button>{job?.preview && completed && <Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate(true)}>Approve & render · {fullCost} Aura</Button>}{completed && !job?.preview && <Button asChild variant="outline"><a href={current.result_video_url ?? ""} download><Download size={16} />Download</a></Button>}</div>
    </>}
  </section>;
}

function videoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const cleanup = () => { URL.revokeObjectURL(url); video.removeAttribute("src"); video.load(); };
    video.preload = "metadata";
    video.onloadedmetadata = () => { const duration = video.duration; cleanup(); Number.isFinite(duration) && duration > 0 ? resolve(duration) : reject(new Error("Could not read this clip’s length.")); };
    video.onerror = () => { cleanup(); reject(new Error("Choose a playable MP4 or MOV clip.")); };
    video.src = url;
  });
}