import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aurora-command-center")({
  head: () => ({
    meta: [
      { title: "Aurora Command Center — Internal QA" },
      { name: "description", content: "Internal Aurora product readiness, workflow evidence and launch-gate dashboard." },
      { property: "og:title", content: "Aurora Command Center — Internal QA" },
      { property: "og:description", content: "Internal Aurora product readiness, workflow evidence and launch-gate dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
