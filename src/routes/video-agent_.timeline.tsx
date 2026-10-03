import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent_/timeline")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
