import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { SCENE_BUILDER_COST_BASE } from '@/lib/scene-builder.templates';

export const renderLayersImage = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ prompt: z.string().min(10).max(3000), referenceUrls: z.array(z.string().url()).min(1).max(2) }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertOwnedReferenceImage } = await import('@/lib/url-guard');
    for (const url of data.referenceUrls) {
      const parsed = new URL(url);
      const storageOrigin = new URL(process.env['SUPABASE_URL'] ?? '').origin;
      const privatePrefix = `/storage/v1/object/sign/layers-private/${context.userId}/layers/`;
      if (parsed.origin === storageOrigin && parsed.pathname.startsWith(privatePrefix) && !/%2e|%2f|\.\./i.test(parsed.pathname)) {
        const path = decodeURIComponent(parsed.pathname.slice('/storage/v1/object/sign/layers-private/'.length));
        const { error } = await context.supabase.storage.from('layers-private').download(path);
        if (error) throw new Error('Reference image is unavailable or not yours.');
      } else await assertOwnedReferenceImage(url, context.userId);
    }
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
