import { useEffect, useMemo, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MultiTrackTimeline } from '@/features/creative-studio/components/video/MultiTrackTimeline';
import { LayersEditor } from '@/features/creative-studio/components/video/LayersEditor';
import { newId, type Clip, type TimelineDoc } from '@/features/creative-studio/lib/timeline-state';
import { studioOwner, uploadLayerImage, type LayerAsset } from '@/components/layers/layers-storage';
import { downloadBlob } from '@/components/layers/layers-export';
import { renderLagos40Shot, LAGOS40_VIDEO_COST } from '@/lib/lagos40.functions';
import { JOSH_CHARACTER, LAGOS40_LOCATIONS, LYRIC_LINES, type Lagos40Location } from './data';

type Card = Lagos40Location & { enabled: boolean; status: 'idle' | 'rendering' | 'done' | 'failed'; videoUrl?: string; error?: string };
type Campaign = { version: 1; character: string; face?: LayerAsset; body?: LayerAsset; song?: { path: string; name: string }; songSeconds: number; lyrics: string[]; cards: Card[] };

const fresh = (): Campaign => ({ version: 1, character: JOSH_CHARACTER, songSeconds: 24, lyrics: LYRIC_LINES, cards: LAGOS40_LOCATIONS.map(l => ({ ...l, enabled: true, status: 'idle' })) });
const campaignPath = (owner: string) => `${owner}/lagos40/campaign.json`;

function shotPrompt(c: Campaign, card: Card) {
  return `Vertical 9:16 music video shot. Keep the person identical to the reference photos.\n\nCHARACTER LOCK:\n${c.character}\n\nLocation: ${card.location}, Lagos, Nigeria.\nOutfit: ${card.outfit}.\nNearby spot: ${card.eatery}.\nMood and light: ${card.vibe}.\nBackground detail: ${card.flair}.\nAction: he walks toward camera performing with confident swagger, then ${card.ending}.\nAll tattoos and text read correctly, never mirrored. Realistic, cinematic, handheld.`;
}

export function Lagos40Studio() {
  const render = useServerFn(renderLagos40Shot);
  const [c, setC] = useState<Campaign>(fresh);
  const [preview, setPreview] = useState<{ face?: string; body?: string; song?: string }>({});
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => { (async () => {
    try {
      const owner = await studioOwner();
      const { data } = await supabase.storage.from('layers-private').download(campaignPath(owner));
      if (!data) return;
      const saved: Campaign = JSON.parse(await data.text());
      if (saved.version !== 1) return;
      setC({ ...saved, cards: saved.cards.map(k => k.status === 'rendering' ? { ...k, status: 'idle' } : k) });
      const sign = async (p?: string) => p ? (await supabase.storage.from('layers-private').createSignedUrl(p, 86400)).data?.signedUrl : undefined;
      setPreview({ face: await sign(saved.face?.path), body: await sign(saved.body?.path), song: await sign(saved.song?.path) });
    } catch { /* signed out or nothing saved yet */ }
  })(); }, []);

  async function persist(next: Campaign) {
    setC(next);
    try {
      const owner = await studioOwner();
      await supabase.storage.from('layers-private').upload(campaignPath(owner), new Blob([JSON.stringify(next)], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
    } catch (e) { setNote(e instanceof Error ? e.message : 'Save failed.'); }
  }

  async function addPhoto(kind: 'face' | 'body', file?: File) {
    if (!file) return;
    const local = URL.createObjectURL(file);
    try {
      const asset = await uploadLayerImage(local, file.name);
      setPreview(p => { if (p[kind]?.startsWith('blob:')) URL.revokeObjectURL(p[kind]!); return { ...p, [kind]: local }; });
      await persist({ ...c, [kind]: asset });
    } catch (e) { URL.revokeObjectURL(local); setNote(e instanceof Error ? e.message : 'Upload failed.'); }
  }

  async function addSong(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('audio/') || file.size > 20 * 1024 * 1024) { setNote('Use an audio file under 20 MB.'); return; }
    try {
      const owner = await studioOwner();
      const path = `${owner}/lagos40/song-${crypto.randomUUID()}.${file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'mp3'}`;
      const { error } = await supabase.storage.from('layers-private').upload(path, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      const local = URL.createObjectURL(file);
      const secs = await new Promise<number>(res => { const a = new Audio(local); a.onloadedmetadata = () => res(Math.round(a.duration) || 24); a.onerror = () => res(24); });
      setPreview(p => ({ ...p, song: local }));
      await persist({ ...c, song: { path, name: file.name }, songSeconds: secs });
    } catch (e) { setNote(e instanceof Error ? e.message : 'Upload failed.'); }
  }

  function updateCard(id: number, patch: Partial<Card>, base = c) {
    const next = { ...base, cards: base.cards.map(k => k.id === id ? { ...k, ...patch } : k) };
    setC(next); return next;
  }

  async function makeVideos(only?: number) {
    const refs = [c.face?.path, c.body?.path].filter(Boolean) as string[];
    if (!refs.length) { setNote('Add Josh’s face or full-body photo first.'); return; }
    const queue = only ? c.cards.filter(k => k.id === only) : c.cards.filter(k => k.enabled && k.status !== 'done').slice(0, count);
    if (!queue.length) { setNote('No shots left to make.'); return; }
    setBusy(true); setNote('');
    let state = c;
    for (const card of queue) {
      state = updateCard(card.id, { status: 'rendering', error: undefined }, state);
      try {
        const res = await render({ data: { prompt: shotPrompt(state, card), referencePaths: refs, idempotencyKey: crypto.randomUUID() } });
        state = updateCard(card.id, res.ok ? { status: 'done', videoUrl: res.url } : { status: 'failed', error: res.error }, state);
        if (!res.ok) { await persist(state); setNote(res.error); break; }
      } catch (e) {
        state = updateCard(card.id, { status: 'failed', error: e instanceof Error ? e.message : 'Render failed.' }, state);
        await persist(state); setNote(e instanceof Error ? e.message : 'Render failed.'); break;
      }
      await persist(state);
    }
    setBusy(false);
  }

  function openInTimeline(card: Card) {
    if (!card.videoUrl) return;
    const secs = c.songSeconds || 24;
    const step = secs / Math.max(1, c.lyrics.length);
    const clips: Clip[] = [
      { id: newId(), track: 'V1', start: 0, duration: secs, name: card.location, kind: 'video', src: card.videoUrl },
      ...c.lyrics.map((line, i): Clip => ({ id: newId(), track: 'V3', start: +(i * step).toFixed(2), duration: +step.toFixed(2), name: line, kind: 'text', prompt: line })),
    ];
    if (preview.song) clips.push({ id: newId(), track: 'A1', start: 0, duration: secs, name: c.song?.name ?? 'Song clip', kind: 'audio', src: preview.song });
    const doc: TimelineDoc = { name: `Lagos 40 — ${card.id}`, ratio: '9:16', bpm: 140, genre: 'drill', seconds: secs, clips, hits: [] };
    window.dispatchEvent(new CustomEvent('aurora:apply-doc', { detail: doc }));
    document.getElementById('lagos40-timeline')?.scrollIntoView({ behavior: 'smooth' });
  }

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['id', 'location', 'outfit', 'status', 'video_url', 'error'], ...c.cards.map(k => [k.id, k.location, k.outfit, k.status, k.videoUrl, k.error])];
    downloadBlob(new Blob([rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }), 'lagos40-log.csv');
  }

  const done = useMemo(() => c.cards.filter(k => k.status === 'done').length, [c.cards]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-28">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase text-muted-foreground">NBA Josh · Out the Mud</p>
        <h1 className="mt-1 text-3xl font-bold">Lagos 40</h1>
        <p className="mt-2 text-muted-foreground">One artist, 40 Lagos locations, one song clip. {done}/40 made.</p>
      </header>

      <section className="mb-8 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-bold">1 · Character Lock</h2>
        <p className="mb-3 text-sm text-muted-foreground">Every shot uses this description and these photos.</p>
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <textarea className="min-h-48 w-full rounded-md border border-input bg-background p-3 text-sm" value={c.character} onChange={e => setC({ ...c, character: e.target.value })} onBlur={() => persist(c)} aria-label="Character description" />
          <div className="flex gap-3">
            {(['face', 'body'] as const).map(kind => (
              <label key={kind} className="flex w-32 cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border p-2 text-center text-xs">
                {preview[kind] ? <img src={preview[kind]} alt={`Josh ${kind}`} className="h-32 w-full rounded object-cover" /> : <span className="flex h-32 items-center text-muted-foreground">Add photo</span>}
                {kind === 'face' ? 'Face photo' : 'Full body photo'}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => addPhoto(kind, e.target.files?.[0])} />
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-bold">2 · Song clip</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm">{c.song ? `Replace (${c.song.name})` : 'Upload song clip'}<input type="file" accept="audio/*" className="sr-only" onChange={e => addSong(e.target.files?.[0])} /></label>
          {preview.song && <audio controls src={preview.song} className="h-9" />}
          <label className="text-sm">Length (seconds) <input type="number" min={5} max={60} value={c.songSeconds} onChange={e => setC({ ...c, songSeconds: Number(e.target.value) || 24 })} onBlur={() => persist(c)} className="ml-1 w-20 rounded-md border border-input bg-background px-2 py-1" /></label>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">{c.lyrics.map((l, i) => <li key={i}>{l}</li>)}</ol>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">3 · Locations</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm">Make <input type="number" min={1} max={40} value={count} onChange={e => setCount(Math.min(40, Math.max(1, Number(e.target.value) || 1)))} className="w-16 rounded-md border border-input bg-background px-2 py-1" /> videos</label>
            <Button disabled={busy} onClick={() => makeVideos()}>{busy ? 'Making…' : `Make (${LAGOS40_VIDEO_COST} Aura each)`}</Button>
            <Button variant="outline" onClick={exportCsv}>Download log</Button>
          </div>
        </div>
        {note && <p role="status" className="mb-3 rounded-md border border-border bg-muted p-2 text-sm">{note}</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.cards.map(card => (
            <article key={card.id} className="rounded-lg border border-border bg-card p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{card.id}. {card.location}</h3>
                <input type="checkbox" checked={card.enabled} aria-label={`Include ${card.location}`} onChange={e => persist(updateCard(card.id, { enabled: e.target.checked }))} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.vibe}</p>
              {card.videoUrl && <video src={card.videoUrl} controls playsInline className="mt-2 aspect-[9/16] w-full rounded bg-muted object-cover" />}
              {card.status === 'failed' && <p className="mt-2 text-xs text-destructive">{card.error}</p>}
              {open === card.id && (
                <div className="mt-2 space-y-2">
                  {(['outfit', 'eatery', 'vibe', 'ending', 'flair'] as const).map(f => (
                    <label key={f} className="block text-xs capitalize">{f === 'eatery' ? 'Spot' : f === 'flair' ? 'Background' : f}
                      <textarea className="mt-1 w-full rounded-md border border-input bg-background p-2" value={card[f]} onChange={e => updateCard(card.id, { [f]: e.target.value })} onBlur={() => persist(c)} />
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setOpen(open === card.id ? null : card.id)}>{open === card.id ? 'Close' : 'Edit'}</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => makeVideos(card.id)}>{card.status === 'done' ? 'Redo' : card.status === 'rendering' ? 'Making…' : 'Make'}</Button>
                {card.videoUrl && <Button size="sm" onClick={() => openInTimeline(card)}>Edit in timeline</Button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="lagos40-timeline" className="border-t border-border pt-6">
        <h2 className="mb-4 text-lg font-bold">4 · Edit and export</h2>
        <div className="min-w-0 overflow-x-auto"><MultiTrackTimeline /></div>
        <details className="mt-4"><summary className="cursor-pointer py-2 text-sm font-semibold">Timeline layers</summary><LayersEditor /></details>
      </section>
    </main>
  );
}
