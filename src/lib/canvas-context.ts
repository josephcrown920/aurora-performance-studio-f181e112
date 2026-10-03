import { z } from "zod";

export const ReferenceRole = z.enum(["identity", "wardrobe", "scene", "depth", "motion"]);
export const CanvasReferenceSchema = z.object({
  id: z.string().max(100),
  path: z.string().min(3).max(500),
  name: z.string().max(180),
  role: ReferenceRole,
  mediaType: z.string().max(100),
});
export const CanvasBriefSchema = z.object({
  title: z.string(),
  logline: z.string(),
  characterLock: z.string(),
  audience: z.string(),
  tone: z.string(),
  visualStyle: z.string(),
  wardrobe: z.string(),
  environment: z.string(),
  motionDirection: z.string(),
  depthPlan: z.string(),
  shots: z.array(z.object({ title: z.string(), prompt: z.string(), camera: z.string() })),
  questions: z.array(z.string()),
});
export const MotionTestSchema = z.object({
  id: z.string(),
  at: z.string(),
  status: z.enum(["passed", "failed"]),
  videoPath: z.string().nullable(),
  detail: z.string(),
});
export const CanvasContextSchema = z.object({
  characterName: z.string().trim().min(1).max(80),
  references: z.array(CanvasReferenceSchema).max(12),
  intent: z.string().max(3000),
  brief: CanvasBriefSchema.nullable(),
  motionTests: z.array(MotionTestSchema).max(20),
});
export type CanvasReference = z.infer<typeof CanvasReferenceSchema>;
export type CanvasBrief = z.infer<typeof CanvasBriefSchema>;
export type CanvasContext = z.infer<typeof CanvasContextSchema>;
export type MotionTest = z.infer<typeof MotionTestSchema>;

export function assertCanvasPaths(references: CanvasReference[], userId: string) {
  for (const ref of references) {
    if (!ref.path.startsWith(`${userId}/`) || ref.path.includes("..") || ref.path.includes("\\")) {
      throw new Error("Only your private reference files can be used.");
    }
  }
}

export function motionReadiness(references: CanvasReference[]) {
  return {
    identity: references.some((r) => r.role === "identity" && r.mediaType.startsWith("image/")),
    motion: references.some((r) => r.role === "motion" && r.mediaType.startsWith("video/")),
    depth: references.some((r) => r.role === "depth"),
  };
}