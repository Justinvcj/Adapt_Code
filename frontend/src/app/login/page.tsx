"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
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
      
      login({
        user_id: data.user_id,
        email: email,
        display_name: data.display_name,
        role: 'student',
        is_pro: data.is_pro,
        created_at: new Date().toISOString()
      });
      
      toast.success("Successfully logged in!");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
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
          <p className="text-sm text-on-surface-variant">Sign in to continue solving problems.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface-variant" htmlFor="email">Email / Username</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 text-on-surface-variant w-5 h-5" />
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
                placeholder="Enter password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-[#1A1A1A] border border-border-default rounded-lg text-text-primary placeholder-on-surface-variant/50 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              />
            </div>
          </div>
          
          <button 
            disabled={loading} 
            type="submit"
            className="w-full bg-success text-white font-bold text-sm py-3.5 rounded-lg hover:bg-success/90 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        
        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Don't have an account? <Link className="text-primary hover:text-primary/80 transition-colors font-bold ml-1" href="/register">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}