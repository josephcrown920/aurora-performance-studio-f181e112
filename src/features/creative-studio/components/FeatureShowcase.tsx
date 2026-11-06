import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const SLIDES = [
  { img: "/nav-previews/perform-anywhere.jpg", title: "Perform Anywhere", text: "Drop yourself into any scene from one photo.", to: "/perform-anywhere" },
  { img: "/nav-previews/lipsync.jpg", title: "Lip Sync", text: "Make any photo perform your verse.", to: "/lipsync" },
  { img: "/nav-previews/music-video.jpg", title: "Music Video", text: "Beat-synced visuals cut to your track.", to: "/studio" },
  { img: "/nav-previews/motion.jpg", title: "Motion Control", text: "Copy your moves onto your character.", to: "/motion" },
  { img: "/nav-previews/colors.jpg", title: "Colors Studio", text: "Magazine-grade portraits in seconds.", to: "/colors" },
  { img: "/nav-previews/ugc.jpg", title: "UGC Ads", text: "Creator-style ads for your release.", to: "/ugc" },
];

/** Auto-playing demo slideshow of Aurora features. */
export function FeatureShowcase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % SLIDES.length), 3500);
    return () => window.clearInterval(t);
  }, []);
  const s = SLIDES[i];
  return (
    <div className="aurora-showcase">
      {SLIDES.map((sl, n) => (
        <img key={sl.img} src={sl.img} alt={sl.title} className={n === i ? "on" : ""} loading={n === 0 ? "eager" : "lazy"} />
      ))}
      <div className="aurora-showcase-cap">
        <div>
          <strong>{s.title}</strong>
          <span>{s.text}</span>
        </div>
        <Link to={s.to} className="aurora-mac-btn primary">Try it</Link>
      </div>
      <div className="aurora-showcase-dots">
        {SLIDES.map((sl, n) => (
          <button key={sl.title} aria-label={sl.title} className={n === i ? "on" : ""} onClick={() => setI(n)} />
        ))}
      </div>
    </div>
  );
}
