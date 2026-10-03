import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent_/workflows")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
