import { useEffect, useState } from "react";

/** Shown once per app launch (new tab / relaunch), then fades away. */
export const WELCOME_LINES = [
  "Some people never make it to their perfect destination.",
  "I'm glad you made it to Aurora.",
] as const;

export function WelcomeSplash() {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");
  useEffect(() => {
    if (sessionStorage.getItem("aurora:welcomed")) return;
    sessionStorage.setItem("aurora:welcomed", "1");
    setPhase("show");
    const a = setTimeout(() => setPhase("fade"), 3200);
    const b = setTimeout(() => setPhase("hidden"), 3900);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (phase === "hidden") return null;
  return (
    <div
      role="dialog"
      aria-label="Welcome"
      onClick={() => setPhase("hidden")}
      className="welcome-splash fixed inset-0 z-[100] flex items-center justify-center px-8 text-center"
      style={{ opacity: phase === "fade" ? 0 : 1 }}
    >
      <div className="max-w-xl">
        <p className="welcome-l1">{WELCOME_LINES[0]}</p>
        <p className="welcome-l2">{WELCOME_LINES[1]}</p>
      </div>
    </div>
  );
}
