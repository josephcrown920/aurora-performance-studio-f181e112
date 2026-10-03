import { Image, Smartphone, Film, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PerformanceSourceStrip({ references, phoneVideoUrl, finalUrl, onUpload }: {
  references: Record<string, string | null>;
  phoneVideoUrl: string | null;
  finalUrl?: string | null;
  onUpload?: (file: File) => void;
}) {
  const images = Object.entries(references).filter((entry): entry is [string, string] => !!entry[1]);
  return <section aria-label="Performance sources and final render" className="performance-source-strip">
    <div className={`source-cell ${images.length ? "workspace-active" : ""}`}>
      <span><Image size={13} />Scene references</span>
      <div className="source-preview">{images.length ? <div className="flex h-full gap-1">{images.slice(0, 4).map(([role, url]) => <img key={role} src={url} alt={`${role} reference`} className="min-w-0 flex-1 object-cover" />)}</div> : <span className="source-empty">Build your scene</span>}</div>
    </div>
    <div className={`source-cell ${phoneVideoUrl ? "workspace-active" : ""}`}>
      <span><Smartphone size={13} />Phone recording</span>
      <div className="source-preview">{phoneVideoUrl ? <video src={phoneVideoUrl} controls playsInline preload="metadata" aria-label="Phone base clip" /> : <label className="source-empty cursor-pointer"><Upload size={16} /><span>Base clip</span>{onUpload && <input aria-label="Upload phone base clip" type="file" accept="video/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.target.value = ""; }} />}</label>}</div>
    </div>
    <div className={`source-cell ${finalUrl ? "workspace-active" : ""}`}>
      <span><Film size={13} />Final render</span>
      <div className="source-preview">{finalUrl ? <video src={finalUrl} controls playsInline preload="metadata" aria-label="Final performance render" /> : <span className="source-empty">Final render</span>}</div>
    </div>
  </section>;
}
