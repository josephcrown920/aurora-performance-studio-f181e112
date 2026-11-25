import { ClientOnly, createLazyFileRoute } from "@tanstack/react-router";
import { LayersLanding } from "@/components/layers/LayersLanding";

export const Route = createLazyFileRoute("/layers")({ component: LayersWorkspace });

function LayersWorkspace() {
  return <ClientOnly fallback={<p role="status">Opening Aurora Layers…</p>}><LayersLanding /></ClientOnly>;
}
