import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PerformanceVariantWorkflow } from "@/components/performance/PerformanceVariantWorkflow";
import { PerformanceSourceStrip } from "@/components/performance/PerformanceSourceStrip";
import { GetReadyWithMeWorkflow } from "@/components/performance/GetReadyWithMeWorkflow";
import { GenjutsuFinishing } from "@/components/performance/GenjutsuFinishing";
import { PerformWorlds } from "@/components/performance/PerformWorlds";
import "@/components/performance/genjutsu.css";
import heroStill from "@/assets/genjutsu/performance.jpg.asset.json";
import heroClip from "@/assets/genjutsu/performance.mp4.asset.json";
import motionStill from "@/assets/genjutsu/motion.jpg.asset.json";
import frameStill from "@/assets/genjutsu/frame.jpg.asset.json";
import klingRender from "@/assets/perform/motion-kling.mp4.asset.json";
import wanRender from "@/assets/perform/motion-wan.mp4.asset.json";

type AddAsset = (url: string, kind: "image" | "video", name: string, place?: boolean) => void;

const TABS = ["Your references", "Your creative direction", "One connected workflow"] as const;
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export function PerformAnywhereWorkspace({ grwm, onExperienceChange, embedded = false, hideWorlds = false, onAsset }: { grwm: boolean; onExperienceChange: (grwm: boolean) => void; embedded?: boolean; hideWorlds?: boolean; onAsset?: AddAsset }) {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  useEffect(() => { if (grwm) document.getElementById("pa-grwm")?.scrollIntoView({ block: "start" }); }, [grwm]);
  const gallery = [
    { key: "perform", eyebrow: "Perform Anywhere", title: "One performance. Any world.", media: <video src={heroClip.url} poster={heroStill.url} muted loop autoPlay playsInline aria-label="Genjutsu performance example" /> },
    { key: "source", eyebrow: "01 / Source video", title: "Capture the motion", media: <img src={motionStill.url} alt="Phone performance used as the motion source" loading="lazy" /> },
    { key: "frame", eyebrow: "02 / Reference frame", title: "Build the new look", media: <img src={frameStill.url} alt="Reference frame of the new scene" loading="lazy" /> },
  ];
  const ordered = [...gallery.slice(tab), ...gallery.slice(0, tab)];

  return <main className={`genjutsu ${embedded ? "" : "min-h-screen pb-24"}`}>
    <div className="genjutsu-inner">
      <header className="genjutsu-nav">
        <div className="flex items-center gap-3">
          {!embedded && <Link to="/studio" aria-label="Back to Studio" className="text-muted-foreground"><ArrowLeft size={16} /></Link>}
          <strong>GENJUTSU · AURORA</strong>
        </div>
        <nav aria-label="Genjutsu sections">
          {[["pa-scene", "Create"], ["pa-luxury", "Luxury interior"], ["pa-grwm", "Get Ready With Me"], ["pa-finish", "Lip sync"], ["pa-costs", "Costs"]].map(([id, label]) => <Button key={id} size="sm" variant="ghost" onClick={() => go(id)}>{label}</Button>)}
        </nav>
      </header>

      <section className="genjutsu-hero" aria-label="Genjutsu">
        <img src={heroStill.url} alt="Artist performing at a mic in a new world" />
        <div className="genjutsu-hero-content">
          <p className="genjutsu-eyebrow">BY ARTISTS, FOR ARTISTS · AURORA</p>
          <h1>YOUR PERFORMANCE. <span>A NEW WORLD.</span></h1>
          <p>Build the look, choose the world, then let your performance drive the finished scene.</p>
          <div className="genjutsu-actions">
            <Button onClick={() => go("pa-scene")}>Start creating<ArrowUpRight size={14} /></Button>
            <Button variant="outline" onClick={() => { onExperienceChange(true); go("pa-grwm"); }}>Get Ready With Me</Button>
            <Button asChild variant="ghost"><Link to="/library">My drafts</Link></Button>
          </div>
        </div>
      </section>

      <div className="genjutsu-tabs" role="tablist" aria-label="Genjutsu showcase">
        {TABS.map((label, i) => <Button key={label} role="tab" aria-selected={tab === i} size="sm" variant={tab === i ? "secondary" : "ghost"} onClick={() => setTab(i)}>{label}</Button>)}
      </div>
      <div className="genjutsu-gallery">
        {ordered.map((g) => <article key={g.key}>{g.media}<figcaption><small>{g.eyebrow.toUpperCase()}</small><strong>{g.title}</strong></figcaption></article>)}
      </div>

      <section className="genjutsu-band" aria-label="How Genjutsu works">
        <p className="genjutsu-eyebrow">FROM PHONE TAKE TO CREATIVE DIRECTION</p>
        <h2>Build the scene. Bring your performance.</h2>
        <div className="genjutsu-directions">
          {[["01 / DIRECT", "Make the world yours.", "Choose your identity, outfit, location and pose.", "Build a scene", "pa-scene"],
            ["02 / PERFORM", "Keep the energy.", "Add your phone performance — Genjutsu drives the scene with it.", "Open Genjutsu", "pa-scene"],
            ["03 / RESTYLE", "Change the look.", "Explore wardrobe and scene direction with Get Ready With Me.", "Explore GRWM", "pa-grwm"],
            ["04 / FINISH", "Your song in the final cut.", "Optional lip sync swaps in the song you want to promote.", "Add lip sync", "pa-finish"]].map(([n, h, p, cta, id]) => (
            <article key={n}><p className="genjutsu-eyebrow">{n}</p><h3>{h}</h3><p>{p}</p><Button size="sm" variant="outline" onClick={() => go(id)}>{cta}<ArrowUpRight size={13} /></Button></article>
          ))}
        </div>
      </section>

      <section id="pa-scene" aria-label="Build your scene" className="genjutsu-band scroll-mt-20">
        <p className="genjutsu-eyebrow">STEP 01 – 02 · SCENE + MOTION</p>
        <h2>Bring the take. Direct what happens next.</h2>
        <div className="mt-6">
          {user ? <PerformanceVariantWorkflow kind="build_scene" mode="anywhere" compact /> : <>
            <PerformanceSourceStrip references={{}} phoneVideoUrl={null} />
            <div className="genjutsu-actions"><Button asChild><Link to="/auth" search={{ next: "/perform-anywhere" }}>Sign in to start your scene<ArrowUpRight size={14} /></Link></Button><Button asChild variant="outline"><Link to="/scene-builder">Scene Builder</Link></Button></div>
          </>}
        </div>
      </section>

      <section aria-label="Real motion renders" className="genjutsu-band">
        <p className="genjutsu-eyebrow">REAL GENJUTSU RENDERS · KIE</p>
        <h2>More performances. More possibilities.</h2>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {[[klingRender.url, "Kling 2.6 · 5s render"], [wanRender.url, "Wan 2.2 · 5s render"]].map(([src, label]) => (
            <figure key={label} className="overflow-hidden rounded-lg bg-card">
              <video src={src} controls playsInline preload="metadata" aria-label={label} className="aspect-[9/16] w-full object-cover" />
              <figcaption className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground"><Play size={12} />{label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="pa-luxury" aria-label="Luxury interior" className="genjutsu-band scroll-mt-20">
        <p className="genjutsu-eyebrow">SCENE PRESET</p>
        {user ? <PerformanceVariantWorkflow kind="luxury_interior" mode="anywhere" compact /> : <>
          <h2>Luxury interior.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Film yourself seated anywhere — Genjutsu rebuilds the world as a Maybach, Rolls-Royce or private jet.</p>
          <div className="genjutsu-actions"><Button asChild><Link to="/auth" search={{ next: "/perform-anywhere" }}>Sign in to start<ArrowUpRight size={14} /></Link></Button></div>
        </>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Two-angle workflow: one wide and one close-up shot, both driven by your phone take.</span>
          <Button asChild size="sm" variant="outline"><Link to="/colors-show" search={{ mode: "anywhere" }}>Open two-angle workflow<ArrowUpRight size={13} /></Link></Button>
        </div>
      </section>

      <section id="pa-grwm" aria-label="Get Ready With Me" className="genjutsu-band scroll-mt-20">
        <p className="genjutsu-eyebrow">GET READY WITH ME · POWERED BY GENJUTSU</p>
        <h2 className="mb-6">Restyle the look. Keep the moment.</h2>
        <GetReadyWithMeWorkflow />
      </section>

      <div id="pa-finish" className="scroll-mt-20"><GenjutsuFinishing onAsset={onAsset} /></div>

      <section id="pa-costs" aria-label="Costs" className="genjutsu-band scroll-mt-20">
        <p className="genjutsu-eyebrow">PLAN YOUR SESSION</p>
        <h2>Explore first. Review costs before rendering.</h2>
        <div className="genjutsu-directions">
          <article><p className="genjutsu-eyebrow">EXPLORE</p><h3>Free to prepare</h3><p>Upload references, set up motion and save drafts without spending Aura.</p></article>
          <article><p className="genjutsu-eyebrow">RENDER</p><h3>Pay per render</h3><p>Each render shows its Aura price first. Cost depends on model, length and resolution.</p></article>
          <article><p className="genjutsu-eyebrow">CONTROL</p><h3>Your budget comes first</h3><p>Nothing renders until you confirm. Finished videos land in your drafts and the video editor.</p></article>
        </div>
      </section>

      {!hideWorlds && <PerformWorlds />}
    </div>
  </main>;
}
