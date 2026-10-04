import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AuroraLayersStudio } from "@/components/layers/AuroraLayersStudio";
import { LayersEmbed } from "@/components/layers/LayersEmbed";

function LayersPage() {
  const [mode, setMode] = useState<"embed" | "studio">("embed");

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <button
          type="button"
          onClick={() => setMode("embed")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
            mode === "embed"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Embedded app
        </button>
        <button
          type="button"
          onClick={() => setMode("studio")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
            mode === "studio"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Native studio
        </button>
      </div>
      <div className="min-h-0 flex-1">
        {mode === "embed" ? <LayersEmbed /> : <AuroraLayersStudio />}
      </div>
    </div>
  );
}

export const Route = createLazyFileRoute("/layers")({ component: LayersPage });
