import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Download, Loader2, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lipSyncVideo, listGenerations } from "@/lib/studio.functions";
import { computeCost } from "@/lib/pricing";
import { finishingSource, validateFinishingInput, GENJUTSU_FINISHING_MODEL } from "@/lib/genjutsu-finishing";

export function GenjutsuFinishing({ videoUrl, audioUrl, onAudio }: { videoUrl?: string | null; audioUrl?: string | null; onAudio?: (file: File) => Promise<void> }) {
  const { user } = useAuth();
  const enqueue = useServerFn(lipSyncVideo);
  const list = useServerFn(listGenerations);
  const [imported, setImported] = useState<string | null>(null);
  const [song, setSong] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const history = useQuery({ queryKey: ["genjutsu-finishing", user?.id], queryFn: () => list(), enabled: !!user && !!generationId, refetchInterval: generationId ? 4000 : false });
  const current = history.data?.items.find(g => g.id === generationId);
  const done = current?.result_video_url && ["succeeded", "complete"].includes(current.status ?? "");
  const failed = ["failed", "cancelled"].includes(current?.status ?? "");
  const running = !!generationId && !done && !failed;
  const source = finishingSource(videoUrl, imported);
  const audio = song || audioUrl || null;
  async function upload(file: File, kind: "audio" | "video") {
    if (!user) return;
    setBusy(true); setError(null);
    try {
      if (kind === "audio" && onAudio) { await onAudio(file); setGenerationId(null); return; }
      const path = `${user.id}/genjutsu/finishing/${crypto.randomUUID()}.${file.name.split(".").pop() || (kind === "audio" ? "mp3" : "mp4")}`;
      const result = await supabase.storage.from("studio").upload(path, file, { contentType: file.type });
      if (result.error) throw result.error;
      const signed = await supabase.storage.from("studio").createSignedUrl(path, 86400);
      if (signed.error || !signed.data?.signedUrl) throw signed.error ?? new Error("Could not load your upload.");
      if (kind === "audio") setSong(signed.data.signedUrl); else setImported(signed.data.signedUrl);
      setGenerationId(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function render() {
    setBusy(true); setError(null);
    try { const result = await enqueue({ data: validateFinishingInput(source, audio, consent) }); setGenerationId(result.generationId); }
    catch (e) { setError(e instanceof Error ? e.message : "Lip sync did not start."); }
    finally { setBusy(false); }
  }
  return <section className="genjutsu-finish" aria-label="Finishing lip sync">
    <p className="genjutsu-eyebrow">03 / FINISH · OPTIONAL</p><h2>Your visuals. Your song.</h2>
    <p className="text-sm text-muted-foreground">Keep your finished performance. Match its lips to the song you want to promote — even when the original take used another track.</p>
    {!user ? <Button asChild><Link to="/auth" search={{ next: "/perform-anywhere" }}>Sign in to finish</Link></Button> : <>
      <div className="genjutsu-upload-pair">
        <label>Completed performance<input aria-label="Upload completed performance" type="file" accept="video/*" disabled={busy || running} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f, "video"); e.target.value = ""; }} /></label>
        <label>Your promotional song<input aria-label="Upload promotional song" type="file" accept="audio/*" disabled={busy || running} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f, "audio"); e.target.value = ""; }} /></label>
      </div>
      {source && <video src={source} controls playsInline preload="metadata" aria-label="Completed performance for lip sync" className="max-h-64 w-full" />}
      {audio && <audio src={audio} controls aria-label="Promotional song" className="w-full" />}
      <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I have permission to use this performance, likeness and song.</label>
      <p className="text-xs text-muted-foreground">Video lip sync · Sync · {computeCost({ features: ["lipsync"], model: GENJUTSU_FINISHING_MODEL }).total} Aura. OmniHuman creates a new video from a photo; it does not preserve this finished take.</p>
      {(error || failed) && <p role="alert" className="text-sm text-destructive">{error || current?.error || "Lip sync failed."}</p>}
      {running && <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />{current?.status ?? "Queued"}</p>}
      <Button disabled={busy || running || !source || !audio || !consent} onClick={() => void render()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Mic2 className="size-4" />}Finish with lip sync</Button>
      {done && <><video src={current.result_video_url ?? ""} controls playsInline aria-label="Finished song-synced performance" className="max-h-80 w-full" /><Button asChild variant="outline"><a href={current.result_video_url ?? ""} download><Download className="size-4" />Download finished video</a></Button><Button asChild variant="outline"><Link to="/studio" search={{ mode: "edit" }}>Open video editor</Link></Button></>}
    </>}
  </section>;
}