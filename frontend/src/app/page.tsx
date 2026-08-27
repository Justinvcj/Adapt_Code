'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return null; // Will redirect
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link className="nav-brand" href="/">
            <span className="logo">&lt;/&gt;</span> AdaptCode
          </Link>
          <div className="nav-links">
            <Link className="nav-link" href="#">Problems</Link>
            <Link className="nav-link" href="#">Contest</Link>
            <Link className="nav-link" href="#">Discuss</Link>
          </div>
          <div className="nav-acts">
            <Link className="btn btn-ghost" href="/login">Sign In</Link>
            <Link className="btn btn-primary" href="/register">Get Started</Link>
          </div>
        </div>
      </nav>
      <div className="app-wrap">
        <div className="main" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center'}}>
          <h1 style={{fontSize: '48px', fontWeight: 700, marginBottom: '24px'}}>A New Way to Learn</h1>
          <p style={{fontSize: '18px', color: 'var(--tx-2)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6}}>
            AdaptCode brings you the best coding practice experience with our beautiful dark mode layout, personalized problem recommendations, and an integrated AI Tutor.
          </p>
          <Link href="/register" className="btn btn-primary" style={{fontSize: '16px', padding: '12px 32px', borderRadius: 'var(--r-lg)'}}>Create Account</Link>
        </div>
      </div>
    </>
  );
}
