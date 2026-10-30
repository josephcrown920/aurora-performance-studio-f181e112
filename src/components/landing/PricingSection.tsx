import { authNextSearch } from "@/lib/auth-return-path";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { createPaystackCheckout } from "@/lib/billing.functions";
import { PLANS, type PlanKey } from "@/lib/billing.plans";
import { detectCurrency } from "@/lib/geo.functions";
import { useAuth } from "@/hooks/use-auth";
import { track } from "@/lib/tracking";
import {
  LIPSYNC_TIER_AURA,
  VIDEO_TIER_AURA,
  auraValueEstimate,
  computeCost,
} from "@/lib/pricing";

const imageCost = computeCost({ features: ["image"] }).total;
const budgetVideoCost = VIDEO_TIER_AURA.budget;
const premiumVideoCost = VIDEO_TIER_AURA.premium;
const budgetLipSyncCost = LIPSYNC_TIER_AURA.budget;

const META: Record<"starter" | "creator" | "studio", {
  name: string;
  tagline: string;
  features: (credits: number) => string[];
  icon: typeof Sparkles;
  highlight?: boolean;
}> = {
  starter: {
    name: "Starter", tagline: "Test-drive the studio.", icon: Sparkles,
    features: (credits) => [
      `${credits.toLocaleString()} Aura (~${auraValueEstimate(credits, "image").count} images)`,
      "All image models",
      "Lip-sync up to 8s",
      "Standard queue",
    ],
  },
  creator: {
    name: "Creator", tagline: "Built for daily posting.", icon: Zap, highlight: true,
    features: (credits) => [
      `${credits.toLocaleString()} Aura (~${Math.floor(credits / budgetVideoCost)} budget · ~${Math.floor(credits / premiumVideoCost)} premium videos)`,
      "All image + video models",
      "Priority queue",
      "Commercial license",
      "Gallery sharing",
    ],
  },
  studio: {
    name: "Studio", tagline: "For agencies + power users.", icon: Crown,
    features: (credits) => [
      `${credits.toLocaleString()} Aura (~${Math.floor(credits / budgetVideoCost)} budget · ~${Math.floor(credits / premiumVideoCost)} premium videos)`,
      "Every model, including Seedance Pro",
      "Top-priority queue",
      "Team sharing",
      "White-glove onboarding",
    ],
  },
};

const ORDER: ("starter" | "creator" | "studio")[] = ["starter", "creator", "studio"];

export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkout = useServerFn(createPaystackCheckout);
  const detectCurrencyFn = useServerFn(detectCurrency);
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const { data: geo } = useQuery({
    queryKey: ["geo-currency"],
    queryFn: () => detectCurrencyFn(),
    staleTime: 60 * 60 * 1000,
  });
  const currency = geo?.currency ?? "USD";

  const onChoose = async (plan: PlanKey) => {

    void track("pricing_cta_click", { plan, currency });
    if (!user) {
      try { localStorage.setItem("aurora_intent_plan", plan); } catch { /* storage unavailable — ignore */ }
      toast.info("Sign in first to complete checkout.");
      navigate({ to: "/auth", search: authNextSearch() });
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await checkout({ data: { plan } });
      window.location.href = res.authorizationUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="relative z-10 px-5 md:px-12 pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-72 max-w-4xl rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="relative text-center max-w-2xl mx-auto mb-12">
        <p className="text-[11px] uppercase tracking-[0.35em] text-violet-300/80 mb-3">Pricing · USD</p>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[0.95]">
          Pay once.<br />
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">Create forever.</span>
        </h2>
        <p className="text-white/60 mt-4 text-sm md:text-base">
          No subscription. Aura never expires. Images from {imageCost} Aura, video from {budgetVideoCost}, lip-sync from {budgetLipSyncCost}.
        </p>
      </div>

      <div className="relative grid md:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto items-stretch">
        {ORDER.map((key) => {
          const p = PLANS[key];
          const meta = META[key];
          const Icon = meta.icon;
          const perAura = (p.usd / p.credits) * 100;
          return (
            <div
              key={key}
              className={`group relative rounded-[28px] p-px transition-all duration-500 hover:-translate-y-1 ${
                meta.highlight
                  ? "bg-gradient-to-b from-violet-400 via-fuchsia-500/60 to-amber-300/40 md:scale-[1.04] shadow-[0_30px_80px_-30px_rgba(167,139,250,0.7)]"
                  : "bg-gradient-to-b from-white/20 to-white/[0.03]"
              }`}
            >
              <div className="relative h-full rounded-[27px] bg-zinc-950/95 backdrop-blur-xl p-7 md:p-8 flex flex-col gap-6 overflow-hidden">
                {meta.highlight && <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`size-10 rounded-2xl flex items-center justify-center ${meta.highlight ? "bg-gradient-to-br from-violet-500 to-fuchsia-500" : "bg-white/[0.06] ring-1 ring-white/10"}`}>
                      <Icon className="size-4 text-white" />
                    </span>
                    <div>
                      <p className="font-semibold text-lg leading-none tracking-tight">{meta.name}</p>
                      <p className="text-[11px] text-white/45 mt-1">{meta.tagline}</p>
                    </div>
                  </div>
                  {meta.highlight && (
                    <span className="text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white text-zinc-950 font-bold">Most popular</span>
                  )}
                </div>
                <div className="relative">
                  <div className="flex items-start gap-1">
                    <span className="text-xl text-white/50 mt-2">$</span>
                    <span className="text-6xl font-semibold tracking-tighter leading-none">{p.usd}</span>
                    <span className="self-end mb-1 ml-1 text-xs text-white/40">USD · one-time</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-3">
                    <span className="text-sm font-semibold text-violet-200">{p.credits.toLocaleString()} Aura</span>
                    <span className="text-[11px] text-white/45">{perAura.toFixed(2)}¢ / Aura</span>
                  </div>
                </div>
                <div className="relative h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <ul className="relative space-y-3 text-sm text-white/80">
                  {meta.features(p.credits).map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-0.5 size-4 rounded-full bg-violet-500/20 ring-1 ring-violet-400/40 flex items-center justify-center shrink-0">
                        <Check className="size-2.5 text-violet-200" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onChoose(key)}
                  disabled={loadingPlan !== null}
                  className={`relative mt-auto w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full font-semibold transition disabled:opacity-60 ${
                    meta.highlight
                      ? "bg-white text-zinc-950 hover:bg-white/90"
                      : "bg-white/[0.06] ring-1 ring-white/15 text-white hover:bg-white/10"
                  }`}
                >
                  {loadingPlan === key ? (<><Loader2 className="size-4 animate-spin" /> Redirecting…</>) : (<>Get {meta.name}</>)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/45">
        <span>Prices in USD</span><span>·</span>
        <span>Secure checkout</span><span>·</span>
        <span>7-day refund on unused Aura</span><span>·</span>
        <Link to="/gifts" className="underline hover:text-white/70">Gift cards</Link>
      </div>
    </section>
  );
}
