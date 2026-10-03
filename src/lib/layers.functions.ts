import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { SCENE_BUILDER_COST_BASE } from '@/lib/scene-builder.templates';

export const renderLayersImage = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ prompt: z.string().min(10).max(3000), referenceUrls: z.array(z.string().url()).min(1).max(2) }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertOwnedReferenceImage } = await import('@/lib/url-guard');
    for (const url of data.referenceUrls) await assertOwnedReferenceImage(url, context.userId);
    const { reserveOrchestrateRecord } = await import('@/lib/generate-core.server');
    const result = await reserveOrchestrateRecord({
      userId: context.userId, kind: 'image', prompt: `[Aurora Layers]\n${data.prompt}`,
      model: 'google/gemini-3.1-flash-image-preview', imageUrls: data.referenceUrls,
      cost: SCENE_BUILDER_COST_BASE, reason: 'layers_image_edit', editStrict: true,
      pinnedModelOnly: true,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    const { data: row } = await context.supabase.from('generations').select('result_image_url').eq('id', result.generationId).eq('user_id', context.userId).maybeSingle();
    return { ok: true as const, url: row?.result_image_url ?? result.url };
  });
