import type { SavedSession } from "./editor-state";

export function editorChatKey(owner: string, project: string) {
  return `aurora-editor-chat:${encodeURIComponent(owner)}:${encodeURIComponent(project)}`;
}

export function readEditorChat(storage: Pick<Storage, "getItem">, owner: string, project: string): SavedSession["messages"] | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(editorChatKey(owner, project)) ?? "null");
    if (!Array.isArray(value)) return null;
    return value.filter((entry): entry is SavedSession["messages"][number] =>
      Boolean(entry) && typeof entry === "object" &&
      (entry.role === "user" || entry.role === "assistant") && typeof entry.text === "string");
  } catch { return null; }
}