"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api, ApiError } from '@/lib/api';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

/**
 * /auth/callback — Supabase OAuth return URL.
 *
 * The provider redirects here with the Supabase session in the URL hash.
 * supabase-js picks it up automatically (detectSessionInUrl: true), then we
 * hand the access_token to our FastAPI backend which verifies it against
 * the Supabase JWKS and issues the httpOnly adaptcode_session cookie that
 * the rest of the app uses.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [message, setMessage] = useState('Finishing sign-in…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = getSupabaseBrowser();
      if (!sb) {
        setMessage('OAuth is not configured for this environment.');
        setTimeout(() => router.replace('/login'), 1500);
        return;
      }
      // Give supabase-js a tick to parse the hash and persist the session.
      let session = (await sb.auth.getSession()).data.session;
      if (!session) {
        // Poll briefly — detectSessionInUrl can lag the first render.
        for (let i = 0; i < 10 && !session; i++) {
          await new Promise((r) => setTimeout(r, 150));
          session = (await sb.auth.getSession()).data.session;
        }
      }
      if (cancelled) return;
      if (!session) {
        toast.error('Sign-in was cancelled or failed.');
        router.replace('/login');
        return;
      }
      const providerName =
        (session.user?.app_metadata?.provider as string | undefined) === 'github'
          ? 'GitHub'
          : (session.user?.app_metadata?.provider as string | undefined) === 'google'
            ? 'Google'
            : 'your provider';
      try {
        await api.post('/api/auth/supabase-callback', { access_token: session.access_token });
        // Clear the Supabase browser session — we only needed it for the
        // round-trip. The server cookie is the source of truth from here on.
        await sb.auth.signOut({ scope: 'local' });
        await refresh();
        toast.success(`Signed in with ${providerName}`);
        router.replace('/');
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(typeof err.detail === 'string' ? err.detail : 'Could not finish sign-in');
        } else {
          toast.error('Could not reach the server');
        }
        router.replace('/login');
      }
    })();
    return () => { cancelled = true; };
  }, [refresh, router]);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 14,
      color: 'var(--tx-2)',
      fontSize: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ffb867, #ffa116)',
        animation: 'auth-pulse 1.2s ease-in-out infinite',
      }} />
      <span>{message}</span>
      <style>{`
        @keyframes auth-pulse {
          0%, 100% { transform: scale(1); opacity: .9; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
