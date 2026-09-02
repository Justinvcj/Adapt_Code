"use client";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav aria-label="Top Navigation" className="fixed top-0 w-full h-[50px] z-50 bg-surface/80 backdrop-blur-md border-b border-border-default flex justify-between items-center px-margin-desktop max-w-7xl mx-auto md:max-w-none md:w-full">
      <div className="flex items-center gap-xl h-full">
        <Link className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2" href="/dashboard">
          <span className="material-symbols-outlined" data-icon="code" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
          AdaptCode
        </Link>
        <div className="hidden md:flex items-center gap-lg h-full">
          <Link className={`h-full flex items-center font-bold pt-[2px] transition-colors duration-200 ${pathname === '/dashboard' ? 'text-primary border-b-2 border-primary opacity-80' : 'text-on-surface-variant hover:text-primary'}`} href="/dashboard">Dashboard</Link>
          <Link className={`h-full flex items-center font-bold pt-[2px] transition-colors duration-200 ${pathname.startsWith('/problem') ? 'text-primary border-b-2 border-primary opacity-80' : 'text-on-surface-variant hover:text-primary'}`} href="/problems">Library</Link>
          <Link className={`h-full flex items-center font-bold pt-[2px] transition-colors duration-200 ${pathname === '/history' ? 'text-primary border-b-2 border-primary opacity-80' : 'text-on-surface-variant hover:text-primary'}`} href="/history">History</Link>
        </div>
      </div>
      <div className="flex items-center gap-md">
        {user ? (
          <div className="flex items-center gap-md">
            <span className="text-sm text-on-surface-variant">{user.email}</span>
            <button onClick={logout} className="text-sm font-label-bold text-primary hover:text-primary-container transition-colors">Sign Out</button>
            <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border-default overflow-hidden flex items-center justify-center ml-2 cursor-pointer">
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-label-bold text-primary hover:text-primary-container transition-colors">Login</Link>
            <Link href="/register" className="text-sm font-label-bold bg-primary text-on-primary px-3 py-1 rounded hover:bg-primary/90 transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
