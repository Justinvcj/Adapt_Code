"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import { GithubIcon } from '@/components/adapt/icons';
import { useAuth } from '@/lib/auth-context';
import { ApiError, ApiOffline, API_ENABLED } from '@/lib/api';
import { getSupabaseBrowser, SUPABASE_BROWSER_ENABLED } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

// Next.js App Router requires useSearchParams() to be inside a Suspense boundary
// at prerender time, otherwise the whole page bails out of static generation
// and the Vercel build fails with "prerender-error".
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = (() => {
    const n = search?.get('next') || '';
    // Only allow in-app relative paths (never an external redirect).
    return n.startsWith('/') && !n.startsWith('//') ? n : '/';
  })();
  const { status, login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [busy, setBusy] = useState(false);
  // When Supabase has "Confirm email" enabled, register() succeeds but the
  // follow-up login 401s because the email isn't verified yet. We can't tell
  // the two cases apart from here, so we gate the home redirect on the auth
  // context's status and show a "check your inbox" screen otherwise.
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const done = (msg: string) => { toast.success(msg); router.push(nextPath); };

  const copy = mode === 'signin'
    ? { h: 'Welcome back', sub: 'Pick up where you left off.' }
    : { h: 'Start learning', sub: 'Twelve concepts, prerequisite-gated. Free forever.' };

  return (
    <div className="auth-pg">
      {/* minimal top strip — no learning nav for signed-out visitors */}
      <header className="auth-top">
        <Link className="auth-brand" href="/">
          <img src="/logo.webp" alt="" className="brand-mark" width={28} height={28} />
          <span>AdaptCode</span>
        </Link>
        <button
          className="auth-top-switch"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Already a member? Sign in'}
        </button>
      </header>

      <main className="auth-main">
        <aside className="auth-pitch">
          <div className="auth-pitch-hero">
            <video
              className="auth-pitch-video"
              src="/logo-anim.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          </div>
          <h1>Learn by solving. Earn by practising.</h1>
          <p>Twelve programming concepts, each one gated by what came before. Progress is a ring that fills; a concept isn&apos;t unlocked until the previous one is understood.</p>
          <ul className="auth-pitch-list">
            <li><span className="pitch-dot" /> Adaptive problem selection, powered by your mastery vector</li>
            <li><span className="pitch-dot" /> Three-tier hints that cost mastery, not pride</li>
            <li><span className="pitch-dot" /> A map of every concept and what unlocks what</li>
          </ul>
          <p className="auth-pitch-fine">Built for learning, not grinding.</p>
        </aside>

        <section className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'signin' ? 'act' : ''}`}
              onClick={() => setMode('signin')}
            >
              Sign in
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'act' : ''}`}
              onClick={() => setMode('signup')}
            >
              Create account
            </button>
          </div>

          <h2>{copy.h}</h2>
          <p className="auth-sub">{copy.sub}</p>

          {pendingVerificationEmail ? (
            <div style={{ padding: '18px 0' }}>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Check your email</h3>
              <p style={{ color: 'var(--tx-2)', fontSize: 13, lineHeight: 1.5 }}>
                We sent a confirmation link to <b style={{ color: 'var(--tx)' }}>{pendingVerificationEmail}</b>.
                Click it to activate your account, then come back and sign in.
              </p>
              <p style={{ color: 'var(--tx-2)', fontSize: 12, marginTop: 12 }}>
                Didn&apos;t get it? Check spam, or try a different email.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setPendingVerificationEmail(null); setMode('signin'); }}
                >
                  Back to sign in
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setPendingVerificationEmail(null)}
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              const fd = new FormData(e.currentTarget);
              const email = String(fd.get('email') || '').trim();
              const password = String(fd.get('password') || '');
              const name = String(fd.get('name') || '').trim();
              if (!API_ENABLED) {
                toast.error('Backend is not configured — set NEXT_PUBLIC_API_URL to sign in.');
                return;
              }
              setBusy(true);
              try {
                if (mode === 'signin') {
                  await login(email, password);
                  done('Signed in');
                } else {
                  await register(email, password, name || undefined);
                  // auth-context ran a follow-up login; if that minted a
                  // session, go home. Otherwise Supabase is holding the
                  // account for email confirmation — show that screen.
                  // Give the context one tick to settle its status.
                  await new Promise((r) => setTimeout(r, 50));
                  // Re-read the latest status from closure via a microtask;
                  // simplest signal is cookie presence, which we proxy by
                  // hitting /api/auth/me through the login() path.
                  try {
                    // Try login one more time — if it succeeds, great; if it
                    // throws 401, we're in email-verification mode.
                    await login(email, password);
                    done('Account created');
                  } catch {
                    setPendingVerificationEmail(email);
                  }
                }
              } catch (err) {
                if (err instanceof ApiOffline) {
                  toast.error('Cannot reach the backend — try again in a moment.');
                } else if (err instanceof ApiError) {
                  const msg = typeof err.detail === 'string' ? err.detail : (mode === 'signin' ? 'Invalid email or password' : 'Could not create account');
                  toast.error(msg);
                } else {
                  toast.error('Network error — try again');
                }
              } finally {
                setBusy(false);
              }
            }}
          >
            {mode === 'signup' && (
              <div className="l-field">
                <label>Your name</label>
                <input name="name" type="text" placeholder="e.g. Justin Varghese" required />
              </div>
            )}
            <div className="l-field">
              <label>Email</label>
              <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div className="l-field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder={mode === 'signup' ? 'at least 8 characters' : ''}
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </div>
            {mode === 'signin' && (
              <div className="l-row">
                <a
                  onClick={async () => {
                    const email = prompt('Email for the password-reset link:');
                    if (!email) return;
                    if (!SUPABASE_BROWSER_ENABLED) {
                      toast.error('Password reset needs Supabase to be configured.');
                      return;
                    }
                    const sb = getSupabaseBrowser();
                    if (!sb) {
                      toast.error('Password reset is not available.');
                      return;
                    }
                    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
                      redirectTo: `${window.location.origin}/auth/reset`,
                    });
                    if (error) toast.error(error.message);
                    else toast.success('Reset link sent — check your inbox.');
                  }}
                >Forgot password?</a>
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={busy}
            >
              {busy ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>
          )}

          {!pendingVerificationEmail && (
          <>
          <div className="l-divider">or</div>

          <div className="auth-social">
            <button
              className="social-btn"
              disabled={busy}
              onClick={async () => {
                if (!API_ENABLED || !SUPABASE_BROWSER_ENABLED) {
                  toast.error('Google sign-in needs Supabase to be configured.');
                  return;
                }
                const sb = getSupabaseBrowser();
                if (!sb) {
                  toast.error('Google sign-in is not configured.');
                  return;
                }
                setBusy(true);
                const { error } = await sb.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
                if (error) {
                  setBusy(false);
                  toast.error(error.message);
                }
                // On success the browser navigates to Google — nothing more to do.
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button
              className="social-btn"
              disabled={busy}
              onClick={async () => {
                if (!API_ENABLED || !SUPABASE_BROWSER_ENABLED) {
                  toast.error('GitHub sign-in needs Supabase to be configured.');
                  return;
                }
                const sb = getSupabaseBrowser();
                if (!sb) {
                  toast.error('GitHub sign-in is not available.');
                  return;
                }
                setBusy(true);
                const { error } = await sb.auth.signInWithOAuth({
                  provider: 'github',
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
                if (error) {
                  setBusy(false);
                  toast.error(error.message);
                }
              }}
            >
              <GithubIcon size={16} /> Continue with GitHub
            </button>
          </div>

          <p className="auth-fine">
            By {mode === 'signin' ? 'signing in' : 'creating an account'} you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
          </p>
          </>
          )}
        </section>
      </main>
    </div>
  );
}
