import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { z } from "zod";

/** Shared, server-only conversational service. Never import into client components. */
export const AuroraConversationMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});
export type AuroraConversationMessage = z.infer<typeof AuroraConversationMessage>;
export const AuroraConversationContext = z.enum([
  "general", "imagine", "video-agent", "video-studio",
  "perform-anywhere", "soul", "canvas", "lipsync", "audio", "ugc", "colors",
]);
export type AuroraConversationContext = z.infer<typeof AuroraConversationContext>;

const CONTEXT_GUIDANCE: Record<AuroraConversationContext, string> = {
  general: "Help with Aurora tools, planning and everyday conversation.",
  imagine: "Clarify image prompts; do not generate images from greetings or ambiguous messages.",
  "video-agent": "Discuss creative direction, shot lists, scripts and model choices before any rendering.",
  "video-studio": "Help plan video edits, timelines and cinematic generation.",
  "perform-anywhere": "Help plan reference-driven performances while protecting character identity.",
  soul: "Help define and maintain consistent characters; never claim a character was trained.",
  canvas: "Help plan and explain node-based workflows; do not execute them.",
  lipsync: "Help plan audio-to-face lip synchronization; do not start a render.",
  audio: "Help plan vocal, mixing and mastering tasks; do not process files.",
  ugc: "Help plan UGC scripts and creative briefs; do not create paid assets.",
  colors: "Help with palettes, styling and visual direction; do not generate assets.",
};

export const AURORA_CONVERSATION_POLICY = `You are Aurora Prime, the helpful conversational assistant across Aurora Studio.
Understand intent before taking action. Greetings, questions, brainstorming, and unclear phrases
are conversations, not generation commands. Ask one short clarification for ambiguous prompts.
For explicit creative requests, help prepare a brief and recommend appropriate Aurora tools.
This service is TEXT ONLY: it cannot execute image, video, audio, training, or editing jobs.
Never claim a job ran or that credits were charged. Paid operations require a separate
server-validated exact Aura quote and explicit user confirmation. Never invent prices,
available models, free quotas, or completed work. Keep replies concise unless asked.`;

export async function auroraConversation({
  messages, context = "general", firstName,
}: {
  messages: AuroraConversationMessage[];
  context?: AuroraConversationContext;
  firstName?: string;
}): Promise<{ reply: string; provider: "OpenRouter"; model: string }> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) throw new Error("Aurora conversations are unavailable: OPENROUTER_API_KEY is not configured.");
  const model = process.env.OPENROUTER_CHAT_MODEL?.trim() || "openrouter/free";
  // Never silently route text conversations to a paid model.
  if (model !== "openrouter/free" && !model.endsWith(":free")) {
    throw new Error("Aurora free mode requires openrouter/free or a model ending in :free.");
  }
  const gateway = createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    headers: { Authorization: `Bearer ${key}` },
  });
  const system = [
    AURORA_CONVERSATION_POLICY,
    `Workspace: ${context}. ${CONTEXT_GUIDANCE[context]}`,
    firstName ? `User's preferred first name: ${firstName}.` : "",
  ].filter(Boolean).join("\n");
  const result = await generateText({ model: gateway(model), system, messages });
  if (!result.text?.trim()) throw new Error("Aurora received an empty response.");
  return { reply: result.text, provider: "OpenRouter", model };
}
