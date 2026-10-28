import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Layers3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLOR_PRESETS } from "@/lib/colors.presets";
import worlds from "@/assets/me/colors-worlds.jpg.asset.json";
import identity from "@/assets/me/identity.jpg.asset.json";

// Order of the 12 sets in the 3x4 reference sheet, mapped to Colors preset ids.
const SHEET = ["hot-pink", "royal-blue", "neon-green", "sunset-orange", "electric-purple", "cyber-yellow", "crimson-red", "ice-white", "obsidian", "aqua", "rose-gold", "lime-pop"];

function tileStyle(i: number) {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return { backgroundImage: `url(${worlds.url})`, backgroundSize: "300% 400%", backgroundPosition: `${col * 50}% ${(row * 100) / 3}%` };
}

/** Colors cyclorama sets as selectable Perform Anywhere worlds, plus a live depth guide preview. */
export function PerformWorlds() {
  const [pick, setPick] = useState(4);
  const preset = COLOR_PRESETS.find((p) => p.id === SHEET[pick]);
  const name = preset?.name ?? SHEET[pick];
  const [depth, setDepth] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const buildDepth = async () => {
    setBusy(true); setErr(null);
    try {
      const { estimateDepthMap } = await import("@/lib/depth-anything");
      const { previewUrl } = await estimateDepthMap(new URL(identity.url, window.location.origin).href);
      setDepth(previewUrl);
    } catch (e) { setErr(e instanceof Error ? e.message : "Depth guide failed"); }
    finally { setBusy(false); }
  };

  return <section aria-label="Choose your world" className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-2xl">PICK YOUR WORLD</h2><span className="text-xs text-muted-foreground">12 color sets</span></div>
      <div className="workspace-active relative aspect-video overflow-hidden rounded-lg border border-border" style={tileStyle(pick)}>
        <img src={identity.url} alt="Your identity reference" className="absolute bottom-0 left-1/2 h-[88%] -translate-x-1/2 rounded-t-md object-cover opacity-95 shadow-2xl" />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold">{name} · Perform Anywhere</span>
      </div>
      <div role="radiogroup" aria-label="Color world" className="mt-2 grid grid-cols-6 gap-1.5">
        {SHEET.map((id, i) => <button key={id} type="button" role="radio" aria-checked={pick === i} aria-label={COLOR_PRESETS.find((p) => p.id === id)?.name ?? id} onClick={() => setPick(i)} style={tileStyle(i)} className={`aspect-video rounded border-2 transition ${pick === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`} />)}
      </div>
      <Button asChild size="sm" className="mt-3"><Link to="/colors">Perform in {name}<ArrowUpRight size={14} /></Link></Button>
    </div>
    <div className="min-w-0 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2"><Layers3 size={16} className="text-primary" /><h3 className="text-sm font-bold">Depth guide · Depth Anything → Genjutsu</h3></div>
      <p className="mt-1 text-xs text-muted-foreground">The depth map locks your body and space so the new world wraps around you. Runs free in your browser.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <figure><img src={identity.url} alt="Source photo" className="aspect-[3/4] w-full rounded object-cover" /><figcaption className="mt-1 text-center text-[11px] text-muted-foreground">Your photo</figcaption></figure>
        <figure>{depth ? <img src={depth} alt="Depth map of your photo" className="aspect-[3/4] w-full rounded object-cover" /> : <div className="flex aspect-[3/4] w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">{busy ? <Loader2 className="animate-spin" /> : "Depth map"}</div>}<figcaption className="mt-1 text-center text-[11px] text-muted-foreground">Depth guide</figcaption></figure>
      </div>
      <Button size="sm" variant="outline" className="mt-3 w-full" disabled={busy} onClick={() => void buildDepth()}>{busy ? "Building depth…" : depth ? "Rebuild depth guide" : "See the depth guide"}</Button>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  </section>;
}
