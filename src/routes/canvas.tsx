import { createFileRoute, redirect } from "@tanstack/react-router";

// The standalone Canvas page was removed; old links open the Studio's node canvas.
export const Route = createFileRoute("/canvas")({
  validateSearch: (search: Record<string, unknown>): {
    template?: string; marketplaceTemplateId?: string; workflow?: string; run?: boolean;
  } => ({
    template: typeof search.template === "string" ? search.template : undefined,
    marketplaceTemplateId: typeof search.marketplaceTemplateId === "string" ? search.marketplaceTemplateId : undefined,
    workflow: typeof search.workflow === "string" ? search.workflow : undefined,
    run: search.run === true || search.run === "1" || search.run === "true",
  }),
  beforeLoad: () => { throw redirect({ to: "/studio", search: { mode: "canvas" } }); },
});
