import { isAllowedKieModel } from "./kie-models";

const KIE = "https://api.kie.ai/api/v1";

/**
 * Server-side Kie.ai task runner shared by Perform Anywhere motion and the
 * Lip Sync page. Only allowlisted cheap models can be called (never Seedance).
 */
export async function runKieTask(
  model: string,
  input: Record<string, unknown>,
  timeoutMs = 10 * 60_000,
): Promise<string> {
  if (!isAllowedKieModel(model)) throw new Error("That Kie model is not enabled");
  const key = process.env.KIE_API_KEY?.trim();
  if (!key) throw new Error("Kie.ai is not connected");
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const r = await fetch(`${KIE}/jobs/createTask`, { method: "POST", headers, body: JSON.stringify({ model, input }) });
  const j = (await r.json().catch(() => ({}))) as { code?: number; msg?: string; data?: { taskId?: string } };
  if (j.code !== 200 || !j.data?.taskId) throw new Error(j.msg || "Kie rejected the request");
  const taskId = j.data.taskId;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((res) => setTimeout(res, 5000));
    const s = await fetch(`${KIE}/jobs/recordInfo?taskId=${taskId}`, { headers });
    const d = ((await s.json().catch(() => ({}))) as { data?: { state?: string; resultJson?: string; failMsg?: string } }).data;
    if (d?.state === "fail") throw new Error(d.failMsg || "Kie generation failed");
    if (d?.state === "success") {
      let urls: string[] = [];
      try { urls = (JSON.parse(d.resultJson || "{}") as { resultUrls?: string[] }).resultUrls ?? []; } catch { /* empty */ }
      if (urls[0]) return urls[0];
      throw new Error("Kie returned no file");
    }
  }
  throw new Error("Kie generation timed out");
}
