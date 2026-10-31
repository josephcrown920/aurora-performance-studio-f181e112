import { applyEdit, makeClip, parseCommand, projectSchema, type Project } from './core/model';
import { TRACKS, TRACK_LABELS, type TimelineDoc } from '@/features/creative-studio/lib/timeline-state';

/** Codex operates on a projection; TimelineDoc remains the only saved document. */
export function codexProject(doc: TimelineDoc): Project {
  const assets = doc.clips.filter(c => c.src && ['video', 'image', 'audio'].includes(c.kind)).map(c => ({
    id: c.id, name: c.name, kind: c.kind as 'video' | 'image' | 'audio', src: c.src ?? '',
    duration: (c.sourceOffset ?? 0) + c.duration,
  }));
  return projectSchema.parse({ version: 1, id: 'aurora-shared', name: doc.name, ratio: doc.ratio, assets,
    tracks: TRACKS.map(id => ({ id, name: TRACK_LABELS[id], kind: id.startsWith('A') ? 'audio' : id === 'V3' ? 'text' : 'video', muted: false, hidden: false, locked: false })),
    clips: doc.clips.filter(c => assets.some(a => a.id === c.id) || c.kind === 'text').map(c => ({
      ...makeClip(c.track, assets.find(a => a.id === c.id), c.start, c.kind === 'text' ? c.name : undefined),
      id: c.id, name: c.name, duration: c.duration, offset: c.sourceOffset ?? 0,
    })),
  });
}

export function previewCodexEdit(doc: TimelineDoc, selected: string | undefined, time: number, command: string) {
  if (doc.clips.some(c => c.locked && c.id === selected)) throw Error('Unlock this clip first');
  const base = codexProject(doc);
  const parsed = parseCommand(base, selected, time, command);
  if (parsed.edit.type === 'update' && parsed.edit.patch.volume !== undefined) throw Error('Volume commands are not yet supported by Aurora playback');
  const next = applyEdit(base, parsed.edit);
  const existing = new Map(doc.clips.map(c => [c.id, c]));
  const supported = new Set(base.clips.map(c => c.id));
  const clips = next.clips.map(c => {
    const asset = next.assets.find(a => a.id === c.assetId);
    const original = existing.get(c.id) ?? existing.get(c.assetId ?? '') ?? (selected ? existing.get(selected) : undefined);
    return { ...original, id: c.id, track: c.trackId as TimelineDoc['clips'][number]['track'], name: c.text ?? c.name,
      kind: c.text ? 'text' as const : asset?.kind ?? 'video' as const, src: c.text ? undefined : asset?.src,
      start: c.start, duration: c.duration, sourceOffset: c.offset };
  });
  const untouched = doc.clips.filter(c => !supported.has(c.id));
  const result: TimelineDoc = { ...doc, ratio: next.ratio, clips: [...untouched, ...clips], seconds: Math.max(doc.seconds, ...clips.map(c => c.start + c.duration)) };
  return { doc: result, summary: parsed.summary };
}