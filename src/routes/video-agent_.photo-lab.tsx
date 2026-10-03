import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent_/photo-lab")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
