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

const connectSrc = [
  "'self'",
  'https://*.supabase.co',
  'wss://*.supabase.co',
  ...(API_ORIGIN ? [API_ORIGIN] : []),
  // Dev-only: Next.js uses a WebSocket for HMR; add both host forms because
  // NEXT_PUBLIC_API_URL could be either.
  ...(isDev ? ['http://localhost:*', 'http://127.0.0.1:*', 'ws://localhost:*', 'ws://127.0.0.1:*'] : []),
].join(' ');

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `connect-src ${connectSrc}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "worker-src 'self' blob:",
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

export default nextConfig;
