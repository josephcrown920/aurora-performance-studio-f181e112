import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Cloud motion fallback: when no self-hosted motion worker is online, render the
 * already-reserved motion job on any configured cloud motion provider instead of
 * leaving it queued. Providers are tried in order until one succeeds.
 */
export type CloudMotionInput = {
  imageUrl: string;
  drivingVideoUrl: string;
  prompt?: string;
  cameraMovement?: string | null;
  motionType?: "faithful" | "expressive" | "subtle" | "exaggerated" | null;
  duration?: number;
};

type Attempt = { name: string; configured: () => boolean; run: (i: CloudMotionInput) => Promise<string> };

// Only cheap Kling 2.6 Motion Control via Kie.ai. Seedance is never used.
const PROVIDERS: Attempt[] = [
  {
    name: "kie-kling-2.6-motion-control",
    configured: () => Boolean(process.env.KIE_API_KEY),
    run: (i) => runKieKling(i),
  },
];

async function runKieKling(i: CloudMotionInput): Promise<string> {
  const { runKieTask } = await import("./kie.server");
  return runKieTask("kling-2.6/motion-control", {
    prompt: i.prompt?.trim() || "Copy the exact body movement from the reference video onto the subject, keeping their face and identity unchanged.",
    input_urls: [i.imageUrl],
    video_urls: [i.drivingVideoUrl],
    character_orientation: "video",
    mode: "720p",
  });
}

export function cloudMotionAvailable(): boolean {
  return PROVIDERS.some((p) => p.configured());
}

export async function renderMotionOnCloud(
  userId: string,
  generationId: string,
  jobId: string,
  input: CloudMotionInput,
): Promise<{ ok: true; provider: string; videoUrl: string } | { ok: false; error: string }> {
  const errors: string[] = [];
  await supabaseAdmin.from("jobs").update({ status: "running" } as never).eq("id", jobId);
  for (const p of PROVIDERS) {
    if (!p.configured()) continue;
    try {
      const remote = await p.run(input);
      let finalUrl = remote;
      try {
        const res = await fetch(remote);
        if (res.ok) {
          const bytes = new Uint8Array(await res.arrayBuffer());
          const path = `${userId}/results/${generationId}.mp4`;
          const { error } = await supabaseAdmin.storage.from("studio").upload(path, bytes, { contentType: "video/mp4", upsert: true });
          if (!error) finalUrl = supabaseAdmin.storage.from("studio").getPublicUrl(path).data.publicUrl;
        }
      } catch { /* keep provider URL */ }
      await supabaseAdmin.from("generations").update({ status: "complete", result_video_url: finalUrl } as never).eq("id", generationId);
      await supabaseAdmin.from("jobs").update({ status: "succeeded" } as never).eq("id", jobId);
      return { ok: true, provider: p.name, videoUrl: finalUrl };
    } catch (e) {
      errors.push(`${p.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const error = errors.length ? errors.join(" | ").slice(0, 900) : "No cloud motion provider is configured";
  await supabaseAdmin.from("generations").update({ status: "failed", error } as never).eq("id", generationId);
  await supabaseAdmin.from("jobs").update({ status: "failed", error } as never).eq("id", jobId);
  return { ok: false, error };
}
