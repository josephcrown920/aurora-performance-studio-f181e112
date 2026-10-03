import { z } from "zod";

export const AnywhereShotSchema = z.object({
  title: z.string(), outfit: z.string(), location: z.string(), scene: z.string(), camera: z.string(),
});
export const AnywherePlanSchema = z.object({
  title: z.string(), characterLock: z.string(), creativeBrief: z.string(), shots: z.array(AnywhereShotSchema),
});
export type AnywherePlan = z.infer<typeof AnywherePlanSchema>;
export type AnywhereRender = { jobId: string; status: string; progress: number; url?: string; videoId?: string; error?: string };
export type AnywhereCampaign = {
  id: string; characterName: string; preferences: string; plan: AnywherePlan;
  renders: Record<string, AnywhereRender>; blockedMessage: string | null;
};

export function validateAnywherePlan(input: unknown): AnywherePlan {
  const plan = AnywherePlanSchema.parse(input);
  if (plan.shots.length !== 30) throw new Error("The Director must return exactly 30 shots. Your references are still saved.");
  for (const field of ["outfit", "location", "scene"] as const) {
    const values = plan.shots.map((shot) => shot[field].trim().toLowerCase());
    if (values.some((value) => !value) || new Set(values).size !== 30) throw new Error(`Every shot needs a different ${field}. Review the plan before rendering.`);
  }
  if (!plan.characterLock.trim()) throw new Error("A character Context Lock is required.");
  return plan;
}

export function anywhereShotPrompt(plan: AnywherePlan, index: number, characterName: string) {
  const shot = plan.shots[index];
  if (!shot) throw new Error("Shot not found.");
  return `Perform Anywhere. One performer only: ${characterName}. Context Lock: ${plan.characterLock}. Preserve the same face, hair, skin tone, age and body proportions from all identity photos. Identity photos are NOT wardrobe or location constraints. Change clothing to: ${shot.outfit}. Location: ${shot.location}. Scene and action: ${shot.scene}. Camera: ${shot.camera}. Creative direction: ${plan.creativeBrief}. No other performers, duplicates, face changes, subtitles or on-screen text. One continuous cinematic performance take. No dialogue or music; the creator adds their song in the timeline.`;
}