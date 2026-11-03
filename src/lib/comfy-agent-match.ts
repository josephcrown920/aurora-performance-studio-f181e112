/** Shared rules both the Video Agent and Canvas use to pick up ComfyUI workflows. */
export type ComfyTemplateLite = { id: string; name: string; description?: string | null; kind?: string | null };
export type ComfyRunLite = { id: string; workflow_id: string; status: string; output_url?: string | null; output_kind?: string | null };

const STOP = new Set(["the", "a", "an", "and", "of", "for", "to", "with", "make", "me", "my", "video", "image", "workflow", "comfy", "comfyui"]);
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));

/** Best saved workflow for a brief, or null. Needs at least one meaningful word overlap. */
export function matchComfyTemplate<T extends ComfyTemplateLite>(brief: string, templates: T[]): T | null {
  const want = new Set(words(brief));
  if (!want.size) return null;
  let best: T | null = null;
  let score = 0;
  for (const t of templates) {
    const nameHits = words(t.name).filter((w) => want.has(w)).length * 2;
    const descHits = words(t.description ?? "").filter((w) => want.has(w)).length;
    const s = nameHits + descHits;
    if (s > score) { score = s; best = t; }
  }
  return score > 0 ? best : null;
}

/** Runs still in progress that an agent should pick up and finish. */
export function unfinishedRuns<T extends ComfyRunLite>(runs: T[]): T[] {
  return runs.filter((r) => r.status === "queued" || r.status === "running" || r.status === "pending");
}

/** Finished runs with an output that can be dropped into the timeline or canvas. */
export function finishedOutputs<T extends ComfyRunLite>(runs: T[]): T[] {
  return runs.filter((r) => r.status === "succeeded" && !!r.output_url);
}
