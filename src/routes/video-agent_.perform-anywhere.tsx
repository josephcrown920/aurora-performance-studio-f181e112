import { createFileRoute } from "@tanstack/react-router";
import { PerformAnywhereProduction } from "@/components/video-agent/PerformAnywhereProduction";

export const Route = createFileRoute("/video-agent_/perform-anywhere")({
  head: () => ({ meta: [
    { title: "Josh · Perform Anywhere — Aurora Video Agent" },
    { name: "description", content: "Create a private 30-shot Perform Anywhere production with one character, 30 outfits, locations and scenes, then edit completed renders in Aurora." },
    { property: "og:title", content: "Perform Anywhere — Aurora Video Agent" },
    { property: "og:description", content: "Josh’s locked identity across 30 distinct performance scenes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PerformAnywhereProduction,
});