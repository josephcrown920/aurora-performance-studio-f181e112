import { describe, it, expect } from 'bun:test';
import { emptyTimeline } from '@/features/creative-studio/lib/timeline-state';
import { previewCodexEdit } from './timeline-adapter';
const doc = { ...emptyTimeline(), clips: [{ id: 'shot', track: 'V1' as const, start: 0, duration: 10, sourceOffset: 2, name: 'Performance', kind: 'video' as const, src: 'blob:performance', look: 'noir' }] };
describe('Actual Codex core on the shared Aurora timeline', () => {
  it('splits source offsets without losing the original look', () => {
    const next = previewCodexEdit(doc, 'shot', 3, 'split at 3').doc;
    expect(next.clips.map(c => [c.start, c.duration, c.sourceOffset, c.look])).toEqual([[0, 3, 2, 'noir'], [3, 7, 5, 'noir']]);
  });
  it('does not mutate the timeline during review', () => {
    previewCodexEdit(doc, 'shot', 0, 'trim to 3'); expect(doc.clips[0].duration).toBe(10);
  });
  it('rejects a locked clip', () => {
    expect(() => previewCodexEdit({ ...doc, clips: [{ ...doc.clips[0], locked: true }] }, 'shot', 0, 'delete')).toThrow('Unlock');
  });
  it('preserves unsupported overlay metadata', () => {
    const overlay = { id: 'overlay', track: 'V4' as const, start: 0, duration: 5, name: 'FX', kind: 'overlay' as const, effect: 'vhs' };
    expect(previewCodexEdit({ ...doc, clips: [...doc.clips, overlay] }, 'shot', 0, 'delete').doc.clips).toEqual([overlay]);
  });
});