import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Download, Layers3, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLOR_PRESETS } from "@/lib/colors.presets";
import worlds from "@/assets/me/colors-worlds.jpg.asset.json";
import identity from "@/assets/nba-josh/full-body.jpg.asset.json";
import performer from "@/assets/nba-josh/performance-cutout.png";

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
  // The creator's own photo (object URL) replaces the NBA Josh sample when picked.
  const [source, setSource] = useState<string | null>(null);
  useEffect(() => () => { if (depth) URL.revokeObjectURL(depth); }, [depth]);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  const sourceUrl = source ?? identity.url;

  const buildDepth = async (from = sourceUrl) => {
    setBusy(true); setErr(null);
    try {
      const { estimateDepthMap } = await import("@/lib/depth-anything");
      const { previewUrl } = await estimateDepthMap(from.startsWith("blob:") ? from : new URL(from, window.location.origin).href);
      setDepth(previewUrl);
    } catch (e) { setErr(e instanceof Error ? e.message : "Depth guide failed"); }
    finally { setBusy(false); }
  };

  return <section aria-label="Choose your world" className="mt-6 grid gap-4 md:grid-cols-[3fr_2fr]">
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-2xl">PICK YOUR WORLD</h2><span className="text-xs text-muted-foreground">12 color sets</span></div>
      <div className="workspace-active relative aspect-video overflow-hidden rounded-lg border border-border" style={tileStyle(pick)}>
        <img src={performer} alt="NBA Josh performance look — scene preview" className="absolute bottom-0 left-1/2 h-[96%] -translate-x-1/2 object-contain" />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold">{name} · Perform Anywhere</span>
      </div>
      <div role="radiogroup" aria-label="Color world" className="mt-2 grid grid-cols-6 gap-1.5">
        {SHEET.map((id, i) => <Button key={id} variant="ghost" type="button" role="radio" aria-checked={pick === i} aria-label={COLOR_PRESETS.find((p) => p.id === id)?.name ?? id} onClick={() => setPick(i)} style={tileStyle(i)} className={`aspect-video h-auto p-0 rounded border-2 transition ${pick === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`} />)}
      </div>
      <Button asChild size="sm" className="mt-3"><Link to="/colors" search={{ color: SHEET[pick] }}>Perform in {name}<ArrowUpRight size={14} /></Link></Button>
    </div>
    <div className="min-w-0 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2"><Layers3 size={16} className="text-primary" /><h3 className="text-sm font-bold">Depth guide · Depth Anything → Genjutsu</h3></div>
      <p className="mt-1 text-xs text-muted-foreground">{source ? "Your photo" : "NBA Josh sample"} · free, runs on your device. Use the guide as the Pose reference when you build your scene.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <figure><img src={sourceUrl} alt="Source photo" className="aspect-[3/4] w-full rounded bg-muted object-contain" /><figcaption className="mt-1 text-center text-[11px] text-muted-foreground">Photo</figcaption></figure>
        <figure>{depth ? <img src={depth} alt="Depth map of your photo" className="aspect-[3/4] w-full rounded bg-muted object-contain" /> : <div className="flex aspect-[3/4] w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">{busy ? <Loader2 className="animate-spin" /> : "Depth map"}</div>}<figcaption className="mt-1 text-center text-[11px] text-muted-foreground">Depth guide</figcaption></figure>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label htmlFor="depth-photo" className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted"><Upload size={14} />Use my photo</label>
        <input id="depth-photo" type="file" accept="image/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (!file) return; const url = URL.createObjectURL(file); setSource(url); setDepth(null); void buildDepth(url); }} />
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void buildDepth()}>{busy ? "Building depth…" : depth ? "Rebuild" : "Build depth guide"}</Button>
      </div>
      {depth && <Button asChild size="sm" variant="ghost" className="mt-2 w-full"><a href={depth} download="depth-guide.png"><Download size={14} />Download depth guide</a></Button>}
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  </section>;
}
