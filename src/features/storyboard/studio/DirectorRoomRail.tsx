import { Link } from "@tanstack/react-router";
import {
  Bot,
  Camera,
  Clapperboard,
  Grid2X2,
  Layers3,
  Music2,
  Palette,
  Scissors,
  Sparkles,
  Wand2,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DirectorRoomPanel =
  | "scenes"
  | "layers"
  | "storyboard"
  | "wardrobe"
  | "moodboard"
  | "flows";

type PanelTool = {
  kind: "panel";
  id: DirectorRoomPanel;
  label: string;
  icon: LucideIcon;
  tab: "canvas" | "characters";
};

type RouteTool = {
  kind: "route";
  label: string;
  icon: LucideIcon;
  to: "/edit" | "/canvas" | "/scene-weaver" | "/photo-edit" | "/puremix" | "/video-agent" | "/agent" | "/layers" | "/previs" | "/likeness";
};

const PLANNING_TOOLS: Array<PanelTool | RouteTool> = [
  { kind: "panel", id: "storyboard", label: "Canvas", icon: Workflow, tab: "canvas" },
  { kind: "panel", id: "scenes", label: "Scenes", icon: Clapperboard, tab: "canvas" },
  { kind: "panel", id: "wardrobe", label: "Character Lock", icon: Camera, tab: "characters" },
  { kind: "route", label: "Layers", icon: Layers3, to: "/layers" },
  { kind: "route", label: "Previs", icon: Grid2X2, to: "/previs" },
  { kind: "route", label: "Locked Likeness", icon: Camera, to: "/likeness" },
];
const AGENTS: RouteTool[] = [];

function RailHeading({ children }: { children: React.ReactNode }) {
  return <p className="director-room-rail-heading">{children}</p>;
}

export function DirectorRoomRail({
  activePanel,
  onPanelChange,
}: {
  activePanel: DirectorRoomPanel | null;
  onPanelChange: (panel: DirectorRoomPanel, tab: PanelTool["tab"]) => void;
}) {
  return (
    <aside aria-label="Director’s Room tools" className="director-room-rail">
      <div className="director-room-rail-inner">
        <div className="director-room-rail-brand">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Clapperboard className="size-4" />
          </span>
          <span>
            <strong>Director’s Room</strong>
            <small>Production tools</small>
          </span>
        </div>

        
        <div className="director-room-rail-list">
          {PLANNING_TOOLS.map((tool) =>
            tool.kind === "panel" ? (
              <Button variant="ghost"
                key={`${tool.label}-${tool.id}`}
                type="button"
                onClick={() => onPanelChange(tool.id, tool.tab)}
                aria-current={activePanel === tool.id ? "page" : undefined}
                className={cn(
                  "director-room-rail-item",
                  activePanel === tool.id && "director-room-rail-item-active",
                )}
              >
                <tool.icon className="size-3.5 shrink-0" />
                <span>{tool.label}</span>
              </Button>
            ) : (
              <Link key={tool.label} to={tool.to} className="director-room-rail-item">
                <tool.icon className="size-3.5 shrink-0" />
                <span>{tool.label}</span>
              </Link>
            ),
          )}
        </div>

        {AGENTS.length > 0 && <RailHeading>Agents</RailHeading>}
        <div className="director-room-rail-list">
          {AGENTS.map((agent) => (
            <Link key={agent.label} to={agent.to} className="director-room-rail-item director-room-agent-item">
              <agent.icon className="size-3.5 shrink-0" />
              <span>{agent.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}