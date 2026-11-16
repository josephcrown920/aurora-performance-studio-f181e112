// Blocks server-side requests to non-public destinations (SSRF guard) for
// user-supplied URLs such as webhooks.
export function isPublicHttpsUrl(raw: string): boolean {
  let u: URL;
  try { u = new URL(raw); } catch { return false; }
  if (u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  if (u.port && u.port !== "443") return false;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!h.includes(".") || h === "localhost" || /\.(localhost|local|internal|lan|home|corp|intranet)$/.test(h)) return false;
  if (h === "metadata.google.internal") return false;
  // IPv4 literals
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
  }
  // Any IPv6 literal or numeric-looking host is rejected outright.
  if (h.includes(":") || /^[0-9.x]+$/.test(h)) return !!v4 && true;
  return true;
}
export function assertPublicHttpsUrl(raw: string): void {
  if (!isPublicHttpsUrl(raw)) throw new Error("Webhook URL must be a public https:// address.");
}
