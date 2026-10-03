import { newId, type Clip, type TimelineDoc } from '@/features/creative-studio/lib/timeline-state';
import type { Lagos40Location } from './data';

export type SceneStatus = 'idle' | 'rendering' | 'done' | 'failed';
export type Scene = { id: string; start: number; duration: number; lyrics: string[]; camera: string; action: string; status: SceneStatus; videoUrl?: string; error?: string };
export type Card = Lagos40Location & { enabled: boolean; scenes: Scene[] };

export const CAMERA_MOVES = ['slow push-in', 'handheld follow from behind', 'low-angle orbit left to right', 'locked-off wide', 'slow pull-back', 'tracking side-on walk'];

/** Scene breakdown: splits the song clip into scenes of at most 6s, sharing the lyric lines evenly. */
export function breakdown(card: Lagos40Location, songSeconds: number, lyrics: string[]): Scene[] {
  const count = Math.max(1, Math.ceil(songSeconds / 6));
  const dur = +(songSeconds / count).toFixed(2);
  const per = Math.ceil(lyrics.length / count);
  return Array.from({ length: count }, (_, i) => {
    const last = i === count - 1;
    const action = i === 0
      ? `steps into frame and performs straight to camera at ${card.eatery}`
      : last ? `finishes the line, then ${card.ending}`
      : ['rhymes with hand gestures, chain swinging', 'leans toward the lens, nodding to the beat', 'walks past the background, glancing back at camera'][(i - 1) % 3];
    return { id: newId(), start: +(i * dur).toFixed(2), duration: dur, lyrics: lyrics.slice(i * per, (i + 1) * per), camera: CAMERA_MOVES[i % CAMERA_MOVES.length], action, status: 'idle' as const };
  });
}

export function scenePrompt(character: string, card: Card, scene: Scene, index: number) {
  const said = scene.lyrics.length ? ` He raps: "${scene.lyrics.join(' / ')}".` : '';
  return `Vertical 9:16 music video, scene ${index + 1} of ${card.scenes.length}. Keep the person identical to the reference photos; keep face, locs, tattoos and jewelry unchanged.\n\nCHARACTER LOCK:\n${character}\n\nLocation: ${card.location}, Lagos, Nigeria. Outfit: ${card.outfit}. Mood and light: ${card.vibe}. Background detail: ${card.flair}.\n\nMOTION: camera ${scene.camera}. He ${scene.action}.${said}\nIn a single continuous shot, no scene cuts. All tattoos and text read correctly, never mirrored. No caption, no on-screen text. Audio: street ambience only, no music.`;
}

/** Final render: all finished scenes in order on V1, lyric captions on V3, the song on A1. */
export function finalCut(card: Card, songSeconds: number, songUrl?: string, songName?: string): TimelineDoc {
  const clips: Clip[] = [];
  for (const s of card.scenes) {
    if (s.videoUrl) clips.push({ id: newId(), track: 'V1', start: s.start, duration: s.duration, name: `Scene ${clips.length + 1}`, kind: 'video', src: s.videoUrl, camera: s.camera, prompt: s.action });
    const step = s.duration / Math.max(1, s.lyrics.length);
    s.lyrics.forEach((line, i) => clips.push({ id: newId(), track: 'V3', start: +(s.start + i * step).toFixed(2), duration: +step.toFixed(2), name: line, kind: 'text', prompt: line }));
  }
  if (songUrl) clips.push({ id: newId(), track: 'A1', start: 0, duration: songSeconds, name: songName ?? 'Song clip', kind: 'audio', src: songUrl });
  return { name: `Lagos 40 — ${card.location}`, ratio: '9:16', bpm: 140, genre: 'drill', seconds: songSeconds, clips, hits: [] };
}
