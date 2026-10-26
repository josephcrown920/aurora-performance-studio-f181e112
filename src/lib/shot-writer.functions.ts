import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  scene: z.string().trim().min(3).max(1500),
  title: z.string().max(200).default(""),
  characters: z.string().max(2000).default(""),
  previous: z.string().max(1500).default(""),
});

const ShotPlan = z.object({
  action: z.string(),
  frame: z.string(),
  shotType: z.string(),
  mood: z.string(),
  duration: z.number(),
});

export const writeShotWithAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured." as string, plan: null };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        output: Output.object({ schema: ShotPlan }),
        system:
          "You are a music-video director. Turn a scene idea into one performable shot for the artist. Keep the same person and continuity. action: what the performer does (1-2 sentences). frame: camera movement. shotType: framing (e.g. medium close-up). mood: lighting and mood. duration: seconds between 3 and 15.",
        prompt: `Shot title: ${data.title}\nScene idea: ${data.scene}\nCharacters: ${data.characters || "the artist"}\nPrevious shot: ${data.previous || "none"}`,
        providerOptions: {
          openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] },
        },
      });
      const plan = await result.output;
      return { error: null, plan: { ...plan, duration: Math.min(15, Math.max(3, Math.round(plan.duration))) } };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("shot writer failed", e);
      return {
        error: status === 402 ? "AI credits are used up. Add credits to keep writing shots." : status === 429 ? "Too many requests, try again in a moment." : "Couldn't write this shot right now.",
        plan: null,
      };
    }
  });
