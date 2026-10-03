import {
  COST_TIKTOK_REMIX_CUT,
  LIPSYNC_TIER_AURA,
  computeCost,
} from "./pricing";

export type ToolDirectoryItem = {
  number: string;
  name: string;
  label?: string;
  description: string;
  price: string;
  to: "/perform-anywhere" | "/colors" | "/spin" | "/video-agent" | "/music-video" | "/lipsync" | "/canvas" | "/prompt-lab" | "/aurora-canvas" | "/aurora-studio-shell";
};

/** Shared live-tool metadata used by the landing directory and Studio shortcuts. */
export const TOOL_DIRECTORY: ReadonlyArray<ToolDirectoryItem> = [
  { number: "00", name: "Perform Anywhere", label: "Flagship", description: "Phone performance → cinematic scene", price: `From ${computeCost({ features: ["video", "motion"], model: "seedance-2.0-fast" }).total} Aura`, to: "/motion" },
  { number: "01", name: "Colors", description: "Performance photo generation", price: `From ${computeCost({ features: ["image"] }).total} Aura`, to: "/colors" },
  { number: "02", name: "TikTok30", description: "UGC campaign engine", price: `From ${COST_TIKTOK_REMIX_CUT} Aura`, to: "/spin" },
  { number: "05", name: "Lip Sync", description: "Audio-synced video", price: `From ${LIPSYNC_TIER_AURA.budget} Aura`, to: "/lipsync" },
  { number: "07", name: "Prompt Lab", label: "New", description: "Turn an idea into a Seedream or Seedance prompt", price: "Free", to: "/prompt-lab" },
  { number: "09", name: "Nexus Dola Agents", label: "New", description: "Dola Seed agent workspace for video production", price: "Pay per render", to: "/aurora-studio-shell" },
] as const;