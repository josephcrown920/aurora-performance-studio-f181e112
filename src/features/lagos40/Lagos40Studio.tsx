import { useEffect, useMemo, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MultiTrackTimeline } from '@/features/creative-studio/components/video/MultiTrackTimeline';
import { LayersEditor } from '@/features/creative-studio/components/video/LayersEditor';
import { studioOwner, uploadLayerImage, type LayerAsset } from '@/components/layers/layers-storage';
import { downloadBlob } from '@/components/layers/layers-export';
import { renderLagos40Shot, LAGOS40_VIDEO_COST } from '@/lib/lagos40.functions';
import { JOSH_CHARACTER, LAGOS40_LOCATIONS, LYRIC_LINES } from './data';
import { breakdown, finalCut, scenePrompt, CAMERA_MOVES, type Card, type Scene } from './pipeline';
import THE_ONE_HOOK from '@/assets/the-one-hook.mp3.asset.json';

type Campaign = { version: 1; character: string; face?: LayerAsset; body?: LayerAsset; song?: { path: string; name: string }; songSeconds: number; lyrics: string[]; cards: Card[] };

const fresh = (): Campaign => ({ version: 1, character: JOSH_CHARACTER, songSeconds: 24, lyrics: LYRIC_LINES, cards: LAGOS40_LOCATIONS.map(l => ({ ...l, enabled: true, scenes: breakdown(l, 24, LYRIC_LINES) })) });
const cardDone = (k: Card) => k.scenes.length > 0 && k.scenes.every(s => s.status === 'done');
const campaignPath = (owner: string) => `${owner}/lagos40/campaign.json`;

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
      setC({ ...saved, cards: saved.cards.map(k => ({ ...k, scenes: (k.scenes ?? breakdown(k, saved.songSeconds, saved.lyrics)).map(sc => sc.status === 'rendering' ? { ...sc, status: 'idle' as const } : sc) })) });
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

  function updateScene(cardId: number, sceneId: string, patch: Partial<Scene>, base = c) {
    const next = { ...base, cards: base.cards.map(k => k.id === cardId ? { ...k, scenes: k.scenes.map(sc => sc.id === sceneId ? { ...sc, ...patch } : sc) } : k) };
    setC(next); return next;
  }

  function rebreak(cardId: number) {
    const card = c.cards.find(k => k.id === cardId); if (!card) return;
    persist(updateCard(cardId, { scenes: breakdown(card, c.songSeconds, c.lyrics) }));
  }

  /** Renders every unfinished scene of the chosen cards in order, stopping at the first failure. */
  async function renderCards(cards: Card[], redo = false) {
    const refs = [c.face?.path, c.body?.path].filter(Boolean) as string[];
    if (!refs.length) { setNote('Step 1: add Josh’s face or full-body photo first.'); return; }
    if (!cards.length) { setNote('No locations left to render.'); return; }
    setBusy(true); setNote('');
    let state = c;
    outer: for (const card of cards) {
      const scenes = state.cards.find(k => k.id === card.id)!.scenes;
      for (const [index, scene] of scenes.entries()) {
        if (scene.status === 'done' && !redo) continue;
        state = updateScene(card.id, scene.id, { status: 'rendering', error: undefined }, state);
        const live = state.cards.find(k => k.id === card.id)!;
        try {
          const res = await render({ data: { prompt: scenePrompt(state.character, live, scene, index), referencePaths: refs, duration: Math.min(10, Math.max(3, Math.round(scene.duration))), idempotencyKey: crypto.randomUUID() } });
          state = updateScene(card.id, scene.id, res.ok ? { status: 'done', videoUrl: res.url } : { status: 'failed', error: res.error }, state);
          await persist(state);
          if (!res.ok) { setNote(res.error); break outer; }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Render failed.';
          state = updateScene(card.id, scene.id, { status: 'failed', error: msg }, state);
          await persist(state); setNote(msg); break outer;
        }
      }
    }
    setBusy(false);
  }

  function openInTimeline(card: Card) {
    window.dispatchEvent(new CustomEvent('aurora:apply-doc', { detail: finalCut(card, c.songSeconds || 24, preview.song, c.song?.name) }));
    document.getElementById('lagos40-timeline')?.scrollIntoView({ behavior: 'smooth' });
  }

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['location_id', 'location', 'scene', 'start', 'camera', 'action', 'status', 'video_url', 'error'], ...c.cards.flatMap(k => k.scenes.map((sc, i) => [k.id, k.location, i + 1, sc.start, sc.camera, sc.action, sc.status, sc.videoUrl, sc.error]))];
    downloadBlob(new Blob([rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }), 'lagos40-log.csv');
  }

  const done = useMemo(() => c.cards.filter(cardDone).length, [c.cards]);

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
          {c.song?.name !== THE_ONE_HOOK.original_filename && <Button size="sm" variant="outline" onClick={async () => { try { const b = await (await fetch(THE_ONE_HOOK.url)).blob(); await addSong(new File([b], THE_ONE_HOOK.original_filename, { type: 'audio/mpeg' })); } catch { setNote('Could not load the hook.'); } }}>Use "The One" hook</Button>}
          {preview.song && <audio controls src={preview.song} className="h-9" />}
          <label className="text-sm">Length (seconds) <input type="number" min={5} max={60} value={c.songSeconds} onChange={e => setC({ ...c, songSeconds: Number(e.target.value) || 24 })} onBlur={() => persist(c)} className="ml-1 w-20 rounded-md border border-input bg-background px-2 py-1" /></label>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">{c.lyrics.map((l, i) => <li key={i}>{l}</li>)}</ol>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">3 · Scenes, motion and render</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm">Make <input type="number" min={1} max={40} value={count} onChange={e => setCount(Math.min(40, Math.max(1, Number(e.target.value) || 1)))} className="w-16 rounded-md border border-input bg-background px-2 py-1" /> videos</label>
            <Button disabled={busy} onClick={() => renderCards(c.cards.filter(k => k.enabled && !cardDone(k)).slice(0, count))}>{busy ? 'Rendering…' : `Render (${LAGOS40_VIDEO_COST} Aura per scene)`}</Button>
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
              <p className="mt-1 text-xs">{card.scenes.filter(sc => sc.status === 'done').length}/{card.scenes.length} scenes rendered</p>
              <div className="mt-2 flex gap-1 overflow-x-auto">{card.scenes.map(sc => sc.videoUrl ? <video key={sc.id} src={sc.videoUrl} muted playsInline className="aspect-[9/16] w-14 shrink-0 rounded bg-muted object-cover" /> : <span key={sc.id} className={`aspect-[9/16] w-14 shrink-0 rounded border border-border ${sc.status === 'rendering' ? 'animate-pulse bg-muted' : sc.status === 'failed' ? 'bg-destructive/30' : ''}`} />)}</div>
              {card.scenes.find(sc => sc.status === 'failed') && <p className="mt-2 text-xs text-destructive">{card.scenes.find(sc => sc.status === 'failed')?.error}</p>}
              {open === card.id && (
                <div className="mt-2 space-y-2">
                  {(['outfit', 'eatery', 'vibe', 'ending', 'flair'] as const).map(f => (
                    <label key={f} className="block text-xs capitalize">{f === 'eatery' ? 'Spot' : f === 'flair' ? 'Background' : f}
                      <textarea className="mt-1 w-full rounded-md border border-input bg-background p-2" value={card[f]} onChange={e => updateCard(card.id, { [f]: e.target.value })} onBlur={() => persist(c)} />
                    </label>
                  ))}
                  <div className="flex items-center justify-between pt-2"><h4 className="text-xs font-semibold uppercase">Scene breakdown and motion plan</h4><Button size="sm" variant="outline" disabled={busy} onClick={() => rebreak(card.id)}>Rebuild scenes</Button></div>
                  {card.scenes.map((sc, i) => (
                    <div key={sc.id} className="space-y-1 rounded-md border border-border p-2 text-xs">
                      <div className="flex justify-between font-semibold"><span>Scene {i + 1} · {sc.start}s–{+(sc.start + sc.duration).toFixed(2)}s</span><span className="text-muted-foreground">{sc.status}</span></div>
                      {sc.lyrics.length > 0 && <p className="italic text-muted-foreground">“{sc.lyrics.join(' / ')}”</p>}
                      <label className="block">Camera<select className="mt-1 w-full rounded-md border border-input bg-background p-1" value={sc.camera} onChange={e => persist(updateScene(card.id, sc.id, { camera: e.target.value }))}>{CAMERA_MOVES.map(m => <option key={m}>{m}</option>)}</select></label>
                      <label className="block">Action<textarea className="mt-1 w-full rounded-md border border-input bg-background p-1" value={sc.action} onChange={e => updateScene(card.id, sc.id, { action: e.target.value })} onBlur={() => persist(c)} /></label>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => { const next = updateScene(card.id, sc.id, { status: 'idle' }); renderCards(next.cards.filter(k => k.id === card.id)); }}>{sc.status === 'done' ? 'Redo scene' : 'Render scene'}</Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setOpen(open === card.id ? null : card.id)}>{open === card.id ? 'Close' : 'Edit'}</Button>
                <Button size="sm" variant="outline" disabled={busy || cardDone(card)} onClick={() => renderCards([card])}>Render all scenes</Button>
                {card.scenes.some(sc => sc.videoUrl) && <Button size="sm" onClick={() => openInTimeline(card)}>Final cut</Button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="lagos40-timeline" className="border-t border-border pt-6">
        <h2 className="mb-4 text-lg font-bold">4 · Final cut and export</h2>
        <div className="min-w-0 overflow-x-auto"><MultiTrackTimeline /></div>
        <details className="mt-4"><summary className="cursor-pointer py-2 text-sm font-semibold">Timeline layers</summary><LayersEditor /></details>
      </section>
    </main>
  );
}
