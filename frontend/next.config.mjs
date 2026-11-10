/** @type {import('next').NextConfig} */

// Build the CSP `connect-src` list from the real backend URL + (in dev) the
// localhost HMR endpoints. Previously this was hard-coded to
// `'self' https://*.supabase.co`, which blocked every /api/* call from the
// browser the moment the backend lived on a different origin — i.e. always
// in both local dev (localhost:8000) and production (Cloud Run).
const API_ORIGIN = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_API_URL || '';
    if (!raw) return '';
    return new URL(raw).origin;
  } catch {
    return '';
  }
})();

const isDev = process.env.NODE_ENV !== 'production';

// Known prod backend origin — allow unconditionally so a mis-set or stale
// NEXT_PUBLIC_API_URL in Vercel doesn't CSP-block the real backend.
const PROD_BACKEND = 'https://adaptcode-backend-c4evyt3utq-as.a.run.app';

const connectSrc = [
  "'self'",
  'https://*.supabase.co',
  'wss://*.supabase.co',
  PROD_BACKEND,
  // Sentry browser ingest + session replay upload. Without these the
  // SDK boots but every event is CSP-blocked (silent data loss).
  'https://*.ingest.us.sentry.io',
  'https://*.ingest.sentry.io',
  ...(API_ORIGIN && API_ORIGIN !== PROD_BACKEND ? [API_ORIGIN] : []),
  // Dev-only: Next.js uses a WebSocket for HMR; add both host forms because
  // NEXT_PUBLIC_API_URL could be either.
  ...(isDev ? ['http://localhost:*', 'http://127.0.0.1:*', 'ws://localhost:*', 'ws://127.0.0.1:*'] : []),
].join(' ');

// Monaco loads its own loader + workers from jsdelivr at runtime. Without
// this it stays stuck at "Loading..." on every problem page because CSP
// blocks the loader.js fetch.
const MONACO_CDN = 'https://cdn.jsdelivr.net';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' ${MONACO_CDN}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `connect-src ${connectSrc} ${MONACO_CDN}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  `worker-src 'self' blob: ${MONACO_CDN}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          // NOTE: 'unsafe-inline' + 'unsafe-eval' are required by Next.js
          // hydration bootstrap and Monaco Editor workers. Nonce-based CSP
          // via middleware is the proper long-term fix (TODO).
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ];
  },
};

// Sentry wrapper is a no-op when SENTRY_* envs are absent, so this stays
// safe for local dev and for previews that don't have the DSN wired up.
let exportedConfig = nextConfig;
if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = await import('@sentry/nextjs');
    exportedConfig = withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    });
  } catch {
    // Sentry not installed yet — keep the base config.
  }
}

export default exportedConfig;
