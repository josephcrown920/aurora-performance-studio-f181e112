import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Film, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PerformanceVariantWorkflow } from "@/components/performance/PerformanceVariantWorkflow";
import { PerformanceSourceStrip } from "@/components/performance/PerformanceSourceStrip";
import { GetReadyWithMeWorkflow } from "@/components/performance/GetReadyWithMeWorkflow";
import { PerformWorlds } from "@/components/performance/PerformWorlds";
import studioClip from "@/assets/josh/generated/clip-05-studio-gel.webm";
import studioPoster from "@/assets/josh/generated/still-05-studio-gel.jpg";

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

export function PerformAnywhereWorkspace({ grwm, onExperienceChange, embedded = false }: { grwm: boolean; onExperienceChange: (grwm: boolean) => void; embedded?: boolean }) {
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  return <main className={`workspace-duo text-foreground ${embedded ? "" : "min-h-screen pb-24"}`}>
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {!embedded && <Link to="/studio" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15} />Studio</Link>}
      <header className="workspace-heading"><h1>PERFORM ANYWHERE</h1><span>Environment swap</span></header>
      <div role="group" aria-label="Performance experience" className="mt-4 flex flex-wrap gap-2"><Button variant={!grwm ? "default" : "outline"} aria-pressed={!grwm} onClick={() => onExperienceChange(false)}>Performance</Button><Button variant={grwm ? "default" : "outline"} aria-pressed={grwm} onClick={() => onExperienceChange(true)}>Get Ready With Me</Button></div>
      <div className="perform-workspace-grid mt-5">
        <section aria-label="Performance examples" className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Performance examples</h2><span className="text-xs text-muted-foreground">Existing Aurora clips</span></div>
          <div className="grid grid-cols-2 gap-3">
            <article className={`performance-example ${active === 0 ? "workspace-active" : ""}`}>
              <video src={studioClip} poster={studioPoster} controls playsInline preload="metadata" aria-label="Studio performance" onPlay={() => setActive(0)} />
              <Button variant="ghost" onClick={() => setActive(0)} aria-pressed={active === 0} className="h-11 w-full justify-start whitespace-normal text-left text-xs">Studio performance</Button>
            </article>
            <PhoneRecordingSlot active={active === 1} onActivate={() => setActive(1)} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-border py-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><Film size={14} />Your scene. Your performance.</span><Button asChild size="sm" variant="outline"><Link to="/motion">Motion controls<ArrowUpRight size={13} /></Link></Button></div>
        </section>
        <section aria-label="Build your performance" className="min-w-0">
          {grwm ? <GetReadyWithMeWorkflow /> : user ? <PerformanceVariantWorkflow kind="build_scene" mode="anywhere" compact /> : <>
            <PerformanceSourceStrip references={{}} phoneVideoUrl={null} />
            <h2 className="mt-5 font-display text-3xl">BUILD YOUR SCENE</h2>
            <div className="mt-4 grid grid-cols-2 gap-2"><Button asChild><Link to="/colors-show" search={{ mode: "anywhere", flow: "build_scene" }}>Start performance<ArrowUpRight size={14} /></Link></Button><Button asChild variant="outline"><Link to="/scene-builder">Scene Builder</Link></Button></div>
          </>}
        </section>
      </div>
      {!grwm && <PerformWorlds />}
      </div>

  </main>;
}
