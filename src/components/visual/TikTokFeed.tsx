import { Heart, MessageCircle, Music2, Share2 } from "lucide-react";
import s0 from "@/assets/tiktok30/shot-0.webp.asset.json";
import s1 from "@/assets/tiktok30/shot-1.webp.asset.json";
import s2 from "@/assets/tiktok30/shot-2.webp.asset.json";
import s3 from "@/assets/tiktok30/shot-3.webp.asset.json";
import s4 from "@/assets/tiktok30/shot-4.webp.asset.json";
import s5 from "@/assets/tiktok30/shot-5.webp.asset.json";
import s7 from "@/assets/tiktok30/shot-7.webp.asset.json";
import s14 from "@/assets/tiktok30/shot-14.webp.asset.json";

// Real TikTok30 outputs (NBA Josh campaign), shown as a vertical phone feed.
const SHOTS = [
  { src: s0.url, label: "Talking-head hook" },
  { src: s1.url, label: "Lip-sync clip" },
  { src: s2.url, label: "Carousel cover" },
  { src: s3.url, label: "Story-style post" },
  { src: s4.url, label: "Caption hook" },
  { src: s5.url, label: "Meme edit" },
  { src: s7.url, label: "POV scenario" },
  { src: s14.url, label: "Behind the scenes" },
];

export function TikTokFeed() {
  return <section aria-label="Live TikTok30 examples" className="mx-4 mt-4 sm:mx-6">
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Live examples · one upload, 30 posts</p>
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
      {SHOTS.map((shot) => <article key={shot.src} className="relative aspect-[9/16] w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card sm:w-48">
        <img src={shot.src} alt={`TikTok30 ${shot.label}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 pt-10">
          <p className="text-xs font-bold text-foreground">@nbajosh</p>
          <p className="text-[11px] text-muted-foreground">{shot.label}</p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Music2 size={10} />original sound</p>
        </div>
        <div className="absolute bottom-16 right-2 flex flex-col items-center gap-3 text-foreground">
          <Heart size={18} /><MessageCircle size={18} /><Share2 size={18} />
        </div>
      </article>)}
    </div>
  </section>;
}
