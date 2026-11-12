"use client";
import { useCallback, useEffect, useRef } from 'react';

// Public site key, baked at build time by Next.js. When unset, the component
// renders nothing and `TURNSTILE_ENABLED` is false — code path matches the
// backend's flag-off behaviour (no verification required).
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
export const TURNSTILE_ENABLED = !!SITE_KEY;

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    __turnstileLoading?: Promise<void>;
  }
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileLoading) return window.__turnstileLoading;
  window.__turnstileLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('turnstile load')), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = '1';
    s.addEventListener('load', () => resolve(), { once: true });
    s.addEventListener('error', () => reject(new Error('turnstile load')), { once: true });
    document.head.appendChild(s);
  });
  return window.__turnstileLoading;
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Hold the callback in a ref so re-renders don't retrigger the script load /
  // widget render cycle (the CF widget doesn't like being re-rendered).
  const cbRef = useRef(onToken);
  useEffect(() => { cbRef.current = onToken; }, [onToken]);

  useEffect(() => {
    if (!TURNSTILE_ENABLED || !hostRef.current) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(hostRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => cbRef.current(token),
          'expired-callback': () => cbRef.current(''),
          'error-callback': () => cbRef.current(''),
          theme: 'auto',
          appearance: 'always',
        });
      })
      .catch(() => { /* script failed — treat as token='' so backend rejects */ });

    return () => {
      cancelled = true;
      if (widgetId.current && typeof window !== 'undefined' && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* ignore */ }
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (widgetId.current && window.turnstile) {
      try { window.turnstile.reset(widgetId.current); } catch { /* ignore */ }
    }
  }, []);

  // Expose reset on the DOM node so the form can call it after a failed submit
  // without React refs ceremony.
  useEffect(() => {
    if (!hostRef.current) return;
    (hostRef.current as HTMLElement & { resetTurnstile?: () => void }).resetTurnstile = reset;
  }, [reset]);

  if (!TURNSTILE_ENABLED) return null;
  return <div ref={hostRef} style={{ marginBottom: 12, minHeight: 65 }} />;
}
