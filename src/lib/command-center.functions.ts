import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CommandCenterCheck = {
  id: string;
  runId: string;
  name: string;
  status: "pass" | "fail" | "skip";
  testedAt: string;
  latencyMs: number | null;
  costUsd: number | null;
  outputUrl: string | null;
  error: string | null;
};

export type RestoreEvidence = {
  kind: "Build" | "Database" | "Storage";
  status: "needs-test";
  lastSuccessfulDrill: null;
  checkpoint: null;
  restorationResult: "No recorded restore drill";
};

export type CommandCenterSnapshot = {
  generatedAt: string;
  latestRun: { id: string; startedAt: string; finishedAt: string | null; passed: number; total: number } | null;
  checks: CommandCenterCheck[];
  providerHealth: Array<{ kind: string; provider: string | null; status: string; detail: string | null; checkedAt: string }>;
  restoreEvidence: RestoreEvidence[];
};

export const getCommandCenterSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CommandCenterSnapshot> => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", {
      _user: context.userId,
      _role: "admin",
    });
    if (roleError || !allowed) throw new Error("Forbidden — admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: runs, error: runError }, { data: health, error: healthError }] = await Promise.all([
      supabaseAdmin
        .from("smoke_runs")
        .select("id, started_at, finished_at, summary")
        .order("started_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("generation_health_state")
        .select("kind, provider, status, detail, checked_at")
        .order("checked_at", { ascending: false }),
    ]);
    if (runError) throw new Error(runError.message);
    if (healthError) throw new Error(healthError.message);

    const runIds = (runs ?? []).map((run) => run.id);
    const { data: checkRows, error: checkError } = runIds.length
      ? await supabaseAdmin
          .from("smoke_checks")
          .select("id, run_id, name, status, latency_ms, cost_usd, output_url, error, created_at")
          .in("run_id", runIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };
    if (checkError) throw new Error(checkError.message);

    const latestByName = new Map<string, CommandCenterCheck>();
    for (const row of checkRows ?? []) {
      if (latestByName.has(row.name)) continue;
      latestByName.set(row.name, {
        id: row.id,
        runId: row.run_id,
        name: row.name,
        status: row.status as CommandCenterCheck["status"],
        testedAt: row.created_at,
        latencyMs: row.latency_ms,
        costUsd: row.cost_usd == null ? null : Number(row.cost_usd),
        outputUrl: row.output_url,
        error: row.error,
      });
    }

    const latest = runs?.[0];
    const summary = latest?.summary && typeof latest.summary === "object" && !Array.isArray(latest.summary)
      ? latest.summary as Record<string, unknown>
      : {};

    return {
      generatedAt: new Date().toISOString(),
      latestRun: latest ? {
        id: latest.id,
        startedAt: latest.started_at,
        finishedAt: latest.finished_at,
        passed: typeof summary.passed === "number" ? summary.passed : 0,
        total: typeof summary.total === "number" ? summary.total : 0,
      } : null,
      checks: [...latestByName.values()],
      providerHealth: (health ?? []).map((row) => ({
        kind: row.kind,
        provider: row.provider,
        status: row.status,
        detail: row.detail,
        checkedAt: row.checked_at,
      })),
      restoreEvidence: ["Build", "Database", "Storage"].map((kind) => ({
        kind: kind as RestoreEvidence["kind"],
        status: "needs-test" as const,
        lastSuccessfulDrill: null,
        checkpoint: null,
        restorationResult: "No recorded restore drill" as const,
      })),
    };
  });
