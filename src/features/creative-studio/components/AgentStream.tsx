import { useEffect, useState } from "react";

const LINES = [
  "What are we making today? Drop the idea and I'll direct it.",
  "I can cut your clips to the beat — every drop, every 808.",
  "Want a low-angle drill visual in the rain? Just say the word.",
  "Upload a selfie and I'll keep your face consistent across shots.",
  "I storyboard a brief into shot-by-shot prompts in seconds.",
  "Need lip sync? Give me the verse and a photo.",
  "The GUI Video Editor has V1–V4 and A1–A3 tracks ready for you.",
  "Tell me the mood — night drive, chrome chains, smoke — I'll build it.",
];

const PRESETS = [
  "Night drive music video, neon reflections",
  "Studio performance, slow push-in",
  "Rooftop drill visual at golden hour",
];

/** A live, typing agent line that rotates every few seconds. */
export function AgentStream({ onPick }: { onPick: (text: string) => void }) {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const full = LINES[line];
    if (chars < full.length) {
      const t = window.setTimeout(() => setChars((c) => c + 1), 28);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLine((l) => (l + 1) % LINES.length);
      setChars(0);
    }, 2400);
    return () => window.clearTimeout(t);
  }, [chars, line]);

  return (
    <div className="aurora-stream" aria-live="polite">
      <div className="aurora-stream-head">
        <span className="aurora-stream-dot" />
        Aurora · live
      </div>
      <p className="aurora-stream-text">
        {LINES[line].slice(0, chars)}
        <span className="aurora-stream-caret" />
      </p>
      <div className="aurora-stream-chips">
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => onPick(p)}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
