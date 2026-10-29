import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Layers, Camera, Flame } from "lucide-react";
import purple from "@/assets/studio-worlds/purple.jpg.asset.json";
import spotlight from "@/assets/studio-worlds/spotlight.jpg.asset.json";
import white from "@/assets/studio-worlds/white.jpg.asset.json";
import crimson from "@/assets/studio-worlds/crimson.jpg.asset.json";
import pink from "@/assets/studio-worlds/pink.jpg.asset.json";
import teal from "@/assets/studio-worlds/teal.jpg.asset.json";
import street from "@/assets/studio-worlds/street.jpg.asset.json";
import redRoom from "@/assets/studio-worlds/red-room.jpg.asset.json";

const WORLDS = [
  { name: "Electric Purple", img: purple.url, color: "electric-purple" },
  { name: "Spotlight", img: spotlight.url, color: "midnight" },
  { name: "Clean White", img: white.url, color: "white" },
  { name: "Crimson", img: crimson.url, color: "crimson" },
  { name: "Hot Pink", img: pink.url, color: "hot-pink" },
  { name: "Teal", img: teal.url, color: "teal" },
  { name: "Golden Street", img: street.url, color: undefined },
  { name: "Red Room", img: redRoom.url, color: "crimson" },
];

const FEATURES = [
  { icon: Layers, kicker: "Scene Builder", title: "Build any scene from your own references.", to: "/scene-builder" as const, search: undefined },
  { icon: Camera, kicker: "Multi-angle", title: "One performance. Wide, close-up and every angle between.", to: "/colors-show" as const, search: { mode: "anywhere", flow: "build_scene" } },
  { icon: Flame, kicker: "TikTok 30", title: "One idea. 30 unique posts ready to publish.", to: "/spin" as const, search: undefined },
];

export function StudioWorldsShowcase() {
  return (
    <section aria-label="Studio worlds" className="relative z-10 py-12">
      <div className="flex items-end justify-between px-5">
        <h2 className="font-display text-3xl uppercase text-foreground md:text-5xl">Pick your studio</h2>
        <span className="text-sm text-muted-foreground">{WORLDS.length} worlds</span>
      </div>
      <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3">
        {WORLDS.map((w) => (
          <Link
            key={w.name}
            to="/colors"
            search={{ color: w.color }}
            className="group relative aspect-video w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl border border-border md:w-[60%]"
          >
            <img src={w.img} alt={`${w.name} studio`} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-background/90 to-transparent p-4">
              <span className="font-display text-xl uppercase text-foreground">{w.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Perform here <ArrowUpRight className="size-3" /></span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-3 px-5 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Link key={f.kicker} to={f.to} search={f.search as never} className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary">
            <f.icon className="size-5 text-primary" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{f.kicker}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{f.title}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open <ArrowUpRight className="size-4" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
