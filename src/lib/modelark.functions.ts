import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { JOSH_CHARACTER, LAGOS40_LOCATIONS } from '@/features/lagos40/data';

const ARK = 'https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks';
const BUCKET = 'layers-private';
export const MODELARK_MODELS = {
  'seedance-2.5': 'dreamina-seedance-2-5-260628',
  'seedance-2.0-fast': 'dreamina-seedance-2-0-fast-260128',
} as const;

type Ctx = { supabase: any; userId: string };
async function assertAdmin(ctx: Ctx) {
  const { data } = await ctx.supabase.rpc('has_role', { _user: ctx.userId, _role: 'admin' });
  if (!data) throw new Error('Admins only.');
}
function key() {
  const k = process.env['MODELARK_API_KEY'];
  if (!k) throw new Error('ModelArk key is not set.');
  return k;
}

function bootPrompt(locId: number, duration: number) {
  const v = LAGOS40_LOCATIONS.find((l) => l.id === locId)!;
  return `Cinematic hip-hop music video, photorealistic, gritty high-end tone, shot on a street in ${v.location}, Lagos, Nigeria.
The man in [Image1] is ${JOSH_CHARACTER}
He is wearing ${v.outfit}.
Low angle static locked-off camera on the ground at eye level. Josh lies face down on rough dusty asphalt, arms crossed under his chin, looking up into the camera.
A Nigerian police officer stands over him pressing a heavy polished black leather boot firmly into Josh's upper back. Only the officer's navy uniform pants and boot are visible in the top third of the frame. Josh does not react at all.
Josh raps directly into the camera${'{AUDIO}'}, calm, firm, unshaken, sharp precise mouth movements, subtle smirk between lines.
${v.vibe}. ${v.flair}. Blurred Lagos street background, danfo buses in the distance, golden light flaring at the edges.
Teal-and-amber grade, 35mm film grain, shallow depth of field, realistic skin and fabric. All tattoos correctly readable, never mirrored. The boot stays on his back the whole time. No subtitles, no text, no camera movement. ${duration} seconds.`;
}

export const startModelArkShot = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    locationId: z.number().int().min(1).max(40),
    facePath: z.string().max(300),
    songPath: z.string().max(300).nullable(),
    model: z.enum(['seedance-2.5', 'seedance-2.0-fast']),
    duration: z.number().int().min(4).max(15),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const own = (p: string) => { if (!p.startsWith(`${context.userId}/modelark/`)) throw new Error('File must be yours.'); };
    own(data.facePath); if (data.songPath) own(data.songPath);
    const sign = async (p: string) => {
      const { data: s, error } = await context.supabase.storage.from(BUCKET).createSignedUrl(p, 7200);
      if (error || !s) throw new Error('Upload missing, add it again.');
      return s.signedUrl as string;
    };
    const content: any[] = [{ type: 'text', text: bootPrompt(data.locationId, data.duration).replace('{AUDIO}', data.songPath ? ', perfectly lip-synced to [Audio1]' : '') }];
    content.push({ type: 'image_url', image_url: { url: await sign(data.facePath) }, role: 'reference_image' });
    if (data.songPath) content.push({ type: 'audio_url', audio_url: { url: await sign(data.songPath) }, role: 'reference_audio' });
    const res = await fetch(ARK, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODELARK_MODELS[data.model], content, ratio: '9:16', resolution: '720p', duration: data.duration, generate_audio: true }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.id) return { ok: false as const, error: body?.error?.message ?? `ModelArk refused the request (${res.status}).` };
    return { ok: true as const, taskId: body.id as string };
  });

export const checkModelArkShot = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ taskId: z.string().regex(/^[A-Za-z0-9-]{4,80}$/), locationId: z.number().int() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const res = await fetch(`${ARK}/${data.taskId}`, { headers: { Authorization: `Bearer ${key()}` } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { status: 'failed' as const, error: body?.error?.message ?? `Status check failed (${res.status}).` };
    if (body.status === 'failed' || body.status === 'expired' || body.status === 'cancelled')
      return { status: 'failed' as const, error: body?.error?.message ?? `Video ${body.status}.` };
    if (body.status !== 'succeeded') return { status: 'running' as const };
    const vid = await fetch(body.content.video_url);
    if (!vid.ok) return { status: 'failed' as const, error: 'Could not download the finished video.' };
    const path = `${context.userId}/modelark/videos/loc${data.locationId}-${data.taskId}.mp4`;
    const { error } = await context.supabase.storage.from(BUCKET).upload(path, new Uint8Array(await vid.arrayBuffer()), { contentType: 'video/mp4', upsert: true });
    if (error) return { status: 'failed' as const, error: 'Saving the video failed.' };
    return { status: 'done' as const, path };
  });

export const listModelArkVideos = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const dir = `${context.userId}/modelark/videos`;
    const { data: files } = await context.supabase.storage.from(BUCKET).list(dir, { sortBy: { column: 'created_at', order: 'desc' }, limit: 200 });
    const out: { name: string; url: string }[] = [];
    for (const f of files ?? []) {
      const { data: s } = await context.supabase.storage.from(BUCKET).createSignedUrl(`${dir}/${f.name}`, 3600);
      if (s) out.push({ name: f.name, url: s.signedUrl });
    }
    return out;
  });
