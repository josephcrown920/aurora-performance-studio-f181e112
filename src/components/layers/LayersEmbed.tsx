const EMBED_SRC = "https://build-it-magic-49.lovable.app/embed";

export function LayersEmbed() {
  return (
    <div className="flex h-full w-full flex-col bg-background">
      <iframe
        src={EMBED_SRC}
        title="Aurora Layers (embedded app)"
        className="h-full w-full flex-1 border-0"
        allow="clipboard-write; camera; microphone"
      />
    </div>
  );
}
