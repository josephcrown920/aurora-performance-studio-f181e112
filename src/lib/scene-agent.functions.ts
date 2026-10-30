import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ScenePlan = { outfit: string; location: string; prop: string; pose: string; prompt: string; tips: string[] };

const SYSTEM = `You are the Aurora Scene Agent, a music-video scene director.
Your only job: turn a creator's brief and their uploaded references into a ready Scene Builder setup.
Slots are Selfie (identity, never change the face), Outfit, Location, Pose, Car.
Every performance scene has a suspended vintage microphone at mouth height that the artist performs into.
Reply ONLY with JSON: {"outfit":"","location":"","prop":"","pose":"","prompt":"","tips":[""]}
- outfit/location/prop/pose: short concrete descriptions (under 20 words each). Keep what the creator specified.
- prompt: one cinematic, photoreal composition prompt that preserves exact identity and includes the hanging mic.
- tips: up to 3 short tips naming which empty slots would improve the result.`;

export const planSceneWithAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ brief: z.string().trim().min(3).max(1500), filled: z.array(z.string().max(20)).max(5) }).parse(d),
  )
  .handler(async ({ data }): Promise<ScenePlan> => {
    const { bytePlusDolaResponse } = await import("./byteplus-tools.server");
    const res = await bytePlusDolaResponse({
      text: `${SYSTEM}\n\nUploaded reference slots: ${data.filled.join(", ") || "none"}.\nCreator brief: ${data.brief}`,
      timeoutMs: 40_000,
    });
    const match = res.outputText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The scene agent didn't return a plan. Try rephrasing.");
    const parsed = z
      .object({
        outfit: z.string().default(""), location: z.string().default(""), prop: z.string().default(""),
        pose: z.string().default(""), prompt: z.string().default(""), tips: z.array(z.string()).default([]),
      })
      .parse(JSON.parse(match[0]));
    return { ...parsed, tips: parsed.tips.slice(0, 3) };
  });
