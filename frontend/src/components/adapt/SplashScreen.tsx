"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Full-screen splash that plays /public/logo-anim.mp4 once on mount, then fades out.
 *
 * Behaviour:
 * - Shows on every fresh page load (hard refresh, direct URL navigation).
 * - Hides as soon as the video ends, or after FALLBACK_MS if the video can't play
 *   (autoplay blocked, decode error, Safari power-save, etc.).
 * - Honors prefers-reduced-motion by skipping the splash entirely.
 * - Transparent passthrough once hidden so no layout cost.
 */
const FALLBACK_MS = 3000;

export default function SplashScreen() {
  const [phase, setPhase] = useState<"playing" | "fading" | "done">("playing");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Respect reduced motion.
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mql.matches) {
        setPhase("done");
        return;
      }
    }

    const fallback = window.setTimeout(() => setPhase("fading"), FALLBACK_MS);

    const v = videoRef.current;
    if (v) {
      const onEnded = () => setPhase("fading");
      const onErr = () => setPhase("fading");
      v.addEventListener("ended", onEnded);
      v.addEventListener("error", onErr);
      // Nudge play — some browsers need an explicit call after mount.
      v.play().catch(() => setPhase("fading"));
      return () => {
        window.clearTimeout(fallback);
        v.removeEventListener("ended", onEnded);
        v.removeEventListener("error", onErr);
      };
    }
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (phase !== "fading") return;
    const t = window.setTimeout(() => setPhase("done"), 450);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #0b0b0e)",
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 420ms cubic-bezier(.22,.61,.36,1)",
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      <video
        ref={videoRef}
        src="/logo-anim.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{
          width: "min(360px, 60vw)",
          height: "auto",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(255, 161, 22, 0.25), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      />
    </div>
  );
}
