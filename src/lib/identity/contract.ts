/**
 * Shared identity-preservation contract used by every Aurora generation surface
 * (Studio, Layers, Face swap, Perform Anywhere, TikTok30, Canvas, Soul).
 * Browser-safe: no server imports.
 */
export const EXPRESSION_MODES = ["preserve", "follow-prompt", "neutral", "happy", "sad", "angry", "surprised", "serious", "custom"] as const;
export type ExpressionMode = (typeof EXPRESSION_MODES)[number];

export type IdentitySettings = {
  identityRequired: boolean;
  /** Count of identity references attached as real provider image inputs. */
  identityReferenceCount?: number;
  identityReferenceId?: string;
  expressionMode?: ExpressionMode;
  customExpression?: string;
  identityStrength?: number;
  faceSwapMode?: boolean;
  preserveFacialStructure?: boolean;
  preserveSkinTone?: boolean;
  preserveDistinctiveFeatures?: boolean;
  referencePriority?: "identity-first" | "composition-first";
};

export const IDENTITY_HEADER = "x-aurora-identity";

/** Image engines verified to consume attached reference images as real inputs. */
export const IDENTITY_IMAGE_ENGINES = new Set(["seedream5pro", "seedream5", "seedream45", "sunburst", "flare", "gemini3pro", "gemini31", "qwenimage"]);
/** Video engines verified to consume reference images/videos (ModelArk Seedance 2.x omni reference). */
export const IDENTITY_VIDEO_ENGINES = new Set(["seedance25", "seedance2", "seedance2fast"]);

export class IdentityError extends Error {
  constructor(message: string) { super(message); this.name = "IdentityError"; }
}

const EXPRESSION_TEXT: Record<Exclude<ExpressionMode, "custom" | "follow-prompt" | "preserve">, string> = {
  neutral: "a relaxed neutral expression", happy: "a natural happy smile", sad: "a subtle sad expression",
  angry: "an angry, tense expression", surprised: "a surprised expression with raised brows", serious: "a serious, focused expression",
};

export function expressionInstruction(mode: ExpressionMode = "follow-prompt", custom?: string): string {
  if (mode === "preserve") return "Keep the exact facial expression from the reference.";
  if (mode === "follow-prompt") return "Use the expression described in the prompt; if none, keep the reference expression.";
  if (mode === "custom") return custom?.trim() ? `Expression: ${custom.trim()}.` : "Keep the exact facial expression from the reference.";
  return `Change only the expression to ${EXPRESSION_TEXT[mode]}; the eyes, nose, lips, jawline and face shape stay identical.`;
}

/** Build the identity lock text appended to the user's prompt. */
export function identityPrompt(s: IdentitySettings): string {
  if (!s.identityRequired && !s.faceSwapMode) return "";
  const keep = [
    s.preserveFacialStructure !== false && "face shape, jawline, cheekbones, forehead, eye shape and spacing, eyebrows, nose, lips, ears",
    s.preserveSkinTone !== false && "exact skin tone",
    s.preserveDistinctiveFeatures !== false && "freckles, marks, scars, tattoos, facial hair, hairline and age",
  ].filter(Boolean).join("; ");
  const role = s.faceSwapMode
    ? "FACE SWAP. Image 1 is the TARGET: keep its pose, head angle, body, clothing, background, framing, lighting and shadows. Image 2 is the SOURCE IDENTITY: transfer only that person's face onto the target. Blend skin tone and lighting seamlessly with no visible seams."
    : "IDENTITY LOCK: the person in the reference image(s) must remain the same recognizable person, not a look-alike.";
  return `${role} Preserve ${keep}. Do not beautify, smooth, stylize, de-age or redesign the face. Clothing, pose, lighting or setting changes must not alter identity. ${expressionInstruction(s.expressionMode, s.customExpression)}`;
}

/** Validate an identity request before anything is sent to a provider. Throws IdentityError. */
export function assertIdentityRequest(s: IdentitySettings, kind: "image" | "video", engine: string, referenceCount: number): void {
  if (!s.identityRequired && !s.faceSwapMode) return;
  const need = s.faceSwapMode && kind === "image" ? 2 : 1;
  if (referenceCount < need) throw new IdentityError(s.faceSwapMode ? "Face swap needs both the target and the face photo." : "Add a reference photo of the person first — we won't generate a different person.");
  const ok = kind === "image" ? IDENTITY_IMAGE_ENGINES : IDENTITY_VIDEO_ENGINES;
  if (!ok.has(engine)) throw new IdentityError(`This model can't keep a person's face from a reference. Pick one of: ${[...ok].join(", ")}.`);
}

export function encodeIdentity(s: IdentitySettings): string { return JSON.stringify(s); }
export function decodeIdentity(raw: string | null | undefined): IdentitySettings | undefined {
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw) as IdentitySettings;
    if (v.expressionMode && !EXPRESSION_MODES.includes(v.expressionMode)) v.expressionMode = "follow-prompt";
    return typeof v === "object" && v ? v : undefined;
  } catch { return undefined; }
}
