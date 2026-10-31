import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/editor")({
  beforeLoad: () => { throw redirect({ to: "/studio" }); },
  head: () => ({
    meta: [
      { title: "Codex Video Editor | Aurora Studio" },
      {
        name: "description",
        content:
          "Edit video in Aurora Codex Studio with a shared multi-track timeline, local editing commands and reviewed cuts.",
      },
      { property: "og:title", content: "Aurora Codex Video Editor" },
      {
        property: "og:description",
        content: "A shared video timeline with local Codex commands and reviewed edits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

