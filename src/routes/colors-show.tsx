import { createFileRoute, redirect } from "@tanstack/react-router";

// Colors Show was retired; old links go to Perform Anywhere.
export const Route = createFileRoute("/colors-show")({
  validateSearch: (s: Record<string, unknown>): { color?: string; mode?: "anywhere"; flow?: "build_scene" | "luxury_interior" } => ({}),
  beforeLoad: () => { throw redirect({ to: "/perform-anywhere", statusCode: 301 }); },
});
