import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent-classic")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
