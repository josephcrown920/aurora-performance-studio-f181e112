// Transient handoff from Genjutsu screens into the shared GuyStudio editor.
// One pending video per tab; the editor consumes it once on open.
const KEY = "aurora:editor-handoff";

export type EditorHandoff = { url: string; kind: "video" | "image"; name: string };

export function putEditorHandoff(item: EditorHandoff, store: Pick<Storage, "setItem"> = sessionStorage) {
  store.setItem(KEY, JSON.stringify(item));
}

export function takeEditorHandoff(store: Pick<Storage, "getItem" | "removeItem"> = sessionStorage): EditorHandoff | null {
  const raw = store.getItem(KEY);
  if (!raw) return null;
  store.removeItem(KEY);
  try {
    const v = JSON.parse(raw) as Partial<EditorHandoff>;
    if (typeof v.url !== "string" || !/^(https?:|blob:)/.test(v.url)) return null;
    return { url: v.url, kind: v.kind === "image" ? "image" : "video", name: typeof v.name === "string" && v.name ? v.name : "genjutsu.mp4" };
  } catch { return null; }
}
