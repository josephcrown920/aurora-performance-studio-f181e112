import { createLazyFileRoute } from "@tanstack/react-router";
import { LipSyncStudioPage } from "@/components/lipsync/LipSyncStudio";

export const Route = createLazyFileRoute("/lipsync")({ component: LipSyncStudioPage });
