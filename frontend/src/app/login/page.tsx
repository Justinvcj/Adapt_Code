"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { GithubIcon } from '@/components/adapt/icons';
import { useAuth } from '@/lib/auth-context';
import { ApiError, ApiOffline, API_ENABLED } from '@/lib/api';
import { getSupabaseBrowser, SUPABASE_BROWSER_ENABLED } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [busy, setBusy] = useState(false);
  const done = (msg: string) => { toast.success(msg); router.push('/'); };

  const isSignin = mode === 'signin';

  return (
    <div className="lg-page">
      <header className="lg-top">
        <Link className="lg-brand" href="/">
          <img src="/logo.webp" alt="" width={24} height={24} />
          <span>AdaptCode</span>
        </Link>
        <Link href="/" className="lg-top-back">Back to home</Link>
      </header>

      <main className="lg-main">
        <section className="lg-card">
          <div className="lg-mono">{isSignin ? 'Sign in' : 'New account'}</div>
          <h1 className="lg-h">
            {isSignin ? 'Welcome back.' : 'Start learning.'}
          </h1>
          <p className="lg-sub">
            {isSignin
              ? 'Pick up where you left off.'
              : 'Twelve concepts, prerequisite-gated. Free forever.'}
          </p>

          <form
            className="lg-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              const fd = new FormData(e.currentTarget);
              const email = String(fd.get('email') || '').trim();
              const password = String(fd.get('password') || '');
              const name = String(fd.get('name') || '').trim();
              if (!API_ENABLED) {
                done(isSignin ? 'Signed in (demo)' : 'Account created (demo)');
                return;
              }
              setBusy(true);
              try {
                if (isSignin) await login(email, password);
                else await register(email, password, name || undefined);
                done(isSignin ? 'Signed in' : 'Account created');
              } catch (err) {
                if (err instanceof ApiOffline) {
                  done(isSignin ? 'Signed in (demo)' : 'Account created (demo)');
                } else if (err instanceof ApiError) {
                  const msg = typeof err.detail === 'string' ? err.detail : (isSignin ? 'Invalid email or password' : 'Could not create account');
                  toast.error(msg);
                } else {
                  toast.error('Network error, try again');
                }
              } finally {
                setBusy(false);
              }
            }}
          >
            {!isSignin && (
              <label className="lg-field">
                <span>Name</span>
                <input name="name" type="text" placeholder="Justin Varghese" required />
              </label>
            )}
            <label className="lg-field">
              <span>Email</span>
              <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
            </label>
            <label className="lg-field">
              <span>
                Password
                {isSignin && (
                  <a
                    className="lg-field-aux"
                    onClick={(e) => { e.preventDefault(); toast('Password reset, coming soon'); }}
                  >Forgot?</a>
                )}
              </span>
              <input
                name="password"
                type="password"
                placeholder={isSignin ? '' : 'at least 8 characters'}
                minLength={8}
                autoComplete={isSignin ? 'current-password' : 'new-password'}
                required
              />
            </label>

            <button type="submit" className="lg-submit" disabled={busy}>
              {busy
                ? (isSignin ? 'Signing in' : 'Creating account')
                : (isSignin ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="lg-divider"><span>or continue with</span></div>

          <div className="lg-social">
            <button
              className="lg-social-btn"
              disabled={busy}
              onClick={async () => {
                if (!API_ENABLED || !SUPABASE_BROWSER_ENABLED) {
                  done(`${isSignin ? 'Signed in' : 'Signed up'} with Google (demo)`);
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
              }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              className="lg-social-btn"
              onClick={() => done(`${isSignin ? 'Signed in' : 'Signed up'} with GitHub`)}
            >
              <GithubIcon size={15} /> GitHub
            </button>
          </div>

          <p className="lg-switch">
            {isSignin ? (
              <>Don&apos;t have an account? <button onClick={() => setMode('signup')}>Create one</button></>
            ) : (
              <>Already a member? <button onClick={() => setMode('signin')}>Sign in</button></>
            )}
          </p>
        </section>

        <p className="lg-fine">
          By continuing you agree to the <Link href="/terms">Terms</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </main>
    </div>
  );
}
