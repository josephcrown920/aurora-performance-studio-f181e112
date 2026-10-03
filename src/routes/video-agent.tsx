import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
