/** Greetings and short chit-chat belong in chat, never in a paid generation. */
export function isChatOnly(text: string) {
  const t = text.trim().toLowerCase().replace(/[!?.,\s]+$/g, "");
  if (/^(hi+|hey+|hello+|yo+|sup|wassup|what'?s up|hiya|howdy|good (morning|afternoon|evening)|thanks?|thank you|ok(ay)?|test(ing)?|help|how are you)( aurora)?$/.test(t)) return true;
  return t.split(/\s+/).length < 2 && t.length < 5;
}
