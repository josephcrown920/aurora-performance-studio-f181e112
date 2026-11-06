import { createFileRoute, redirect } from "@tanstack/react-router";

// ComfyUI is admin-only; the admin area enforces the role check.
export const Route = createFileRoute("/comfy")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/comfy" });
  },
  head: () => ({ meta: [{ title: "ComfyUI — Aurora Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
});
