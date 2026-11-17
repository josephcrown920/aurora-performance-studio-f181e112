import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Image as ImageIcon, Film, Move, Mic, Scissors, Upload, X, Loader2, Download, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { kieImage, kieVideo, kieMotion, kieLipSync } from "@/lib/kie-client";
import { putEditorHandoff } from "@/lib/genjutsu-handoff";

type Tool = "image" | "video" | "motion" | "lipsync";
type Item = { id: string; tool: Tool; prompt: string; url?: string; status: "running" | "done" | "failed"; error?: string; at: number };

const TOOLS: { id: Tool; label: string; icon: typeof ImageIcon; hint: string }[] = [
  { id: "image", label: "Image", icon: ImageIcon, hint: "Describe an image…" },
  { id: "video", label: "Video", icon: Film, hint: "Describe a shot — add a photo to animate it" },
  { id: "motion", label: "Motion", icon: Move, hint: "Photo + driving video: your moves on any character" },
  { id: "lipsync", label: "Lip sync", icon: Mic, hint: "Photo + song: make it perform your verse" },
];
const VIDEO_MODELS = [["kling-2.6/text-to-video", "Kling 2.6"], ["grok-imagine/text-to-video", "Grok Imagine"], ["bytedance/seedance-2-mini", "Seedance 2.0 Mini"]] as const;
const KEY = "aurora:krea-feed";

export function KreaStudio() {
  const { user } = useAuth();
  const [tool, setTool] = useState<Tool>("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("9:16");
  const [model, setModel] = useState<string>(VIDEO_MODELS[0][0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [media, setMedia] = useState<File | null>(null);
  const [feed, setFeed] = useState<Item[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { setFeed((JSON.parse(localStorage.getItem(KEY) || "[]") as Item[]).filter((i) => i.status === "done")); } catch { /* empty */ } }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(feed.filter((i) => i.status === "done").slice(0, 60))); }, [feed]);

  const needsPhoto = tool === "motion" || tool === "lipsync";
  const canRun = !!user && (needsPhoto ? !!photo && !!media : prompt.trim().length > 2);

  async function run() {
    if (!canRun) return;
    const item: Item = { id: crypto.randomUUID(), tool, prompt: prompt.trim() || TOOLS.find((t) => t.id === tool)!.label, status: "running", at: Date.now() };
    setFeed((f) => [item, ...f]);
    const patch = (p: Partial<Item>) => setFeed((f) => f.map((i) => (i.id === item.id ? { ...i, ...p } : i)));
    try {
      const url = tool === "image" ? await kieImage(prompt, { aspect, refs: photo ? [photo] : [] })
        : tool === "video" ? await kieVideo(model, prompt, { aspect, image: photo ?? undefined })
        : tool === "motion" ? await kieMotion(photo!, media!, prompt)
        : await kieLipSync(photo!, media!, prompt);
      patch({ url, status: "done" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      patch({ status: "failed", error: msg }); toast.error(msg);
    }
  }

  function toEditor(i: Item) {
    if (!i.url) return;
    putEditorHandoff({ url: i.url, kind: i.tool === "image" ? "image" : "video", name: i.prompt.slice(0, 40) });
    window.location.assign("/studio?mode=edit");
  }

  const isVideo = (i: Item) => i.tool !== "image";
  return <div className="krea flex min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-16 flex-col items-center gap-2 border-r border-border bg-card/60 py-4 backdrop-blur md:flex">
      <Link to="/" aria-label="Home" className="mb-4 text-muted-foreground"><ArrowLeft size={18} /></Link>
      {TOOLS.map((t) => <button key={t.id} onClick={() => setTool(t.id)} aria-label={t.label} title={t.label}
        className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl text-[9px] ${tool === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><t.icon size={18} />{t.label}</button>)}
      <Link to="/studio" search={{ mode: "edit" }} aria-label="Editor" title="Editor" className="mt-auto flex h-11 w-11 flex-col items-center justify-center rounded-xl text-[9px] text-muted-foreground hover:bg-muted"><Scissors size={18} />Edit</Link>
    </aside>

    <main className="w-full pb-56 md:pl-16">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <Sparkles size={16} className="text-primary" /><strong className="tracking-widest text-sm">AURORA STUDIO</strong>
        <nav className="ml-auto flex gap-1 md:hidden">{TOOLS.map((t) => <Button key={t.id} size="sm" variant={tool === t.id ? "default" : "ghost"} onClick={() => setTool(t.id)}>{t.label}</Button>)}</nav>
      </header>
      {feed.length === 0 ? <div className="mx-auto mt-24 max-w-md px-6 text-center">
        <h1 className="text-3xl font-bold">What are we making?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick a tool, type a prompt and your results stack up here. Send any result straight to the video editor.</p>
      </div> : <section className="columns-2 gap-3 p-3 md:columns-3 xl:columns-4">
        {feed.map((i) => <figure key={i.id} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card">
          {i.status === "running" ? <div className="flex aspect-[9/16] items-center justify-center bg-muted/40 animate-pulse"><Loader2 className="animate-spin text-primary" /></div>
            : i.status === "failed" ? <div className="flex aspect-square items-center justify-center p-4 text-center text-xs text-destructive">{i.error}</div>
            : isVideo(i) ? <video src={i.url} controls playsInline loop className="w-full" /> : <img src={i.url} alt={i.prompt} loading="lazy" className="w-full" />}
          <figcaption className="flex items-center gap-1 p-2 text-[11px] text-muted-foreground">
            <span className="line-clamp-1 flex-1">{i.prompt}</span>
            {i.url && <><a href={i.url} target="_blank" rel="noreferrer" aria-label="Download"><Download size={13} /></a>
              <button onClick={() => toEditor(i)} aria-label="Open in editor"><Scissors size={13} /></button></>}
            <button onClick={() => setFeed((f) => f.filter((x) => x.id !== i.id))} aria-label="Remove"><X size={13} /></button>
          </figcaption>
        </figure>)}
      </section>}
    </main>

    <div className="fixed inset-x-0 bottom-16 z-30 px-3 md:bottom-4 md:left-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder={TOOLS.find((t) => t.id === tool)!.hint}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void run(); } }}
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          <Button size="sm" variant="outline" onClick={() => photoRef.current?.click()}><Upload size={13} />{photo ? photo.name.slice(0, 14) : needsPhoto ? "Photo *" : "Reference"}</Button>
          {needsPhoto && <><input ref={mediaRef} type="file" accept={tool === "motion" ? "video/*" : "audio/*"} hidden onChange={(e) => setMedia(e.target.files?.[0] ?? null)} />
            <Button size="sm" variant="outline" onClick={() => mediaRef.current?.click()}><Upload size={13} />{media ? media.name.slice(0, 14) : tool === "motion" ? "Driving video *" : "Song *"}</Button></>}
          {(tool === "image" || tool === "video") && <select value={aspect} onChange={(e) => setAspect(e.target.value)} aria-label="Aspect ratio" className="h-8 rounded-md border border-border bg-background px-2 text-xs">{["9:16", "1:1", "16:9"].map((a) => <option key={a}>{a}</option>)}</select>}
          {tool === "video" && <select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model" className="h-8 rounded-md border border-border bg-background px-2 text-xs">{VIDEO_MODELS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>}
          {photo && <button onClick={() => setPhoto(null)} aria-label="Clear photo" className="text-muted-foreground"><X size={14} /></button>}
          <Button size="sm" className="ml-auto" disabled={!canRun} onClick={() => void run()}>{user ? "Generate" : "Sign in to generate"}</Button>
        </div>
      </div>
    </div>
  </div>;
}
