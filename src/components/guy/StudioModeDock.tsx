import { Camera, Clapperboard, Film, Layers3, Workflow, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StudioMode = "edit" | "canvas" | "layers" | "workflows" | "perform" | "creative";

const MODES = [
  { mode: "edit", label: "Editor", icon: Clapperboard },
  { mode: "canvas", label: "Canvas", icon: Film },
  { mode: "layers", label: "Layers", icon: Layers3 },
  { mode: "workflows", label: "Workflows", icon: Workflow },
  { mode: "perform", label: "Perform", icon: Camera },
  { mode: "creative", label: "Creative tools", icon: Wand2 },
] as const;

/** Compact navigation rail gives each workspace its own space without shrinking the canvas vertically. */
export function StudioModeDock({ mode, onMode }: { mode: StudioMode | "start"; onMode: (mode: StudioMode) => void }) {
  return (
    <nav
      aria-label="Studio spaces"
      className="studio-dock flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-border bg-card/75 px-1.5 py-3 backdrop-blur-xl sm:w-[84px]"
    >
      <span className="sr-only">Studio spaces</span>
      {MODES.map(({ mode: value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          onClick={() => onMode(value)}
          aria-label={label}
          aria-pressed={mode === value}
          title={label}
          className={cn(
            "relative flex h-16 w-full shrink-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-1 transition-colors motion-reduce:transition-none",
            mode === value
              ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/50"
              : "border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
          <span className="max-w-full text-center text-[10px] leading-tight">{label}</span>
          {mode === value && <span aria-hidden="true" className="absolute left-0 top-2 h-7 w-1 rounded-r bg-primary" />}
        </Button>
      ))}
    </nav>
  );
}
