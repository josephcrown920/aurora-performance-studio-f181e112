import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM = `You are Aurora Prime, Aurora Studio's conversational creative director.
Understand the user's intent before proposing any generation. A greeting, unclear phrase,
question, or brainstorming request is a conversation, NOT a generation instruction.
For unclear input ask one short clarifying question. For explicit image, video, audio,
or editing requests, help refine the brief and explain which Aurora tool fits.
You cannot directly launch paid generation from this chat endpoint. Never claim that
content was generated or credits were deducted. Generation requires a separate,
server-validated exact Aura quote and explicit user confirmation.
Never invent credit prices, free allowances, model availability, or capabilities.
If the price is unavailable, say that generation must wait for a verified quote.
Be helpful, concise, and conversational. Keep responses under 120 words unless asked.`;

const Msg = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const auroraChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      firstName: z.string().trim().max(60).optional(),
      messages: z.array(Msg).min(1).max(40),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const nameLine = data.firstName ? `\n\nThe user's first name is ${data.firstName}. Address them naturally.` : "";

    try {
      // Only the explicitly configured OpenRouter provider is used.
      // Do not silently fall back to a paid Lovable or BytePlus gateway.
      const apiKey = process.env.OPENROUTER_API_KEY?.trim();
      if (!apiKey) throw new Error("Aurora Prime is not configured: set OPENROUTER_API_KEY on the server.");
      const model = process.env.OPENROUTER_CHAT_MODEL?.trim() || "openrouter/free";
      const gateway = createOpenAICompatible({
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const { text } = await generateText({
        model: gateway(model),
        system: SYSTEM + nameLine,
        messages: data.messages,
      });
      if (!text?.trim()) throw new Error("Aurora Prime received an empty reply.");
      return { reply: text, provider: "OpenRouter", model };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Concierge failed";
      if (msg.includes("429")) throw new Error("Concierge is rate-limited. Try again in a moment.");
      if (msg.includes("402")) throw new Error("Out of AI credits.");
      throw new Error(msg);
    }
  });
