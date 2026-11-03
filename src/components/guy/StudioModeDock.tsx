import { Clapperboard, Film, Layers3, Workflow, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import editorPreview from "@/assets/guy/tile-editor.png";
import canvasPreview from "@/assets/guy/tile-canvas.png";
import layersPreview from "@/assets/guy/tile-layers.png";
import workflowsPreview from "@/assets/guy/tile-workflows.png";
import performPreview from "@/assets/guy/tile-perform.png";
import creativePreview from "@/assets/guy/thumb-matchcut.jpg";

type StudioMode = "edit" | "canvas" | "layers" | "workflows" | "perform" | "creative";

const MODES = [
  { mode: "edit", label: "Editor", image: editorPreview, icon: Clapperboard },
  { mode: "canvas", label: "Canvas", image: canvasPreview, icon: Film },
  { mode: "layers", label: "Layers", image: layersPreview, icon: Layers3 },
  { mode: "workflows", label: "Workflows", image: workflowsPreview, icon: Workflow },
  { mode: "perform", label: "Perform", image: performPreview, icon: Film },
  { mode: "creative", label: "Creative tools", image: creativePreview, icon: Wand2 },
] as const;

/** Visual mode navigation leaves the parent editor session mounted. */
export function StudioModeDock({ mode, onMode }: { mode: StudioMode; onMode: (mode: StudioMode) => void }) {
  return (
    <nav aria-label="Studio modes" className="studio-dock shrink-0 overflow-x-auto border-b border-border glass-panel px-3 py-2">
      <div className="mx-auto flex w-max gap-2">
        {MODES.map(({ mode: value, label, image, icon: Icon }) => (
          <Button
            key={value}
            variant="ghost"
            onClick={() => onMode(value)}
            aria-label={label}
            aria-pressed={mode === value}
            className={cn(
              "group relative flex h-[76px] w-[108px] shrink-0 flex-col gap-0 overflow-hidden rounded-md border p-0 transition-colors motion-reduce:transition-none",
              mode === value ? "border-primary bg-primary text-primary-foreground ring-1 ring-primary" : "border-border bg-card text-foreground hover:border-primary",
            )}
          >
            <img src={image} alt="" className="h-[48px] w-full shrink-0 object-cover transition-transform group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
            <span className="relative flex h-7 w-full items-center justify-center gap-1.5 bg-inherit text-[10px] font-semibold"><Icon className="size-3 shrink-0" />{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}