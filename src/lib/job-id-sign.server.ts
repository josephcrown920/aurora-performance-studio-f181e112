// Binds an upstream job id to the user who created it, so another user can't
// poll or download it by guessing/obtaining the id.
async function hmac(data: string): Promise<string> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.LOVABLE_API_KEY || "";
  if (!secret) throw new Error("Server signing key missing");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  return Array.from(sig.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}
export async function signJobId(userId: string, id: string): Promise<string> {
  return `${id}~${await hmac(`${userId}:${id}`)}`;
}
export async function verifyJobId(userId: string, signed: string): Promise<string | null> {
  const i = signed.lastIndexOf("~");
  if (i <= 0) return null;
  const id = signed.slice(0, i);
  return (await hmac(`${userId}:${id}`)) === signed.slice(i + 1) ? id : null;
}
/** Rewrites a JSON response's `id` field to a user-bound signed id. */
export async function signJobResponse(userId: string, res: Response): Promise<Response> {
  if (!res.ok) return res;
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!data || typeof data.id !== "string") return Response.json(data ?? {}, { status: res.status });
  return Response.json({ ...data, id: await signJobId(userId, data.id) }, { status: res.status });
}
