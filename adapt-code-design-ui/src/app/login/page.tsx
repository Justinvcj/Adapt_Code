'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { GoogleIcon, GithubIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { toast } = useToastContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast('Please enter email and password', 'error');
      return;
    }
    
    if (!process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      toast('UI Test Mode: Bypassing Auth', 'success');
      router.push('/problems');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('cached_user', JSON.stringify({
        user_id: data.user_id,
        email: email,
        display_name: data.display_name,
        role: 'student',
        is_pro: data.is_pro,
        created_at: new Date().toISOString()
      }));
      
      toast('Signed in successfully', 'success');
      router.push('/problems');
    } catch (error: any) {
      toast(error.message || 'Failed to log in', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        toast('UI Test Mode: Bypassing Auth', 'success');
        router.push('/problems');
        return;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/problems` : 'http://localhost:3000/problems'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast(error.message || 'Failed to initialize Google login', 'error');
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-var(--nav-h))] flex items-center justify-center p-5">
        <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg cursor-pointer">
            <span className="w-8 h-8 rounded-[var(--r-md)] bg-[var(--accent)] flex items-center justify-center text-[13px] font-extrabold text-[#010102] font-[var(--font-mono)]">&lt;/&gt;</span>
            AdaptCode
          </Link>

          {/* Card */}
          <div className="w-full p-8 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] shadow-xl">
            <h2 className="text-lg font-bold mb-1 tracking-[-0.03em]">Welcome back</h2>
            <p className="text-[var(--tx-2)] text-[13px] mb-5">Sign in to continue your practice streak</p>

            <form className="flex flex-col gap-3.5" onSubmit={signIn}>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[var(--tx-1)]">Email or username</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  required 
                  className="px-3 py-[9px] rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm focus:border-[var(--blue)] outline-none transition-colors" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[var(--tx-1)]">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  className="px-3 py-[9px] rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm focus:border-[var(--blue)] outline-none transition-colors" 
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-1.5 text-[var(--tx-2)] cursor-pointer">
                  <input type="checkbox" className="accent-[var(--solved)] w-3.5 h-3.5" /> Remember me
                </label>
                <button type="button" className="text-[var(--blue)] font-medium" onClick={() => toast('Password reset is not implemented', 'info')}>Forgot password?</button>
              </div>
              <button disabled={loading} type="submit" className="w-full py-2.5 rounded-[var(--r-md)] bg-[var(--solved)] text-white font-medium text-sm hover:bg-[#2fba50] transition-colors disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4 text-[var(--tx-3)] text-xs uppercase">
              <span className="flex-1 h-px bg-[var(--border)]" />or<span className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* Social */}
            <div className="flex flex-col gap-2">
              <button type="button" className="w-full py-[9px] rounded-[var(--r)] border border-[var(--border)] flex items-center justify-center gap-2 text-[13px] font-medium text-[var(--tx-1)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-h)] transition-all bg-[rgba(255,255,255,0.03)]" onClick={signInWithGoogle}>
                <GoogleIcon size={16} /> Continue with Google
              </button>
              <button type="button" className="w-full py-[9px] rounded-[var(--r)] border border-[var(--border)] flex items-center justify-center gap-2 text-[13px] font-medium text-[var(--tx-1)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-h)] transition-all bg-[rgba(255,255,255,0.03)]" onClick={() => toast('Github login not configured', 'info')}>
                <GithubIcon size={16} /> Continue with GitHub
              </button>
            </div>

            <p className="text-center text-[13px] text-[var(--tx-2)] mt-4">
              Don&apos;t have an account?{' '}
              <Link href="/login" className="text-[var(--blue)] font-medium">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
