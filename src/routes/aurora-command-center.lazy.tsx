import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, Bot, Boxes, CheckCircle2, CircleDot, ExternalLink,
  FileText, FlaskConical, Gauge, Layers3, LockKeyhole, MinusCircle, Monitor, Search,
  Server, ShieldCheck, Smartphone, Workflow, XCircle, ZoomIn, ZoomOut,
} from "lucide-react";
import { AdminRouteBoundary } from "@/components/AdminRouteBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { providerStatus } from "@/lib/provider-status.functions";
import { getCommandCenterSnapshot, type CommandCenterCheck } from "@/lib/command-center.functions";
import {
  AGENTS, DOCUMENTATION_AUDIT, EVIDENCE_ALIASES, LAUNCH_GATES, PERFORMANCE_WORKFLOWS,
  PRODUCT_SURFACES, PROVIDERS, SKILL_AUDIT, SYSTEM_WORKFLOWS, type ProductSurface,
  type ProofStatus, type WorkflowDefinition,
} from "@/lib/command-center-manifest";

export const Route = createLazyFileRoute("/aurora-command-center")({ component: CommandCenterRoute });

type ProviderState = Awaited<ReturnType<typeof providerStatus>>;
const STATUS_META: Record<ProofStatus, { label: string; dot: string; border: string; icon: typeof CheckCircle2 }> = {
  proven: { label: "PROVEN", dot: "bg-success", border: "border-success/35", icon: CheckCircle2 },
  "needs-test": { label: "NEEDS TEST", dot: "bg-warning", border: "border-warning/35", icon: FlaskConical },
  broken: { label: "BROKEN", dot: "bg-destructive", border: "border-destructive/35", icon: XCircle },
  "ui-only": { label: "UI ONLY", dot: "bg-muted-foreground", border: "border-border", icon: MinusCircle },
  blocked: { label: "BLOCKED BY PROVIDER", dot: "bg-info", border: "border-info/35", icon: AlertTriangle },
};

function CommandCenterRoute() {
  return <AdminRouteBoundary><CommandCenter /></AdminRouteBoundary>;
}

function CommandCenter() {
  const snapshotFn = useServerFn(getCommandCenterSnapshot);
  const providersFn = useServerFn(providerStatus);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(100);
  const snapshotQuery = useQuery({ queryKey: ["aurora-command-center"], queryFn: () => snapshotFn(), refetchInterval: 30_000, staleTime: 0 });
  const providersQuery = useQuery({ queryKey: ["provider-status"], queryFn: () => providersFn(), staleTime: 60_000 });

  const checks = snapshotQuery.data?.checks ?? [];
  const evidence = useMemo(() => new Map(checks.map((check) => [check.name, check])), [checks]);
  const visibleSurfaces = PRODUCT_SURFACES.filter((surface) => surface.name.toLowerCase().includes(query.toLowerCase()) || surface.route?.toLowerCase().includes(query.toLowerCase()));
  const provenCount = PRODUCT_SURFACES.filter((surface) => deriveStatus(surface.evidenceKeys, surface.blocker, evidence).status === "proven").length;
  const failedCount = PRODUCT_SURFACES.filter((surface) => deriveStatus(surface.evidenceKeys, surface.blocker, evidence).status === "broken").length;

  if (snapshotQuery.isLoading) return <div className="grid min-h-screen place-items-center bg-background"><Activity className="size-6 animate-pulse text-primary" /></div>;
  if (snapshotQuery.error) return <div className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md text-center"><ShieldCheck className="mx-auto size-10 text-muted-foreground" /><h1 className="mt-4 text-xl font-semibold">Command center unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{snapshotQuery.error instanceof Error ? snapshotQuery.error.message : "The audit snapshot could not be loaded."}</p></div></div>;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" asChild><Link to="/admin" aria-label="Back to admin"><ArrowLeft /></Link></Button>
            <div className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10"><Gauge className="size-4 text-primary" /></div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">Aurora Command Center</p><p className="truncate text-[11px] text-muted-foreground">Internal launch control · evidence only</p></div>
          </div>
          <div className="hidden items-center gap-5 text-xs md:flex">
            <Metric label="Proven surfaces" value={`${provenCount}/${PRODUCT_SURFACES.length}`} />
            <Metric label="Recorded failures" value={String(failedCount)} danger={failedCount > 0} />
            <Metric label="Latest proof run" value={snapshotQuery.data?.latestRun?.finishedAt ? formatDate(snapshotQuery.data.latestRun.finishedAt) : "None"} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <section className="mb-6 grid gap-4 border-b border-border pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="text-xs font-semibold uppercase text-primary">Launch readiness</p><h1 className="mt-2 max-w-4xl text-3xl font-semibold sm:text-4xl">One control room for every screen, workflow, provider and proof.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Statuses come from recorded workflow checks. A visible screen alone never becomes proven.</p></div>
          <Button variant="outline" asChild><Link to="/admin/smoke"><FlaskConical /> Run proof suite</Link></Button>
        </section>

        <Tabs defaultValue="canvas" className="space-y-5">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-md border border-border bg-card/50 p-1">
            <TabsTrigger value="canvas"><Monitor /> Product canvas</TabsTrigger>
            <TabsTrigger value="workflows"><Workflow /> Workflows</TabsTrigger>
            <TabsTrigger value="systems"><Server /> Systems</TabsTrigger>
            <TabsTrigger value="qa"><ShieldCheck /> Final QA</TabsTrigger>
          </TabsList>

          <TabsContent value="canvas" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative min-w-[240px] flex-1 sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a page or route" className="pl-9" /></div>
              <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1"><Button variant="ghost" size="icon" onClick={() => setZoom((value) => Math.max(70, value - 10))} aria-label="Zoom out"><ZoomOut /></Button><span className="w-12 text-center text-xs tabular-nums text-muted-foreground">{zoom}%</span><Button variant="ghost" size="icon" onClick={() => setZoom((value) => Math.min(130, value + 10))} aria-label="Zoom in"><ZoomIn /></Button></div>
            </div>
            <div className="overflow-auto rounded-md border border-border bg-card/20 p-4 sm:p-6">
              <div className="origin-top-left transition-transform" style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%` }}>
                {(["web", "mobile"] as const).map((platform) => <section key={platform} className="mb-8"><div className="mb-3 flex items-center gap-2">{platform === "web" ? <Monitor className="size-4 text-primary" /> : <Smartphone className="size-4 text-primary" />}<h2 className="text-sm font-semibold uppercase">{platform}</h2><span className="text-xs text-muted-foreground">{visibleSurfaces.filter((item) => item.platform === platform).length} surfaces</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleSurfaces.filter((item) => item.platform === platform).map((surface) => <SurfaceCard key={surface.id} surface={surface} evidence={evidence} />)}</div></section>)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-8">
            <WorkflowGrid title="Performance workflow library" subtitle="Every definition must reach Aurora infrastructure—not stop at a prompt preset." workflows={PERFORMANCE_WORKFLOWS} evidence={evidence} />
            <WorkflowGrid title="System proof workflows" subtitle="Cross-product systems and acceptance tests from the launch specification." workflows={SYSTEM_WORKFLOWS} evidence={evidence} />
          </TabsContent>

          <TabsContent value="systems" className="space-y-8">
            <SystemSection title="Providers" icon={Server}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{PROVIDERS.map((provider) => { const configured = providersQuery.data?.[provider.key as keyof ProviderState] ?? false; const health = snapshotQuery.data?.providerHealth.find((item) => item.kind.toLowerCase().includes(provider.key)); return <article key={provider.key} className="rounded-md border border-border bg-card/40 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{provider.name}</h3><p className="mt-1 text-xs text-muted-foreground">{provider.role}</p></div><StatusPill status={health?.status === "healthy" ? "proven" : configured ? "needs-test" : "blocked"} label={health?.status === "healthy" ? "HEALTHY" : configured ? "CONFIGURED" : "NOT CONFIGURED"} /></div>{health && <p className="mt-3 text-xs text-muted-foreground">{health.checkedAt ? `Checked ${formatDate(health.checkedAt)}` : "No health check timestamp"}{health.detail ? ` · ${health.detail}` : ""}</p>}</article>; })}</div></SystemSection>
            <SystemSection title="Agents" icon={Bot}><div className="grid gap-3 md:grid-cols-2">{AGENTS.map((agent) => <article key={agent.name} className="rounded-md border border-border bg-card/40 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{agent.name}</h3><p className="mt-1 text-xs text-muted-foreground">{agent.responsibility}</p></div><span className="rounded-sm border border-border px-2 py-1 text-[10px] text-muted-foreground">{agent.model}</span></div></article>)}</div></SystemSection>
            <SystemSection title="Skills" icon={Boxes}><div className="divide-y divide-border rounded-md border border-border">{SKILL_AUDIT.map((skill) => <div key={skill.name} className="flex items-center justify-between gap-4 bg-card/30 p-4"><div><p className="text-sm font-medium">{skill.name}</p><p className="mt-1 text-xs text-muted-foreground">{skill.consumers}</p></div><StatusPill status={("missing" in skill && skill.missing) ? "ui-only" : "needs-test"} /></div>)}</div></SystemSection>
            <SystemSection title="Backup / restore" icon={LockKeyhole}><div className="grid gap-3 md:grid-cols-3">{snapshotQuery.data?.restoreEvidence.map((item) => <article key={item.kind} className="rounded-md border border-warning/30 bg-card/40 p-4"><p className="text-xs uppercase text-muted-foreground">{item.kind} restore</p><h3 className="mt-2 font-semibold">No successful drill recorded</h3><p className="mt-2 text-xs text-muted-foreground">Checkpoint: none · Result: {item.restorationResult}</p><div className="mt-4"><StatusPill status="needs-test" /></div></article>)}</div></SystemSection>
          </TabsContent>

          <TabsContent value="qa" className="space-y-8">
            <SystemSection title="Launch gates" icon={ShieldCheck}><div className="grid gap-4 lg:grid-cols-3">{Object.entries(LAUNCH_GATES).map(([priority, items]) => <section key={priority} className="rounded-md border border-border bg-card/40"><div className="border-b border-border p-4"><p className="text-xs font-semibold text-primary">{priority}</p><h3 className="mt-1 font-semibold">{priority === "P0" ? "Must work" : priority === "P1" ? "Before launch" : "Polish"}</h3></div><div className="divide-y divide-border">{items.map((item) => { const derived = deriveStatus(EVIDENCE_ALIASES[item], undefined, evidence); return <div key={item} className="flex items-center justify-between gap-3 p-3"><span className="text-sm">{item}</span><StatusPill status={derived.status} /></div>; })}</div></section>)}</div></SystemSection>
            <SystemSection title="Documentation index" icon={FileText}><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{DOCUMENTATION_AUDIT.map((guide) => { const derived = deriveStatus(EVIDENCE_ALIASES[guide], undefined, evidence); return <div key={guide} className="flex items-center justify-between rounded-md border border-border bg-card/30 p-3"><span className="text-sm">{guide}</span><span className="text-[10px] text-muted-foreground">{derived.status === "proven" ? "Proof linked" : "Awaiting proof"}</span></div>; })}</div><p className="mt-3 text-xs text-muted-foreground">Only guides with linked successful workflow evidence qualify as tested documentation.</p></SystemSection>
            <SystemSection title="Latest recorded evidence" icon={FlaskConical}>{checks.length ? <div className="divide-y divide-border rounded-md border border-border">{checks.map((check) => <EvidenceRow key={check.id} check={check} />)}</div> : <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No proof runs have been recorded.</div>}</SystemSection>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function deriveStatus(keys: readonly string[] | undefined, blocker: string | undefined, evidence: Map<string, CommandCenterCheck>) {
  const checks = (keys ?? []).map((key) => evidence.get(key)).filter((item): item is CommandCenterCheck => Boolean(item));
  if (checks.some((item) => item.status === "fail")) return { status: "broken" as const, check: checks.find((item) => item.status === "fail") };
  if (checks.length > 0 && checks.every((item) => item.status === "pass")) return { status: "proven" as const, check: checks[0] };
  if (checks.some((item) => item.status === "skip") && blocker) return { status: "blocked" as const, check: checks[0] };
  if (keys?.length) return { status: "needs-test" as const, check: checks[0] };
  return { status: blocker ? "ui-only" as const : "needs-test" as const, check: undefined };
}

function SurfaceCard({ surface, evidence }: { surface: ProductSurface; evidence: Map<string, CommandCenterCheck> }) {
  const derived = deriveStatus(surface.evidenceKeys, surface.blocker, evidence);
  const check = derived.check;
  return <article className={`min-h-56 rounded-md border bg-card/55 p-4 ${STATUS_META[derived.status].border}`}><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase text-muted-foreground">{surface.platform}</p><h3 className="mt-1 font-semibold">{surface.name}</h3></div><StatusPill status={derived.status} /></div><div className="mt-4 aspect-[16/6] overflow-hidden rounded-sm border border-border bg-background/70">{check?.outputUrl ? (check.outputUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? <video src={check.outputUrl} muted playsInline className="size-full object-cover" /> : <img src={check.outputUrl} alt={`${surface.name} proof output`} className="size-full object-cover" />) : <div className="grid size-full place-items-center text-center text-[11px] text-muted-foreground"><Monitor className="mb-1 size-5 opacity-50" /><span>{surface.route ? "Open the live route to inspect UI" : "No route mapped"}</span></div>}</div><dl className="mt-4 grid gap-2 text-xs"><Meta label="Route" value={surface.route ?? "Not mapped"} mono /><Meta label="Implementation" value={surface.route ? "Route present" : "Not found"} /><Meta label="Functional" value={STATUS_META[derived.status].label} /><Meta label="Last test" value={check ? formatDate(check.testedAt) : "No recorded test"} /><Meta label="Workflow" value={surface.workflow ?? "Not linked"} /></dl>{(check?.error || surface.blocker) && <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground"><AlertTriangle className="mr-1 inline size-3 text-warning" />{check?.error ?? surface.blocker}</p>}{surface.route && <Button variant="ghost" size="sm" className="mt-3 w-full" asChild><Link to={surface.route as never}>Open screen <ExternalLink /></Link></Button>}</article>;
}

function WorkflowGrid({ title, subtitle, workflows, evidence }: { title: string; subtitle: string; workflows: WorkflowDefinition[]; evidence: Map<string, CommandCenterCheck> }) {
  return <SystemSection title={title} icon={Workflow}><p className="mb-4 text-sm text-muted-foreground">{subtitle}</p><div className="grid gap-3 lg:grid-cols-2">{workflows.map((workflow) => { const derived = deriveStatus(workflow.evidenceKeys, workflow.blocker, evidence); return <article key={workflow.id} className={`rounded-md border bg-card/40 p-4 ${STATUS_META[derived.status].border}`}><div className="flex items-start justify-between gap-3"><h3 className="font-medium">{workflow.name}</h3><StatusPill status={derived.status} /></div><div className="mt-4 flex flex-wrap gap-1.5">{workflow.stages.map((stage, index) => <span key={stage} className="inline-flex items-center gap-1 rounded-sm border border-border bg-background/50 px-2 py-1 text-[10px] text-muted-foreground"><span className="font-mono text-primary">{index + 1}</span>{stage}</span>)}</div>{workflow.blocker && <p className="mt-3 text-xs leading-5 text-muted-foreground">{workflow.blocker}</p>}</article>; })}</div></SystemSection>;
}

function SystemSection({ title, icon: Icon, children }: { title: string; icon: typeof Server; children: React.ReactNode }) { return <section><div className="mb-3 flex items-center gap-2"><Icon className="size-4 text-primary" /><h2 className="text-sm font-semibold uppercase">{title}</h2></div>{children}</section>; }
function StatusPill({ status, label }: { status: ProofStatus; label?: string }) { const meta = STATUS_META[status]; const Icon = meta.icon; return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border bg-background/70 px-2 py-1 text-[9px] font-semibold ${meta.border}`}><span className={`size-1.5 rounded-full ${meta.dot}`} /><Icon className="size-3" />{label ?? meta.label}</span>; }
function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="grid grid-cols-[88px_1fr] gap-2"><dt className="text-muted-foreground">{label}</dt><dd className={`truncate text-right ${mono ? "font-mono" : ""}`} title={value}>{value}</dd></div>; }
function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div className="text-right"><p className="text-[10px] uppercase text-muted-foreground">{label}</p><p className={danger ? "font-semibold text-destructive" : "font-semibold"}>{value}</p></div>; }
function EvidenceRow({ check }: { check: CommandCenterCheck }) { const status: ProofStatus = check.status === "pass" ? "proven" : check.status === "fail" ? "broken" : "blocked"; return <div className="grid gap-2 bg-card/30 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium">{check.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{check.error ?? `Run ${check.runId.slice(0, 8)}`}</p></div><span className="text-xs text-muted-foreground">{formatDate(check.testedAt)}</span><div className="flex items-center gap-2"><StatusPill status={status} />{check.outputUrl && <Button size="icon" variant="ghost" asChild><a href={check.outputUrl} target="_blank" rel="noreferrer" aria-label={`View ${check.name} output`}><ExternalLink /></a></Button>}</div></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
