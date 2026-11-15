import { createFileRoute } from "@tanstack/react-router";
import { CreateHub } from "@/components/create/CreateHub";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Something New — Aurora" },
      { name: "description", content: "Every Aurora tool for artists: Perform Anywhere, Colors, TikTok30, Video Agent, Lip Sync and more." },
      { property: "og:title", content: "Create Something New — Aurora" },
      { property: "og:description", content: "Every Aurora tool for artists, with credit costs up front." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateHub,
});
