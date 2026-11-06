import { supabase } from "@/integrations/supabase/client";

async function call<T>(body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const r = await fetch("/api/kie", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const j = (await r.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!r.ok) throw new Error(j.error?.message || `Kie request failed (${r.status})`);
  return j;
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const f = new FileReader();
    f.onload = () => res(String(f.result));
    f.onerror = () => rej(f.error);
    f.readAsDataURL(blob);
  });

/** Returns a public URL Kie can fetch. http(s) URLs pass through. */
export async function kieUpload(src: string | Blob, fileName?: string): Promise<string> {
  if (typeof src === "string" && /^https?:\/\//.test(src)) return src;
  const blob = typeof src === "string" ? await (await fetch(src)).blob() : src;
  const { url } = await call<{ url: string }>({ kind: "upload", dataUrl: await toDataUrl(blob), fileName });
  return url;
}

export async function kieRun(model: string, input: Record<string, unknown>, onStatus?: (s: string) => void, timeoutMs = 10 * 60_000): Promise<string> {
  const { taskId } = await call<{ taskId: string }>({ kind: "create", model, input });
  const started = Date.now();
  for (;;) {
    await new Promise((r) => setTimeout(r, 4000));
    const s = await call<{ state: string; urls: string[]; error?: string }>({ kind: "status", taskId });
    onStatus?.(s.state);
    if (s.state === "success" && s.urls[0]) return s.urls[0];
    if (s.state === "fail") throw new Error(s.error || "Generation failed.");
    if (Date.now() - started > timeoutMs) throw new Error("Generation took too long.");
  }
}

const ratio = (a?: string) => (a === "9:16" || a === "16:9" || a === "1:1" ? a : "16:9");

export async function kieImage(prompt: string, opts: { aspect?: string; refs?: (string | Blob)[] } = {}) {
  const refs = await Promise.all((opts.refs ?? []).slice(0, 4).map((r) => kieUpload(r)));
  if (refs.length) return kieRun("google/nano-banana-edit", { prompt, image_urls: refs, output_format: "png", image_size: ratio(opts.aspect) });
  return kieRun("google/nano-banana", { prompt, output_format: "png", image_size: ratio(opts.aspect) });
}

export async function kieVideo(model: string, prompt: string, opts: { aspect?: string; duration?: number; image?: string | Blob; onStatus?: (s: string) => void } = {}) {
  const dur = (opts.duration ?? 5) > 7 ? "10" : "5";
  const image = opts.image ? await kieUpload(opts.image) : undefined;
  const grok = model.startsWith("grok-imagine");
  const m = image ? model.replace("text-to-video", "image-to-video") : model.replace("image-to-video", "text-to-video");
  const input: Record<string, unknown> = grok
    ? { prompt, ...(image ? { image_urls: [image] } : { aspect_ratio: ratio(opts.aspect) }), mode: "normal" }
    : { prompt, sound: false, duration: dur, ...(image ? { image_urls: [image] } : { aspect_ratio: ratio(opts.aspect) }) };
  return kieRun(m, input, opts.onStatus);
}

export async function kieMotion(photo: string | Blob, drivingVideo: string | Blob, prompt = "", onStatus?: (s: string) => void) {
  const [img, vid] = await Promise.all([kieUpload(photo), kieUpload(drivingVideo)]);
  return kieRun("kling-2.6/motion-control", { prompt, input_urls: [img], video_urls: [vid], character_orientation: "video", mode: "720p" }, onStatus);
}

export async function kieLipSync(photo: string | Blob, audio: string | Blob, prompt = "", onStatus?: (s: string) => void) {
  const [img, aud] = await Promise.all([kieUpload(photo), kieUpload(audio)]);
  return kieRun("omnihuman-2-0", { image_urls: [img], audio_url: aud, prompt }, onStatus);
}
