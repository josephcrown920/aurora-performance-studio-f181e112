import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function authenticatedUserId(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : (data.user?.id ?? null);
}

/** Returns a 401 Response when the request has no valid signed-in user. */
export async function requireApiUser(request: Request): Promise<{ userId: string } | Response> {
  const userId = await authenticatedUserId(request);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return { userId };
}
