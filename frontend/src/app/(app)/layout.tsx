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

  const isWorkspace = pathname.startsWith('/problem/');

  return (
    <>
      <Navbar />
      {!isWorkspace && <Sidebar />}
      <main className={`flex-1 mt-[50px] ${!isWorkspace ? 'md:ml-[220px] p-margin-mobile md:p-margin-desktop overflow-y-auto min-h-[calc(100vh-50px)]' : 'h-[calc(100vh-50px)] overflow-hidden'} bg-background`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </>
  );
}
