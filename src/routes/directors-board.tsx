import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/directors-board")({
  beforeLoad: () => {
    throw redirect({ to: "/create", statusCode: 301 });
  },
});
