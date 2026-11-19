import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Download, Layers3, Loader2, Plus, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { normalizeUprightVideo } from "@/lib/video-orientation";
import { useAuth } from "@/hooks/use-auth";
import { generateMimicMotion, listGenerations } from "@/lib/studio.functions";
import {
  generatePerformanceVariantPlate,
  loadPerformanceVariant,
  savePerformanceVariant,
  type PerformanceVariantPayload,
} from "@/lib/performance-variant.functions";
import {
  PERFORMANCE_VARIANT_CATALOG,
  LUXURY_INTERIOR_PRESETS,
  REANGLE_PRESETS,
  VEHICLES,
  type PerformanceVariantKind,
} from "@/lib/performance-variant-workflows";
import { PerformanceSourceStrip } from "@/components/performance/PerformanceSourceStrip";
import { GenjutsuModelNotes, GenjutsuSheet, GenjutsuStep } from "@/components/performance/GenjutsuSheet";
import { RecordingReferenceGuide, WorkflowVisualGuide } from "@/components/performance/WorkflowVisualGuide";
import joshPortrait from "@/assets/nba-josh/portrait.jpg.asset.json";
import { SoulPicker } from "@/components/soul/SoulPicker";
import { EnvironmentPickerDialog } from "@/components/performance/EnvironmentPicker";
import { PERFORM_ENVIRONMENTS, LUXURY_INTERIORS, absoluteUrl } from "@/lib/environment-presets";

function initial(kind: PerformanceVariantKind, mode: "colors" | "anywhere"): PerformanceVariantPayload {
  const references = Object.fromEntries(PERFORMANCE_VARIANT_CATALOG[kind].references.map((item) => [item.id, null]));
  return {
    version: 1, kind, mode, references,
    settings: kind === "build_scene"
      ? { subject: "", outfit: "", location: "", pose: "", prop: "", lighting: "cinematic practical lighting", action: "performing to camera" }
      : { vehicle: "Maybach", interior: "", outfit: "Use outfit from identity reference", seatAngle: "rear seat, through-window camera", lighting: "soft cinematic night lighting", action: "controlled seated performance", context: "Performer rapping inside the vehicle" },
    selectedAngles: kind === "build_scene" ? REANGLE_PRESETS.slice(0, 3).map((item) => item.id) : LUXURY_INTERIOR_PRESETS.slice(0, 2).map((item) => item.id),
    base: null, angles: [], motions: [], phoneVideoUrl: null, angleVideoOverrides: {}, motionDirections: {}, audioUrl: null,
  };
}

export function PerformanceVariantWorkflow({ kind, mode, compact = false, studioLocation }: { kind: PerformanceVariantKind; mode: "colors" | "anywhere"; compact?: boolean; studioLocation?: string }) {
  const { user } = useAuth();
  const catalog = PERFORMANCE_VARIANT_CATALOG[kind];
  const [draft, setDraft] = useState(() => initial(kind, mode));
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [pickerSlot, setPickerSlot] = useState<"location" | "interior" | null>(null);
  const [pickedIds, setPickedIds] = useState<Record<string, string | null>>({});
  const [envId, setEnvId] = useState<string | null>(null);
  // Local copy of the phone take: lets the browser read frames for the depth
  // pose guide without a cross-origin canvas read.
  const [localTake, setLocalTake] = useState<string | null>(null);
  const [depthBusy, setDepthBusy] = useState(false);
  useEffect(() => () => { if (localTake) URL.revokeObjectURL(localTake); }, [localTake]);
  // Default Genjutsu scene: the graffiti wall, until the creator picks or uploads another.
  useEffect(() => {
    // Wait for the saved workflow to load (ready) before applying the default,
    // otherwise the async preset copy overwrites the creator's saved scene.
    if (mode !== "anywhere" || !user || !ready || draft.references.location || envId !== null) return;
    if (!catalog.references.some((r) => r.id === "location")) return;
    const graffiti = PERFORM_ENVIRONMENTS.find((p) => p.id === "graffiti-color");
    if (!graffiti) return;
    setEnvId(graffiti.id);
    setDraft((d) => "location" in d.settings && !d.references.location ? { ...d, settings: { ...d.settings, location: graffiti.prompt } } : d);
    void usePresetImage("location", graffiti.image, true).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user, ready, draft.references.location, envId, catalog.references]);
  const loadFn = useServerFn(loadPerformanceVariant);
  const saveFn = useServerFn(savePerformanceVariant);
  const generateFn = useServerFn(generatePerformanceVariantPlate);
  const motionFn = useServerFn(generateMimicMotion);
  const listFn = useServerFn(listGenerations);
  const generations = useQuery({
    queryKey: ["performance-variant-generations", user?.id],
    queryFn: () => listFn(),
    enabled: !!user,
    refetchInterval: 4_000,
  });

  useEffect(() => {
    if (!user) return;
    loadFn({ data: { kind, mode } }).then((result) => {
      // Never pre-fill a demo portrait: the server only accepts the creator's own uploads.
      const loaded = result.payload ?? initial(kind, mode);
      // Colors Studio: the palette picked on the page is the scene location.
      setDraft(studioLocation ? { ...loaded, settings: { ...loaded.settings, location: studioLocation } } : loaded);
      setRevision(result.revision);
      setReady(true);
    }).catch((error) => toast.error(error instanceof Error ? error.message : "Could not load workflow"));
  }, [user, kind, mode, studioLocation]);

  useEffect(() => {
    if (!ready || !user) return;
    const timer = setTimeout(() => {
      saveFn({ data: { expectedRevision: revision, payload: draft } }).then((result) => {
        if (!result.ok) {
          setDraft(result.payload);
          setRevision(result.revision);
          toast.error("This workflow changed elsewhere. Loaded the newest saved version.");
          return;
        }
        setRevision(result.revision);
        if (
          result.payload.base?.generationId !== draft.base?.generationId ||
          result.payload.angles.map((item) => item.generationId).join() !== draft.angles.map((item) => item.generationId).join()
        ) {
          setDraft(result.payload);
          toast.info("Changed inputs invalidated affected approvals.");
        }
      }).catch((error) => toast.error(error instanceof Error ? error.message : "Could not save workflow"));
    }, 650);
    return () => clearTimeout(timer);
  }, [draft, ready, user]);

  async function upload(original: File, slot: string, media: "image" | "video" | "audio", skipIfSet = false) {
    if (!user) return;
    const file = media === "video" ? await normalizeUprightVideo(original, (m) => toast.message(m)) : original;
    const extension = file.name.split(".").pop() || (media === "image" ? "jpg" : media === "audio" ? "mp3" : "mp4");
    const path = `${user.id}/performance-variants/${kind}/${slot}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("studio").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data, error: signError } = await supabase.storage.from("studio").createSignedUrl(path, 60 * 60 * 24);
    if (signError) throw signError;
    // skipIfSet: a default-scene copy must never overwrite a reference the
    // creator saved or picked while the copy was still uploading.
    if (media === "image") setDraft((value) => (skipIfSet && value.references[slot])
      ? value
      : { ...value, references: { ...value.references, [slot]: data.signedUrl } });
    else if (media === "video") setDraft((value) => slot === "original-performance"
      ? { ...value, phoneVideoUrl: data.signedUrl }
      : { ...value, angleVideoOverrides: { ...value.angleVideoOverrides, [slot]: data.signedUrl } });
    else setDraft((value) => ({ ...value, audioUrl: data.signedUrl }));
  }

  // Preset scenes are app images; the server only accepts the creator's own storage,
  // so copy the preset into their studio folder before using it.
  async function usePresetImage(slot: string, image: string, skipIfSet = false) {
    const response = await fetch(absoluteUrl(image));
    if (!response.ok) throw new Error("Could not load that scene");
    const blob = await response.blob();
    const type = blob.type || "image/jpeg";
    await upload(new File([blob], `${slot}.${type.split("/")[1] || "jpg"}`, { type }), slot, "image", skipIfSet);
  }

  const plateMutation = useMutation({
    mutationFn: (presetId?: string) => generateFn({ data: { payload: draft, ...(presetId ? { presetId } : {}) } }),
    onSuccess: (result) => setDraft((value) => result.presetId
      ? {
          ...value,
          angles: [...value.angles.filter((item) => item.presetId !== result.presetId), { ...result, presetId: result.presetId!, approved: false }],
          motions: value.motions.filter((item) => item.presetId !== result.presetId),
        }
      : { ...value, base: { url: result.url, generationId: result.generationId, approved: false }, angles: [], motions: [] }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Generation failed"),
  });

  const motionMutation = useMutation({
    mutationFn: async (presetId: string) => {
      const plate = presetId === "base" ? draft.base : draft.angles.find((item) => item.presetId === presetId);
      if (!plate?.approved || !draft.phoneVideoUrl) throw new Error("Approve the plate and upload the original phone performance first");
      const prior = draft.motions.find((item) => item.presetId === presetId);
      const preview = prior?.previewId ? generations.data?.items.find((item) => item.id === prior.previewId) : undefined;
      const confirmedPreviewId = preview?.result_video_url && ["succeeded", "complete"].includes(preview.status ?? "")
        ? prior?.previewId
        : undefined;
      const settings = Object.entries(draft.settings).map(([key, value]) => `${key}: ${value}`).join("; ");
      return {
        presetId,
        result: await motionFn({ data: {
          imageUrl: plate.url, sourceGenerationId: plate.generationId,
          variantWorkflowKind: kind,
          variantMode: mode,
          variantPresetId: presetId,
          drivingVideoUrl: draft.angleVideoOverrides[presetId] ?? draft.phoneVideoUrl,
          prompt: `${draft.motionDirections[presetId] ?? "Faithfully preserve the recorded performance."} Context: ${settings}`,
          params: { motionType: "faithful", cameraMovement: "static" },
          confirmPreviewId: confirmedPreviewId,
        } }),
      };
    },
    onSuccess: ({ presetId, result }) => setDraft((value) => ({
      ...value,
      motions: [...value.motions.filter((item) => item.presetId !== presetId), {
        presetId, generationId: result.generationId, jobId: result.jobId,
        previewId: result.preview ? result.generationId : value.motions.find((item) => item.presetId === presetId)?.previewId ?? null,
      }],
    })),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Motion enqueue failed"),
  });
  // Long image renders can outlive the request connection, leaving the button
  // spinning even though the plate was saved. Recover it from the generation list.
  const plateStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (plateMutation.isPending && plateStartRef.current == null) plateStartRef.current = Date.now() - 5_000;
    const started = plateStartRef.current;
    if (started == null) return;
    const needle = kind === "build_scene" ? "canonical performance scene" : "canonical luxury seated interior";
    const found = generations.data?.items.find((g) => g.kind === "image" && !!g.result_image_url
      && ["succeeded", "complete"].includes(g.status ?? "") && (g.prompt ?? "").includes(needle)
      && g.id !== draft.base?.generationId && new Date(g.created_at).getTime() >= started);
    if (found?.result_image_url) {
      plateStartRef.current = null;
      setDraft((value) => ({ ...value, base: { url: found.result_image_url!, generationId: found.id, approved: false }, angles: [], motions: [] }));
      plateMutation.reset();
    } else if (!plateMutation.isPending && Date.now() - started > 600_000) plateStartRef.current = null;
  }, [plateMutation, generations.data, draft.base, kind]);
  const requiredReady = catalog.references.every((item) => draft.references[item.id]);
  const [autoBuild, setAutoBuild] = useState(false);
  useEffect(() => {
    if (!autoBuild) return;
    setAutoBuild(false);
    if (plateMutation.isPending) return;
    const missing = catalog.references.filter((item) => !draft.references[item.id]).map((item) => item.label);
    if (missing.length) { toast.message(`Scene saved. Add ${missing.join(", ")} to build it.`); return; }
    toast.message("Building your scene…");
    plateMutation.mutate(undefined);
  }, [autoBuild, draft.references, catalog.references, plateMutation]);
  const finishedMotion = draft.motions.find((item) => item.generationId !== item.previewId && generations.data?.items.some((g) => g.id === item.generationId && !!g.result_video_url && ["succeeded", "complete"].includes(g.status ?? "")));
  const finalUrl = finishedMotion ? generations.data?.items.find((g) => g.id === finishedMotion.generationId)?.result_video_url : null;
  async function uploadTake(file: File) {
    setLocalTake(URL.createObjectURL(file));
    await upload(file, "original-performance", "video");
  }

  // Depth Anything runs in the browser on a frame of the creator's take, then
  // the depth map becomes the Pose reference the scene image is built from.
  async function depthPoseFromTake() {
    const source = localTake ?? draft.phoneVideoUrl;
    if (!source) { toast.message("Add your performance video in Step 02 first"); return; }
    setDepthBusy(true);
    try {
      const { estimateDepthMap, firstFrameDataUrl } = await import("@/lib/depth-anything");
      const frame = await firstFrameDataUrl(source);
      const { blob } = await estimateDepthMap(frame);
      const poseSlot = catalog.references.find((r) => r.id === "composition")?.id ?? catalog.references[catalog.references.length - 1].id;
      await upload(new File([blob], "depth-pose.png", { type: "image/png" }), poseSlot, "image");
      toast.success("Depth guide added as your Pose reference");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build the depth guide");
    } finally { setDepthBusy(false); }
  }

  if (mode === "anywhere") {
    const hints: Record<string, string> = { identity: "Avatar or character", outfit: "Clothing reference", location: "World or background", composition: "Body composition", prop: "Cars, products, objects", interior: "Car or jet interior" };
    const labelFor = (id: string, fallback: string) => ({ identity: "Identity", composition: "Pose", prop: "Props" } as Record<string, string>)[id] ?? fallback;
    const takeUrl = localTake ?? draft.phoneVideoUrl;
    const hasPose = catalog.references.some((r) => r.id === "composition");
    return (
      <GenjutsuSheet subtitle={kind === "luxury_interior" ? "Luxury interior · Genjutsu" : "Motion transfer · Genjutsu"} footer={<>
        <span>Drafts save automatically to your account. Each render shows its Aura price before it starts.</span>
        {finalUrl && <Button asChild variant="outline"><a href={finalUrl} download><Download className="size-4" />Download final render</a></Button>}
      </>}>
        <GenjutsuStep n="01" title="Build your scene" badge="SCENE BUILDER" description="Prepare the approved target image before transferring your performance." boxed>
          <div className="gj-slots">
            {catalog.references.map((reference) => {
              const url = draft.references[reference.id];
              const picker = reference.id === "location" || reference.id === "interior";
              const inner = <>{url ? <img src={url} alt={reference.label} /> : <span className="gj-slot-plus"><Plus size={14} /></span>}<strong>{labelFor(reference.id, reference.label)}</strong><small>{hints[reference.id] ?? reference.guidance}</small></>;
              return picker
                ? <button key={reference.id} type="button" className={`gj-slot ${url ? "is-set" : ""}`} onClick={() => setPickerSlot(reference.id as "location" | "interior")}>{inner}</button>
                : <label key={reference.id} htmlFor={`gj-ref-${kind}-${reference.id}`} className={`gj-slot ${url ? "is-set" : ""}`}>{inner}</label>;
            })}
          </div>
          {catalog.references.filter((r) => r.id !== "location" && r.id !== "interior").map((reference) => (
            <input key={reference.id} id={`gj-ref-${kind}-${reference.id}`} ref={(node) => { fileRefs.current[reference.id] = node; }} type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, reference.id, "image").catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed")); event.target.value = ""; }} />
          ))}
          {hasPose && <Button type="button" size="sm" variant="outline" disabled={depthBusy} onClick={() => void depthPoseFromTake()}>
            {depthBusy ? <Loader2 className="size-4 animate-spin" /> : <Layers3 className="size-4" />}
            {depthBusy ? "Building depth guide…" : "Pose from my video · depth guide"}
          </Button>}
          <label className="grid gap-1 text-xs font-semibold text-primary">Scene direction
            <textarea value={draft.settings.direction ?? ""} maxLength={700} onChange={(e) => { const direction = e.target.value; setDraft((d) => ({ ...d, settings: { ...d.settings, direction } })); }} placeholder="Put the performer in the selected outfit and location. Preserve identity, tattoos, proportions, and styling." />
          </label>
          <SoulPicker label="Use a Soul character as identity" onPick={(url) => setDraft((d) => ({ ...d, references: { ...d.references, identity: url } }))} />
          <div>
            <p className="mb-2 text-xs font-semibold">{kind === "build_scene" ? "Extra angles (3–5)" : "Alternate interiors"}</p>
            <div className="flex flex-wrap gap-2">{(kind === "build_scene" ? REANGLE_PRESETS : LUXURY_INTERIOR_PRESETS).map((preset) => <Button key={preset.id} type="button" size="sm" variant={draft.selectedAngles.includes(preset.id) ? "default" : "outline"} onClick={() => setDraft((d) => ({ ...d, selectedAngles: d.selectedAngles.includes(preset.id) ? d.selectedAngles.filter((id) => id !== preset.id) : (kind !== "build_scene" || d.selectedAngles.length < 5) ? [...d.selectedAngles, preset.id] : d.selectedAngles }))}>{preset.label}</Button>)}</div>
          </div>
          <Button disabled={!requiredReady || plateMutation.isPending} onClick={() => plateMutation.mutate(undefined)}>{plateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}Build scene</Button>
          {!requiredReady && <p className="text-xs text-muted-foreground">Add every reference to build the scene.</p>}
          {draft.base && <PlateCard label="Base scene" plate={draft.base} motion={draft.motions.find((item) => item.presetId === "base")} generations={generations.data?.items ?? []} busy={motionMutation.isPending} onApprove={() => setDraft((d) => ({ ...d, base: d.base && { ...d.base, approved: true } }))} onAnimate={() => motionMutation.mutate("base")} />}
          {draft.base?.approved && draft.selectedAngles.map((id) => {
            const preset = [...REANGLE_PRESETS, ...LUXURY_INTERIOR_PRESETS].find((item) => item.id === id);
            if (!preset) return null;
            const plate = draft.angles.find((item) => item.presetId === id);
            return plate ? <PlateCard key={id} label={preset.label} plate={plate} motion={draft.motions.find((item) => item.presetId === id)} generations={generations.data?.items ?? []} busy={motionMutation.isPending} onApprove={() => setDraft((d) => ({ ...d, angles: d.angles.map((item) => item.presetId === id ? { ...item, approved: true } : item) }))} onAnimate={() => motionMutation.mutate(id)} /> : <Button key={id} variant="outline" disabled={plateMutation.isPending} onClick={() => plateMutation.mutate(id)}>Generate {preset.label}</Button>;
          })}
        </GenjutsuStep>

        <GenjutsuStep n="02" title="Drive it with your performance" badge="MOTION TRANSFER">
          <label htmlFor={`gj-take-${kind}`} className="gj-drop">
            {takeUrl ? <video src={takeUrl} muted playsInline controls /> : <span className="gj-slot-plus"><Video size={14} /></span>}
            <strong>{takeUrl ? "Replace your performance video" : "Add reference video to extract motion"}</strong>
            <small>Video duration · 4–30 seconds</small>
          </label>
          <input id={`gj-take-${kind}`} type="file" accept="video/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadTake(file).catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed")); }} />
          <p className="text-xs text-muted-foreground">Approve your scene above, then press “Generate motion preview” on it — your take drives the motion.</p>
          <RecordingReferenceGuide kind={kind} className="max-w-md" />
          <label htmlFor={`gj-song-${kind}`} className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold"><Upload className="size-4 text-primary" />{draft.audioUrl ? "Soundtrack added · replace" : "Optional soundtrack"}</label>
          <input id={`gj-song-${kind}`} type="file" accept="audio/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file, "soundtrack", "audio").catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed")); }} />
          <GenjutsuModelNotes motion="Genjutsu · Kling 2.6 Motion Control via Kie" scene="Nano Banana via Kie" />
        </GenjutsuStep>

        <EnvironmentPickerDialog open={pickerSlot !== null} onOpenChange={(v) => { if (!v) setPickerSlot(null); }}
          presets={pickerSlot === "interior" ? LUXURY_INTERIORS : PERFORM_ENVIRONMENTS}
          selectedId={pickerSlot === "interior" ? pickedIds.interior ?? null : envId}
          onUpload={() => { const slot = pickerSlot; setPickerSlot(null); if (!slot) return; fileRefs.current[slot]?.click(); if (slot === "location") setEnvId(null); else setPickedIds((m) => ({ ...m, [slot]: null })); }}
          onPick={(preset) => { const slot = pickerSlot; setPickerSlot(null); if (!slot) return; if (slot === "location") setEnvId(preset.id); else setPickedIds((m) => ({ ...m, [slot]: preset.id })); setDraft((d) => ({ ...d, settings: slot in d.settings ? { ...d.settings, [slot]: preset.prompt } : d.settings })); void usePresetImage(slot, preset.image).then(() => setAutoBuild(true)).catch((error) => toast.error(error instanceof Error ? error.message : "Could not use that scene")); }} />
        {/* Hidden inputs for the picker's "upload your own" option. */}
        {catalog.references.filter((r) => r.id === "location" || r.id === "interior").map((reference) => (
          <input key={reference.id} ref={(node) => { fileRefs.current[reference.id] = node; }} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, reference.id, "image").catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed")); event.target.value = ""; }} />
        ))}
      </GenjutsuSheet>
    );
  }

  return (
    <div className={compact ? "compact-performance text-foreground" : "workspace-duo min-h-screen text-foreground"}>
      <div className={compact ? "space-y-4" : "relative z-10 mx-auto max-w-6xl space-y-6 px-5 py-8"}>
        {!compact && <WorkflowVisualGuide kind={kind} />}
        {mode === "anywhere" && <PerformanceSourceStrip references={draft.references} phoneVideoUrl={draft.phoneVideoUrl} finalUrl={finalUrl} onUpload={(file) => { void upload(file, "original-performance", "video").catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed")); }} />}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="aurora-kicker">{mode === "anywhere" ? "Genjutsu" : "Colors Studio"}</p><h1 className="font-display text-3xl">{catalog.label}</h1></div>
        </div>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {catalog.references.map((reference) => (
            <div key={reference.id} className={`reference-tile ${draft.references[reference.id] ? "workspace-active" : ""}`}>
              <input ref={(node) => { fileRefs.current[reference.id] = node; }} hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, reference.id, "image").catch((error) => toast.error(error instanceof Error ? error.message : "Upload failed")); event.target.value = ""; }} />
              <Button variant="ghost" onClick={() => reference.id === "location" || reference.id === "interior" ? setPickerSlot(reference.id) : fileRefs.current[reference.id]?.click()} className="h-16 w-full justify-start overflow-hidden text-left">
                {draft.references[reference.id] ? <img src={draft.references[reference.id] ?? ""} alt={reference.label} className="size-10 shrink-0 rounded object-cover" /> : <Upload className="size-4 shrink-0 text-primary" />}
                <span className="whitespace-normal text-xs">{reference.label}</span>
              </Button>
            </div>
          ))}
        </section>
        <SoulPicker label="Use a Soul character as identity" onPick={(url) => setDraft((d) => ({ ...d, references: { ...d.references, identity: url } }))} />
        <EnvironmentPickerDialog open={pickerSlot !== null} onOpenChange={(v) => { if (!v) setPickerSlot(null); }}
          presets={pickerSlot === "interior" ? LUXURY_INTERIORS : PERFORM_ENVIRONMENTS}
          selectedId={pickerSlot === "interior" ? pickedIds.interior ?? null : envId}
          onUpload={() => { const slot = pickerSlot; setPickerSlot(null); if (!slot) return; fileRefs.current[slot]?.click(); if (slot === "location") setEnvId(null); else setPickedIds((m) => ({ ...m, [slot]: null })); }}
          onPick={(preset) => { const slot = pickerSlot; setPickerSlot(null); if (!slot) return; if (slot === "location") setEnvId(preset.id); else setPickedIds((m) => ({ ...m, [slot]: preset.id })); setDraft((d) => ({ ...d, settings: slot in d.settings ? { ...d.settings, [slot]: preset.prompt } : d.settings })); void usePresetImage(slot, preset.image).then(() => setAutoBuild(true)).catch((error) => toast.error(error instanceof Error ? error.message : "Could not use that scene")); }} />


        {kind === "build_scene" && <section><h2 className="mb-3 text-lg font-bold">Choose 3–5 re-angles</h2><div className="flex flex-wrap gap-2">{REANGLE_PRESETS.map((preset) => <Button key={preset.id} size="sm" variant={draft.selectedAngles.includes(preset.id) ? "default" : "outline"} onClick={() => setDraft((d) => ({ ...d, selectedAngles: d.selectedAngles.includes(preset.id) ? d.selectedAngles.filter((id) => id !== preset.id) : d.selectedAngles.length < 5 ? [...d.selectedAngles, preset.id] : d.selectedAngles }))}>{preset.label}</Button>)}</div></section>}
        {kind === "luxury_interior" && <section><h2 className="mb-3 text-lg font-bold">Alternate interiors using the same identity and performance</h2><div className="flex flex-wrap gap-2">{LUXURY_INTERIOR_PRESETS.map((preset) => <Button key={preset.id} size="sm" variant={draft.selectedAngles.includes(preset.id) ? "default" : "outline"} onClick={() => setDraft((d) => ({ ...d, selectedAngles: d.selectedAngles.includes(preset.id) ? d.selectedAngles.filter((id) => id !== preset.id) : [...d.selectedAngles, preset.id] }))}>{preset.label}</Button>)}</div></section>}

        <section className="space-y-4">
          
          <Button disabled={!requiredReady || plateMutation.isPending} onClick={() => plateMutation.mutate(undefined)}>{plateMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Generate base scene</Button>
          {draft.base && <PlateCard label="Base scene" plate={draft.base} motion={draft.motions.find((item) => item.presetId === "base")} generations={generations.data?.items ?? []} busy={motionMutation.isPending} onApprove={() => setDraft((d) => ({ ...d, base: d.base && { ...d.base, approved: true } }))} onAnimate={() => motionMutation.mutate("base")} />}
          {draft.base?.approved && draft.selectedAngles.map((id) => {
            const preset = [...REANGLE_PRESETS, ...LUXURY_INTERIOR_PRESETS].find((item) => item.id === id)!;
            const plate = draft.angles.find((item) => item.presetId === id);
            return plate ? <PlateCard key={id} label={preset.label} plate={plate} motion={draft.motions.find((item) => item.presetId === id)} generations={generations.data?.items ?? []} busy={motionMutation.isPending} onApprove={() => setDraft((d) => ({ ...d, angles: d.angles.map((item) => item.presetId === id ? { ...item, approved: true } : item) }))} onAnimate={() => motionMutation.mutate(id)} /> : <Button key={id} variant="outline" disabled={plateMutation.isPending} onClick={() => plateMutation.mutate(id)}>Generate {preset.label}</Button>;
          })}
        </section>

        <section className="border-t border-border pt-4">
          <h2 className="font-bold">Performance controls</h2>
          {!compact && <RecordingReferenceGuide kind={kind} className="my-3 max-w-md" />}
          <input type="file" accept="video/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, "original-performance", "video"); }} />
          
          <h3 className="mt-5 font-semibold">Optional soundtrack</h3>
          <input type="file" accept="audio/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, "soundtrack", "audio"); }} />
          
        </section>
      </div>
    </div>
  );
}

function PlateCard({ label, plate, motion, generations, busy, onApprove, onAnimate }: {
  label: string;
  plate: { url: string; approved: boolean };
  motion?: { generationId: string; previewId: string | null };
  generations: Array<{ id: string; status?: string | null; result_video_url?: string | null; error?: string | null }>;
  busy: boolean;
  onApprove: () => void;
  onAnimate: () => void;
}) {
  const current = motion ? generations.find((item) => item.id === motion.generationId) : undefined;
  const preview = motion?.previewId ? generations.find((item) => item.id === motion.previewId) : undefined;
  const previewReady = !!preview?.result_video_url && ["succeeded", "complete"].includes(preview.status ?? "");
  const failed = current?.status === "failed";
  const processing = !!motion && !current?.result_video_url && !failed;
  const labelText = previewReady
    ? (motion?.generationId === motion?.previewId ? "Approve preview · render full" : failed ? "Retry full render" : "Render full again")
    : failed ? "Retry fresh preview" : processing ? "Motion rendering…" : "Generate motion preview";
  return <article className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-[120px_1fr]"><img src={plate.url} alt={label} className="aspect-video w-full rounded-lg object-cover md:aspect-[3/4]" /><div><h3 className="text-lg font-bold">{label}</h3><p className="mt-2 text-sm text-muted-foreground">{plate.approved ? "Approved for continuity and motion." : "Review this plate independently."}</p>{current?.result_video_url && <video src={current.result_video_url} controls playsInline className="mt-3 max-h-72 rounded-xl" />}{failed && <p className="mt-2 text-xs text-destructive">{current?.error ?? "Motion render failed; this angle can retry independently."}</p>}<div className="mt-4 flex flex-wrap gap-2">{!plate.approved && <Button onClick={onApprove}>Approve</Button>}<Button variant="outline" disabled={!plate.approved || busy || processing} onClick={onAnimate}>{labelText}</Button>{current?.result_video_url && motion?.generationId !== motion?.previewId && <Button asChild variant="outline"><a href={current.result_video_url} download>Download render</a></Button>}</div></div></article>;
}