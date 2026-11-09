import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildKiePerformanceInput, kiePerformanceModelSchema, type KiePerformanceModel } from "./kie-payloads";

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
  model?: KiePerformanceModel;
};

export function cloudMotionAvailable(): boolean {
  return Boolean(process.env.KIE_API_KEY?.trim());
}

export async function renderMotionOnCloud(
  userId: string,
  generationId: string,
  jobId: string,
  input: CloudMotionInput,
): Promise<{ ok: true; provider: string; videoUrl: string } | { ok: false; error: string }> {
  const model = kiePerformanceModelSchema.parse(input.model ?? "kling-2.6/motion-control");
  await supabaseAdmin.from("jobs").update({ status: "running" } as never).eq("id", jobId);
  await supabaseAdmin.from("generations").update({ model } as never).eq("id", generationId).eq("user_id", userId);
    try {
      const { runKieTask } = await import("./kie.server");
      const remote = await runKieTask(model, buildKiePerformanceInput(model, input.imageUrl, input.drivingVideoUrl, input.prompt, input.duration), 10 * 60_000);
      let finalUrl: string;
        const res = await fetch(remote);
        if (!res.ok) throw new Error("The generated video could not be downloaded for private storage");
          const bytes = new Uint8Array(await res.arrayBuffer());
          const path = `${userId}/results/${generationId}.mp4`;
          const { error } = await supabaseAdmin.storage.from("studio").upload(path, bytes, { contentType: "video/mp4", upsert: true });
          if (error) throw new Error("The generated video could not be saved privately");
          const { data: signed, error: signError } = await supabaseAdmin.storage.from("studio").createSignedUrl(path, 3600);
          if (signError || !signed?.signedUrl) throw new Error("The private generated video could not be opened");
          finalUrl = signed.signedUrl;
      await supabaseAdmin.from("generations").update({ status: "complete", result_video_url: finalUrl } as never).eq("id", generationId);
      await supabaseAdmin.from("jobs").update({ status: "succeeded" } as never).eq("id", jobId);
      return { ok: true, provider: `kie:${model}`, videoUrl: finalUrl };
    } catch (e) {
  const error = `${model}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 900);
  await supabaseAdmin.from("generations").update({ status: "failed", error } as never).eq("id", generationId);
  await supabaseAdmin.from("jobs").update({ status: "failed", error } as never).eq("id", jobId);
  return { ok: false, error };
  }
}
