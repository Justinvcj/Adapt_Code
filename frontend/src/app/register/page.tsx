"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name: email.split('@')[0] })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      
      toast.success("Successfully registered! Please log in.");
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize Google login");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-surface-elevated border border-border-default rounded-2xl p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">AdaptCode</h1>
          <p className="text-sm text-on-surface-variant">Create a free account to get started.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant" htmlFor="email">Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-on-surface-variant w-5 h-5" />
              <input 
                id="email" 
                type="email" 
                required 
                placeholder="Enter your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-[#1A1A1A] border border-border-default rounded-lg text-text-primary placeholder-on-surface-variant/50 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-on-surface-variant w-5 h-5" />
              <input 
                id="password" 
                type="password" 
                required 
                placeholder="Create a password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-[#1A1A1A] border border-border-default rounded-lg text-text-primary placeholder-on-surface-variant/50 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              />
            </div>
          </div>
          
          <button 
            disabled={loading} 
            type="submit"
            className="w-full bg-primary text-white font-bold text-sm py-3.5 rounded-lg hover:bg-primary/90 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="my-8 relative flex items-center justify-center">
          <hr className="w-full border-border-default absolute"/>
          <span className="bg-surface-elevated px-3 text-xs font-bold text-on-surface-variant relative z-10 uppercase tracking-widest">or continue with</span>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          type="button" 
          className="w-full flex items-center justify-center space-x-2 bg-surface-elevated border border-border-default py-3.5 rounded-lg hover:border-border-hover hover:bg-surface-secondary transition-all group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-sm font-bold text-on-surface-variant group-hover:text-text-primary transition-colors">Sign in with Google</span>
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Already have an account? <Link className="text-primary hover:text-primary/80 transition-colors font-bold ml-1" href="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
