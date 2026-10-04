"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { GithubIcon } from '@/components/adapt/icons';
import { useAuth } from '@/lib/auth-context';
import { ApiError, ApiOffline, API_ENABLED } from '@/lib/api';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [busy, setBusy] = useState(false);
  const done = (msg: string) => { toast.success(msg); router.push('/'); };

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

          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              const fd = new FormData(e.currentTarget);
              const email = String(fd.get('email') || '').trim();
              const password = String(fd.get('password') || '');
              const name = String(fd.get('name') || '').trim();
              // Offline / preview mode: no backend, keep the demo flow
              if (!API_ENABLED) {
                done(mode === 'signin' ? 'Signed in (demo)' : 'Account created (demo)');
                return;
              }
              setBusy(true);
              try {
                if (mode === 'signin') await login(email, password);
                else await register(email, password, name || undefined);
                done(mode === 'signin' ? 'Signed in' : 'Account created');
              } catch (err) {
                if (err instanceof ApiOffline) {
                  done(mode === 'signin' ? 'Signed in (demo)' : 'Account created (demo)');
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
                <a onClick={() => toast('Password reset — coming soon')}>Forgot password?</a>
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

          <div className="l-divider">or</div>

          <div className="auth-social">
            <button className="social-btn" onClick={() => done(`${mode === 'signin' ? 'Signed in' : 'Signed up'} with Google`)}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button className="social-btn" onClick={() => done(`${mode === 'signin' ? 'Signed in' : 'Signed up'} with GitHub`)}>
              <GithubIcon size={16} /> Continue with GitHub
            </button>
          </div>

          <p className="auth-fine">
            By {mode === 'signin' ? 'signing in' : 'creating an account'} you agree to the <a>Terms</a> and <a>Privacy Policy</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
