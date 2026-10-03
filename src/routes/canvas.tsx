import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/canvas")({
  beforeLoad: () => { throw redirect({ to: "/studio" }); },
  // All optional so existing plain canvas links remain type-safe.
  validateSearch: (search: Record<string, unknown>): {
    template?: string; marketplaceTemplateId?: string; workflow?: string; run?: boolean;
  } => ({
    template: typeof search.template === "string" ? search.template : undefined,
    marketplaceTemplateId: typeof search.marketplaceTemplateId === "string" ? search.marketplaceTemplateId : undefined,
    workflow: typeof search.workflow === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(search.workflow) ? search.workflow : undefined,
    run: search.run === true || search.run === "1" || search.run === "true",
  }),
  head: () => ({
    meta: [
      { title: "Director Canvas — Aurora Performance Studio" },
      { name: "description", content: "Plan from character, scene and motion references; review your creative brief and execute your production graph with Aurora Director." },
      { property: "og:title", content: "Director Canvas — Aurora Performance Studio" },
      { property: "og:description", content: "Your references, creative brief and production graph in one private workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://auroraperformancestudio.com/canvas" },
    ],
    links: [{ rel: "canonical", href: "https://auroraperformancestudio.com/canvas" }],
  }),
});

