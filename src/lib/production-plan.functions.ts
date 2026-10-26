import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  brief: z.string().max(1500).default(""),
  characters: z.string().max(2000).default(""),
  shots: z.array(z.object({ id: z.string().max(80), title: z.string().max(200), prompt: z.string().max(1000), action: z.string().max(600), frame: z.string().max(200), duration: z.number() })).max(40),
  clips: z.array(z.object({ id: z.string().max(80), track: z.string().max(8), start: z.number(), duration: z.number(), name: z.string().max(200), effect: z.string().max(40).nullable(), look: z.string().max(40).nullable() })).max(120),
  effects: z.array(z.string().max(40)).max(40),
  looks: z.array(z.string().max(40)).max(40),
});

const Plan = z.object({
  logline: z.string(),
  continuity: z.array(z.string()),
  shots: z.array(z.object({ id: z.string(), action: z.string(), frame: z.string(), shotType: z.string(), mood: z.string(), motionPrompt: z.string(), duration: z.number() })),
  edits: z.array(z.object({ id: z.string(), start: z.number().nullable(), duration: z.number().nullable(), effect: z.string().nullable(), look: z.string().nullable(), reason: z.string() })),
});
export type ProductionPlan = z.infer<typeof Plan>;

export const planProduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured.", plan: null as ProductionPlan | null };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const openai = createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key, headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" } });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        output: Output.object({ schema: Plan }),
        system: `You are Aurora's music-video director. Read the creator's canvas shots (in chain order) and timeline clips, then return a production plan. Keep the same performer and continuity throughout. shots: one entry per canvas shot using its exact id, with action, camera frame, shotType, mood, a vivid motionPrompt for a video generator, and duration 3-15s. continuity: short notes on wardrobe, lighting, and story issues. edits: suggestions for existing clip ids only; effect must be one of [${data.effects.join(", ")}] or null; look one of [${data.looks.join(", ")}] or null; null for unchanged fields. Never invent ids.`,
        prompt: JSON.stringify({ brief: data.brief, characters: data.characters, shots: data.shots, clips: data.clips }),
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] } },
      });
      const plan = await result.output;
      const shotIds = new Set(data.shots.map((s) => s.id));
      const clipIds = new Set(data.clips.map((c) => c.id));
      return {
        error: null,
        plan: {
          ...plan,
          shots: plan.shots.filter((s) => shotIds.has(s.id)).map((s) => ({ ...s, duration: Math.min(15, Math.max(3, Math.round(s.duration))) })),
          edits: plan.edits.filter((e) => clipIds.has(e.id)).map((e) => ({ ...e, effect: e.effect && data.effects.includes(e.effect) ? e.effect : null, look: e.look && data.looks.includes(e.look) ? e.look : null })),
        },
      };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("production plan failed", e);
      return { error: status === 402 ? "AI credits are used up. Add credits to keep planning." : status === 429 ? "Too many requests, try again in a moment." : "Couldn't build a plan right now.", plan: null };
    }
  });
