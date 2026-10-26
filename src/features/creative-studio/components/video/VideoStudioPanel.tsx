import { useEffect, useRef, useState } from "react";
import { Clapperboard, Download, Loader2, Pause, Play, SkipBack, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Board } from "@/lib/board-store";
import { chainOrder } from "@/lib/board-store";
import { fmtTime, loadTimeline, type TimelineDoc } from "@/features/creative-studio/lib/timeline-state";
import { appendShotsToTimeline, clipAt } from "@/features/creative-studio/lib/board-timeline";
import { downloadBlob, renderTimeline } from "@/features/creative-studio/lib/timeline-render";
import { MultiTrackTimeline } from "./MultiTrackTimeline";
import { LayersEditor } from "./LayersEditor";
import { StudioDirectorPanel } from "./StudioDirectorPanel";
import { ProductionPlanPanel } from "./ProductionPlanPanel";
import { EffectsPresetsDrawer } from "./EffectsPresetsDrawer";
import type { ShotNode } from "@/lib/board-store";
import "@/features/creative-studio/editor-workstation.css";

/** Full video editor inside Studio: monitor + shared timeline + layers + director. */
export function VideoStudioPanel({ board, onUpdateShot }: { board: Board; onUpdateShot?: (id: string, patch: Partial<ShotNode>) => void }) {
  const [doc, setDoc] = useState<TimelineDoc | null>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("");
  const [rendering, setRendering] = useState<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const localUrls = useRef<string[]>([]);

  useEffect(() => {
    setDoc(loadTimeline());
    const sync = (e: Event) => setDoc((e as CustomEvent<TimelineDoc>).detail);
    const seek = (e: Event) => { const time = (e as CustomEvent<number>).detail; if (Number.isFinite(time)) { setPlaying(false); setT(Math.max(0, time)); } };
    window.addEventListener("aurora:timeline-change", sync);
    window.addEventListener("aurora:seek", seek);
    return () => { window.removeEventListener("aurora:timeline-change", sync); window.removeEventListener("aurora:seek", seek); localUrls.current.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  const end = doc ? Math.max(1, ...doc.clips.map((c) => c.start + c.duration)) : 1;
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      setT((p) => { const n = p + (now - last) / 1000; if (n >= end) { setPlaying(false); return end; } return n; });
      last = now; raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, end]);
  useEffect(() => { window.dispatchEvent(new CustomEvent("aurora:playhead-change", { detail: t })); }, [t]);

  const clip = doc ? clipAt(doc, t) : null;
  useEffect(() => {
    const el = video.current;
    if (!el || !clip || clip.kind !== "video") return;
    const target = (clip.sourceOffset ?? 0) + t - clip.start;
    if (Math.abs(el.currentTime - target) > 0.3) el.currentTime = target;
    if (playing && el.paused) void el.play().catch(() => {});
    if (!playing && !el.paused) el.pause();
  }, [clip, t, playing]);

  const sendCanvas = () => {
    const result = appendShotsToTimeline(loadTimeline(), chainOrder(board));
    if (!result.added) { setNotice("No new canvas images or videos to add yet."); return; }
    window.dispatchEvent(new CustomEvent("aurora:apply-doc", { detail: result.doc }));
    setNotice(`${result.added} canvas shot${result.added > 1 ? "s" : ""} added to the timeline.`);
  };
  const exportVideo = async () => {
    if (!doc) return;
    setRendering(0); setNotice("");
    try { downloadBlob(await renderTimeline(doc, setRendering), `${doc.name || "aurora-cut"}.webm`); setNotice("Video downloaded."); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Export failed."); }
    finally { setRendering(null); }
  };
  const importFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : file.type.startsWith("video/") ? "video" : null;
      if (!kind) continue;
      const src = URL.createObjectURL(file); localUrls.current.push(src);
      let duration = 5;
      if (kind !== "image") {
        const media = document.createElement(kind === "audio" ? "audio" : "video");
        try { duration = await new Promise<number>((resolve, reject) => { media.onloadedmetadata = () => Number.isFinite(media.duration) ? resolve(media.duration) : reject(new Error("No duration")); media.onerror = () => reject(new Error("Cannot read media")); media.src = src; }); }
        catch { URL.revokeObjectURL(src); setNotice(`Could not read ${file.name}.`); continue; }
        finally { media.removeAttribute("src"); media.load(); }
      }
      const current = loadTimeline();
      const track = kind === "audio" ? "A1" : "V1";
      const start = current.clips.filter((c) => c.track === track).reduce((n, c) => Math.max(n, c.start + c.duration), 0);
      window.dispatchEvent(new CustomEvent("aurora:import-media", { detail: { name: file.name, src, kind, duration, start } }));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    setNotice("Local media imported. Reimport these files after refreshing.");
    if (fileInput.current) fileInput.current.value = "";
  };

  return <section aria-label="Video editor" className="video-studio-panel aurora-editor-workstation">
    <div className="video-studio-main">
      <div className="video-studio-monitor">
        <div className="video-studio-screen" aria-label="Program monitor">
          {clip?.kind === "video" ? <video ref={video} key={clip.id} src={clip.src} playsInline muted={false} /> : clip ? <img src={clip.src} alt={clip.name} /> : <p>{doc?.clips.length ? "No clip under the playhead" : "Send canvas shots or import media to start editing"}</p>}
        </div>
        <div className="video-studio-transport">
          <Button variant="ghost" size="icon" aria-label="Back to start" onClick={() => { setPlaying(false); setT(0); }}><SkipBack /></Button>
          <Button size="icon" aria-label={playing ? "Pause" : "Play"} onClick={() => { if (t >= end) setT(0); setPlaying((p) => !p); }}>{playing ? <Pause /> : <Play />}</Button>
          <span className="font-mono text-xs">{fmtTime(t)} / {fmtTime(end)}</span>
          <input aria-label="Scrub" type="range" min={0} max={end} step={0.01} value={t} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} />
          <input ref={fileInput} hidden type="file" multiple accept="image/*,video/*,audio/*" aria-label="Import media files" onChange={(e) => void importFiles(e.target.files)} />
          <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}><Upload />Import</Button>
          <Button variant="outline" size="sm" onClick={sendCanvas}><Clapperboard />Canvas to timeline</Button>
          <Button variant="outline" size="sm" disabled={rendering !== null} onClick={() => void exportVideo()}>{rendering !== null ? <><Loader2 className="animate-spin" />{Math.round(rendering * 100)}%</> : <><Download />Export WebM</>}</Button>
        </div>
        {notice && <p role="status" className="px-3 pb-2 text-xs text-muted-foreground">{notice}</p>}
      </div>
      <aside className="video-studio-side">{onUpdateShot && <ProductionPlanPanel board={board} onUpdateShot={onUpdateShot} />}<StudioDirectorPanel /></aside>
    </div>
    <div className="video-studio-timeline"><MultiTrackTimeline /></div>
    <EffectsPresetsDrawer t={t} />
    <details className="video-studio-layers"><summary>Layers & AI edits</summary><LayersEditor /></details>
  </section>;
}