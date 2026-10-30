import { Quote, Star } from "lucide-react";

const QUOTES = [
  {
    name: "Maya R.",
    role: "Music artist",
    location: "Lagos, Nigeria",
    flag: "🇳🇬",
    text: "I shot a full cover art series for my EP on a Tuesday night. Aurora replaced a $4k photoshoot.",
    color: "from-violet-500/30 to-fuchsia-500/10",
  },
  {
    name: "Daniel K.",
    role: "Music video director",
    location: "Berlin, Germany",
    flag: "🇩🇪",
    text: "Split-reality renders are dangerous. I previz two storylines for a client in 20 minutes.",
    color: "from-emerald-500/30 to-teal-500/10",
  },
  {
    name: "Ife O.",
    role: "Creator · 1.2M followers",
    location: "London, UK",
    flag: "🇬🇧",
    text: "The lip-sync is unreal. My UGC ads with Aurora are converting 3x my last batch.",
    color: "from-amber-500/30 to-rose-500/10",
  },
  {
    name: "Tobi A.",
    role: "Afrobeats artist",
    location: "Lagos, Nigeria",
    flag: "🇳🇬",
    text: "Dropped the visualizer the same night I mastered the track. It was charting before I could even book a video shoot.",
    color: "from-cyan-500/30 to-blue-500/10",
  },
  {
    name: "Hiroshi M.",
    role: "Anime concept artist",
    location: "Tokyo, Japan",
    flag: "🇯🇵",
    text: "The agent reads my brief in Japanese and returns shot lists I'd hire a director to write. Insane.",
    color: "from-pink-500/30 to-rose-500/10",
  },
  {
    name: "Camila V.",
    role: "Indie filmmaker",
    location: "São Paulo, Brazil",
    flag: "🇧🇷",
    text: "Pitched a Netflix short with Aurora previz. Got greenlit off the mood board alone.",
    color: "from-orange-500/30 to-amber-500/10",
  },
  {
    name: "Marcus D.",
    role: "Drill producer",
    location: "London, UK",
    flag: "🇬🇧",
    text: "Every type beat I sell now ships with an Aurora visual. Artists pick my beats just for the videos.",
    color: "from-yellow-500/30 to-orange-500/10",
  },
  {
    name: "Jules P.",
    role: "Independent rapper",
    location: "Atlanta, USA",
    flag: "🇺🇸",
    text: "No label, no budget, no problem. My last three music videos were all Aurora — views tripled overnight.",
    color: "from-fuchsia-500/30 to-purple-500/10",
  },
  {
    name: "Kwame A.",
    role: "Afrobeats producer",
    location: "Accra, Ghana",
    flag: "🇬🇭",
    text: "Visualizers for every track on the album. The diaspora is paying attention now.",
    color: "from-emerald-500/30 to-lime-500/10",
  },
  {
    name: "Min-jun L.",
    role: "K-pop visual director",
    location: "Seoul, South Korea",
    flag: "🇰🇷",
    text: "Storyboarded an entire MV with the agent. My team thought I'd hired a second director.",
    color: "from-sky-500/30 to-indigo-500/10",
  },
  {
    name: "Olivia W.",
    role: "Creator · 3M followers",
    location: "Sydney, Australia",
    flag: "🇦🇺",
    text: "Lip-sync that doesn't look uncanny. Finally. My TikTok views literally doubled.",
    color: "from-teal-500/30 to-cyan-500/10",
  },
  {
    name: "Mateo G.",
    role: "Reggaeton artist",
    location: "Medellín, Colombia",
    flag: "🇨🇴",
    text: "Dropped a full visual EP on Aurora. Looks like a Bad Bunny budget. Costó nada.",
    color: "from-violet-500/30 to-purple-500/10",
  },
  {
    name: "Zainab B.",
    role: "Fashion stylist",
    location: "Abuja, Nigeria",
    flag: "🇳🇬",
    text: "Get Ready With Me let me dress my client in three looks before we ever touched a rail.",
    color: "from-rose-500/30 to-pink-500/10",
  },
  {
    name: "Andre T.",
    role: "Drill artist",
    location: "Toronto, Canada",
    flag: "🇨🇦",
    text: "Recorded on my phone in my room, came out standing under a mic on a rainy street. Fans thought we had a crew.",
    color: "from-blue-500/30 to-indigo-500/10",
  },
  {
    name: "Sofia L.",
    role: "Brand marketer",
    location: "Milan, Italy",
    flag: "🇮🇹",
    text: "TikTok30 turned one product shot into a month of posts. Same face, same vibe, every frame.",
    color: "from-amber-500/30 to-yellow-500/10",
  },
  {
    name: "Chidi E.",
    role: "Label A&R",
    location: "Lagos, Nigeria",
    flag: "🇳🇬",
    text: "We test visual concepts for new signings before spending a cent on production.",
    color: "from-violet-500/30 to-indigo-500/10",
  },
  {
    name: "Priya S.",
    role: "Wedding filmmaker",
    location: "Mumbai, India",
    flag: "🇮🇳",
    text: "Multi-angle gave me the B-cam I never had. Clients can't tell which shot was real.",
    color: "from-orange-500/30 to-rose-500/10",
  },
  {
    name: "Marcus J.",
    role: "Gospel artist",
    location: "Houston, USA",
    flag: "🇺🇸",
    text: "Cheaper than one day of studio rental and I own every frame.",
    color: "from-emerald-500/30 to-cyan-500/10",
  },
];

export function Testimonials() {
  return (
    <section className="relative z-10 px-6 md:px-12 pb-24">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="aurora-kicker mb-2">Loved worldwide</p>
          <h2 className="text-2xl md:text-3xl font-semibold">Creators in 40+ countries. One studio.</h2>
          <p className="text-sm text-white/55 mt-2">Artists, producers and directors from Lagos to Atlanta are shipping with Aurora.</p>
        </div>
        <div className="flex items-center gap-1 text-amber-300">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
          <span className="text-white/70 text-sm ml-2">4.9 · 2,400+ creators</span>
        </div>
      </div>
      <figure className="relative mb-6 rounded-3xl aurora-glass p-7 md:p-10 overflow-hidden">
        <div className="absolute -inset-20 blur-3xl opacity-40 bg-gradient-to-br from-violet-500/40 to-fuchsia-500/10" />
        <Quote className="relative size-8 text-violet-300/60 mb-4" />
        <blockquote className="relative text-xl md:text-3xl font-medium leading-snug max-w-4xl">"{QUOTES[0].text}"</blockquote>
        <figcaption className="relative mt-5 text-sm text-white/60">{QUOTES[0].name} · {QUOTES[0].role} · {QUOTES[0].location}</figcaption>
      </figure>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
        {QUOTES.slice(1).map((q, i) => (
          <figure
            key={q.name}
            className="relative mb-4 break-inside-avoid rounded-2xl aurora-glass p-5 overflow-hidden animate-fade-in hover:-translate-y-1 transition"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`absolute -inset-16 blur-3xl opacity-50 bg-gradient-to-br ${q.color}`} />
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex gap-0.5 text-amber-300">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-3 fill-current" />)}</div>
              <span className="text-xl leading-none" aria-hidden>{q.flag}</span>
            </div>
            <blockquote className="relative text-sm text-white/85 leading-relaxed">"{q.text}"</blockquote>
            <figcaption className="relative mt-4 flex items-center gap-3 text-xs">
              <span className="size-8 rounded-full bg-white/10 ring-1 ring-white/15 flex items-center justify-center font-semibold">{q.name[0]}</span>
              <span>
                <span className="block font-medium text-white">{q.name}</span>
                <span className="block text-white/50">{q.role} · {q.location}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
