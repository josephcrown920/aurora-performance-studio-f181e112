import { ClientOnly, createLazyFileRoute } from "@tanstack/react-router";
import { AuroraLayersStudio } from "@/components/layers/AuroraLayersStudio";

export const Route = createLazyFileRoute("/layers")({ component: LayersWorkspace });

function LayersWorkspace() {
  return <ClientOnly fallback={<p role="status">Opening Aurora Layers…</p>}><AuroraLayersStudio /></ClientOnly>;
}
