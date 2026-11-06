import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { isAllowedKieModel } from "@/lib/kie-models";

const KIE = "https://api.kie.ai/api/v1";
const UPLOAD = "https://kieai.redpandaai.co/api/file-base64-upload";

type Body =
  | { kind: "upload"; dataUrl: string; fileName?: string }
  | { kind: "create"; model: string; input: Record<string, unknown> }
  | { kind: "status"; taskId: string };

const fail = (message: string, status = 400) => Response.json({ error: { message } }, { status });

async function signedIn(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return false;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  return !error && Boolean(data.user);
}

// Kie.ai proxy: keeps the key server-side and only allows the approved cheap models.
export const Route = createFileRoute("/api/kie")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["KIE_API_KEY"]?.trim();
        if (!key) return fail("Kie.ai is not connected yet.", 503);
        if (!(await signedIn(request))) return fail("Sign in to generate.", 401);
        const b = (await request.json().catch(() => ({}))) as Body;
        const auth = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

        if (b.kind === "upload") {
          if (!b.dataUrl?.startsWith("data:")) return fail("Missing file");
          const r = await fetch(UPLOAD, { method: "POST", headers: auth, body: JSON.stringify({ base64Data: b.dataUrl, uploadPath: "aurora", fileName: b.fileName || `upload-${Date.now()}` }) });
          const j = (await r.json().catch(() => ({}))) as { data?: { downloadUrl?: string }; msg?: string };
          if (!r.ok || !j.data?.downloadUrl) return fail(j.msg || "Upload failed", 502);
          return Response.json({ url: j.data.downloadUrl });
        }

        if (b.kind === "create") {
          if (!isAllowedKieModel(b.model)) return fail("That model is not enabled.");
          const r = await fetch(`${KIE}/jobs/createTask`, { method: "POST", headers: auth, body: JSON.stringify({ model: b.model, input: b.input }) });
          const j = (await r.json().catch(() => ({}))) as { code?: number; msg?: string; data?: { taskId?: string } };
          if (j.code !== 200 || !j.data?.taskId) return fail(j.msg || "Kie rejected the request", 502);
          return Response.json({ taskId: j.data.taskId });
        }

        if (b.kind === "status") {
          if (!/^[\w-]+$/.test(b.taskId ?? "")) return fail("Bad task");
          const r = await fetch(`${KIE}/jobs/recordInfo?taskId=${b.taskId}`, { headers: auth });
          const j = (await r.json().catch(() => ({}))) as { data?: { state?: string; resultJson?: string; failMsg?: string } };
          const state = j.data?.state ?? "waiting";
          let urls: string[] = [];
          try { urls = (JSON.parse(j.data?.resultJson || "{}") as { resultUrls?: string[] }).resultUrls ?? []; } catch { /* not ready */ }
          return Response.json({ state, urls, error: j.data?.failMsg || undefined });
        }
        return fail("Unknown request");
      },
    },
  },
});
