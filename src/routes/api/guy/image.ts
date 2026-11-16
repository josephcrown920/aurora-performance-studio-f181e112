import { requireApiUser } from "@/lib/api-auth.server";
import { createFileRoute } from "@tanstack/react-router";
import { GATEWAY, IMAGE_MODEL, apiKey, passthrough, shouldFallback, openRouterImage } from "@/lib/guy/gateway.server";
import { IMAGE_ENGINES } from "@/lib/guy/engines";
import { arkFetch, arkError } from "@/lib/guy/ark.server";
import { IDENTITY_HEADER, assertIdentityRequest, decodeIdentity, identityPrompt } from "@/lib/identity/contract";

async function arkImage(model: string, prompt: string, image?: string | string[]) {
  const r = await arkFetch("/images/generations", { method: "POST", body: JSON.stringify({ model, prompt, size: "2K", response_format: "b64_json", watermark: false, ...(image ? { image } : {}) }) });
  if (!r.ok) return arkError(r);
  return passthrough(r);
}

function resolve(engine?: string) {
  const e = IMAGE_ENGINES.find((x) => x.id === engine);
  if (!e) return { model: IMAGE_MODEL };
  if (!e.available || !e.model) return { error: `${e.name} is not available on this workspace yet. Pick another image engine.` };
  return { model: e.model, ark: e.provider === "ark" };
}

// JSON {prompt, engine} = generate; multipart (prompt + image + engine) = edit by prompt
export const Route = createFileRoute("/api/guy/image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const __auth = await requireApiUser(request);
        if (__auth instanceof Response) return __auth;
        const type = request.headers.get("content-type") ?? "";
        if (type.includes("multipart")) {
          const form = await request.formData();
          if (!String(form.get("prompt") ?? "").trim()) return Response.json({ error: { message: "Prompt required" } }, { status: 400 });
          const engineId = String(form.get("engine") ?? "");
          const r = resolve(engineId);
          if (r.error || !r.model) return Response.json({ error: { message: r.error ?? "Image model unavailable" } }, { status: 400 });
          const identity = decodeIdentity(String(form.get("identity") ?? "")) ?? decodeIdentity(request.headers.get(IDENTITY_HEADER));
          form.delete("identity");
          if (identity) {
            const refCount = [...form.getAll("image"), ...form.getAll("image[]")].filter((f) => f instanceof File && f.size > 0).length;
            try { assertIdentityRequest(identity, "image", engineId, refCount); }
            catch (e) { return Response.json({ error: { message: (e as Error).message } }, { status: 400 }); }
            form.set("prompt", `${String(form.get("prompt"))}\n\n${identityPrompt(identity)}`);
          }
          if (r.ark) {
            const files = [...form.getAll("image"), ...form.getAll("image[]")].filter((file): file is File => file instanceof File);
            const urls = await Promise.all(files.map(async (file) => {
              const buf = new Uint8Array(await file.arrayBuffer());
              let bin = "";
              for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
              return `data:${file.type || "image/png"};base64,${btoa(bin)}`;
            }));
            return arkImage(r.model, String(form.get("prompt") ?? ""), urls.length > 1 ? urls : urls[0]);
          }
          const key = apiKey();
          const prompt = String(form.get("prompt") ?? "");
          const files = [...form.getAll("image"), ...form.getAll("image[]")].filter((file): file is File => file instanceof File);
          form.set("model", r.model);
          form.delete("engine");
          form.delete("stream");
          const up = await fetch(`${GATEWAY}/v1/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
          if (shouldFallback(up.status)) {
            const urls = await Promise.all(files.map(async (file) => {
              const buf = new Uint8Array(await file.arrayBuffer());
              let bin = "";
              for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
              return `data:${file.type || "image/png"};base64,${btoa(bin)}`;
            }));
            const fb = await openRouterImage(prompt, urls);
            if (fb) return fb;
          }
          return passthrough(up);
        }
        const { prompt, engine } = (await request.json()) as { prompt?: string; engine?: string };
        if (!prompt?.trim()) return new Response("Prompt required", { status: 400 });
        const jsonIdentity = decodeIdentity(request.headers.get(IDENTITY_HEADER));
        if (jsonIdentity?.identityRequired || jsonIdentity?.faceSwapMode) return Response.json({ error: { message: "Add a reference photo of the person first — we won't generate a different person." } }, { status: 400 });
        const r = resolve(engine);
        if (r.error || !r.model) return Response.json({ error: { message: r.error ?? "Image model unavailable" } }, { status: 400 });
        if (r.ark) return arkImage(r.model, prompt);
        const key = apiKey();
        const up = await fetch(`${GATEWAY}/v1/images/generations`, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: r.model, prompt, size: "1536x1024" }),
        });
        if (shouldFallback(up.status)) {
          const fb = await openRouterImage(prompt);
          if (fb) return fb;
        }
        return passthrough(up);
      },
    },
  },
});
