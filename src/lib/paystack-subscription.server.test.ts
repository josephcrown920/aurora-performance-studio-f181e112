import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

// Unit tests for the three subscription event handlers extracted from the
// Paystack webhook route into the shared service module.  All DB calls are
// stubbed so the tests are fast, offline, and deterministic.
//
// Reminder for future contributors: subscription business logic belongs in
// paystack-webhook.server.ts, NOT in the route file.  The route must stay a
// thin dispatcher.  Tests here ensure each handler calls exactly the RPCs and
// table writes the business rules require.

type TableData = { data: unknown; error: { message: string } | null };
let tables: Record<string, TableData> = {};
let upsertResults: Record<string, TableData> = {};
let rpcResult: Record<string, { data: unknown; error: { message: string } | null }> = {};
const calls = {
  rpc: [] as Array<{ name: string; args: Record<string, unknown> }>,
  inserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
  updates: [] as Array<{ table: string; patch: Record<string, unknown> }>,
  upserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
};

function builder(table: string) {
  let op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  const resolve = () => {
    if (op === "insert") return upsertResults[table] ?? { data: null, error: null };
    if (op === "upsert") return upsertResults[table] ?? { data: null, error: null };
    if (op !== "select") return { data: null, error: null };
    return tables[table] ?? { data: null, error: null };
  };
  const b: Record<string, unknown> = {};
  for (const m of [
    "select", "eq", "neq", "order", "limit", "contains", "is", "in", "gte", "lte",
  ]) {
    b[m] = () => b;
  }
  b.insert = (row: Record<string, unknown>) => {
    op = "insert";
    calls.inserts.push({ table, row });
    return b;
  };
  b.upsert = (row: Record<string, unknown>, _opts?: unknown) => {
    op = "upsert";
    calls.upserts.push({ table, row });
    return b;
  };
  b.update = (patch: Record<string, unknown>) => {
    op = "update";
    calls.updates.push({ table, patch });
    return b;
  };
  b.delete = () => {
    op = "delete";
    return b;
  };
  b.maybeSingle = async () => resolve();
  b.single = async () => resolve();
  (b as { then: unknown }).then = (res: (v: unknown) => unknown) => res(resolve());
  return b;
}

const supabaseAdmin = {
  from: (t: string) => builder(t),
  rpc: async (name: string, args: Record<string, unknown>) => {
    calls.rpc.push({ name, args });
    return rpcResult[name] ?? { data: true, error: null };
  },
};

mock.module("@/integrations/supabase/client.server", () => ({ supabaseAdmin }));

const { processSubscriptionCreate, processSubscriptionRenewal, processSubscriptionDisable } =
  await import("./paystack-webhook.server");

beforeEach(() => {
  tables = {};
  upsertResults = {};
  rpcResult = {};
  calls.rpc.length = 0;
  calls.inserts.length = 0;
  calls.updates.length = 0;
  calls.upserts.length = 0;
});

// Subscription creation is metadata only; a successful charge must arrive first.
describe("processSubscriptionCreate", () => {
  it("records a pending subscription without granting Pro or Aura", async () => {
    tables.profiles = { data: { user_id: "u1" }, error: null };
    const result = await processSubscriptionCreate({
      subscription_code: "SUB_abc",
      customer: { email: "user@example.com" },
    });
    expect(result.status).toBe("success");
    expect(calls.rpc).toHaveLength(0);
    expect(calls.upserts[0]?.row.status).toBe("pending");
  });
});

describe("processSubscriptionRenewal", () => {
  it("grants on a confirmed charge and uses a stable charge-specific reference", async () => {
    tables.subscriptions = { data: { user_id: "u1" }, error: null };
    await processSubscriptionRenewal({ subscription_code: "SUB_abc", reference: "CHARGE_1" });
    const first = calls.rpc.find(c => c.name === "grant_monthly_aura")?.args._ref;
    calls.rpc.length = 0;
    await processSubscriptionRenewal({ subscription_code: "SUB_abc", reference: "CHARGE_1" });
    const second = calls.rpc.find(c => c.name === "grant_monthly_aura")?.args._ref;
    expect(first).toBe(second);
    calls.rpc.length = 0;
    await processSubscriptionRenewal({ subscription_code: "SUB_abc", reference: "CHARGE_2" });
    expect(calls.rpc.find(c => c.name === "grant_monthly_aura")?.args._ref).not.toBe(first);
  });

  it("refuses a subscription charge without a payment reference", async () => {
    await expect(processSubscriptionRenewal({ subscription_code: "SUB_abc" })).rejects.toThrow(/charge reference/);
    expect(calls.rpc).toHaveLength(0);
  });

  it("does not acknowledge failed Aura grants", async () => {
    tables.subscriptions = { data: { user_id: "u1" }, error: null };
    rpcResult.grant_monthly_aura = { data: null, error: { message: "grant failed" } };
    await expect(processSubscriptionRenewal({ subscription_code: "SUB_abc", reference: "CHARGE_1" })).rejects.toThrow("grant failed");
  });
});

// ── processSubscriptionDisable ────────────────────────────────────────────────

describe("processSubscriptionDisable", () => {
  it("keeps the paid Pro period and marks the row cancellation_pending", async () => {
    tables.subscriptions = {
      data: { user_id: "u1", next_payment_date: "2026-09-15T00:00:00Z" },
      error: null,
    };

    const result = await processSubscriptionDisable({ subscription_code: "SUB_abc" });
    expect(result).toMatchObject({ status: "success", userId: "u1", subscriptionCode: "SUB_abc" });

    const deactivate = calls.rpc.find((c) => c.name === "deactivate_pro_subscription");
    expect(deactivate).toBeUndefined();

    const upd = calls.updates.find((u) => u.table === "subscriptions");
    expect(upd?.patch).toMatchObject({ status: "cancellation_pending" });
  });

  it("returns ignored when subscription_code is absent", async () => {
    const result = await processSubscriptionDisable({});
    expect(result).toEqual({ status: "ignored" });
    expect(calls.rpc.length).toBe(0);
  });

  it("returns ignored when the subscriptions row cannot be found", async () => {
    tables.subscriptions = { data: null, error: null };
    const result = await processSubscriptionDisable({ subscription_code: "SUB_unknown" });
    expect(result).toEqual({ status: "ignored" });
    expect(calls.rpc.length).toBe(0);
  });
});

afterAll(() => {
  /* module mock is process-local to this test file */
});
