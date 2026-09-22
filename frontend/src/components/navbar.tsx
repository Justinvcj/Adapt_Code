"use client";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav aria-label="Top Navigation" className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-border-default">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop h-[50px] max-w-7xl mx-auto md:max-w-none md:w-full">
        <div className="flex items-center gap-xl h-full">
          <Link className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2" href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-outlined" data-icon="code" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
            AdaptCode
          </Link>
          <div className="hidden md:flex items-center gap-lg h-full">
            <Link className={`h-full flex items-center font-bold pt-[2px] transition-colors duration-200 ${pathname === '/dashboard' ? 'text-primary border-b-2 border-primary opacity-80' : 'text-on-surface-variant hover:text-primary'}`} href="/dashboard">Dashboard</Link>
            <Link className={`h-full flex items-center font-bold pt-[2px] transition-colors duration-200 ${pathname.startsWith('/problem') ? 'text-primary border-b-2 border-primary opacity-80' : 'text-on-surface-variant hover:text-primary'}`} href="/problems">Library</Link>
            <Link className={`h-full flex items-center font-bold pt-[2px] transition-colors duration-200 ${pathname === '/history' ? 'text-primary border-b-2 border-primary opacity-80' : 'text-on-surface-variant hover:text-primary'}`} href="/history">History</Link>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-md">
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

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-on-surface-variant hover:text-primary p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-surface pb-4 shadow-lg">
          <div className="flex flex-col px-4 pt-2">
            <Link className={`py-3 border-b border-border-default/50 font-bold ${pathname === '/dashboard' ? 'text-primary' : 'text-on-surface-variant'}`} href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link className={`py-3 border-b border-border-default/50 font-bold ${pathname.startsWith('/problem') ? 'text-primary' : 'text-on-surface-variant'}`} href="/problems" onClick={() => setMobileMenuOpen(false)}>Library</Link>
            <Link className={`py-3 border-b border-border-default/50 font-bold ${pathname === '/history' ? 'text-primary' : 'text-on-surface-variant'}`} href="/history" onClick={() => setMobileMenuOpen(false)}>History</Link>
            
            <div className="mt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <span className="text-sm text-on-surface-variant opacity-70 mb-1">{user.email}</span>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full py-2 bg-surface-elevated border border-border-default rounded font-label-bold text-primary text-center">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2 border border-border-default rounded text-primary text-center font-label-bold">Login</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2 bg-primary text-on-primary rounded text-center font-label-bold">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
