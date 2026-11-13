export const GENJUTSU_FINISHING_MODEL = "fal-ai/sync-lipsync/v2" as const;

export function finishingSource(motionVideo: string | null | undefined, importedVideo: string | null | undefined) {
  return importedVideo || motionVideo || null;
}

export function validateFinishingInput(video: string | null, audio: string | null, consent: boolean) {
  if (!video) throw new Error("Add a completed performance video first.");
  if (!audio) throw new Error("Add the song you want to promote.");
  if (!consent) throw new Error("Confirm you have permission to use this performance and song.");
  return { videoUrl: video, audioUrl: audio, model: GENJUTSU_FINISHING_MODEL };
}