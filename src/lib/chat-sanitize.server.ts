// Clients may only speak as "user" or "assistant". Any other role (e.g. a
// client-supplied "system" message) is downgraded to "user" so callers can't
// override the server's instructions. Also caps size.
export function safeChatMessages<T extends { role?: unknown; content?: unknown }>(messages: T[] | undefined, max = 40): { role: "user" | "assistant"; content: T["content"] }[] {
  return (Array.isArray(messages) ? messages : []).slice(-max).map((m) => ({
    role: m?.role === "assistant" ? "assistant" : "user",
    content: typeof m?.content === "string" ? (m.content.slice(0, 40000) as T["content"]) : m?.content,
  }));
}
