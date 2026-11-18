import { PageHeroBanner } from "@/components/visual/PageHeroBanner";
import { DEMO_ASSETS, type DemoMediaAsset } from "@/lib/demo-assets";
import { cn } from "@/lib/utils";
import genjutsuVideo from "@/assets/genjutsu/performance.mp4.asset.json";
import genjutsuPoster from "@/assets/genjutsu/performance.jpg.asset.json";
import grwmMirror from "@/assets/genjutsu/grwm-mirror.webp.asset.json";

/** Copy for the Lip Sync-style box shown at the top of each flagship feature. */
export type FeatureTopBoxId =
  | "genjutsu"
  | "grwm"
  | "luxury"
  | "colors"
  | "multiangle"
  | "tiktok30"
  | "videoAgent"
  | "puremix"
  | "soul"
  | "lipsync";

type Entry = { kicker: string; headline: string; sub: string; media: DemoMediaAsset };

const img = (id: string, src: string, alt: string): DemoMediaAsset => ({ id, src, type: "image", alt });

export const FEATURE_TOP_BOXES: Record<FeatureTopBoxId, Entry> = {
  genjutsu: {
    kicker: "Genjutsu · Perform Anywhere",
    headline: "Your performance. A new world.",
    sub: "Film yourself anywhere, then Genjutsu rebuilds the scene around your real moves.",
    media: { id: "genjutsu-hero", src: genjutsuVideo.url, type: "video", alt: "Genjutsu performance render", poster: genjutsuPoster.url },
  },
  grwm: {
    kicker: "Genjutsu · Get Ready With Me",
    headline: "Get ready. Then get seen.",
    sub: "Turn a mirror clip into a styled vanity moment with your own face and outfit.",
    media: img("grwm-hero", grwmMirror.url, "Dressing-room vanity mirror reference"),
  },
  luxury: {
    kicker: "Genjutsu · Luxury Interior",
    headline: "Your seat becomes a Maybach.",
    sub: "Film yourself seated anywhere and step out of a luxury car or private jet.",
    media: img("luxury-hero", "/nav-previews/perform-anywhere.jpg", "Luxury interior performance scene"),
  },
  colors: {
    kicker: "Colors Studio",
    headline: "One color. Your whole stage.",
    sub: "Pick a backdrop color and perform inside a lit cyclorama studio.",
    media: DEMO_ASSETS.colors.hero,
  },
  multiangle: {
    kicker: "Multi-Angle Camera",
    headline: "One photo. Six camera angles.",
    sub: "Same face, outfit and lighting — captured from six cinematic angles.",
    media: img("multiangle-hero", "/nav-previews/avatar.jpg", "Portrait used for multiple camera angles"),
  },
  tiktok30: {
    kicker: "TikTok30",
    headline: "Thirty posts from one idea.",
    sub: "Give Aurora one topic and get a full month of short-form content.",
    media: DEMO_ASSETS.spin.hero,
  },
  videoAgent: {
    kicker: "Video Agent",
    headline: "Describe the shot. Watch it happen.",
    sub: "Drop your character into a movie-style scene with control over camera, light and motion.",
    media: img("video-agent-hero", "/nav-previews/video-agent.jpg", "Aurora Video Agent output"),
  },
  puremix: {
    kicker: "PureMix Mastering",
    headline: "Make your record hit loud.",
    sub: "Upload a song, shape the sound and export a master ready for streaming.",
    media: img("puremix-hero", "/nav-previews/music-video.jpg", "Music studio session"),
  },
  soul: {
    kicker: "Soul Studio",
    headline: "Your artist identity, on demand.",
    sub: "Train your look once, then generate photos and videos that stay true to you.",
    media: img("soul-hero", "/nav-previews/avatar.jpg", "Artist identity portrait"),
  },
  lipsync: {
    kicker: "Lip Sync Studio",
    headline: "Make any face sing your hook.",
    sub: "Use a portrait and your audio to create a performance with visible expression and timing.",
    media: DEMO_ASSETS.lipsync.hero,
  },
};

/**
 * The rounded artwork box (kicker, gradient headline, short line) that sits at
 * the top of every flagship feature, matching the Lip Sync Studio header.
 */
export function FeatureTopBox({ feature, className }: { feature: FeatureTopBoxId; className?: string }) {
  const entry = FEATURE_TOP_BOXES[feature];
  return (
    <PageHeroBanner
      kicker={entry.kicker}
      headline={entry.headline}
      sub={entry.sub}
      media={entry.media}
      className={cn("feature-top-box relative z-10 mx-4 mt-6 rounded-3xl border border-border sm:mx-6", className)}
    />
  );
}
