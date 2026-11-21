import { useEffect, useRef, useState } from 'react';
import { ClientOnly, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowDown, ArrowUp, Copy, Download, Eye, ImagePlus, Layers3, Loader2, Lock, Plus, RotateCcw, Save, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadTimeline, type Clip, type TimelineDoc } from '@/features/creative-studio/lib/timeline-state';
import { renderLayersImage } from '@/lib/layers.functions';
import { SCENE_BUILDER_COST_BASE } from '@/lib/scene-builder.templates';
import { layerImageUrl, listLayersProjects, loadLayersProject, removeLayersProject, saveLayersProject, uploadLayerImage, type LayerAsset, type LayersProject } from './layers-storage';
import { exportContactSheet, exportLayerPng, exportLayersZip } from './layers-export';
import { freshLayerImageUrl } from './layers-storage';
import '@/features/creative-studio/editor-workstation.css';

const TARGETS = [
  { id: 'background', name: 'Background', icon: '▦', region: 'the environment behind the subjects', sample: 'Night block party, neon signage, wet asphalt reflections' },
  { id: 'talent', name: 'Talent', icon: '☻', region: 'the subject’s body and posture only', sample: 'Same person, shoulders squared to camera' },
  { id: 'face', name: 'Face', icon: '◉', region: 'facial makeup only, preserving facial identity', sample: 'Subtle cinematic makeup, preserve facial features' },
  { id: 'hair', name: 'Hair', icon: '≈', region: 'hair and headwear only', sample: 'Long neon-green braids with beaded tips' },
  { id: 'wardrobe', name: 'Wardrobe', icon: '▧', region: 'clothing only', sample: 'Puffer jacket, cargo pants, designer shades' },
  { id: 'jewelry', name: 'Jewelry', icon: '✦', region: 'chains, rings, watches and accessories only', sample: 'Iced-out cuban links, diamond rings' },
  { id: 'props', name: 'Props', icon: '◈', region: 'handheld objects and props only', sample: 'Swap the handheld prop for a chrome boombox' },
  { id: 'lighting', name: 'Lighting', icon: '✸', region: 'lighting and colour grade only', sample: 'Hard magenta rim light, teal shadows, light haze' },
];
const PRESETS = [
  'Turn the outfit into full trap streetwear — puffer jacket, iced-out cuban chains, designer shades',
  'Give the subject long neon-green braids and an oversized varsity jacket',
  'Add a red bandana, backwards fitted cap and gold rope chain',
  'Relight the scene as a night block party with neon signage',
];
type ImageState = { src: string; name: string; asset?: LayerAsset };
const emptyDoc = (): TimelineDoc => loadTimeline();
const message = (error: unknown) => error instanceof Error ? error.message : 'The action could not be completed.';

export function AuroraLayersStudio() {
  return <ClientOnly fallback={<div className="p-12 text-center text-muted-foreground">Loading Layers…</div>}><Studio /></ClientOnly>;
}
function Studio() {
  const [name, setName] = useState('Untitled shoot');
  const [id, setId] = useState<string>(() => crypto.randomUUID());
  const [source, setSource] = useState<ImageState>();
  const [character, setCharacter] = useState<ImageState>();
  const [prompt, setPrompt] = useState(PRESETS[0] ?? '');
  const [lock, setLock] = useState(true);
  const [target, setTarget] = useState<string>();
  const [edits, setEdits] = useState<Record<string, { prompt: string; image?: ImageState }>>({});
  const [doc, setDoc] = useState<TimelineDoc>(emptyDoc);
  const [active, setActive] = useState<string>();
  const [original, setOriginal] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [dragging, setDragging] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const reference = useRef<HTMLInputElement>(null);
  const temporaryUrls = useRef<string[]>([]);
  const renderImage = useServerFn(renderLayersImage);
  const shots = doc.clips.filter(clip => clip.kind === 'image' && clip.src).sort((a, b) => a.start - b.start);
  const result = shots.find(clip => clip.id === active) ?? shots[shots.length - 1];
  const display = original ? source?.src : result?.src ?? source?.src;
  const definition = TARGETS.find(item => item.id === target);

  useEffect(() => {
    void listLayersProjects().then(setProjects).catch(() => {});
    const update = (event: Event) => setDoc((event as CustomEvent<TimelineDoc>).detail);
    window.addEventListener('aurora:timeline-change', update);
    return () => { window.removeEventListener('aurora:timeline-change', update); temporaryUrls.current.forEach(url => URL.revokeObjectURL(url)); };
  }, []);
  useEffect(() => {
    const retained = new Set([source?.src, character?.src, ...doc.clips.map(clip => clip.src)]);
    temporaryUrls.current = temporaryUrls.current.filter(url => {
      if (retained.has(url)) return true;
      URL.revokeObjectURL(url); return false;
    });
  }, [source, character, doc]);
  function apply(next: TimelineDoc) { window.dispatchEvent(new CustomEvent('aurora:apply-doc', { detail: next })); }
  async function task(label: string, run: () => Promise<void>) {
    if (busy) return;
    setBusy(label); setError(''); setNote('');
    try { await run(); } catch (failure) { setError(message(failure)); } finally { setBusy(undefined); }
  }
  function readImage(value: File | undefined, role: 'source' | 'character') {
    if (!value) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(value.type)) { setError('Use a JPG, PNG or WebP photo.'); return; }
    if (value.size > 20 * 1024 * 1024) { setError('Images must be smaller than 20 MB.'); return; }
    const src = URL.createObjectURL(value); temporaryUrls.current.push(src);
    const image = { src, name: value.name };
    if (role === 'source') { setSource(image); setEdits({}); setTarget(undefined); setOriginal(true); }
    else setCharacter(image);
    setError('');
  }
  async function persist(image: ImageState) {
    if (image.asset) return image.asset;
    return uploadLayerImage(image.src, image.name);
  }
  async function render() {
    await task('render', async () => {
      if (!source || !prompt.trim()) throw new Error('Add a source photo and an edit prompt first.');
      const sourceAsset = await persist(source);
      setSource({ ...source, asset: sourceAsset });
      const baseUrl = result?.src ? await freshLayerImageUrl(result.src) : await layerImageUrl(sourceAsset);
      const refs = [baseUrl];
      if (character) { const asset = await persist(character); setCharacter({ ...character, asset }); refs.push(await layerImageUrl(asset)); }
      const fullPrompt = [
        definition ? `EDIT TARGET: ${definition.region}. Preserve all other regions as closely as possible.` : '',
        prompt.trim(),
        lock ? 'IDENTITY LOCK: preserve the same facial identity, skin tone, body proportions, expression, camera angle, framing and subject position. Do not mirror, swap or recast the person. Change only what the edit requests.' : '',
        character ? 'The second image is the character sheet. Use it only to maintain the same person.' : '',
      ].filter(Boolean).join('\n\n');
      const outcome = await renderImage({ data: { prompt: fullPrompt, referenceUrls: refs } });
      if (!outcome.ok) throw new Error(outcome.error);
      const resultAsset = await uploadLayerImage(outcome.url, definition ? `${definition.name} edit` : 'Layer edit');
      const privateResultUrl = await layerImageUrl(resultAsset);
      const clipId = crypto.randomUUID();
      const start = Math.max(0, ...doc.clips.map(clip => clip.start + clip.duration));
      const clip: Clip = { id: clipId, track: 'V1', kind: 'image', start, duration: 5, name: definition ? `${definition.name} edit` : `Shot ${shots.length + 1}`, src: privateResultUrl, prompt };
      apply({ ...doc, seconds: Math.max(doc.seconds, start + 5), clips: [...doc.clips, clip] });
      setActive(clipId); setOriginal(false);
      if (target) setEdits(current => ({ ...current, [target]: { prompt, image: { src: privateResultUrl, name: clip.name, asset: resultAsset } } }));
      setNote('Frame rendered and added to the shared timeline.');
    });
  }
  async function save() {
    await task('save', async () => {
      if (!source) throw new Error('Add a photo first.');
      const sourceAsset = await persist(source); setSource({ ...source, asset: sourceAsset });
      const characterAsset = character ? await persist(character) : undefined;
      if (character && characterAsset) setCharacter({ ...character, asset: characterAsset });
      const savedEdits: LayersProject['edits'] = {};
      for (const [key, edit] of Object.entries(edits)) savedEdits[key] = { prompt: edit.prompt, asset: edit.image ? await persist(edit.image) : undefined };
      const clips = await Promise.all(doc.clips.map(async clip => {
        if (clip.kind === 'image' && clip.src) {
          const asset = await uploadLayerImage(clip.src, clip.name);
          return { ...clip, src: `studio-layer:${asset.path}` };
        }
        if (clip.src?.startsWith('blob:')) throw new Error('Local video or audio needs reimport after refresh. Save this project from the video editor instead.');
        return clip;
      }));
      await saveLayersProject({ version: 1, id, name, prompt, lockIdentity: lock, source: sourceAsset, character: characterAsset, edits: savedEdits, timeline: { ...doc, clips }, updatedAt: new Date().toISOString() });
      setProjects(current => [{ id, name }, ...current.filter(project => project.id !== id)]);
      setNote('Project saved privately to your Aurora account.');
    });
  }
  async function open(projectId: string) {
    await task('open', async () => {
      const project = await loadLayersProject(projectId);
      const image = async (asset?: LayerAsset): Promise<ImageState | undefined> => asset ? { src: await layerImageUrl(asset), name: asset.name, asset } : undefined;
      const restoredEdits: typeof edits = {};
      for (const [key, edit] of Object.entries(project.edits)) restoredEdits[key] = { prompt: edit.prompt, image: await image(edit.asset) };
      const clips = await Promise.all(project.timeline.clips.map(async clip => clip.src?.startsWith('studio-layer:') ? { ...clip, src: await layerImageUrl({ path: clip.src.slice('studio-layer:'.length), name: clip.name }) } : clip));
      setId(project.id); setName(project.name); setPrompt(project.prompt); setLock(project.lockIdentity); setSource(await image(project.source)); setCharacter(await image(project.character)); setEdits(restoredEdits); setTarget(undefined); setActive(undefined); setOriginal(false);
      apply({ ...project.timeline, clips }); setProjects(current => current.map(item => item.id === project.id ? { ...item, name: project.name } : item));
      setNote('Private project restored.');
    });
  }
  function newProject() {
    if ((source || shots.length) && !window.confirm('Start a new shoot? Unsaved edits will be cleared.')) return;
    setId(crypto.randomUUID()); setName('Untitled shoot'); setSource(undefined); setCharacter(undefined); setEdits({}); setActive(undefined); setTarget(undefined); setError(''); setNote('');
    apply({ ...doc, clips: [], hits: [] });
  }
  function moveShot(shot: Clip, direction: number) {
    const index = shots.findIndex(item => item.id === shot.id); const other = shots[index + direction]; if (!other) return;
    apply({ ...doc, clips: doc.clips.map(clip => clip.id === shot.id ? { ...clip, start: other.start } : clip.id === other.id ? { ...clip, start: shot.start } : clip) });
  }
  const IconAction = ({ title, children, onClick, disabled = false }: { title: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) => <Button size="icon" variant="ghost" title={title} aria-label={title} onClick={onClick} disabled={disabled || !!busy}>{children}</Button>;

  return <main className="layers-studio min-h-[100dvh] bg-background text-foreground">
    <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:pl-32 lg:pr-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3"><Layers3 className="size-8 text-primary" /><h1 className="text-2xl font-bold sm:text-3xl">Aurora Layers</h1></div>
        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Image studio</span><Button asChild variant="outline" size="sm"><Link to="/studio" search={{ mode: "edit" }}>Video editor</Link></Button></div>
      </header>
      <div className="layers-workspace grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="min-w-0">
          <div className="flex items-center gap-2 border-b border-border pb-4"><input aria-label="Project name" className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-2 text-base font-bold focus:border-primary focus:outline-none" value={name} onChange={event => setName(event.target.value)} /><IconAction title="New project" onClick={newProject}><Plus className="size-4" /></IconAction></div>
          <p className="layers-label mt-5">Context Lock — Character sheet</p>
          <Button className="mt-3 h-auto w-full justify-between gap-3 whitespace-normal py-3 text-left" variant="outline" onClick={() => reference.current?.click()} disabled={!!busy}>
            <span className="flex min-w-0 items-center gap-2">{character ? <img src={character.src} alt="Character reference" className="size-10 shrink-0 rounded object-cover" /> : <Lock className="size-4 shrink-0" />}<span>{character?.name ?? 'Character sheet / face reference'}</span></span><span>{character ? 'Locked' : 'Add'}</span>
          </Button>
          {character && <Button variant="ghost" size="sm" onClick={() => setCharacter(undefined)} disabled={!!busy}><X className="size-3" />Remove reference</Button>}
          <input ref={reference} aria-label="Upload character sheet" className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => readImage(event.target.files?.[0], 'character')} />
          <p className="layers-label mt-6">Step 01 — Source photo</p>
          <div onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); if (!busy) readImage(event.dataTransfer.files[0], 'source'); }} className={`mt-3 overflow-hidden rounded-lg border-2 border-dashed p-2 ${dragging ? 'border-primary bg-primary/10' : 'border-border bg-secondary/40'}`}>
            {source ? <><img src={source.src} alt="Uploaded source" className="aspect-[4/3] w-full rounded object-contain" /><div className="mt-2 flex gap-2"><Button className="flex-1" variant="outline" size="sm" onClick={() => file.current?.click()} disabled={!!busy}><ImagePlus className="size-4" />Replace photo</Button><IconAction title="Remove source photo" onClick={() => { setSource(undefined); setEdits({}); setTarget(undefined); }}><Trash2 className="size-4" /></IconAction></div></> : <Button variant="ghost" className="aspect-[4/3] h-auto w-full flex-col gap-3 whitespace-normal" onClick={() => file.current?.click()} disabled={!!busy}><span className="layers-gradient grid size-14 place-items-center rounded-lg"><ImagePlus className="size-6" /></span><span className="text-base font-bold">Upload your photo</span><span className="text-xs text-muted-foreground">JPG · PNG · WebP</span></Button>}
          </div>
          <input ref={file} aria-label="Upload source photo" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => readImage(event.target.files?.[0], 'source')} />
          <p className="layers-label mt-6">Step 02 — Engine</p>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-md bg-secondary p-1"><Button size="sm" className="layers-gradient text-xs">Gemini Image</Button><Button size="sm" variant="ghost" disabled title="Not connected">GPT Image</Button><Button size="sm" variant="ghost" disabled title="Not connected">Flux</Button></div>
          <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" className="accent-primary" checked={lock} onChange={event => setLock(event.target.checked)} /><Lock className="size-3" />Lock identity, pose &amp; framing</label>
          <p className="layers-label mt-6">Step 03 — {definition ? `${definition.name} prompt` : 'Layer prompt'}</p>
          <textarea aria-label="Layer prompt" value={prompt} onChange={event => { setPrompt(event.target.value); if (target) setEdits(current => ({ ...current, [target]: { ...current[target], prompt: event.target.value } })); }} rows={4} maxLength={2200} className="mt-3 w-full resize-y rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary" placeholder={definition?.sample ?? 'Describe your edit…'} />
          <div className="mt-3 grid grid-cols-2 gap-2">{PRESETS.map((preset, index) => <Button key={preset} size="sm" variant="outline" className="h-auto justify-start whitespace-normal py-2 text-left text-xs text-muted-foreground" onClick={() => { setPrompt(preset); setTarget(undefined); }}>{['Trap streetwear', 'Neon braids', 'Gold chain & cap', 'Night block party'][index]}</Button>)}</div>
          <Button className="layers-gradient mt-5 h-12 w-full font-bold" onClick={() => void render()} disabled={!!busy || !source || !prompt.trim()}>{busy === 'render' ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{busy === 'render' ? 'Rendering layer…' : definition ? `Render ${definition.name}` : shots.length ? 'Stack another shot' : 'Run layer edit'}</Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">{SCENE_BUILDER_COST_BASE} credits per edit</p>
          {error && <p role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {note && <p role="status" className="mt-4 text-sm text-accent">{note}</p>}
          {projects.length > 0 && <div className="mt-6 border-t border-border pt-4"><p className="layers-label">Saved projects</p><ul className="mt-3 space-y-1">{projects.map(project => <li key={project.id} className="flex min-w-0 items-center gap-2"><Button variant="ghost" className="min-w-0 flex-1 justify-start" onClick={() => void open(project.id)} disabled={!!busy}><span className="truncate">{project.name}</span></Button><IconAction title="Delete saved project" onClick={() => { if (window.confirm('Delete this saved project?')) void task('delete', async () => { await removeLayersProject(project.id); setProjects(current => current.filter(item => item.id !== project.id)); setNote('Saved project deleted.'); }); }}><Trash2 className="size-4" /></IconAction></li>)}</ul></div>}
        </section>
        <section className="flex min-w-0 flex-col gap-5">
          <div className="border-b border-border pb-5"><div className="flex flex-wrap items-center gap-2"><span className="layers-chip">Layer targets</span><span className="text-xs text-muted-foreground">{source ? '8 edit regions' : 'Waiting for a photo'}</span>{target && <IconAction title="Reset target selection" onClick={() => setTarget(undefined)}><RotateCcw className="size-4" /></IconAction>}</div>
            <ul className="layers-target-grid mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{TARGETS.map(layer => <li key={layer.id}><Button variant="outline" aria-pressed={target === layer.id} aria-label={`Edit ${layer.name}`} disabled={!source || !!busy} onClick={() => { setTarget(layer.id); setPrompt(edits[layer.id]?.prompt ?? layer.sample); }} className={`h-auto w-full flex-col items-stretch gap-0 overflow-hidden p-0 text-left ${target === layer.id ? 'border-primary ring-1 ring-primary' : ''}`}>
              <span className="relative block aspect-square w-full bg-secondary">{source ? <img src={edits[layer.id]?.image?.src ?? source.src} alt={`${layer.name} reference`} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-2xl text-muted-foreground">{layer.icon}</span>}<span className="absolute left-1 top-1 rounded bg-background/80 px-1.5 text-accent">{layer.icon}</span>{edits[layer.id]?.image && <span className="absolute bottom-1 right-1 rounded bg-primary px-1 text-[10px] text-primary-foreground">edited</span>}</span><span className="block px-2 py-2 text-xs font-bold">{layer.name}</span>
            </Button></li>)}</ul>
          </div>
          <div><div className="mb-3 flex items-center justify-between gap-2"><span className="layers-chip">Output</span>{source && result && <Button variant="ghost" size="sm" onClick={() => setOriginal(value => !value)}><Eye className="size-4" />{original ? 'Show edit' : 'Show original'}</Button>}</div><div className="layers-output relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-border bg-card">{display ? <img src={display} alt={original || !result ? 'Source preview' : 'Generated layer edit'} className="h-full w-full object-contain" /> : <Layers3 className="size-16 text-muted-foreground/30" />}{busy === 'render' && <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70"><Loader2 className="size-5 animate-spin" />Rendering layer…</div>}</div></div>
          {shots.length > 0 && <div className="border-t border-border pt-4"><div className="flex items-center gap-2"><span className="layers-chip">Storyboard</span><span className="text-xs text-muted-foreground">{shots.length} shots</span><IconAction title="Copy shot list" onClick={() => void task('copy', async () => { await navigator.clipboard.writeText(shots.map((shot, index) => `${index + 1}. ${shot.prompt ?? shot.name}`).join('\n')); setNote('Shot list copied.'); })}><Copy className="size-4" /></IconAction></div><ul className="mt-3 space-y-2">{shots.map((shot, index) => <li key={shot.id} className={`flex min-w-0 items-center gap-3 rounded-lg border p-2 ${result?.id === shot.id ? 'border-primary' : 'border-border'}`}><Button variant="ghost" className="size-16 shrink-0 overflow-hidden p-0" aria-label={`Select shot ${index + 1}`} onClick={() => { setActive(shot.id); setOriginal(false); }}><img src={shot.src} alt={`Shot ${index + 1}`} className="h-full w-full object-cover" /></Button><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{String(index + 1).padStart(2, '0')} · {shot.name}</p><input aria-label={`Shot ${index + 1} motion direction`} className="mt-1 w-full min-w-0 rounded border border-border bg-secondary p-1 text-xs" placeholder="Motion direction…" value={shot.camera ?? ''} onChange={event => apply({ ...doc, clips: doc.clips.map(clip => clip.id === shot.id ? { ...clip, camera: event.target.value } : clip) })} /></div><div className="flex shrink-0 flex-col"><IconAction title={`Move shot ${index + 1} up`} disabled={index === 0} onClick={() => moveShot(shot, -1)}><ArrowUp className="size-3" /></IconAction><IconAction title={`Move shot ${index + 1} down`} disabled={index === shots.length - 1} onClick={() => moveShot(shot, 1)}><ArrowDown className="size-3" /></IconAction><IconAction title={`Delete shot ${index + 1}`} onClick={() => apply({ ...doc, clips: doc.clips.filter(clip => clip.id !== shot.id) })}><Trash2 className="size-3" /></IconAction></div></li>)}</ul></div>}
          <div className="border-t border-border pt-4"><p className="layers-label">Step 04 — Save &amp; export</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => void save()} disabled={!source || !!busy}>{busy === 'save' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save + sync</Button><Button variant="outline" size="sm" disabled={!display || !!busy} onClick={() => void task('png', async () => { if (display) await exportLayerPng(display); })}><Download className="size-4" />PNG</Button><Button variant="outline" size="sm" disabled={!shots.length || !!busy} onClick={() => void task('sheet', () => exportContactSheet(doc))}><Layers3 className="size-4" />Composite sheet</Button><Button className="layers-gradient" size="sm" disabled={!shots.length || !!busy} onClick={() => void task('zip', () => exportLayersZip(doc, name))}><Download className="size-4" />Export ZIP</Button></div></div>
        </section>
      </div>
      <section aria-label="Image versions" className="mt-8 border-t border-border pt-6"><h2 className="mb-2 text-lg font-bold">Image versions</h2><p className="mb-4 text-sm text-muted-foreground">Select a generated image to preview it. Video editing stays in the separate GUI editor.</p><div className="flex flex-wrap gap-3">{shots.map(shot => <button key={shot.id} type="button" onClick={() => { setActive(shot.id); setOriginal(false); }} aria-pressed={result?.id === shot.id} className={`w-24 overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${result?.id === shot.id ? 'border-primary' : 'border-border'}`}><img src={shot.src} alt={shot.name || 'Generated image'} className="aspect-square w-full object-cover" /><span className="block truncate p-2 text-xs">{shot.name || 'Image'}</span></button>)}</div></section>
    </div>
  </main>;
}
