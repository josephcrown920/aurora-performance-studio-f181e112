import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { computeCost } from '@/lib/pricing';

export const LAGOS40_VIDEO_COST = computeCost({ features: ['video'] }).total;

const pathSchema = z.string().regex(/^[0-9a-f-]{36}\/layers\/[0-9a-f-]{36}\.(png|jpg|webp)$/);

/** Renders one Lagos 40 location shot from the creator's private Character Lock photos. */
export const renderLagos40Shot = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ prompt: z.string().min(20).max(6000), referencePaths: z.array(pathSchema).min(1).max(2), idempotencyKey: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const imageUrls: string[] = [];
    for (const path of data.referencePaths) {
      if (!path.startsWith(`${context.userId}/layers/`)) throw new Error('Character photos must belong to you.');
      const { data: signed, error } = await context.supabase.storage.from('layers-private').createSignedUrl(path, 3600);
      if (error || !signed) throw new Error('Character photo unavailable. Upload it again.');
      imageUrls.push(signed.signedUrl);
    }
    const { reserveOrchestrateRecord } = await import('@/lib/generate-core.server');
    const outcome = await reserveOrchestrateRecord({
      userId: context.userId, kind: 'video', prompt: data.prompt, imageUrls,
      cost: LAGOS40_VIDEO_COST, reason: 'lagos40_shot', aspectRatio: '9:16', idempotencyKey: data.idempotencyKey,
    });
    if (!outcome.ok) return { ok: false as const, error: outcome.error };
    return { ok: true as const, url: outcome.url };
  });
