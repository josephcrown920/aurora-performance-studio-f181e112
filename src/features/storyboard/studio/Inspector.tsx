import { useRef, useState } from "react";
import { streamImage } from "@/lib/streamImage";
import type { Board, ShotNode } from "@/lib/board-store";
import { VideoAgentPanel } from "./VideoAgentPanel";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Image, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { computeCost } from "@/lib/pricing";

export function Inspector({ shot, board, onChange, onDelete }: { shot: ShotNode; board: Board; onChange: (patch: Partial<ShotNode>) => void; onDelete: () => void }) {
  const [error,setError] = useState<string | null>(null);
  const [busy,setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const incoming = board.edges.filter(e => e.to === shot.id).flatMap(e => board.shots.filter(s => s.id === e.from));
  const referenceUrls = [...incoming.map(s => s.imageUrl), shot.imageUrl].filter((u): u is string => !!u && /^https?:/.test(u)).slice(0,4);
  const frameCost = computeCost({features:["image"],model:"replit/gemini-2.5-flash-image"}).total;
  async function generate() {
    setBusy(true);setError(null);
    try {
      if (!shot.action?.trim() || !shot.frame.trim()) throw new Error("Add the action and camera movement first.");
      const frames:string[] = [];
      for (let i=0;i<3;i++) {
        const prompt = `Cinematic previs frame ${i+1} of 3 at ${Math.round(i*50)}% of the scene. Scene: ${shot.prompt || shot.title}. Action: ${shot.action}. Camera movement: ${shot.frame}. Framing: ${shot.shotType}. Wardrobe: ${shot.wardrobe}. Lighting/mood: ${shot.mood}. ${shot.note}. Preserve character and scene continuity from references. Show the actual action and camera position at this moment; no labels or collage.`;
        let url = "";
        await streamImage("/api/directors-board/generate-image",prompt.slice(0,2000),(next,final) => {if(final) url=next;}, i && frames[0] ? [frames[0],...referenceUrls].slice(0,4) : referenceUrls);
        if (!url) throw new Error("No frame was returned.");
        frames.push(url);
        onChange({previsFrames:[...frames],imageUrl:frames[0],previsApproved:false});
      }
    } catch(e) {setError(e instanceof Error ? e.message : "Previs failed.");} finally {setBusy(false);}
  }
  async function upload(file:File) {
    setBusy(true);setError(null);
    try {
      const {data} = await supabase.auth.getUser();
      if(!data.user) throw new Error("Sign in to save a reference.");
      const path = `${data.user.id}/canvas/${board.id}/${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;
      const {error} = await supabase.storage.from("studio").upload(path,file,{contentType:file.type});
      if(error) throw error;
      const signed = await supabase.storage.from("studio").createSignedUrl(path,604800);
      if(signed.error || !signed.data) throw new Error("Could not open the saved reference.");
      onChange({imageUrl:signed.data.signedUrl,previsFrames:[],previsApproved:false});
    } catch(e) {setError(e instanceof Error ? e.message : "Upload failed.");} finally {setBusy(false);}
  }
  return <div className="space-y-4 p-4">
    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{shot.kind === "reference" ? "Character Lock" : shot.kind === "video" ? "Motion" : "Scene"}</h3><Button variant="ghost" size="icon" aria-label="Delete node" onClick={onDelete}><Trash2 className="text-destructive" /></Button></div>
    <Field label="Title"><input className="sb-input" value={shot.title} onChange={e => onChange({title:e.target.value})} /></Field>
    {shot.imageUrl && <img src={shot.imageUrl} alt={shot.title} className="aspect-video w-full rounded-lg object-cover" />}
    <Button variant="outline" className="w-full" disabled={busy} onClick={() => fileRef.current?.click()}><Upload /> Upload reference</Button>
    <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => {const f=e.target.files?.[0];if(f) void upload(f);e.target.value="";}} />
    <Field label={shot.kind === "reference" ? "Character description" : "Scene description"}><textarea className="sb-input" rows={3} value={shot.prompt} onChange={e => onChange({prompt:e.target.value})} /></Field>
    {shot.kind !== "reference" && <>
      <Field label="Action / blocking"><textarea className="sb-input" rows={2} value={shot.action || ""} onChange={e => onChange({action:e.target.value})} /></Field>
      <Field label="Camera movement"><input className="sb-input" value={shot.frame} onChange={e => onChange({frame:e.target.value})} /></Field>
      <Field label="Framing"><input className="sb-input" value={shot.shotType} onChange={e => onChange({shotType:e.target.value})} /></Field>
      <Field label="Duration (seconds)"><input className="sb-input" type="number" min={3} max={15} value={shot.duration} onChange={e => onChange({duration:Number(e.target.value)})} /></Field>
      <Button className="w-full" disabled={busy} onClick={() => void generate()}><Image /> {busy ? "Rendering…" : `Render 3 previs frames · ${frameCost*3} Aura`}</Button>
      {!!shot.previsFrames?.length && <div className="grid grid-cols-3 gap-1">{shot.previsFrames.map((url,i) => <img key={i} src={url} alt={`Previs frame ${i+1}`} className="aspect-video w-full object-cover" />)}</div>}
      {shot.previsFrames?.length === 3 && <Button variant="outline" className="w-full" disabled={busy || shot.previsApproved} onClick={() => onChange({previsApproved:true})}><Check /> {shot.previsApproved ? "Frames approved" : "Approve frames"}</Button>}
      <VideoAgentPanel shot={shot} board={board} onChange={onChange} />
    </>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}) {return <label className="block space-y-1"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;}
