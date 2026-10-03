import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent_/beat-director")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
