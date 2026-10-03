import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PerformanceVariantWorkflow } from "@/components/performance/PerformanceVariantWorkflow";
import { PerformanceSourceStrip } from "@/components/performance/PerformanceSourceStrip";

export const Route = createLazyFileRoute("/perform-anywhere")({ component: PerformAnywhere });
import streetClip from "@/assets/josh/generated/clip-15-alley-neon.webm";
import streetPoster from "@/assets/josh/generated/still-15-alley-neon.jpg";
import studioClip from "@/assets/josh/generated/clip-05-studio-gel.webm";
import studioPoster from "@/assets/josh/generated/still-05-studio-gel.jpg";
const EXAMPLES = [
  { label: "Neon street", src: streetClip, poster: streetPoster },
  { label: "Studio performance", src: studioClip, poster: studioPoster },
];
function PerformAnywhere() {
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  return <main className="workspace-duo min-h-screen pb-24 text-foreground">
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <Link to="/studio" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15} />Studio</Link>
      <header className="workspace-heading"><h1>PERFORM ANYWHERE</h1><span>Environment swap</span></header>
      <div className="perform-workspace-grid mt-5">
        <section aria-label="Performance examples" className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Performance examples</h2><span className="text-xs text-muted-foreground">Existing Aurora clips</span></div>
          <div className="grid grid-cols-2 gap-3">
            {EXAMPLES.map((example, index) => <article key={example.src} className={`performance-example ${active === index ? "workspace-active" : ""}`}>
              <video src={example.src} poster={example.poster} controls playsInline preload="metadata" aria-label={example.label} onPlay={() => setActive(index)} />
              <Button variant="ghost" onClick={() => setActive(index)} aria-pressed={active === index} className="h-11 w-full justify-start whitespace-normal text-left text-xs">{example.label}</Button>
            </article>)}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-border py-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><Film size={14} />Your scene. Your performance.</span><Button asChild size="sm" variant="outline"><Link to="/motion">Motion controls<ArrowUpRight size={13} /></Link></Button></div>
        </section>
        <section aria-label="Build your performance" className="min-w-0">
          {user ? <PerformanceVariantWorkflow kind="build_scene" mode="anywhere" compact /> : <>
            <PerformanceSourceStrip references={{}} phoneVideoUrl={null} />
            <h2 className="mt-5 font-display text-3xl">BUILD YOUR SCENE</h2>
            <div className="mt-4 grid grid-cols-2 gap-2"><Button asChild><Link to="/colors-show" search={{ mode: "anywhere", flow: "build_scene" }}>Start performance<ArrowUpRight size={14} /></Link></Button><Button asChild variant="outline"><Link to="/scene-builder">Scene Builder</Link></Button></div>
          </>}
        </section>
      </div>
    </div>
  </main>;
}
