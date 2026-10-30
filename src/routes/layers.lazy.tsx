import { createLazyFileRoute } from "@tanstack/react-router";
import { AuroraLayersStudio } from "@/components/layers/AuroraLayersStudio";

export const Route = createLazyFileRoute("/layers")({ component: AuroraLayersStudio });
