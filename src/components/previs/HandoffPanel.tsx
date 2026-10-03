import { ArrowRight, Download, Loader2, Film } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { VideoAgentProjectDto } from "@/lib/video-agent-projects.functions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY, emptyShot, uid, type Board } from "@/lib/board-store";

type HandoffPanelProps = {
  project: VideoAgentProjectDto | null;
  onExport: () => Promise<void>;
  exporting: boolean;
};

export function HandoffPanel({ project, onExport, exporting }: HandoffPanelProps) {
  const hasProject = !!project;
  const shotCount = project?.scenes.length ?? 0;
  const platedCount = project?.scenes.filter((s) => s.frame).length ?? 0;
  function sendToCanvas(event: React.MouseEvent) {
    if (!project) return;
    const shots = project.scenes.map((scene, index) => emptyShot({
      id: scene.id, title: scene.title, scene: scene.purpose ?? "Scene",
      prompt: scene.modelPrompt ?? scene.description, imageUrl: scene.frame,
      duration: scene.duration, x: 60 + (index % 4) * 320, y: 60 + Math.floor(index / 4) * 300,
    }));
    const board: Board = { id: project.id, title: project.title, treatment: project.prompt,
      stylePreset: project.style, shots, characters: [], updatedAt: new Date().toISOString(),
      edges: shots.slice(0, -1).flatMap((shot, index) => {
        const next = shots[index + 1];
        return next ? [{ id: uid(), from: shot.id, to: next.id }] : [];
      }),
    };
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board)); }
    catch { event.preventDefault(); window.alert("Canvas could not save this handoff. Export the package instead."); }
  }

  return (
    <div className="previs-handoff-panel">
      <div className="previs-handoff-header">
        <p className="previs-field-label">Ready to produce?</p>
        <p className="text-xs text-ink-dim/60 leading-relaxed mt-1">
          Export a package (storyboard, CSV, JSON, prompts, plates) or continue planning on Canvas.
        </p>
      </div>

      {hasProject && (
        <div className="previs-handoff-stats">
          <div className="previs-handoff-stat">
            <span className="previs-handoff-stat-value">{shotCount}</span>
            <span className="previs-handoff-stat-label">scenes</span>
          </div>
          <div className="previs-handoff-stat">
            <span className="previs-handoff-stat-value">{platedCount}</span>
            <span className="previs-handoff-stat-label">plates</span>
          </div>
          <div className="previs-handoff-stat">
            <span className={cn("previs-handoff-stat-value text-xs", project?.status === "succeeded" ? "text-emerald-400" : "text-ink-dim/60")}>
              {project?.status ?? "—"}
            </span>
            <span className="previs-handoff-stat-label">status</span>
          </div>
        </div>
      )}

      <div className="previs-handoff-actions">
        <Button variant="outline"
          type="button"
          onClick={() => void onExport()}
          disabled={exporting || !hasProject}
          className="previs-handoff-btn previs-handoff-btn--export"
          data-testid="button-export-zip"
        >
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export Package
        </Button>

        {hasProject ? (
          <Link
            to="/canvas"
            onClick={sendToCanvas}
            className="previs-handoff-btn previs-handoff-btn--editor"
            data-testid="link-handoff-editor"
          >
            <Film className="size-4" />
            Open Canvas
            <ArrowRight className="size-3.5 ml-auto" />
          </Link>
        ) : (
          <Button variant="outline"
            type="button"
            disabled
            className="previs-handoff-btn previs-handoff-btn--editor opacity-40 cursor-not-allowed"
          >
            <Film className="size-4" />
            Open Canvas
            <ArrowRight className="size-3.5 ml-auto" />
          </Button>
        )}
      </div>
    </div>
  );
}
