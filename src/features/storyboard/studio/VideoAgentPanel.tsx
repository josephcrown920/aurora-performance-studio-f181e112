import { useState } from "react";
import type { Board, ShotNode } from "@/lib/board-store";
import { useVideoFromImageJobFn } from "@/lib/use-job-polling";
import { Button } from "@/components/ui/button";
import { Film, Play } from "lucide-react";
import { computeCost } from "@/lib/pricing";

export function VideoAgentPanel({shot,board,onChange}:{shot:ShotNode;board:Board;onChange:(patch:Partial<ShotNode>)=>void}) {
  const generate = useVideoFromImageJobFn();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const incoming = board.edges.filter(e=>e.to===shot.id).flatMap(e=>board.shots.filter(s=>s.id===e.from));
  const source = shot.previsApproved ? shot : incoming.find(s=>s.previsApproved);
  const request = source?.imageUrl ? {imageUrl:source.imageUrl,prompt:`${shot.videoPrompt || source.prompt || shot.title}. Action: ${shot.action || source.action || ""}. Camera movement: ${shot.frame || source.frame}. Preserve the character and setting.`,duration:Math.max(3,Math.min(15,Math.round(shot.duration))),resolution:"720p" as const,modelKey:"seedance-2.0-fast"} : null;
  const matches = !!request && JSON.stringify(request) === JSON.stringify(shot.motionPreviewRequest);
  const previewCost=computeCost({features:["video"],model:"seedance-2.0-fast",durationSeconds:Math.min(5,request?.duration || 4),resolution:"480p"}).total;
  const finalCost=computeCost({features:["video"],model:"seedance-2.0-fast",durationSeconds:request?.duration || 4,resolution:"720p"}).total;
  async function render(final:boolean) {
    if(!request) return;
    setBusy(true);setError(null);
    try {
      const result = await generate({data:{...request,...(final && matches && shot.motionPreviewId ? {confirmPreviewId:shot.motionPreviewId} : {})}});
      if(result.preview) onChange({motionPreviewId:result.id,motionPreviewUrl:result.videoUrl,motionPreviewRequest:request,videoUrl:null});
      else onChange({videoUrl:result.videoUrl});
    } catch(e) {setError(e instanceof Error ? e.message : "Render failed.");} finally {setBusy(false);}
  }
  return <section className="space-y-2 border-t border-border pt-4">
    <Button variant="outline" className="w-full" disabled={busy || !request} onClick={()=>void render(false)}><Play /> {busy ? "Rendering…" : `Motion preview · ${previewCost} Aura`}</Button>
    {shot.motionPreviewUrl && <video src={shot.motionPreviewUrl} controls className="aspect-video w-full rounded-lg" />}
    <Button className="w-full" disabled={busy || !matches || !shot.motionPreviewId} onClick={()=>void render(true)}><Film /> Approve & render final · {finalCost} Aura</Button>
    {shot.videoUrl && <video src={shot.videoUrl} controls className="aspect-video w-full rounded-lg" />}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
