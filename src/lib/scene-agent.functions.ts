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
    const text = `${SYSTEM}\n\nUploaded reference slots: ${data.filled.join(", ") || "none"}.\nCreator brief: ${data.brief}`;
    let outputText = "";
    try {
      const { bytePlusDolaResponse } = await import("./byteplus-tools.server");
      outputText = (await bytePlusDolaResponse({ text, timeoutMs: 40_000 })).outputText;
    } catch (err) {
      // Dola Seed unavailable (e.g. ModelArk billing) — fall back to Lovable AI so the agent still works.
      console.warn("[scene-agent] Dola failed, using Lovable AI fallback:", err instanceof Error ? err.message : err);
      const key = process.env.LOVABLE_API_KEY;
      if (!key) throw new Error("The scene agent is unavailable right now.");
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [{ role: "user", content: text }] }),
      });
      if (!r.ok) throw new Error(r.status === 429 ? "Scene agent is busy, try again shortly." : "The scene agent is unavailable right now.");
      const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
      outputText = j.choices?.[0]?.message?.content ?? "";
    }
    const match = outputText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The scene agent didn't return a plan. Try rephrasing.");
    const parsed = z
      .object({
        outfit: z.string().default(""), location: z.string().default(""), prop: z.string().default(""),
        pose: z.string().default(""), prompt: z.string().default(""), tips: z.array(z.string()).default([]),
      })
      .parse(JSON.parse(match[0]));
    return { ...parsed, tips: parsed.tips.slice(0, 3) };
  });
