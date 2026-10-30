import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateImage, faceSwapVideo } from "@/lib/guy/generate";
import { IMAGE_ENGINES, DEFAULT_IMAGE_ENGINE } from "@/lib/guy/engines";
import { Loader2, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXPRESSION_MODES, IDENTITY_IMAGE_ENGINES, assertIdentityRequest, type ExpressionMode, type IdentitySettings } from "@/lib/identity/contract";

const IDENTITY_LOCK = "Keep the exact same person from the face reference: identical face shape, eyes, nose, lips, jawline, skin tone, freckles, marks and age. Do not beautify, stylize or blend identities.";

export function FaceSwap({ onAsset }: { onAsset: (url: string, kind: "image" | "video", name: string) => void }) {
  const [kind, setKind] = useState<"image" | "video">("image");
  const [target, setTarget] = useState<File>();
  const [face, setFace] = useState<File>();
  const [preview, setPreview] = useState<string[]>([]);
  const [engine, setEngine] = useState("seedream5pro");
  const [expression, setExpression] = useState<ExpressionMode>("preserve");
  const [customExpr, setCustomExpr] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState("");
  useEffect(() => { const urls = [target, face].map((f) => f ? URL.createObjectURL(f) : ""); setPreview(urls); return () => urls.forEach((u) => { if (u) URL.revokeObjectURL(u); }); }, [target, face]);

  function switchKind(k: "image" | "video") { if (busy) return; setKind(k); setTarget(undefined); setResult(""); setStatus(""); }

  async function run() {
    if (!target || !face || !consent || busy) return;
    setBusy(true); setResult("");
    try {
      if (kind === "video") {
        const url = await faceSwapVideo(target, [face], IDENTITY_LOCK, setStatus);
        setResult(url); onAsset(url, "video", "face-swap.mp4"); setStatus("Face-swapped video added to Generations.");
      } else {
        setStatus("Editing the face…");
        const identity: IdentitySettings = { identityRequired: true, faceSwapMode: true, expressionMode: expression, customExpression: customExpr, preserveFacialStructure: true, preserveSkinTone: true, preserveDistinctiveFeatures: true, referencePriority: "identity-first" };
        assertIdentityRequest(identity, "image", engine, 2);
        const url = await generateImage("Natural photographic face swap, no text.", engine, target, true, [face], identity);
        setResult(url); onAsset(url, "image", "face-swap.png"); setStatus("Face edit added to Generations.");
      }
    } catch (e) { setStatus(e instanceof Error ? e.message : "Face swap failed."); }
    finally { setBusy(false); }
  }

  const labels = [kind === "video" ? "Original video" : "Original image", "Face reference"];
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 font-semibold"><ScanFace className="size-4" />Face swap</h2>
      <div role="tablist" aria-label="Swap type" className="flex rounded-md border border-border p-0.5 text-xs">
        {(["image", "video"] as const).map((k) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => switchKind(k)} className={cn("rounded px-3 py-1", kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{k === "image" ? "Photo" : "Video"}</button>)}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">{labels.map((label, i) => <label key={label} className="flex min-w-0 flex-col gap-2 text-xs">
      {label}{preview[i] && (i === 0 && kind === "video"
        ? <video src={preview[i]} muted playsInline controls className="aspect-square w-full rounded-lg bg-muted object-contain" />
        : <img src={preview[i]} alt={label} className="aspect-square w-full rounded-lg object-contain" />)}
      <input key={`${kind}-${i}`} aria-label={label} type="file" accept={i === 0 && kind === "video" ? "video/*" : "image/*"} className="w-full min-w-0" onChange={(e) => { if (i === 0) setTarget(e.target.files?.[0]); else setFace(e.target.files?.[0]); }} />
    </label>)}</div>
    {kind === "image"
      ? <select aria-label="Face swap image engine" value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full rounded-md border border-border bg-background p-2 text-xs">{IMAGE_ENGINES.filter((e) => IDENTITY_IMAGE_ENGINES.has(e.id)).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
      : <p className="text-xs text-muted-foreground">Model: Seedance 2.5 (ModelArk). Keeps the clip's motion, timing and sound; best with clips up to 15 seconds.</p>}
    <div className="flex gap-2">
      <select aria-label="Expression" value={expression} onChange={(e) => setExpression(e.target.value as ExpressionMode)} className="flex-1 rounded-md border border-border bg-background p-2 text-xs">{EXPRESSION_MODES.filter((m) => kind === "image" || m === "preserve").map((m) => <option key={m} value={m}>{m === "preserve" ? "Keep original expression" : m === "follow-prompt" ? "Follow note" : m[0].toUpperCase() + m.slice(1)}</option>)}</select>
      {expression === "custom" && <input aria-label="Custom expression" value={customExpr} onChange={(e) => setCustomExpr(e.target.value)} placeholder="e.g. smirk, one brow raised" className="flex-1 rounded-md border border-border bg-background p-2 text-xs" />}
    </div>
    <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />I have permission from the adults pictured to edit their likeness.</label>
    <Button disabled={!target || !face || !consent || busy} onClick={() => void run()}>{busy ? <Loader2 className="animate-spin" /> : <ScanFace />}{kind === "video" ? "Swap face in video" : "Swap face"}</Button>
    {status && <p role="status" className="text-xs text-muted-foreground">{status}</p>}
    {result && (kind === "video"
      ? <video src={result} controls playsInline className="max-h-96 rounded-lg" />
      : <img src={result} alt="Face swap result" className="max-h-96 rounded-lg object-contain" />)}
  </section>;
}
