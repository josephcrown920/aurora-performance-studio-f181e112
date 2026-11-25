import { useState } from "react";
import { ArrowDown, ArrowUpRight, Layers3, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraLayersStudio } from "@/components/layers/AuroraLayersStudio";
import heroTriptych from "@/assets/guy/hero-triptych.jpg";
import tileLayers from "@/assets/guy/tile-layers.png";
import armor from "@/assets/guy/aurora-layer-armor.jpg";
import braids from "@/assets/guy/aurora-layer-braids.jpg";
import bandana from "@/assets/guy/aurora-layer-bandana.jpg";
import chains from "@/assets/guy/aurora-layer-chains.jpg";

const examples = [
  { label: "Original frame", image: heroTriptych },
  { label: "Wardrobe", image: armor },
  { label: "Hair", image: braids },
  { label: "Accessories", image: bandana },
  { label: "Jewelry", image: chains },
];

const nav = [
  { label: "Home", href: "/" },
  { label: "Studio", href: "/studio" },
  { label: "Layers", href: "/layers", active: true },
  { label: "Presets", href: "/templates" },
  { label: "Viral", href: "/spin" },
  { label: "Storyboard", href: "/storyboard" },
  { label: "Moodboard", href: "/directors-board" },
  { label: "Image", href: "/photo-edit" },
  { label: "Video", href: "/video-agent" },
];

export function LayersLanding() {
  const [openStudio, setOpenStudio] = useState(false);
  const [activeExample, setActiveExample] = useState(0);
  const [split, setSplit] = useState(54);

  if (openStudio) {
    return (
      <div className="min-h-screen bg-[#0b0711] text-white">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#100a18]/95 px-4 py-2 backdrop-blur sm:px-8">
          <button onClick={() => setOpenStudio(false)} className="text-xs font-semibold tracking-[0.16em] text-white/70 hover:text-white">← LAYERS OVERVIEW</button>
          <span className="font-display text-sm font-bold tracking-wide">AURORA LAYERS</span>
          <span className="w-24" />
        </div>
        <AuroraLayersStudio />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0711] text-white">
      <header className="relative z-20 flex min-h-12 items-center justify-between border-b border-white/10 bg-[#08060b]/95 px-4 sm:px-8">
        <a href="/" className="font-serif text-sm tracking-wide text-white/90">Directors Room</a>
        <nav aria-label="Aurora navigation" className="hidden items-center gap-1 overflow-x-auto md:flex">
          {nav.map((item) => <a key={item.label} href={item.href} aria-current={item.active ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] transition ${item.active ? "bg-white text-[#17111d]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>{item.label}</a>)}
        </nav>
        <Button onClick={() => setOpenStudio(true)} className="h-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 text-xs font-bold text-white hover:brightness-110">Open Studio</Button>
      </header>

      <section className="relative isolate min-h-[760px] border-b border-white/10 sm:min-h-[820px]">
        <img src={heroTriptych} alt="" aria-hidden className="absolute inset-0 -z-20 size-full object-cover object-center opacity-55" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,5,16,.96)_0%,rgba(13,7,23,.79)_48%,rgba(9,5,16,.56)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#0b0711_0%,transparent_40%,rgba(7,4,12,.3)_100%)]" />
        <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-10 lg:min-h-[710px] lg:grid-cols-[.92fr_1.08fr] lg:px-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-black/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.25em] text-fuchsia-200">
              <span>Director’s Room</span><span className="text-white/30">·</span><span>Aurora Layers</span>
            </div>
            <h1 className="font-serif text-[clamp(3.8rem,10vw,8.8rem)] font-black leading-[.83] tracking-[-.055em]">
              <span className="block">One frame.</span>
              <span className="block bg-gradient-to-r from-[#be67ff] via-[#ef69c6] to-[#9f65ff] bg-clip-text text-transparent">Infinite</span>
              <span className="block bg-gradient-to-r from-[#d575ff] to-[#a84fea] bg-clip-text text-transparent">layers.</span>
            </h1>
            <p className="mt-7 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
              Turn a flat image into an editable performance. Change the wardrobe, jewelry, light, or motion while the identity, pose, and frame stay locked.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button onClick={() => setOpenStudio(true)} className="h-11 rounded-full bg-white px-6 text-[11px] font-extrabold uppercase tracking-[.12em] text-[#17111d] hover:bg-fuchsia-100">Open Studio <ArrowUpRight className="ml-2 size-4" /></Button>
              <a href="#layers-examples" className="rounded-full border border-white/25 px-5 py-3 text-[10px] font-bold uppercase tracking-[.13em] text-white/85 transition hover:border-fuchsia-300 hover:text-white">See the layers</a>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {[["Identity stays locked", "Face, pose and frame"], ["Edit one element", "Wardrobe, light, props"], ["Keep creating", "Every result joins your timeline"]].map(([title, copy]) => <div key={title} className="border-l border-fuchsia-400/60 pl-3"><p className="text-xs font-semibold text-white">{title}</p><p className="mt-1 text-[11px] leading-4 text-white/50">{copy}</p></div>)}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[520px] lg:ml-auto">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#17101f]/80 p-2 shadow-[0_20px_100px_rgba(125,40,180,.28)] backdrop-blur">
              <div className="relative aspect-[4/4.2] overflow-hidden rounded-[1.15rem] bg-black">
                <img src={examples[activeExample].image} alt={examples[activeExample].label + " layer preview"} className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                  <img src={tileLayers} alt="Original frame before the layer edit" className="size-full object-cover" />
                </div>
                <div className="absolute inset-y-0 w-px bg-white shadow-[0_0_16px_rgba(0,0,0,.8)]" style={{ left: `${split}%` }} />
                <span className="absolute left-3 top-3 rounded-full bg-fuchsia-600/90 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[.2em]">Upload</span>
                <span className="absolute right-3 top-3 rounded-full bg-fuchsia-600/90 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[.2em]">One sentence later</span>
                <label className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-full border border-white/15 bg-[#100a18]/90 px-4 py-2.5 backdrop-blur">
                  <span className="text-fuchsia-300">✦</span><span className="min-w-0 flex-1 truncate text-xs text-white/85">{examples[activeExample].label === "Original frame" ? "ice him out — keep everything else locked" : `Change only the ${examples[activeExample].label.toLowerCase()}`}</span>
                  <span aria-hidden className="size-6 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500" />
                  <input aria-label="Before and after comparison" type="range" min={10} max={90} value={split} onChange={(e) => setSplit(Number(e.target.value))} className="absolute inset-x-0 -bottom-3 h-1 cursor-ew-resize opacity-0" />
                </label>
              </div>
              <div className="flex items-center justify-between px-3 py-3 text-[10px] text-white/55"><span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-3 text-fuchsia-300" /> Identity and framing protected</span><span>{split}% comparison</span></div>
            </div>
          </div>
        </div>

        <div id="layers-examples" className="mx-auto grid max-w-[1120px] grid-cols-2 gap-3 px-5 pb-12 sm:grid-cols-5 sm:px-10">
          {examples.map((example, index) => <button key={example.label} onClick={() => setActiveExample(index)} aria-pressed={activeExample === index} className={`group relative aspect-[1.4/1] overflow-hidden rounded-lg border transition ${activeExample === index ? "border-fuchsia-400 shadow-[0_0_18px_rgba(210,90,255,.28)]" : "border-white/10 opacity-75 hover:opacity-100"}`}><img src={example.image} alt={example.label} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pb-2 pt-6 text-left text-[10px] font-semibold">{example.label}</span></button>)}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-8 px-5 py-20 sm:px-10 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className="font-mono text-[10px] uppercase tracking-[.26em] text-fuchsia-300">The best of the frame never moves</p><h2 className="mt-4 font-serif text-4xl font-black leading-[.95] sm:text-6xl">Change one thing.<br/><span className="text-fuchsia-400">Everything else stays.</span></h2><p className="mt-5 max-w-md text-sm leading-6 text-white/60">Use a source photo, lock the identity, and direct Aurora to edit one named layer. Your original stays intact and every render can join the shared timeline.</p><Button onClick={() => setOpenStudio(true)} variant="outline" className="mt-6 rounded-full border-fuchsia-300/40 text-white hover:bg-fuchsia-500/15">Start a layer edit <ArrowDown className="ml-2 size-4" /></Button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [Layers3, "Upload. Name the element.", "Start from a photo and choose the exact part you want changed."],
            [LockKeyhole, "Lock what matters.", "Protect identity, pose, camera, and framing while the target changes."],
            [Sparkles, "Direct it in one sentence.", "Pick a preset or write a focused prompt for wardrobe, light, hair, or props."],
            [ArrowUpRight, "Keep the result moving.", "Save a shoot, export layers, or add the generated frame to your timeline."],
          ].map(([Icon, title, copy]) => <article key={String(title)} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><Icon className="size-5 text-fuchsia-300"/><h3 className="mt-4 text-sm font-bold">{String(title)}</h3><p className="mt-2 text-xs leading-5 text-white/55">{String(copy)}</p></article>)}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#100a18] px-5 py-14 text-center">
        <p className="text-sm text-white/55">Same person. Same frame. Your direction.</p>
        <Button onClick={() => setOpenStudio(true)} className="mt-4 h-11 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-7 font-bold text-white">Open Aurora Layers</Button>
      </section>
    </main>
  );
}
