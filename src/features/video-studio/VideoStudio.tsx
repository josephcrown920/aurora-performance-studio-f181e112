// @ts-nocheck
// Video Studio: the shared multi-track editor inside /studio. Program monitor
// on top, multi-track timeline below, media import and WebM export in the bar.
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Download, HardDriveUpload, Layers, Loader2, Sparkles, Film, Music2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { MultiTrackTimeline } from "@/features/creative-studio/components/video/MultiTrackTimeline";
import { LayersEditor } from "@/features/creative-studio/components/video/LayersEditor";
import { loadTimeline } from "@/features/creative-studio/lib/timeline-state";
import { downloadBlob, renderTimeline } from "@/features/creative-studio/lib/timeline-render";
import { ProgramMonitor } from "./ProgramMonitor";
import "@/features/creative-studio/editor-workstation.css";

function kindFor(file: File): "video" | "audio" | "image" {
  if (file.type.startsWith("audio")) return "audio";
  if (file.type.startsWith("image")) return "image";
  return "video";
}

export function VideoStudio() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLayers, setShowLayers] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<"preview" | "timeline">("preview");

  const importFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    let start = Math.max(0, ...loadTimeline().clips.map(c => c.start + c.duration));
    for (const file of files) {
      const src = URL.createObjectURL(file);
      const kind = kindFor(file);
      let duration = 5;
      if (kind !== "image") {
        const media = kind === "audio" ? new Audio() : document.createElement("video");
        media.preload = "metadata";
        try { duration = await new Promise<number>((resolve, reject) => {
          const finish = () => {
            clearTimeout(timeout);
            if (Number.isFinite(media.duration) && media.duration > 0) resolve(media.duration);
            else reject(new Error(`This browser cannot read ${file.name}. Try a compatible MP4 or WebM file.`));
            media.removeAttribute("src");
            media.load();
          };
          const timeout = setTimeout(finish, 15000);
          media.onloadedmetadata = finish;
          media.onerror = finish;
          media.src = src;
        }); } catch (error) { URL.revokeObjectURL(src); toast.error(error instanceof Error ? error.message : 'Unsupported media'); continue; }
      }
      window.dispatchEvent(
        new CustomEvent("aurora:import-media", {
          detail: { name: file.name.replace(/\.[^/.]+$/, ""), src, kind, start, duration },
        }),
      );
      start += duration;
    }
    if (files.length) {
      toast.success(
        `${files.length} ${files.length === 1 ? "clip" : "clips"} added to the timeline`,
        { description: "Local files stay in this browser tab — reimport after a refresh." },
      );
    }
  };

  const exportVideo = async () => {
    if (exporting) return;
    setExporting(true);
    setProgress(0);
    try {
      const blob = await renderTimeline(loadTimeline(), setProgress);
      downloadBlob(blob, `aurora-cut-${Date.now()}.webm`);
      toast.success("Export ready — WebM downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="aurora-editor-workstation mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-[1600px] flex-col gap-6 rounded-3xl border border-border/50 bg-background px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground"><Sparkles className="size-4" /> AURORA CREATIVE</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Video Studio</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Create, preview and finish your next video in one focused workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="video/*,audio/*,image/*" multiple className="hidden" onChange={importFiles} />
          <Button type="button" data-testid="video-studio-import" variant="outline" onClick={() => fileRef.current?.click()}><HardDriveUpload className="mr-2 size-4" /> Add media</Button>
          <Button type="button" data-testid="video-studio-export" onClick={exportVideo} disabled={exporting}><Download className="mr-2 size-4" />{exporting ? `Exporting ${Math.round(progress * 100)}%` : "Export video"}</Button>
        </div>
      </header>
      <section aria-label="Video creation workflow" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => fileRef.current?.click()} className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 text-left transition hover:border-primary/60 hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Film className="size-6 text-primary" /><span><strong className="block text-sm">Start with footage</strong><small className="text-muted-foreground">Import video clips</small></span></button>
        <button type="button" onClick={() => fileRef.current?.click()} className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 text-left transition hover:border-primary/60 hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><ImageIcon className="size-6 text-primary" /><span><strong className="block text-sm">Animate images</strong><small className="text-muted-foreground">Add stills to your edit</small></span></button>
        <button type="button" onClick={() => fileRef.current?.click()} className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 text-left transition hover:border-primary/60 hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Music2 className="size-6 text-primary" /><span><strong className="block text-sm">Add soundtrack</strong><small className="text-muted-foreground">Import audio tracks</small></span></button>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Workspace view" className="flex rounded-xl border border-border bg-card p-1">
          <button role="tab" aria-selected={workspaceTab === "preview"} type="button" onClick={() => setWorkspaceTab("preview")} className={`rounded-lg px-4 py-2 text-sm ${workspaceTab === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Preview</button>
          <button role="tab" aria-selected={workspaceTab === "timeline"} type="button" onClick={() => setWorkspaceTab("timeline")} className={`rounded-lg px-4 py-2 text-sm ${workspaceTab === "timeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Timeline</button>
        </div>
        <Button type="button" variant="outline" aria-expanded={showLayers} onClick={() => setShowLayers(v => !v)}><Layers className="mr-2 size-4" />{showLayers ? "Hide clip layers" : "Clip layers"}</Button>
      </div>
      <section aria-label="Program preview" className={`min-h-[320px] overflow-hidden rounded-2xl border border-border bg-card/40 p-3 sm:p-5 ${workspaceTab === "timeline" ? "hidden lg:block" : ""}`}><ProgramMonitor /></section>
      <section aria-label="Video timeline" className={`min-w-0 overflow-x-auto rounded-2xl border border-border bg-card/40 p-3 ${workspaceTab === "preview" ? "hidden lg:block" : ""}`}><MultiTrackTimeline /></section>
      {showLayers && <section aria-label="Clip layers" className="rounded-2xl border border-border bg-card/40 p-4"><LayersEditor /></section>}
    </main>
  );
}
