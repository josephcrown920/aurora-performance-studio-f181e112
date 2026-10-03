import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/video-agent_/music-video")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
