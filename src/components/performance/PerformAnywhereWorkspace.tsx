import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Film, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PerformanceVariantWorkflow } from "@/components/performance/PerformanceVariantWorkflow";
import { PerformanceSourceStrip } from "@/components/performance/PerformanceSourceStrip";
import { GetReadyWithMeWorkflow } from "@/components/performance/GetReadyWithMeWorkflow";
import { PerformWorlds } from "@/components/performance/PerformWorlds";
import studioClip from "@/assets/josh/generated/clip-05-studio-gel.webm";
import studioPoster from "@/assets/josh/generated/still-05-studio-gel.jpg";
import micScene from "@/assets/environments/mic/mic-street.jpg.asset.json";
import klingRender from "@/assets/perform/motion-kling.mp4.asset.json";
import wanRender from "@/assets/perform/motion-wan.mp4.asset.json";

function PhoneRecordingSlot({ active, onActivate }: { active: boolean; onActivate: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  return (
    <article className={`performance-example ${active ? "workspace-active" : ""}`}>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (url) URL.revokeObjectURL(url);
          setUrl(URL.createObjectURL(file));
          setName(file.name);
          onActivate();
        }}
      />
      {url ? (
        <video src={url} controls playsInline preload="metadata" aria-label="Performance recording" onPlay={onActivate} />
      ) : (
        <Button
          variant="outline"
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground transition hover:text-foreground"
        >
          <Smartphone size={22} />
          <span className="px-3 text-center text-xs">Record or pick a phone clip</span>
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() => (url ? onActivate() : inputRef.current?.click())}
        aria-pressed={active}
        className="h-11 w-full justify-start whitespace-normal text-left text-xs"
      >
        {name ? `Performance — ${name}` : "Performance"}
      </Button>
    </article>
  );
}

export function PerformAnywhereWorkspace({ grwm, onExperienceChange, embedded = false, hideWorlds = false }: { grwm: boolean; onExperienceChange: (grwm: boolean) => void; embedded?: boolean; hideWorlds?: boolean }) {
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  useEffect(() => { if (grwm) document.getElementById("pa-grwm")?.scrollIntoView({ block: "start" }); }, [grwm]);
  void onExperienceChange;
  return <main className={`workspace-duo text-foreground ${embedded ? "" : "min-h-screen pb-24"}`}>
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {!embedded && <Link to="/studio" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15} />Studio</Link>}
      <header className="workspace-heading"><h1>PERFORM ANYWHERE</h1><span>Environment swap</span></header>
      <nav aria-label="Perform Anywhere features" className="mt-4 flex flex-wrap gap-2">
        {[["pa-scene","Build a scene"],["pa-luxury","Luxury interior"],["pa-twoangle","Two-angle"],["pa-grwm","Get Ready With Me"]].map(([id,label]) => <Button key={id} variant="outline" size="sm" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>{label}</Button>)}
      </nav>
      <div className="perform-workspace-grid mt-5">
        <section aria-label="Performance examples" className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Performance examples</h2><span className="text-xs text-muted-foreground">Scene → phone → final</span></div>
          <div className="grid grid-cols-3 gap-2">
            <article className={`performance-example ${active === 0 ? "workspace-active" : ""}`}>
              <img src={micScene.url} alt="Scene with a hanging mic to perform at" className="aspect-video w-full rounded-md object-cover" onClick={() => setActive(0)} />
              <Button variant="ghost" onClick={() => setActive(0)} aria-pressed={active === 0} className="h-11 w-full justify-start whitespace-normal text-left text-xs">Scene at the mic</Button>
            </article>
            <PhoneRecordingSlot active={active === 1} onActivate={() => setActive(1)} />
            <article className={`performance-example ${active === 2 ? "workspace-active" : ""}`}>
              <video src={studioClip} poster={studioPoster} controls playsInline preload="metadata" aria-label="Final render" onPlay={() => setActive(2)} />
              <Button variant="ghost" onClick={() => setActive(2)} aria-pressed={active === 2} className="h-11 w-full justify-start whitespace-normal text-left text-xs">Final render</Button>
            </article>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2" aria-label="Real motion renders">
            {[[klingRender.url, "Kling 2.6 · real 5s render"], [wanRender.url, "Wan 2.2 · real 5s render"]].map(([src, label]) => (
              <figure key={label} className="performance-example">
                <video src={src} controls playsInline preload="metadata" aria-label={label} className="aspect-[9/16] w-full rounded-md object-cover" />
                <figcaption className="px-1 py-2 text-xs text-muted-foreground">{label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-border py-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><Film size={14} />Your scene. Your performance.</span><Button asChild size="sm" variant="outline"><Link to="/motion">Motion controls<ArrowUpRight size={13} /></Link></Button></div>
        </section>
        <section id="pa-scene" aria-label="Build your performance" className="min-w-0 scroll-mt-20">
          {user ? <PerformanceVariantWorkflow kind="build_scene" mode="anywhere" compact /> : <>
            <PerformanceSourceStrip references={{}} phoneVideoUrl={null} />
            <h2 className="mt-5 font-display text-3xl">BUILD YOUR SCENE</h2>
            <div className="mt-4 grid grid-cols-2 gap-2"><Button asChild><Link to="/colors-show" search={{ mode: "anywhere", flow: "build_scene" }}>Start performance<ArrowUpRight size={14} /></Link></Button><Button asChild variant="outline"><Link to="/scene-builder">Scene Builder</Link></Button></div>
          </>}
        </section>
      </div>
      <section id="pa-luxury" aria-label="Luxury interior" className="mt-10 scroll-mt-20 border-t border-border pt-6">
        {user ? <PerformanceVariantWorkflow kind="luxury_interior" mode="anywhere" compact /> : <>
          <h2 className="font-display text-3xl">LUXURY INTERIOR</h2>
          <p className="mt-1 text-sm text-muted-foreground">Film yourself seated anywhere — Aurora rebuilds the world as a Maybach, Rolls-Royce or private jet.</p>
          <Button asChild className="mt-3"><Link to="/colors-show" search={{ mode: "anywhere", flow: "luxury_interior" }}>Start luxury interior<ArrowUpRight size={14} /></Link></Button>
        </>}
      </section>
      <section id="pa-twoangle" aria-label="Two-angle workflow" className="mt-10 scroll-mt-20 border-t border-border pt-6">
        <h2 className="font-display text-3xl">TWO-ANGLE WORKFLOW</h2>
        <p className="mt-1 text-sm text-muted-foreground">One wide and one close-up shot of you at the mic, then animate both with your phone performance.</p>
        <Button asChild className="mt-3"><Link to="/colors-show" search={{ mode: "anywhere" }}>Open two-angle workflow<ArrowUpRight size={14} /></Link></Button>
      </section>
      <section id="pa-grwm" aria-label="Get Ready With Me" className="mt-10 scroll-mt-20 border-t border-border pt-6">
        <h2 className="mb-4 font-display text-3xl">GET READY WITH ME</h2>
        <GetReadyWithMeWorkflow />
      </section>
      {!hideWorlds && <PerformWorlds />}
      </div>

  </main>;
}
