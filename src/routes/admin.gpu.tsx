import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/gpu")({
  head: () => ({
    meta: [
      { title: "GPU launch — Aurora admin" },
      { name: "description", content: "Check notebook GPU capacity and connect an Aurora motion or lip-sync worker." },
      { property: "og:title", content: "GPU launch — Aurora admin" },
      { property: "og:description", content: "Check notebook GPU capacity and connect an Aurora motion or lip-sync worker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
