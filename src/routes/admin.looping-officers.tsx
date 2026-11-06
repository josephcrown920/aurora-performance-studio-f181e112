import { createFileRoute, redirect } from "@tanstack/react-router";

// Admin entry for the NBA Josh "Looping Officers" production template.
export const Route = createFileRoute("/admin/looping-officers")({
  beforeLoad: () => {
    throw redirect({ to: "/templates", search: { open: "looping-officers", category: undefined } });
  },
  head: () => ({ meta: [{ title: "Looping Officers — Aurora Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
});
