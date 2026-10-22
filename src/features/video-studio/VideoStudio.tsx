// @ts-nocheck
// Video Studio: the shared multi-track editor inside /studio. Program monitor
// on top, multi-track timeline below, media import and WebM export in the bar.
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Download, HardDriveUpload, Layers, Loader2 } from "lucide-react";
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
        duration = await new Promise<number>(resolve => {
          const finish = () => {
            clearTimeout(timeout);
            resolve(Number.isFinite(media.duration) && media.duration > 0 ? media.duration : 5);
            media.removeAttribute("src");
            media.load();
          };
          const timeout = setTimeout(finish, 5000);
          media.onloadedmetadata = finish;
          media.onerror = finish;
          media.src = src;
        });
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
    <div className="aurora-editor-workstation flex min-h-[calc(100vh-160px)] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold">Video Studio</h2>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          Shared timeline
        </span>
        <div className="flex-1" />
        <input
          ref={fileRef}
          type="file"
          accept="video/*,audio/*,image/*"
          multiple
          className="hidden"
          onChange={importFiles}
        />
        <Button
          type="button"
          data-testid="video-studio-import"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary/50"
        >
          <HardDriveUpload className="size-3.5" /> Import media
        </Button>
        <Button
          type="button"
          onClick={() => setShowLayers((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary/50"
        >
          <Layers className="size-3.5" /> {showLayers ? "Hide layers" : "Layers"}
        </Button>
        <Button
          type="button"
          data-testid="video-studio-export"
          onClick={exportVideo}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          {exporting ? `Exporting ${Math.round(progress * 100)}%` : "Export video"}
        </Button>
      </div>

      <div className="min-h-[320px] flex-1 rounded-lg border border-border bg-card/40 p-4">
        <ProgramMonitor />
      </div>

      <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-card/40 p-2">
        <MultiTrackTimeline />
      </div>

      {showLayers && (
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <LayersEditor />
        </div>
      )}
    </div>
  );
}
