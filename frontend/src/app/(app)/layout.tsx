"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{background: 'var(--bg)'}}>
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // The practice page uses a fullscreen layout, so we don't wrap it in app-wrap
  if (pathname === '/practice' || pathname.startsWith('/practice/')) {
    return (
      <>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="app-wrap">
        <Sidebar />
        <div className="main">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
