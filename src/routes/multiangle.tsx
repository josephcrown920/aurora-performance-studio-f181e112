import { createFileRoute } from "@tanstack/react-router";
import { MultiAngleCameraPage } from "./reshoot.lazy";

export const Route = createFileRoute("/multiangle")({
  head: () => ({ meta: [
    { title: "Multi-Angle Camera — Aurora Studio" },
    { name: "description", content: "Create six cinematic camera angles from your own portrait in Aurora." },
    { property: "og:title", content: "Multi-Angle Camera — Aurora Studio" },
    { property: "og:description", content: "One portrait, six camera angles, one creative identity." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: MultiAngleCameraPage,
});