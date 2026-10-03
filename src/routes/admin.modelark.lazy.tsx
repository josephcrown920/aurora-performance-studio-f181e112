import { createLazyFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LAGOS40_LOCATIONS } from "@/features/lagos40/data";
import { startModelArkShot, checkModelArkShot, listModelArkVideos } from "@/lib/modelark.functions";

export const Route = createLazyFileRoute("/admin/modelark")({ component: ModelArkPage });

function ModelArkPage() {
  const { user } = useAuth();
  const start = useServerFn(startModelArkShot);
  const check = useServerFn(checkModelArkShot);
  const list = useServerFn(listModelArkVideos);
  const [facePath, setFacePath] = useState<string | null>(null);
  const [songPath, setSongPath] = useState<string | null>(null);
  const [loc, setLoc] = useState(1);
  const [model, setModel] = useState<"seedance-2.5" | "seedance-2.0-fast">("seedance-2.5");
  const [duration, setDuration] = useState(10);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [videos, setVideos] = useState<{ name: string; url: string }[]>([]);

  const refresh = useCallback(() => { list().then(setVideos).catch((e) => toast.error(e.message)); }, [list]);
  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  async function upload(file: File, kind: "face" | "song") {
    if (!user) return;
    const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
    const path = `${user.id}/modelark/${kind}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("layers-private").upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    kind === "face" ? setFacePath(path) : setSongPath(path);
    toast.success(kind === "face" ? "Face photo added" : "Song added");
  }

  async function run() {
    if (!facePath) return toast.error("Add Josh's face photo first.");
    setBusy(true); setStatus("Sending to ModelArk…");
    try {
      const r = await start({ data: { locationId: loc, facePath, songPath, model, duration } });
      if (!r.ok) { setStatus(r.error); return; }
      setStatus("Making the video — this can take a few minutes…");
      for (let i = 0; i < 180; i++) {
        await new Promise((res) => setTimeout(res, 10_000));
        const c = await check({ data: { taskId: r.taskId, locationId: loc } });
        if (c.status === "done") { setStatus("Done — saved below."); refresh(); return; }
        if (c.status === "failed") { setStatus(c.error); return; }
      }
      setStatus("Still running after 30 minutes. Check back later.");
    } catch (e) { setStatus((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">ModelArk boot-shot videos</h1>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <label className="block text-sm">Josh face photo {facePath && "✓"}
          <input type="file" accept="image/*" className="mt-1 block" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "face")} />
        </label>
        <label className="block text-sm">Song clip (optional, for lip-sync) {songPath && "✓"}
          <input type="file" accept="audio/*" className="mt-1 block" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "song")} />
        </label>
        <label className="block text-sm">Location
          <select className="mt-1 block w-full rounded border border-border bg-background p-2" value={loc} onChange={(e) => setLoc(Number(e.target.value))}>
            {LAGOS40_LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.id}. {l.location}</option>)}
          </select>
        </label>
        <div className="flex gap-4">
          <label className="text-sm">Model
            <select className="mt-1 block rounded border border-border bg-background p-2" value={model} onChange={(e) => setModel(e.target.value as typeof model)}>
              <option value="seedance-2.5">Seedance 2.5 (best)</option>
              <option value="seedance-2.0-fast">Seedance 2.0 Fast (cheaper)</option>
            </select>
          </label>
          <label className="text-sm">Seconds
            <input type="number" min={4} max={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 block w-20 rounded border border-border bg-background p-2" />
          </label>
        </div>
        <Button onClick={run} disabled={busy || !facePath}>{busy && <Loader2 className="mr-2 size-4 animate-spin" />}Make 1 video</Button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </div>
      <h2 className="text-lg font-semibold">Saved videos</h2>
      {videos.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : (
        <div className="grid grid-cols-2 gap-4">
          {videos.map((v) => <div key={v.name}><video src={v.url} controls className="w-full rounded" /><a href={v.url} download className="text-xs underline">{v.name}</a></div>)}
        </div>
      )}
    </div>
  );
}
