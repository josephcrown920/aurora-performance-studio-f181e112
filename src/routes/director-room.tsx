import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/director-room")({
  beforeLoad: () => {
    throw redirect({ to: "/create", statusCode: 301 });
  },
});
