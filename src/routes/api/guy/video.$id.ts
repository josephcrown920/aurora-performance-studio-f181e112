import { requireApiUser } from "@/lib/api-auth.server";
import { verifyJobId } from "@/lib/job-id-sign.server";
import { createFileRoute } from "@tanstack/react-router";
import { GATEWAY, apiKey, passthrough } from "@/lib/guy/gateway.server";
import { arkFetch, arkError } from "@/lib/guy/ark.server";

export const Route = createFileRoute("/api/guy/video/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const __auth = await requireApiUser(request);
        if (__auth instanceof Response) return __auth;
        const jobId = await verifyJobId(__auth.userId, params.id);
        if (!jobId) return Response.json({ error: { message: "Not found" } }, { status: 404 });
        if (jobId.startsWith("ark_")) {
          const r = await arkFetch(`/contents/generations/tasks/${encodeURIComponent(jobId.slice(4))}`);
          if (!r.ok) return arkError(r);
          const t = (await r.json()) as { status?: string; error?: { message?: string } };
          return Response.json({ status: t.status, error: t.error });
        }
        return passthrough(await fetch(`${GATEWAY}/v1/videos/${encodeURIComponent(jobId)}`, { headers: { Authorization: `Bearer ${apiKey()}` } }));
      },
    },
  },
});
