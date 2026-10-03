import { createFileRoute } from "@tanstack/react-router";
import { Lagos40Studio } from "@/features/lagos40/Lagos40Studio";

export const Route = createFileRoute("/lagos40")({
  head: () => ({
    meta: [
      { title: "Lagos 40 — NBA Josh Music Video Campaign | Aurora" },
      { name: "description", content: "Make 40 locked-character NBA Josh music videos across Lagos, timed to the song clip with lyric captions." },
      { property: "og:title", content: "Lagos 40 — NBA Josh Music Video Campaign" },
      { property: "og:description", content: "One artist, 40 Lagos locations, one song clip — made and edited in Aurora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Lagos40Studio,
});
