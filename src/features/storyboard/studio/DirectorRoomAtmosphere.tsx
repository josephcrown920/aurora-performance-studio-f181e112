import type { ReactNode } from "react";
import type { DirectorRoomPanel } from "./DirectorRoomRail";

type AtmosphereKey = DirectorRoomPanel | "gpu";

const ATMOSPHERES: Record<AtmosphereKey, { src: string; label: string; position: string }> = {
  wardrobe: {
    src: "/__l5e/assets-v1/fa6a1ba2-4e6e-4791-aa19-b60f0b5cfe52/streets-performance-close.png",
    label: "Close performance",
    position: "center 30%",
  },
  scenes: {
    src: "/__l5e/assets-v1/db30a888-a3b3-4125-b63f-f3e8742374be/streets-performance-hero.jpeg",
    label: "Street-scale scene",
    position: "center",
  },
  layers: {
    src: "/__l5e/assets-v1/3a2a1740-a5b5-4ff8-9bb9-73f1a552f7a1/streets-performance-wide.png",
    label: "Wet street detail",
    position: "center 45%",
  },
  storyboard: {
    src: "/__l5e/assets-v1/07d7be50-a8f1-471f-8d96-9a9f488913c4/streets-performance-crowd.png",
    label: "Crowd performance",
    position: "center 35%",
  },
  moodboard: {
    src: "/__l5e/assets-v1/db30a888-a3b3-4125-b63f-f3e8742374be/streets-performance-hero.jpeg",
    label: "Visual language",
    position: "center 55%",
  },
  flows: {
    src: "/__l5e/assets-v1/3a2a1740-a5b5-4ff8-9bb9-73f1a552f7a1/streets-performance-wide.png",
    label: "Movement flow",
    position: "center 35%",
  },
  gpu: {
    src: "/__l5e/assets-v1/fa6a1ba2-4e6e-4791-aa19-b60f0b5cfe52/streets-performance-close.png",
    label: "Render energy",
    position: "center 25%",
  },
};

export function DirectorRoomAtmosphere({
  panel,
  children,
}: {
  panel: AtmosphereKey;
  children: ReactNode;
}) {
  if (panel === "storyboard" || panel === "flows") {
    return <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">{children}</div>;
  }
  const atmosphere = ATMOSPHERES[panel];

  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
      <img
        src={atmosphere.src}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
        style={{ objectPosition: atmosphere.position }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(7,6,18,0.94)_0%,rgba(7,6,18,0.76)_45%,rgba(7,6,18,0.88)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(141,84,255,0.18),transparent_36%)]"
      />
      <div className="relative z-10 flex size-full min-h-0 flex-col bg-background/35">
        <div className="pointer-events-none absolute right-4 top-3 z-20 hidden rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45 backdrop-blur-sm lg:block">
          {atmosphere.label}
        </div>
        {children}
      </div>
    </div>
  );
}