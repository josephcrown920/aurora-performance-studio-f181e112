import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PerformanceVariantWorkflow } from "@/components/performance/PerformanceVariantWorkflow";
import "@/components/performance/genjutsu.css";

export const Route = createFileRoute("/luxury-interior")({
  head: () => ({ meta: [
    { title: "Luxury Interior — Genjutsu by Aurora" },
    { name: "description", content: "Film yourself seated anywhere and Genjutsu rebuilds the world as a Maybach, Rolls-Royce or private jet." },
    { property: "og:title", content: "Luxury Interior — Genjutsu by Aurora" },
    { property: "og:description", content: "Your couch becomes a luxury car or jet interior, driven by your own performance." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LuxuryInterior,
});

function LuxuryInterior() {
  const { user } = useAuth();
  return <main className="genjutsu min-h-screen pb-24"><div className="genjutsu-inner">
    <header className="genjutsu-nav"><div className="flex items-center gap-3"><Link to="/perform-anywhere" aria-label="Back to Genjutsu" className="text-muted-foreground"><ArrowLeft size={16} /></Link><strong>GENJUTSU · LUXURY INTERIOR</strong></div></header>
    <section className="genjutsu-band">
      {user ? <PerformanceVariantWorkflow kind="luxury_interior" mode="anywhere" compact /> : <>
        <h2>Luxury interior.</h2>
        <p className="mt-2 text-sm text-muted-foreground">Film yourself seated anywhere — Genjutsu rebuilds the world as a Maybach, Rolls-Royce or private jet.</p>
        <div className="genjutsu-actions"><Button asChild><Link to="/auth" search={{ next: "/luxury-interior" }}>Sign in to start<ArrowUpRight size={14} /></Link></Button></div>
      </>}
    </section>
  </div></main>;
}
