"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getSupabaseBrowser, SUPABASE_BROWSER_ENABLED } from '@/lib/supabase';

/**
 * /auth/reset — landing for the Supabase password-reset email.
 *
 * Supabase sends the user here with a `?code=` (PKCE) or a token in the URL
 * hash. supabase-js auto-detects the session, which gives us a brief
 * authenticated window to call `updateUser({ password })`. After the update
 * we sign the Supabase browser session out again — the server session cookie
 * is the source of truth once the user logs in normally.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!SUPABASE_BROWSER_ENABLED) {
        setErr('Password reset is not configured for this environment.');
        setReady(true);
        return;
      }
      const sb = getSupabaseBrowser();
      if (!sb) {
        setErr('Password reset is not available.');
        setReady(true);
        return;
      }
      // Give supabase-js a tick to parse the hash / code.
      let session = (await sb.auth.getSession()).data.session;
      for (let i = 0; i < 10 && !session; i++) {
        await new Promise((r) => setTimeout(r, 150));
        session = (await sb.auth.getSession()).data.session;
      }
      if (cancelled) return;
      if (!session) {
        setErr('This reset link has expired or already been used. Request a new one from the sign-in page.');
      }
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="auth-pg">
      <header className="auth-top">
        <Link className="auth-brand" href="/">
          <img src="/logo.webp" alt="" className="brand-mark" width={28} height={28} />
          <span>AdaptCode</span>
        </Link>
      </header>

      <main className="auth-main" style={{ gridTemplateColumns: '1fr', maxWidth: 480 }}>
        <section className="auth-card">
          <h2>Set a new password</h2>
          <p className="auth-sub">
            Pick something you&apos;ll remember. Minimum eight characters.
          </p>

          {!ready && (
            <p style={{ color: 'var(--tx-2)', fontSize: 13 }}>Checking your reset link…</p>
          )}
          {ready && err && (
            <>
              <p style={{ color: 'var(--hard)', fontSize: 13, marginBottom: 12 }}>{err}</p>
              <Link href="/login" className="btn btn-primary auth-submit" style={{ textAlign: 'center' }}>
                Back to sign-in
              </Link>
            </>
          )}
          {ready && !err && (
            <form
              className="auth-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (busy) return;
                const fd = new FormData(e.currentTarget);
                const password = String(fd.get('password') || '');
                const confirm = String(fd.get('confirm') || '');
                if (password !== confirm) {
                  toast.error('Passwords don\'t match.');
                  return;
                }
                if (password.length < 8) {
                  toast.error('Use at least eight characters.');
                  return;
                }
                const sb = getSupabaseBrowser();
                if (!sb) return;
                setBusy(true);
                const { error } = await sb.auth.updateUser({ password });
                if (error) {
                  toast.error(error.message);
                  setBusy(false);
                  return;
                }
                // Clear the browser session — user will sign in normally with the new password.
                await sb.auth.signOut({ scope: 'local' });
                toast.success('Password updated — sign in now.');
                router.replace('/login');
              }}
            >
              <div className="l-field">
                <label>New password</label>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className="l-field">
                <label>Confirm password</label>
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                {busy ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
