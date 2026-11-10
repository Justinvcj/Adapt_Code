"use client";
/**
 * Root error boundary — catches unhandled errors on any page under app/.
 * Next.js App Router wraps every route in this boundary; without it a crash
 * turns into the default Next grey error screen which leaks the stack trace.
 */
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Best-effort client log — swap for Sentry once that's wired.
    // eslint-disable-next-line no-console
    console.error('[app error]', error);
  }, [error]);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      padding: '24px',
      textAlign: 'center',
      color: 'var(--tx)',
    }}>
      <div style={{
        fontSize: 56,
        fontWeight: 700,
        lineHeight: 1,
        background: 'linear-gradient(135deg, #ff8a8a, #ff5757)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>Something broke</div>
      <p style={{ color: 'var(--tx-2)', fontSize: 14, maxWidth: 480, lineHeight: 1.55 }}>
        We hit an unexpected error rendering this page. Nothing was lost — your progress is stored server-side.
      </p>
      {error.digest && (
        <code style={{ fontSize: 11, color: 'var(--tx-2)', opacity: 0.6 }}>
          ref: {error.digest}
        </code>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
        <Link href="/" className="btn btn-ghost">Home</Link>
      </div>
    </main>
  );
}
