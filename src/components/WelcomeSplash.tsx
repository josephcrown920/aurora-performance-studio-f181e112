import { useEffect, useState } from "react";

/** Shown once per app launch (new tab / relaunch), then fades away. */
export const WELCOME_LINES = [
  "Some people never make it to their perfect destination.",
  "I'm glad you made it to Aurora.",
] as const;

/**
 * Runs in <head> before first paint: marks a repeat visit in this tab so CSS
 * hides the splash instantly, or records the first launch so it shows.
 */
export const WELCOME_BOOT_SCRIPT = `(function(){try{if(sessionStorage.getItem('aurora:welcomed'))document.documentElement.setAttribute('data-welcome','seen');else sessionStorage.setItem('aurora:welcomed','1');}catch(e){}})();`;

/**
 * Rendered in the server-sent page shell so it is visible on the very first
 * paint. CSS fades it out after ~3s even before the app finishes loading;
 * after load, a tap dismisses it early and it unmounts once faded.
 */
export function WelcomeSplash() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (document.documentElement.getAttribute("data-welcome") === "seen") {
      setGone(true);
      return;
    }
    const t = setTimeout(() => setGone(true), 4000);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div
      role="dialog"
      aria-label="Welcome"
      onClick={() => setGone(true)}
      className="welcome-splash fixed inset-0 z-[100] flex items-center justify-center px-8 text-center"
    >
      <div className="max-w-xl">
        <p className="welcome-l1">{WELCOME_LINES[0]}</p>
        <p className="welcome-l2">{WELCOME_LINES[1]}</p>
      </div>
    </div>
  );
}
