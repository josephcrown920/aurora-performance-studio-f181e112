import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/** App-wide back button: shown on every page except home. Falls back to home when there's no history. */
export function BackButton() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else void router.navigate({ to: "/" });
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      title="Go back"
      className="fixed left-3 top-[72px] z-[9999] flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur transition hover:bg-accent"
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}
