import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/aurora-canvas")({ beforeLoad: () => { throw redirect({ to: "/studio" }); } });
