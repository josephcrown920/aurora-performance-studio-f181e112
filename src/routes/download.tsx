import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Smartphone, ShieldCheck, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Latest signed Android APK from EAS (preview profile). Update after each new build. */
export const ANDROID_APK_URL = "https://expo.dev/artifacts/eas/_Ksd9WAnkceFfgItWpzXvDPsmYFgwpxA3xDliMwF9L0.apk";
export const ANDROID_APK_VERSION = "1.0.0 (build 4)";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Aurora for Android & install the web app" },
      { name: "description", content: "Install Aurora directly on Android with the APK, or add it to your home screen in one tap." },
      { property: "og:title", content: "Download Aurora for Android" },
      { property: "og:description", content: "Get the Aurora app straight to your phone — no store wait." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  const promptRef = useRef<(Event & { prompt: () => Promise<void> }) | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); promptRef.current = e as Event & { prompt: () => Promise<void> }; setCanInstall(true); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-xl space-y-6">
        <Link to="/" className="text-sm font-semibold text-muted-foreground">← Aurora</Link>
        <h1 className="text-3xl font-bold">Get Aurora on your phone</h1>

        <section className="rounded-2xl border border-primary/40 bg-card p-5">
          <div className="mb-3 flex items-center gap-2"><Smartphone className="size-5 text-primary" /><h2 className="text-lg font-bold">Android app</h2></div>
          <Button asChild size="lg" className="w-full"><a href={ANDROID_APK_URL} download><Download />Download for Android</a></Button>
          <p className="mt-2 text-xs text-muted-foreground">Version {ANDROID_APK_VERSION}</p>
          <ol className="mt-4 space-y-2 text-sm">
            <li><b>1.</b> Tap the download, then open the file when it finishes.</li>
            <li><b>2.</b> If your phone asks, tap <b>Settings → Allow from this source</b>, go back, and tap <b>Install</b>.</li>
          </ol>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />Signed by Aurora. Only download it from this page.</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 text-lg font-bold">Or install the web app</h2>
          {canInstall ? (
            <Button variant="outline" className="w-full" onClick={async () => { await promptRef.current?.prompt(); setCanInstall(false); }}><Download />Install app</Button>
          ) : (
            <p className="flex items-start gap-2 text-sm text-muted-foreground"><Share className="mt-0.5 size-4 shrink-0" />iPhone: tap Share, then <b>Add to Home Screen</b>. Android Chrome: open the ⋮ menu, then <b>Install app</b>.</p>
          )}
        </section>
      </div>
    </main>
  );
}
