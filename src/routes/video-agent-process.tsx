import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent-process")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
