import { supabase } from "@/integrations/supabase/client";

// Attaches the signed-in user's bearer token to same-origin /api/* requests
// (except /api/public/*) so protected server routes can verify the caller.
let installed = false;
export function installApiFetchAuth() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(raw, window.location.origin);
      if (url.origin === window.location.origin && url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/public/")) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has("authorization")) {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          if (token) {
            headers.set("authorization", `Bearer ${token}`);
            if (input instanceof Request && !init) return original(new Request(input, { headers }));
            return original(input, { ...init, headers });
          }
        }
      }
    } catch { /* fall through */ }
    return original(input, init);
  };
}
