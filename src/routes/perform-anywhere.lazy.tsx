import { createLazyFileRoute } from "@tanstack/react-router";
import { PerformAnywhereWorkspace } from "@/components/performance/PerformAnywhereWorkspace";

export const Route = createLazyFileRoute("/perform-anywhere")({ component: PerformAnywhere });

function PerformAnywhere() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return <PerformAnywhereWorkspace grwm={search.experience === "grwm"} onExperienceChange={(g) => void navigate({ search: g ? { experience: "grwm" } : {} })} />;
}
