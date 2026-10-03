import { createFileRoute } from "@tanstack/react-router";
import { CANONICAL_ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/layers")({
  head: () => ({
    meta: [
      { title: "Aurora Layers — Image Editing Studio" },
      {
        name: "description",
        content: "Edit wardrobe, lighting, backgrounds and character details in Aurora Layers, with private project saves and a shared video timeline.",
      },
      { property: "og:title", content: "Aurora Layers — Image Editing Studio" },
      {
        property: "og:description",
        content: "Edit image regions, stack shots and save private creative projects in Aurora Layers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `${CANONICAL_ORIGIN}/layers` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL_ORIGIN}/layers` }],
  }),
});
