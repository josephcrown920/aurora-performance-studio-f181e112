// @ts-nocheck
// Program monitor: plays the shared TimelineDoc (video, image, text, overlay
// and audio clips) in sync with the multi-track timeline. Scrubbing here moves
// the timeline playhead and vice versa via the aurora:* window events.
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipBack, Volume2, VolumeX } from "lucide-react";
import {
  fmtTime,
  loadTimeline,
  type Clip,
  type TimelineDoc,
} from "@/features/creative-studio/lib/timeline-state";

function filterFor(clip: Clip): string {
  if (clip.effect === "bw" || clip.look === "noir") return "grayscale(1) contrast(1.1)";
  if (clip.effect === "vhs" || clip.look === "vhs") return "saturate(1.4) contrast(1.15) sepia(0.2)";
  if (clip.effect === "blur") return "blur(2px)";
  return "none";
}

/** Visual clips stack V1 (bottom) → V4 (top); audio tracks never render. */
function visualOrder(clip: Clip): number {
  return ["V1", "V2", "V3", "V4"].indexOf(clip.track);
}

export function ProgramMonitor() {
  const [doc, setDoc] = useState<TimelineDoc>(() => loadTimeline());
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const mediaRef = useRef(new Map<string, HTMLVideoElement | HTMLAudioElement>());
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);
  const timeRef = useRef(0);
  timeRef.current = time;

  // Follow timeline edits.
  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<TimelineDoc>).detail;
      if (next && Array.isArray(next.clips)) setDoc(next);
    };
    const onPlayhead = (event: Event) => {
      const t = (event as CustomEvent<number>).detail;
      if (Number.isFinite(t)) setTime(Math.max(0, t));
    };
    window.addEventListener("aurora:timeline-change", onChange);
    window.addEventListener("aurora:playhead-change", onPlayhead);
    return () => {
      window.removeEventListener("aurora:timeline-change", onChange);
      window.removeEventListener("aurora:playhead-change", onPlayhead);
    };
  }, []);

  // Build / refresh media elements for clips that have a source.
  useEffect(() => {
    const media = mediaRef.current;
    const seen = new Set<string>();
    for (const clip of doc.clips) {
      if (!clip.src || (clip.kind !== "video" && clip.kind !== "audio")) continue;
      seen.add(clip.id);
      if (!media.has(clip.id)) {
        const el =
          clip.kind === "audio"
            ? new Audio()
            : Object.assign(document.createElement("video"), { playsInline: true, muted: true });
        el.preload = "auto";
        el.src = clip.src;
        media.set(clip.id, el);
      }
    }
    for (const [id, el] of media) {
      if (!seen.has(id)) {
        el.pause();
        media.delete(id);
      }
    }
  }, [doc.clips]);

  // Playback loop.
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      mediaRef.current.forEach((el) => el.pause());
      return;
    }
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      const next = timeRef.current + dt;
      if (next >= doc.seconds) {
        setTime(doc.seconds);
        setPlaying(false);
        window.dispatchEvent(new CustomEvent("aurora:playhead-change", { detail: doc.seconds }));
        return;
      }
      setTime(next);
      window.dispatchEvent(new CustomEvent("aurora:playhead-change", { detail: next }));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, doc.seconds]);

  // Keep media elements in sync with the playhead.
  useEffect(() => {
    for (const clip of doc.clips) {
      const el = mediaRef.current.get(clip.id);
      if (!el) continue;
      const active = time >= clip.start && time < clip.start + clip.duration;
      if (!active) {
        if (!el.paused) el.pause();
        continue;
      }
      const target = (clip.sourceOffset ?? 0) + (time - clip.start);
      if (Math.abs(el.currentTime - target) > 0.35) el.currentTime = target;
      if (playing && el.paused) void el.play().catch(() => {});
    }
  }, [time, playing, doc.clips]);

  useEffect(() => {
    mediaRef.current.forEach((el) => {
      if (el instanceof HTMLAudioElement) el.muted = muted;
    });
  }, [muted]);

  const activeVisuals = useMemo(
    () =>
      doc.clips
        .filter(
          (c) =>
            !c.track.startsWith("A") &&
            c.kind !== "audio" &&
            time >= c.start &&
            time < c.start + c.duration,
        )
        .sort((a, b) => visualOrder(a) - visualOrder(b)),
    [doc.clips, time],
  );

  const hasMedia = doc.clips.some((c) => c.src);
  const ratioClass = doc.ratio === "16:9" ? "aspect-video" : doc.ratio === "1:1" ? "aspect-square" : "aspect-[9/16]";

  const seek = (value: number) => {
    setTime(value);
    window.dispatchEvent(new CustomEvent("aurora:playhead-change", { detail: value }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col items-center gap-3">
      <div
        className={`relative ${ratioClass} max-h-full w-auto max-w-full flex-1 overflow-hidden rounded-xl border border-border bg-black`}
        style={{ minHeight: 240 }}
        data-testid="program-monitor"
      >
        {!hasMedia && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              Import clips below to build your cut — the monitor plays whatever is under the playhead.
            </p>
          </div>
        )}
        {activeVisuals.map((clip) => {
          if (clip.kind === "text" || clip.kind === "overlay") {
            return (
              <div
                key={clip.id}
                className="pointer-events-none absolute inset-x-0 bottom-8 z-20 text-center"
                style={{ filter: filterFor(clip) }}
              >
                <span className="inline-block rounded bg-black/60 px-3 py-1 text-lg font-bold text-white">
                  {clip.name}
                </span>
              </div>
            );
          }
          if (clip.kind === "image" && clip.src) {
            return (
              <img
                key={clip.id}
                src={clip.src}
                alt={clip.name}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: filterFor(clip) }}
              />
            );
          }
          if (clip.kind === "video" && clip.src) {
            return (
              <MonitorVideo key={clip.id} clip={clip} mediaRef={mediaRef} />
            );
          }
          return null;
        })}
        {playing && (
          <div className="absolute left-2 top-2 z-30 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
            Playing
          </div>
        )}
      </div>

      <div className="flex w-full max-w-xl items-center gap-3">
        <button
          type="button"
          aria-label="Back to start"
          className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          onClick={() => seek(0)}
        >
          <SkipBack className="size-4" />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          data-testid="monitor-play"
          className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
          onClick={() => {
            if (!playing && time >= doc.seconds) seek(0);
            setPlaying((v) => !v);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
        </button>
        <span className="w-20 text-xs tabular-nums text-muted-foreground">
          {fmtTime(time)}
        </span>
        <input
          type="range"
          aria-label="Scrub"
          min={0}
          max={doc.seconds}
          step={0.033}
          value={Math.min(time, doc.seconds)}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer accent-primary"
        />
        <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">
          {fmtTime(doc.seconds)}
        </span>
        <button
          type="button"
          aria-label={muted ? "Unmute" : "Mute"}
          className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          onClick={() => setMuted((v) => !v)}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function MonitorVideo({
  clip,
  mediaRef,
}: {
  clip: Clip;
  mediaRef: React.RefObject<Map<string, HTMLVideoElement | HTMLAudioElement>>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mediaRef.current?.get(clip.id);
    const host = hostRef.current;
    if (!el || !host || !(el instanceof HTMLVideoElement)) return;
    el.className = "h-full w-full object-cover";
    el.style.filter = filterFor(clip);
    host.appendChild(el);
    return () => {
      if (el.parentElement === host) host.removeChild(el);
    };
  }, [clip.id, clip.effect, clip.look, mediaRef]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
