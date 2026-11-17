import { createFileRoute } from "@tanstack/react-router";
import { ColorsStudio } from "@/components/performance/ColorsStudio";

// Colors Studio is independent of the retired Colors Show experience.
export const Route = createFileRoute("/colors")({
  validateSearch: (s: Record<string, unknown>): { color?: string; mode?: "anywhere"; flow?: "build_scene" | "luxury_interior" } => ({ color: typeof s.color === "string" ? s.color : undefined }),
  head: () => ({ meta: [
    { title: "Colors Studio — Aurora" },
    { name: "description", content: "Choose a cyclorama studio palette and create your Aurora performance scene." },
    { property: "og:title", content: "Colors Studio — Aurora" },
    { property: "og:description", content: "Color-led performance scenes with your own character and phone take." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ColorsStudio initialColor={Route.useSearch().color} />,
});
