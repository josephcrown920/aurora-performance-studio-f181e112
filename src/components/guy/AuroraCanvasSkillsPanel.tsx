// @ts-nocheck
import { useRef, useState } from "react";
import { EFFECTS } from "@/lib/aurora-canvas-vfx.mjs";
import { listAuroraCanvasAgentTools, executeAuroraCanvasAgentTool } from "@/lib/aurora-canvas-agent-tools.mjs";

/** Local Canvas Agent skill workbench. Never submits a paid job. */
export function AuroraCanvasSkillsPanel() {
 const [effect,setEffect]=useState("night-vision");
 const [message,setMessage]=useState("");
 const [preview,setPreview]=useState<string|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null);
 const [tools]=useState(()=>listAuroraCanvasAgentTools());
 const selected=EFFECTS.find(x=>x.id===effect);
 async function apply(file:File) {
  if(!selected?.implemented){setMessage("This preset requires a camera/timeline renderer and is not yet executable.");return;}
  try {
   const image=await createImageBitmap(file);
   const c=canvas.current;if(!c)return;
   c.width=image.width;c.height=image.height;
   const ctx=c.getContext("2d",{willReadFrequently:true});if(!ctx)throw Error("Canvas unavailable");
   ctx.drawImage(image,0,0);
   const pixels=ctx.getImageData(0,0,c.width,c.height);
   executeAuroraCanvasAgentTool({tool:"aurora.vfx",action:"apply-pixel",input:{id:effect,frame:pixels}});
   ctx.putImageData(pixels,0,0);
   setPreview(c.toDataURL("image/png"));setMessage("Local preview rendered. No credits spent.");
   image.close();
  }catch(e){setMessage(e instanceof Error?e.message:"Unable to process image");}
 }
 return <section className="rounded-xl border p-3 space-y-3" aria-label="Aurora Canvas Agent skills">
  <h3 className="font-semibold">Aurora Canvas Agent Skills</h3>
  <p className="text-xs text-muted-foreground">{tools.length} registered skill tools · Local VFX and Soul/Omni preflight · No paid jobs</p>
  <label className="block text-sm">VFX preset
   <select className="block w-full rounded border bg-transparent p-2" value={effect} onChange={e=>{setEffect(e.target.value);setPreview(null);setMessage("");}}>
    {EFFECTS.map(e=><option key={e.id} value={e.id}>{e.id} — {e.implemented?"Preview available":"Renderer required"}</option>)}
   </select>
  </label>
  {selected?.implemented?<label className="block text-sm">Preview on image
    <input className="block w-full text-xs" type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)void apply(f);}} />
   </label>:<p className="text-xs">Requires: {selected?.requires.join(", ")}</p>}
  <canvas ref={canvas} className="hidden" />
  {preview&&<><img src={preview} alt="Rendered VFX preview" className="max-h-56 rounded object-contain" /><a href={preview} download={effect+".png"} className="text-sm underline">Save preview PNG</a></>}
  {message&&<p role="status" className="text-xs">{message}</p>}
  <p className="text-xs text-muted-foreground">LoRA and Omni skills are available for preflight through the shared dispatcher. Live training/generation is not connected in this panel.</p>
 </section>;
}
