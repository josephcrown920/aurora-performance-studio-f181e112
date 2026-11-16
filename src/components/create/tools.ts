export type HubTool = { to: string; name: string; tag: string; cost: string; badge?: string; img: string };
export const HUB_TOOLS: HubTool[] = [
  { to: "/perform-anywhere", name: "Perform Anywhere", tag: "AI live performance engine", cost: "FREE", badge: "Flagship", img: "/nav-previews/perform-anywhere.jpg" },
  { to: "/spin", name: "TikTok30", tag: "UGC campaign engine", cost: "6 CR", img: "/nav-previews/spin.jpg" },
  { to: "/video-agent", name: "Video Agent", tag: "AI video production assistant", cost: "10 CR", img: "/nav-previews/video-agent.jpg" },
  { to: "/lipsync", name: "Lip Sync", tag: "Audio-synced video", cost: "8 CR", img: "/nav-previews/lipsync.jpg" },
  { to: "/motion", name: "Motion Control", tag: "Kinetic visual generation", cost: "10 CR", badge: "Flagship", img: "/nav-previews/motion.jpg" },
];
