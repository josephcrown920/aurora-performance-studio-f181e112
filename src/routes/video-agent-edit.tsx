import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent-edit")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
