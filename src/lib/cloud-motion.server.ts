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
  const key = process.env.KIE_API_KEY!;
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const r = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "kling-2.6/motion-control",
      input: {
        prompt: i.prompt?.trim() || "Copy the exact body movement from the reference video onto the subject, keeping their face and identity unchanged.",
        input_urls: [i.imageUrl],
        video_urls: [i.drivingVideoUrl],
        character_orientation: "video",
        mode: "720p",
      },
    }),
  });
  const j = (await r.json().catch(() => ({}))) as { code?: number; msg?: string; data?: { taskId?: string } };
  if (j.code !== 200 || !j.data?.taskId) throw new Error(j.msg || "Kie rejected the motion request");
  const taskId = j.data.taskId;
  const deadline = Date.now() + 10 * 60_000;
  while (Date.now() < deadline) {
    await new Promise((res) => setTimeout(res, 5000));
    const s = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers });
    const d = ((await s.json().catch(() => ({}))) as { data?: { state?: string; resultJson?: string; failMsg?: string } }).data;
    if (d?.state === "fail") throw new Error(d.failMsg || "Kling motion failed");
    if (d?.state === "success") {
      const urls = (JSON.parse(d.resultJson || "{}") as { resultUrls?: string[] }).resultUrls ?? [];
      if (urls[0]) return urls[0];
      throw new Error("Kling returned no video");
    }
  }
  throw new Error("Kling motion timed out");
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
