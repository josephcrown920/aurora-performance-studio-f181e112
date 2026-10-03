import { createFileRoute } from "@tanstack/react-router";
import { CANONICAL_ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/perform-anywhere")({
  validateSearch: (search: Record<string, unknown>): { experience?: "grwm" } => ({ experience: search.experience === "grwm" ? "grwm" : undefined }),
  head: () => ({
    meta: [
      { title: "Perform Anywhere — Aurora" },
      {
        name: "description",
        content: "Transform phone performances and Get Ready With Me dressing clips with Aurora’s motion workflows.",
      },
      { property: "og:title", content: "Perform Anywhere — Aurora" },
      { property: "og:description", content: "Real movement in. Cinematic performance video out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `${CANONICAL_ORIGIN}/perform-anywhere` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL_ORIGIN}/perform-anywhere` }],
  }),
});