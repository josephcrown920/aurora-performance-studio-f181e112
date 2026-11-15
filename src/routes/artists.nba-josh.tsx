import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Work = { src: string; title: string; tool: string; to: string };

// NBA Josh's public showcase — every image here is already shipped in /public/josh.
const WORKS: Work[] = [
  { src: "/josh/looping-officers-hero.png", title: "Looping Officers — key art", tool: "Studio", to: "/studio" },
  { src: "/josh/josh-red-angle1.png", title: "Red room · angle 1", tool: "Multi-angle reshoot", to: "/reshoot" },
  { src: "/josh/josh-red-angle2.png", title: "Red room · angle 2", tool: "Multi-angle reshoot", to: "/reshoot" },
  { src: "/josh/looping-officers-sunset.png", title: "Looping Officers — sunset", tool: "Canvas", to: "/create" },
  { src: "/josh/josh-pink-mic-portrait.jpg", title: "Pink mic session", tool: "Perform Anywhere", to: "/perform-anywhere" },
  { src: "/josh/looping-officers-fire.png", title: "Looping Officers — fire", tool: "Studio", to: "/studio" },
  { src: "/josh/josh-orange-performance.jpg", title: "Orange energy", tool: "UGC", to: "/ugc" },
  { src: "/josh/generated2/colors-royal-blue.webp", title: "Colors — royal blue", tool: "Colors", to: "/create" },
  { src: "/josh/looping-officers-rain-red.png", title: "Looping Officers — red rain", tool: "Studio", to: "/studio" },
  { src: "/josh/josh-mirror-getready.webp", title: "Get ready with me", tool: "Genjutsu", to: "/perform-anywhere" },
  { src: "/josh/generated2/viral-10-performance.webp", title: "Performance cut", tool: "TikTok 30", to: "/spin" },
  { src: "/josh/looping-officers-city.png", title: "Looping Officers — city", tool: "Studio", to: "/studio" },
  { src: "/josh/josh-concert-performance.webp", title: "Concert moment", tool: "Perform Anywhere", to: "/perform-anywhere" },
  { src: "/josh/generated2/viral-12-single-cover.webp", title: "Single cover", tool: "Layers", to: "/layers" },
  { src: "/josh/josh-blue-portrait.webp", title: "Blue cinematic", tool: "Studio", to: "/studio" },
  { src: "/josh/generated2/colors-sunset-orange.webp", title: "Colors — sunset orange", tool: "Colors", to: "/create" },
];

export const Route = createFileRoute("/artists/nba-josh")({
  head: () => ({
    meta: [
      { title: "NBA Josh — Featured Artist | Aurora" },
      { name: "description", content: "See NBA Josh's music visuals made in Aurora: Looping Officers key art, multi-angle shoots, Genjutsu performances and covers." },
      { property: "og:title", content: "NBA Josh — Featured Artist on Aurora" },
      { property: "og:description", content: "Music visuals, performances and covers NBA Josh built with Aurora." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NbaJoshPage,
});

function NbaJoshPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="relative overflow-hidden border-b border-border">
        <img
          src="/josh/looping-officers-hero.png"
          alt="NBA Josh — Looping Officers key art"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-24">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground">
            <ArrowLeft className="size-4" /> Home
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Featured artist</p>
          <h1 className="mt-2 text-5xl font-black uppercase leading-none md:text-7xl">NBA Josh</h1>
          <p className="mt-4 max-w-[46ch] text-base text-muted-foreground">
            Atlanta-based artist and one of Aurora&apos;s earliest creators. Every visual below was made inside Aurora.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/lagos40" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground no-underline">
              Lagos 40 campaign <ArrowRight className="size-4" />
            </Link>
            <Link to="/create" className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground no-underline">
              Make yours
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10" aria-label="NBA Josh's work">
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
          {WORKS.map((w) => (
            <figure key={w.src} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card">
              <img src={w.src} alt={w.title} loading="lazy" className="w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-2 p-3">
                <span className="text-xs font-medium leading-tight">{w.title}</span>
                <Link to={w.to} className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground no-underline">
                  {w.tool}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
