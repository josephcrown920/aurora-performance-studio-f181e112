import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/modelark")({
  head: () => ({
    meta: [
      { title: "ModelArk Videos — Aurora Admin" },
      { name: "description", content: "Generate and store NBA Josh boot-shot videos with ModelArk." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
