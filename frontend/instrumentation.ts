// Next 14 entry point for server + edge runtimes. Called once per cold start.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Capture errors from React Server Components (Next 15+ API, safe to leave).
export const onRequestError =
  process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
    ? async (...args: unknown[]) => {
        const Sentry = await import('@sentry/nextjs');
        // @ts-expect-error - signature set by Next runtime
        return Sentry.captureRequestError(...args);
      }
    : undefined;
