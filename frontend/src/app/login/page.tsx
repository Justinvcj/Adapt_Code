'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const IC = {
    google: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/></svg>,
    github: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
  };

  return (
    <div className="login-pg">
      <div className="login-w">
        <Link className="login-brand" href="/">
          <span className="logo">&lt;/&gt;</span> AdaptCode
        </Link>
        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="sub">Sign in to continue your practice streak</p>
          <form className="l-form" onSubmit={handleLogin}>
            <div className="l-field">
              <label>Email or username</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="l-field">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="l-row">
              <label><input type="checkbox"/> Remember me</label>
              <a href="#" onClick={e => e.preventDefault()}>Forgot password?</a>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{width: '100%', padding: '10px', borderRadius: 'var(--r-md)'}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="l-divider">or</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <button className="social-btn" onClick={() => toast.error('Coming soon')}>{IC.google} Continue with Google</button>
            <button className="social-btn" onClick={() => toast.error('Coming soon')}>{IC.github} Continue with GitHub</button>
          </div>
          <p className="l-footer">Don't have an account? <Link href="/register">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}
