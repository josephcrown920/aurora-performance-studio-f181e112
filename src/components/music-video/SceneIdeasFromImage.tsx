import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { suggestScenePrompts, type ScenePromptSuggestions } from "@/lib/scene-prompts.functions";

type Props = {
  userId: string | null;
  videoType: "Narrative" | "Lyrics" | "Visualizer";
  brief: string;
  count: number;
  onUse: (text: string) => void;
};

export function SceneIdeasFromImage({ userId, videoType, brief, count, onUse }: Props) {
  const suggest = useServerFn(suggestScenePrompts);
  const [ref, setRef] = useState<{ path: string; url: string } | null>(null);
  const [busy, setBusy] = useState<"upload" | "suggest" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScenePromptSuggestions | null>(null);

  async function onFile(file?: File) {
    if (!file || !userId) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Use a JPG, PNG or WebP image");
    setError(null); setResult(null); setBusy("upload");
    try {
      const path = `${userId}/music-video/references/${crypto.randomUUID()}.${file.name.split(".").pop()?.toLowerCase() || "jpg"}`;
      const { error: e } = await supabase.storage.from("studio").upload(path, file, { contentType: file.type });
      if (e) throw new Error(e.message);
      const { data } = await supabase.storage.from("studio").createSignedUrl(path, 3600);
      setRef({ path, url: data?.signedUrl ?? "" });
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  }

  async function run() {
    if (!ref) return;
    setError(null); setBusy("suggest");
    try { setResult(await suggest({ data: { imagePath: ref.path, videoType, brief, count } })); }
    catch (e) { setError((e as Error).message || "Could not get suggestions"); }
    finally { setBusy(null); }
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-card/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium"><ImagePlus className="h-4 w-4" /> Scene ideas from a reference image</div>
      <p className="text-xs text-muted-foreground">Upload a mood or style image and Aurora suggests scene prompts that match its look.</p>
      <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Reference image for scene ideas" disabled={!userId || !!busy} onChange={(e) => onFile(e.target.files?.[0])} />
      {busy === "upload" && <Loader2 className="h-4 w-4 animate-spin" />}
      {ref && <img src={ref.url} alt="Style reference" className="h-32 rounded-md object-cover" />}
      <Button size="sm" onClick={run} disabled={!ref || !!busy}>
        {busy === "suggest" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        Suggest {count} scene prompt{count > 1 ? "s" : ""}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Look:</span> {result.look}</p>
          {result.scenes.map((s, i) => (
            <div key={i} className="rounded-md border border-border p-3 text-sm">
              <div className="font-medium">{i + 1}. {s.title}</div>
              <p className="mt-1 text-muted-foreground">{s.prompt}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => onUse(s.prompt)}>Add to brief</Button>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={() => onUse(result.scenes.map((s, i) => `Scene ${i + 1}: ${s.prompt}`).join("\n"))}>Add all to brief</Button>
        </div>
      )}
    </div>
  );
}
