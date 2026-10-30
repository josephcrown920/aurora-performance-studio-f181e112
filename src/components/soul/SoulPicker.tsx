import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { getSoulIdentityReference, listSouls } from "@/lib/soul.functions";

/** "Use my Soul" button: pick a trained character instead of uploading a selfie. */
export function SoulPicker({ onPick, label = "Use a Soul character", className }: { onPick: (url: string, name: string) => void; label?: string; className?: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const listFn = useServerFn(listSouls);
  const refFn = useServerFn(getSoulIdentityReference);
  const souls = useQuery({ queryKey: ["souls-picker", user?.id], queryFn: () => listFn(), enabled: !!user && open });
  if (!user) return null;
  const ready = (souls.data ?? []).filter((s) => s.status === "ready" || s.reference_image_paths.length || s.training_image_paths.length);
  return <>
    <Button type="button" size="sm" variant="outline" className={className} onClick={() => setOpen(true)}><UserCircle2 className="size-4" />{label}</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Pick a trained character</DialogTitle></DialogHeader>
        {souls.isLoading ? <Loader2 className="mx-auto size-5 animate-spin" /> : souls.isError ? <p className="text-sm text-muted-foreground">Could not load your characters.</p> : ready.length === 0 ? <p className="text-sm text-muted-foreground">No trained characters yet. Train one in Aurora Soul first.</p> : (
          <div className="grid grid-cols-2 gap-2">
            {ready.map((s) => <Button key={s.id} variant="outline" disabled={!!busy} className="h-14 justify-start" onClick={async () => {
              setBusy(s.id);
              try { const r = await refFn({ data: { soulId: s.id } }); onPick(r.url, r.name); setOpen(false); toast.success(`${r.name} locked as identity`); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Could not use this character"); }
              finally { setBusy(null); }
            }}>{busy === s.id ? <Loader2 className="size-4 animate-spin" /> : <UserCircle2 className="size-4" />}<span className="truncate">{s.name}</span></Button>)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>;
}
