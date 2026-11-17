"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";

/**
 * Full-screen intro: the logo draws itself, then the page is revealed.
 *
 * - Plays once per browser session. The inline script in app/layout.tsx sets
 *   `data-intro="seen"` on <html> before paint when the session has already
 *   seen it, and CSS hides the splash in that case (no flash on navigation).
 * - Skipped entirely under prefers-reduced-motion (handled in CSS).
 * - Pure SVG + CSS, so there is no video to download or fail to autoplay.
 */
const INTRO_MS = 2750;
const KEY = "adaptcode.intro.v2";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"playing" | "done" | "gone">("playing");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch { /* storage unavailable: just play it */ }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }
    const a = window.setTimeout(() => setPhase("done"), INTRO_MS);
    const b = window.setTimeout(() => setPhase("gone"), INTRO_MS + 700);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div aria-hidden className={`ac-splash ${phase === "done" ? "is-done" : ""}`}>
      <Logo size={96} animate />
    </div>
  );
}
