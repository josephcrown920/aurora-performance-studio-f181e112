// @ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tiktok")({
  beforeLoad: () => { throw redirect({ to: "/canvas" }); },
  head: () => ({
    meta: [
      { title: "Aurora — Canvas workspace" },
      { name: "description", content: "Continue your production on Aurora’s node canvas." },
      { property: "og:title", content: "Aurora — Canvas workspace" },
      { property: "og:description", content: "Connected scene planning and previews in Aurora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://auroraperformancestudio.com/tiktok" }],
  }),
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-muted-foreground">Not found.</div>,
});

