'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { GoogleIcon, GithubIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';

export default function LoginPage() {
  const { toast } = useToastContext();
  const router = useRouter();

  function signIn() {
    toast('Signed in successfully', 'success');
    router.push('/problems');
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
          <div className="w-full p-8 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)]">
            <h2 className="text-lg font-bold mb-1 tracking-[-0.03em]">Welcome back</h2>
            <p className="text-[var(--tx-2)] text-[13px] mb-5">Sign in to continue your practice streak</p>

            <form className="flex flex-col gap-3.5" onSubmit={(e) => { e.preventDefault(); signIn(); }}>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[var(--tx-1)]">Email or username</label>
                <input type="text" placeholder="you@example.com" required className="px-3 py-[9px] rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm focus:border-[var(--blue)] transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[var(--tx-1)]">Password</label>
                <input type="password" placeholder="••••••••" required className="px-3 py-[9px] rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm focus:border-[var(--blue)] transition-colors" />
              </div>
              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-1.5 text-[var(--tx-2)] cursor-pointer">
                  <input type="checkbox" className="accent-[var(--solved)] w-3.5 h-3.5" /> Remember me
                </label>
                <button type="button" className="text-[var(--blue)] font-medium" onClick={() => toast('Password reset — demo', 'info')}>Forgot password?</button>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-[var(--r-md)] bg-[var(--solved)] text-white font-medium text-sm hover:bg-[#2fba50] transition-colors">Sign In</button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4 text-[var(--tx-3)] text-xs uppercase">
              <span className="flex-1 h-px bg-[var(--border)]" />or<span className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* Social */}
            <div className="flex flex-col gap-2">
              <button className="w-full py-[9px] rounded-[var(--r)] border border-[var(--border)] flex items-center justify-center gap-2 text-[13px] font-medium text-[var(--tx-1)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-h)] transition-all bg-[rgba(255,255,255,0.03)]" onClick={signIn}>
                <GoogleIcon size={16} /> Continue with Google
              </button>
              <button className="w-full py-[9px] rounded-[var(--r)] border border-[var(--border)] flex items-center justify-center gap-2 text-[13px] font-medium text-[var(--tx-1)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-h)] transition-all bg-[rgba(255,255,255,0.03)]" onClick={signIn}>
                <GithubIcon size={16} /> Continue with GitHub
              </button>
            </div>

            <p className="text-center text-[13px] text-[var(--tx-2)] mt-4">
              Don&apos;t have an account?{' '}
              <button className="text-[var(--blue)] font-medium" onClick={signIn}>Sign up free</button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
