import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reshoot")({
  head: () => ({
    meta: [
      { title: "Multi-Angle Camera — Aurora" },
      {
        name: "description",
        content:
          "Generate six cinematic camera angles from one portrait with the Aurora Multi-Angle Camera.",
      },
      { property: "og:title", content: "Multi-Angle Camera — Aurora" },
      {
        property: "og:description",
        content:
          "One reference photo, six fixed camera angles. Same subject, same outfit, same scene — six brand-new vertical portraits in one click.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://aurora-performance-studio.lovable.app/multiangle" }],
  }),
});

