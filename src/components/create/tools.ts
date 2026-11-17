export type HubTool = { to: string; name: string; tag: string; cost: string; badge?: string; img: string };
export const HUB_TOOLS: HubTool[] = [
  { to: "/perform-anywhere", name: "Genjutsu", tag: "Perform Anywhere & Get Ready With Me", cost: "PER RENDER", badge: "Flagship", img: "/nav-previews/perform-anywhere.jpg" },
  { to: "/colors", name: "Colors Studio", tag: "Color-led performance scenes", cost: "PER RENDER", img: "/nav-previews/studio.jpg" },
  { to: "/multiangle", name: "Multi-Angle Camera", tag: "One portrait, six camera angles", cost: "6 AURA", img: "/nav-previews/avatar.jpg" },
  { to: "/spin", name: "TikTok30", tag: "30-post campaign engine", cost: "PER RENDER", img: "/nav-previews/spin.jpg" },
  { to: "/video-agent", name: "Video Agent", tag: "Image, video, motion & lip sync", cost: "PER RENDER", img: "/nav-previews/video-agent.jpg" },
  { to: "/puremix", name: "PureMix Mastering", tag: "Music mixing & mastering", cost: "PREVIEW", img: "/nav-previews/music-video.jpg" },
  { to: "/soul", name: "Soul Studio", tag: "Artist identity & creative direction", cost: "PER RENDER", img: "/nav-previews/avatar.jpg" },
  { to: "/studio", name: "GUI Studio", tag: "Your complete video editor", cost: "FREE EDIT", img: "/nav-previews/studio.jpg" },
];
