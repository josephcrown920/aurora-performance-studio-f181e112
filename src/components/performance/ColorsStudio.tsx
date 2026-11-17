import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorStudioBackdrop } from "@/components/studio/ColorStudioBackdrop";
import { COLOR_PRESETS } from "@/lib/colors.presets";
import { PerformanceVariantWorkflow } from "@/components/performance/PerformanceVariantWorkflow";
import { useAuth } from "@/hooks/use-auth";

export function ColorsStudio({ initialColor }: { initialColor?: string }) {
  const { user } = useAuth();
  const [colorId, setColorId] = useState(initialColor ?? "royal-blue");
  const preset = COLOR_PRESETS.find(color => color.id === colorId) ?? COLOR_PRESETS[1];
  return <main className="min-h-screen bg-background pb-24 text-foreground">
    <header className="flex items-center gap-3 border-b border-border px-5 pb-5 pt-28 md:pt-12">
      <Button asChild variant="ghost" size="icon"><Link to="/create" aria-label="Back to Create"><ArrowLeft /></Link></Button>
      <h1 className="font-display text-3xl">Colors Studio</h1>
    </header>
    <section className="mx-auto max-w-6xl px-5 py-6">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <ColorStudioBackdrop colorId={preset.id} label={`${preset.name} cyclorama studio`} />
      </div>
      <fieldset className="mt-5"><legend className="mb-3 text-sm font-semibold">Studio palette</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COLOR_PRESETS.map(color => <Button key={color.id} variant={preset.id === color.id ? "default" : "outline"} aria-pressed={preset.id === color.id} onClick={() => setColorId(color.id)}>{color.name}</Button>)}
        </div>
      </fieldset>
    </section>
    <section className="mx-auto max-w-6xl border-t border-border px-5 py-6" aria-label="Colors performance">
      {user ? <PerformanceVariantWorkflow key={preset.id} kind="build_scene" mode="colors" studioLocation={`${preset.promptName} seamless cyclorama color studio`} compact /> : <Button asChild><Link to="/auth" search={{ next: `/colors?color=${preset.id}` }}>Sign in to create</Link></Button>}
    </section>
  </main>;
}