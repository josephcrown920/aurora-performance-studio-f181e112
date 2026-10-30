import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Layers, Camera, Flame, ScanFace, Film, Mic } from "lucide-react";
import sceneFinal from "@/assets/tutorial-studio-final.jpg.asset.json";
import sceneRefs from "@/assets/tutorial-studio-refs.jpg.asset.json";
import lowAngle from "@/assets/video-josh-lowangle.mp4.asset.json";
import closeup from "@/assets/video-josh-closeup.mp4.asset.json";
import balloon from "@/assets/balloon-talking-v2.mp4.asset.json";
import joshPortrait from "@/assets/nba-josh/portrait.jpg.asset.json";
import stillPerf from "@/assets/josh-performance-still-v1.jpg.asset.json";
import balloonStill from "@/assets/balloon-head.png.asset.json";
import joshSide from "@/assets/josh-blue-side.jpg.asset.json";
import joshRed from "@/assets/josh-red-portrait.png.asset.json";
import spin1 from "@/assets/spin-demo-1.jpg";
import spin2 from "@/assets/spin-demo-2.jpg";
import spin3 from "@/assets/spin-demo-3.jpg";
import spin4 from "@/assets/spin-demo-4.jpg";
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
  { name: "Spotlight", img: spotlight.url, color: "obsidian" },
  { name: "Clean White", img: white.url, color: "ice-white" },
  { name: "Crimson", img: crimson.url, color: "crimson-red" },
  { name: "Hot Pink", img: pink.url, color: "hot-pink" },
  { name: "Teal", img: teal.url, color: "aqua" },
  { name: "Golden Street", img: street.url, color: undefined },
  { name: "Red Room", img: redRoom.url, color: "crimson-red" },
];

type Demo = { kind: "video"; src: string; poster: string } | { kind: "pair"; before: string; after: string; labels: [string, string] } | { kind: "grid"; srcs: string[] };
const FEATURES: { icon: typeof Layers; kicker: string; title: string; demo: string; to: "/scene-builder" | "/reshoot" | "/spin" | "/studio" | "/perform-anywhere" | "/lipsync"; search?: Record<string, string>; media: Demo }[] = [
  { icon: Layers, kicker: "Scene Builder", title: "Build any scene from your own references.", demo: "Drop in a face, outfit and location. Aurora puts them together into one finished shot.", to: "/scene-builder", media: { kind: "pair", before: sceneRefs.url, after: sceneFinal.url, labels: ["Your refs", "Scene"] } },
  { icon: Camera, kicker: "Multi-angle", title: "One performance. Wide, close-up and every angle between.", demo: "Upload one photo and get six camera angles of the same person in the same look.", to: "/reshoot", media: { kind: "video", src: lowAngle.url, poster: joshSide.url } },
  { icon: Flame, kicker: "TikTok 30", title: "1–2 photos in. 30 shots out.", demo: "Same character in every frame, new outfits, places and poses, ready to post.", to: "/spin", media: { kind: "grid", srcs: [spin1, spin2, spin3, spin4] } },
  { icon: ScanFace, kicker: "Face swap", title: "Swap a face in any photo or video.", demo: "Add the clip and a face photo. Motion, lighting and sound stay the same.", to: "/studio", media: { kind: "pair", before: joshPortrait.url, after: joshRed.url, labels: ["Face", "Result"] } },
  { icon: Film, kicker: "Perform Anywhere", title: "Film on your phone. Perform in any world.", demo: "Your phone take drives the motion while the scene, outfit and face stay locked.", to: "/perform-anywhere", media: { kind: "video", src: closeup.url, poster: stillPerf.url } },
  { icon: Mic, kicker: "Lip sync", title: "Any face. Any track. In sync.", demo: "Upload a vocal and a clip or photo. Aurora picks the best model for you.", to: "/lipsync", media: { kind: "video", src: balloon.url, poster: balloonStill.url } },
];

function DemoMedia({ media, label }: { media: Demo; label: string }) {
  const box = "relative aspect-video w-full overflow-hidden rounded-xl bg-muted";
  if (media.kind === "video") return <div className={box}><video src={media.src} poster={media.poster} muted loop autoPlay playsInline preload="metadata" aria-label={`${label} demo`} className="size-full object-cover" /></div>;
  if (media.kind === "grid") return <div className={`${box} grid grid-cols-4 gap-0.5`}>{media.srcs.map((src, i) => <img key={src} src={src} alt={`${label} shot ${i + 1}`} loading="lazy" className="size-full object-cover" />)}</div>;
  return <div className={`${box} grid grid-cols-2 gap-0.5`}>{[media.before, media.after].map((src, i) => <div key={src} className="relative"><img src={src} alt={`${label} ${media.labels[i]}`} loading="lazy" className="size-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-foreground">{media.labels[i]}</span></div>)}</div>;
}


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
          <Link key={f.kicker} to={f.to} search={f.search as never} className="group rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary">
            <DemoMedia media={f.media} label={f.kicker} />
            <div className="px-2 pb-2">
            <f.icon className="mt-4 size-5 text-primary" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{f.kicker}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{f.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.demo}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open <ArrowUpRight className="size-4" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
