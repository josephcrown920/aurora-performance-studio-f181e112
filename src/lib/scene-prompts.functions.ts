import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SuggestionSchema = z.object({
  look: z.string(),
  scenes: z.array(z.object({ title: z.string(), prompt: z.string() })),
});

export type ScenePromptSuggestions = z.infer<typeof SuggestionSchema>;

export const suggestScenePrompts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      imagePath: z.string().min(3).max(500),
      videoType: z.enum(["Narrative", "Lyrics", "Visualizer"]),
      brief: z.string().max(2000).optional(),
      count: z.number().int().min(1).max(6),
    }).parse(d),
  )
  .handler(async ({ data, context }): Promise<ScenePromptSuggestions> => {
    // Only the creator's own uploads may be analysed.
    if (!data.imagePath.startsWith(`${context.userId}/`)) throw new Error("You can only use your own reference images.");
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured for this app yet.");

    // Send the image bytes inline so the model never depends on fetching a link.
    const { data: blob, error } = await context.supabase.storage.from("studio").download(data.imagePath);
    if (error || !blob) throw new Error("Could not read the reference image. Upload it again.");
    const mediaType = blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
    const bytes = new Uint8Array(await blob.arrayBuffer());

    const { structuredResponsesCall } = await import("@/features/creative-studio/lib/ai-gateway.server");
    const { data: result } = await structuredResponsesCall({
      apiKey,
      model: "openai/gpt-6-astra",
      schema: SuggestionSchema,
      system:
        "You are a music video director. Study the reference image (palette, lighting, wardrobe, setting, mood, era, lens feel) and write scene prompts for a video generator that match it. Each prompt is one vivid paragraph under 70 words describing setting, action, camera move and lighting. Never describe a real person's identity; refer to the subject as 'the performer'.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Write exactly ${data.count} scene prompts for a ${data.videoType} music video. ${data.brief?.trim() ? `Creator's brief: ${data.brief.trim()}` : ""} Also give a one-sentence summary of the visual look in "look".`,
            },
            { type: "image", image: bytes, mediaType },
          ],
        },
      ],
    });
    return { look: result.look, scenes: result.scenes.slice(0, data.count) };
  });
