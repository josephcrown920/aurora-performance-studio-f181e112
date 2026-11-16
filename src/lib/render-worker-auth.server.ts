// Shared-secret check for the render-worker fleet endpoints. When the secret
// is not configured the endpoints are disabled rather than left open.
export function verifyRenderWorker(request: Request, headers: Record<string, string>): Response | null {
  const expected = process.env.RENDER_WORKER_TOKEN?.trim();
  if (!expected) return Response.json({ error: "Worker endpoints disabled" }, { status: 503, headers });
  const got = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (got.length !== expected.length) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? null : Response.json({ error: "Unauthorized" }, { status: 401, headers });
}
