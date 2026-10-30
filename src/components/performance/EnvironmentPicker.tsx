import { useMemo, useState } from "react";
import { Check, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EnvironmentPreset } from "@/lib/environment-presets";

export function EnvironmentGrid({ presets, selectedId, onPick, onUpload, disabled }: { presets: EnvironmentPreset[]; selectedId?: string | null; onPick: (p: EnvironmentPreset) => void; onUpload?: () => void; disabled?: boolean }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(presets.map((p) => p.category)))], [presets]);
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? presets : presets.filter((p) => p.category === cat);
  return (
    <div className="space-y-3">
      {categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{c}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {onUpload && (
          <button type="button" disabled={disabled} onClick={onUpload} className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs text-muted-foreground">
            <Upload className="size-4 text-primary" />Upload your own
          </button>
        )}
        {shown.map((p) => (
          <button key={p.id} type="button" disabled={disabled} aria-pressed={selectedId === p.id} aria-label={p.label} onClick={() => onPick(p)} className={`relative overflow-hidden rounded-md border ${selectedId === p.id ? "border-primary ring-2 ring-primary" : "border-border"}`}>
            <img src={p.image} alt={p.label} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-background/80 px-1.5 py-1 text-left text-[10px] font-semibold leading-tight">{p.label}</span>
            {selectedId === p.id && <Check className="absolute right-1 top-1 size-4 rounded-full bg-primary p-0.5 text-primary-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentPickerDialog({ open, onOpenChange, ...grid }: { open: boolean; onOpenChange: (v: boolean) => void } & Parameters<typeof EnvironmentGrid>[0]) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Choose a scene</DialogTitle></DialogHeader>
        <EnvironmentGrid {...grid} />
      </DialogContent>
    </Dialog>
  );
}
