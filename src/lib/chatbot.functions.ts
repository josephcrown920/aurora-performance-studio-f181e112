import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  auroraConversation,
  AuroraConversationContext,
  AuroraConversationMessage,
} from "@/lib/aurora-conversation.server";

/** Shared authenticated chat endpoint for every Aurora workspace. */
export const auroraChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      firstName: z.string().trim().max(60).optional(),
      context: AuroraConversationContext.optional(),
      messages: z.array(AuroraConversationMessage).min(1).max(40),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    try {
      return await auroraConversation(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Aurora conversation failed";
      if (/429|rate.limit/i.test(msg)) throw new Error("OpenRouter free limit reached. Try again later.");
      if (/402|insufficient.credits/i.test(msg)) throw new Error("OpenRouter free capacity is unavailable.");
      throw new Error(msg);
    }
  });
