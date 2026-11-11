import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, Download, Music2, Wand2, SlidersHorizontal, Layers3, Disc3, Send, PanelRightClose, PanelRightOpen, Play, Pause } from "lucide-react";

export const Route = createLazyFileRoute("/puremix")({ component: PureMixStudio });
type Stage = "separation" | "mixing" | "mastering";
type Mode = "manual" | "auto";
type Stem = { name: string; gain: number; muted: boolean; solo: boolean };
const initialStems: Stem[] = [
  { name: "Vocals", gain: 100, muted: false, solo: false },
  { name: "Drums", gain: 100, muted: false, solo: false },
  { name: "Bass", gain: 100, muted: false, solo: false },
  { name: "Instrumental", gain: 100, muted: false, solo: false },
];
const stages: { id: Stage; label: string; icon: typeof Layers3 }[] = [
  { id: "separation", label: "Separation", icon: Layers3 },
  { id: "mixing", label: "Mixing", icon: SlidersHorizontal },
  { id: "mastering", label: "Mastering", icon: Disc3 },
];
function PureMixStudio() {
  const [stage, setStage] = useState<Stage>("mixing");
  const [mode, setMode] = useState<Mode>("manual");
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [renderUrl, setRenderUrl] = useState("");
  const [agentOpen, setAgentOpen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [stems, setStems] = useState(initialStems);
  const [settings, setSettings] = useState({ eq: "Neutral", compression: "Gentle", stereo: "Natural", target: "Streaming", output: 100 });
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{role: string; text: string}[]>([{role:"agent",text:"Welcome to PureMix. You can work entirely in Manual mode, or ask me for suggested settings in Auto mode. Production AI audio tools are not connected yet."}]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const objectUrls = useRef<string[]>([]);
  useEffect(() => () => objectUrls.current.forEach(URL.revokeObjectURL), []);
  useEffect(() => {
    if (!sourceUrl) return;
    let cancelled = false;
    (async () => {
      const context = new AudioContext();
      try {
        const buffer = await context.decodeAudioData(await (await fetch(sourceUrl)).arrayBuffer());
        if (cancelled || !canvas.current) return;
        const element = canvas.current, g = element.getContext("2d");
        if (!g) return;
        const data = buffer.getChannelData(0), width = element.width, height = element.height;
        g.clearRect(0, 0, width, height); g.fillStyle = "#a78bfa";
        for (let x=0;x<width;x+=3) {
          const start=Math.floor(x*data.length/width), end=Math.floor((x+3)*data.length/width);
          let peak=0; for(let i=start;i<end;i+=Math.max(1,Math.floor((end-start)/20))) peak=Math.max(peak,Math.abs(data[i]));
          const bar=Math.max(2,peak*height*.9);g.fillRect(x,(height-bar)/2,2,bar);
        }
      } catch { /* Keep player available when waveform decoding is unsupported. */ }
      finally { await context.close(); }
    })();
    return () => {cancelled=true;};
  }, [sourceUrl]);
  function load(next?: File) {
    if (!next) return;
    if (!next.type.startsWith("audio/") && !/\.(wav|mp3|m4a|flac|ogg)$/i.test(next.name)) { setError("Choose a supported audio file.");return; }
    const url=URL.createObjectURL(next);objectUrls.current.push(url);
    setFile(next);setSourceUrl(url);setRenderUrl("");setError("");setPlaying(false);
  }
  function changeStem(index: number, patch: Partial<Stem>) {setStems(old=>old.map((s,i)=>i===index?{...s,...patch}:s));}
  function submit() {
    const text=prompt.trim();if(!text)return;
    const target=/club|drill|grime|punch|loud/i.test(text)?"Club":/radio|broadcast/i.test(text)?"Broadcast":"Streaming";
    setSettings(s=>({...s,target,compression:/punch|drill|club/i.test(text)?"Punchy":s.compression}));
    setMessages(old=>[...old,{role:"user",text},{role:"agent",text:"I suggested the "+target+" target and updated the available controls. This assistant currently uses local rules, not an LLM or an automated mix engine."}]);setPrompt("");
  }
  async function renderPreview() {
    if(!file||busy)return;
    setBusy(true);setError("");
    try {
      const ctx=new AudioContext();let input:AudioBuffer;
      try {input=await ctx.decodeAudioData(await file.arrayBuffer());} finally {await ctx.close();}
      const offline=new OfflineAudioContext(Math.min(2,input.numberOfChannels),input.length,input.sampleRate);
      const src=offline.createBufferSource();src.buffer=input;
      const eq=offline.createBiquadFilter();eq.type="lowshelf";eq.frequency.value=160;eq.gain.value=settings.eq==="Warm"?2:settings.eq==="Bright"?-1:0;
      const compressor=offline.createDynamicsCompressor();compressor.threshold.value=settings.compression==="Punchy"?-22:-14;compressor.ratio.value=settings.compression==="Punchy"?3:1.7;
      const gain=offline.createGain();gain.gain.value=settings.output/100;
      src.connect(eq).connect(compressor).connect(gain).connect(offline.destination);src.start();
      const out=await offline.startRendering(),channels=out.numberOfChannels;
      const wav=new ArrayBuffer(44+out.length*channels*2),v=new DataView(wav);
      const str=(p:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i));};
      str(0,"RIFF");v.setUint32(4,wav.byteLength-8,true);str(8,"WAVE");str(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,out.sampleRate,true);v.setUint32(28,out.sampleRate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,"data");v.setUint32(40,out.length*channels*2,true);
      let p=44;for(let i=0;i<out.length;i++)for(let ch=0;ch<channels;ch++){const s=Math.max(-1,Math.min(1,out.getChannelData(ch)[i]));v.setInt16(p,s<0?s*32768:s*32767,true);p+=2;}
      const url=URL.createObjectURL(new Blob([wav],{type:"audio/wav"}));objectUrls.current.push(url);setRenderUrl(url);
    }catch(e){setError(e instanceof Error?e.message:"Unable to process audio.");}finally{setBusy(false);}
  }
  const panel="rounded-[26px] border border-white/15 bg-white/[0.055] shadow-[0_18px_70px_rgba(0,0,0,.25)] backdrop-blur-2xl";
  const button="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium hover:bg-white/15 disabled:opacity-40";
  return <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(109,40,217,.24),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(217,119,6,.12),transparent_50%),#0b0c16] px-3 py-5 text-white sm:px-6">
    <header className="mx-auto mb-6 flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
      <div><div className="flex items-center gap-2 text-2xl font-bold"><Music2 className="text-amber-300"/> PureMix <span className="font-normal text-violet-300">Studio</span></div><p className="mt-1 text-xs text-white/50">Aurora · Music & Audio · Mixing and mastering workstation</p></div>
      <div className="flex gap-2"><button className={button} onClick={()=>setAgentOpen(v=>!v)}>{agentOpen?<PanelRightClose size={17}/>:<PanelRightOpen size={17}/>}</button><label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold"><Upload size={17}/> Upload Song<input type="file" accept="audio/*,.wav,.flac,.m4a" className="hidden" onChange={e=>load(e.target.files?.[0])}/></label></div>
    </header>
    <div className="mx-auto grid max-w-[1600px] gap-4 lg:grid-cols-[210px_minmax(0,1fr)_auto]">
      <nav className={panel+" h-fit p-3"} aria-label="Audio studio workspaces"><p className="px-3 py-3 text-xs uppercase tracking-widest text-white/40">Workspaces</p>{stages.map(({id,label,icon:Icon})=><button key={id} onClick={()=>setStage(id)} aria-current={stage===id?"page":undefined} className={"mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm "+(stage===id?"bg-violet-500/30 text-violet-100":"text-white/65 hover:bg-white/10")}><Icon size={18}/>{label}</button>)}<div className="mt-5 rounded-2xl bg-black/25 p-3 text-xs leading-5 text-white/50">Separation requires a dedicated stem model. Mixing and mastering are independent workspaces.</div></nav>
      <section className="min-w-0 space-y-4">
        <div className={panel+" p-5"}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[.2em] text-violet-300">{stage} studio</p><h1 className="mt-1 text-xl font-semibold">{file?.name||"Your new audio project"}</h1></div>{stage!=="separation"&&<div className="flex rounded-2xl border border-white/10 bg-black/30 p-1"><button onClick={()=>setMode("manual")} className={"rounded-xl px-4 py-2 text-sm "+(mode==="manual"?"bg-white/20":"text-white/50")}>Manual</button><button onClick={()=>setMode("auto")} className={"rounded-xl px-4 py-2 text-sm "+(mode==="auto"?"bg-violet-500/50":"text-white/50")}>Auto AI</button></div>}</div>
          {!file?<label className="flex min-h-[250px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-violet-300/35 bg-violet-500/[.06] text-center"><Upload size={34} className="text-violet-300"/><strong>Drop in your song or click to upload</strong><span className="text-sm text-white/50">WAV, MP3, FLAC, M4A · Your audio stays in the browser for this preview</span><input type="file" accept="audio/*,.wav,.flac,.m4a" className="hidden" onChange={e=>load(e.target.files?.[0])}/></label>:<><canvas ref={canvas} width={960} height={170} className="w-full rounded-2xl bg-black/35"/><audio ref={audio} controls src={renderUrl||sourceUrl} className="mt-3 w-full" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/><div className="mt-3 flex flex-wrap gap-2"><button className={button} onClick={()=>{if(audio.current?.paused)void audio.current.play();else audio.current?.pause();}}>{playing?<Pause size={16}/>:<Play size={16}/>}</button><button className={button} onClick={()=>{if(audio.current){audio.current.src=sourceUrl;audio.current.load();}}}>Original</button><button className={button} disabled={!renderUrl} onClick={()=>{if(audio.current){audio.current.src=renderUrl;audio.current.load();}}}>Processed preview</button></div></>}
        </div>
        {stage==="separation"?<div className={panel+" p-5"}><h2 className="text-lg font-semibold">Audio Separation</h2><p className="my-3 text-sm text-white/60">Extract vocals, drums, bass and instruments into separate tracks. The separation model is not connected yet; these tracks are not generated from your upload.</p><div className="grid gap-3 sm:grid-cols-2">{stems.map(s=><div key={s.name} className="rounded-2xl border border-white/10 bg-black/25 p-4"><Layers3 className="mb-2 text-violet-300"/>{s.name}<p className="text-xs text-white/40">Stem extraction unavailable</p></div>)}</div><button disabled className={button+" mt-4"}>Separate stems · Backend required</button></div>:
        <div className={panel+" p-5"}><div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-semibold">{stage==="mixing"?"Mixing Console":"Mastering Console"}</h2><p className="text-sm text-white/50">{mode==="auto"?"AI-guided processing · Full LLM engine pending":"Manual editing · No agent required"}</p></div><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/60">{stage==="mixing"?"MULTITRACK":"STEREO MASTER"}</span></div>
          {stage==="mixing"?<div className="space-y-3">{stems.map((s,i)=><div key={s.name} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"><div className="w-28 font-medium">{s.name}</div><button className={button+" !px-3 !py-2"} onClick={()=>changeStem(i,{muted:!s.muted})} aria-pressed={s.muted}>M</button><button className={button+" !px-3 !py-2"} onClick={()=>changeStem(i,{solo:!s.solo})} aria-pressed={s.solo}>S</button><div className="flex-1 rounded-xl bg-violet-500/10 px-3 py-2 text-xs text-white/45">Stem not yet separated</div><input aria-label={s.name+" level"} type="number" min="0" max="200" value={s.gain} onChange={e=>changeStem(i,{gain:Math.min(200,Math.max(0,Number(e.target.value)||0))})} className="w-16 rounded-xl border border-white/10 bg-white/10 p-2 text-center text-sm"/>%</div>)}<p className="text-xs text-amber-200/70">These stem controls are staged for the separation engine; they do not change the uploaded stereo audio yet.</p></div>:
          <div className="grid gap-3 sm:grid-cols-2">{([["eq","Tone / EQ",["Neutral","Warm","Bright"]],["compression","Compression",["Gentle","Punchy"]],["stereo","Stereo Image",["Natural","Wide"]],["target","Delivery Target",["Streaming","Club","Broadcast"]]] as const).map(([key,label,values])=><div key={key} className="rounded-2xl border border-white/10 bg-black/20 p-4"><label className="mb-3 block text-sm text-white/60">{label}</label><div className="flex flex-wrap gap-2">{values.map(value=><button key={value} onClick={()=>setSettings(s=>({...s,[key]:value}))} className={"rounded-xl border px-3 py-2 text-xs "+(settings[key]===value?"border-violet-400 bg-violet-500/25":"border-white/10 bg-white/5")}>{value}</button>)}</div></div>)}<div className="rounded-2xl border border-white/10 bg-black/20 p-4"><label className="mb-2 block text-sm text-white/60">Output Gain (%)</label><input aria-label="Output gain percentage" type="number" min="0" max="200" value={settings.output} onChange={e=>setSettings(s=>({...s,output:Math.min(200,Math.max(0,Number(e.target.value)||0))}))} className="w-24 rounded-xl border border-white/10 bg-white/10 p-2"/></div></div>}
          <div className="mt-5 flex flex-wrap gap-2"><button disabled={!file||busy||stage==="mixing"} onClick={()=>void renderPreview()} className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-black disabled:opacity-40">{busy?"Rendering…":"Render Mastering Preview"}</button>{renderUrl&&<a href={renderUrl} download="puremix-preview.wav" className={button+" flex items-center gap-2"}><Download size={16}/> Export WAV preview</a>}</div>
          <p className="mt-3 text-xs leading-5 text-white/45">The browser preview applies basic EQ and compression only. It does not implement true peak limiting, loudness targeting, stem mixing, stereo widening, or the production PureMix Python mastering worker. Auto AI is not operational until an LLM and audio tools are connected.</p>
          {error&&<p role="alert" className="mt-3 text-red-300">{error}</p>}
        </div>}
      </section>
      {agentOpen&&<aside className={panel+" flex min-h-[550px] w-full flex-col lg:w-[320px]"}><div className="border-b border-white/10 p-4"><h2 className="flex items-center gap-2 font-semibold"><Wand2 className="text-violet-300" size={18}/> PureMix Agent</h2><p className="mt-1 text-xs text-white/45">Optional assistant · Local rules only</p></div><div className="max-h-[490px] flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">{messages.map((m,i)=><div key={i} className={"rounded-2xl p-3 text-sm leading-6 "+(m.role==="agent"?"bg-violet-500/15":"bg-white/10")}><span className="mb-1 block text-xs uppercase tracking-wider text-white/40">{m.role}</span>{m.text}</div>)}</div><form onSubmit={e=>{e.preventDefault();submit();}} className="flex gap-2 border-t border-white/10 p-3"><input value={prompt} onChange={e=>setPrompt(e.target.value)} aria-label="Message mastering assistant" placeholder="Make it punchy and clean…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/25 p-3 text-sm"/><button type="submit" aria-label="Send" className="rounded-xl bg-violet-500 p-3"><Send size={16}/></button></form></aside>}
    </div>
  </main>;
}
