import { ClientOnly, createLazyFileRoute } from "@tanstack/react-router";
import { GuyStudio } from "@/features/guy-studio/GuyStudio";

export const Route = createLazyFileRoute("/layers")({ component: LayersWorkspace });

function LayersWorkspace() {
  return <ClientOnly fallback={<p role="status">Opening Layers…</p>}><GuyStudio initialMode="layers" /></ClientOnly>;
}
