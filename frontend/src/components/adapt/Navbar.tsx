"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchModal from './SearchModal';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-store';

export default function Navbar({ active, loggedIn = true }: { active?: string; loggedIn?: boolean }) {
  const [smOpen, setSmOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const { logout, user } = useAuth();
  const { profile } = useProfile();
  const initials = (profile.name || 'U')
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const handle = profile.display_name || 'me';

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSmOpen(true); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (!ddOpen) return;
    const h = (e: MouseEvent) => {
      const el = document.getElementById('userDD');
      if (el && !el.contains(e.target as Node)) setDdOpen(false);
    };
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, [ddOpen]);

  const notify = (msg: string) => toast(msg);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link className="nav-brand" href="/">
            <img src="/logo.webp" alt="" className="brand-mark" width={28} height={28} />
            AdaptCode
          </Link>
          <div className="nav-links">
            <Link className={`nav-link ${active === 'home' ? 'act' : ''}`} href="/">Home</Link>
            <Link className={`nav-link ${active === 'mastery' ? 'act' : ''}`} href="/mastery">Mastery</Link>
            <Link className={`nav-link ${active === 'graph' ? 'act' : ''}`} href="/graph">Graph</Link>
            <Link className={`nav-link ${active === 'problems' ? 'act' : ''}`} href="/problems">Practice</Link>
            <Link className={`nav-link ${active === 'leaderboard' ? 'act' : ''}`} href="/leaderboard">Leaderboard</Link>
            {user?.role === 'admin' && (
              <Link className={`nav-link ${active === 'admin' ? 'act' : ''}`} href="/admin" style={{ color: 'var(--accent)' }}>Admin</Link>
            )}
          </div>
          <div className="nav-acts">
            <button className="nav-search" onClick={() => setSmOpen(true)}>
              <Search /> Search
            </button>
            {loggedIn ? (
              <>
                <button className="ni" onClick={() => notify('No new notifications')}>
                  <Bell />
                </button>
                <div className={`dd ${ddOpen ? 'open' : ''}`} id="userDD">
                  <button className="nav-avatar" onClick={() => setDdOpen((v) => !v)}>{initials}</button>
                  <div className="dd-menu" style={{ minWidth: 260 }}>
                    <div className="dd-head">
                      <div className="dd-avatar">{initials}</div>
                      <div>
                        <div className="dd-name">{profile.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>@{handle}</div>
                      </div>
                    </div>
                    <Link className="dd-item" href={`/profile/${handle}`}><User /> Profile</Link>
                    <Link className="dd-item" href="/mastery"><Settings /> Mastery</Link>
                    <Link className="dd-item" href="/settings"><Settings /> Settings</Link>
                    <div className="dd-sep" />
                    <button className="dd-item danger" onClick={async () => { await logout(); toast.success('Signed out'); window.location.href = '/'; }}>
                      <LogOut /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost" href="/login">Sign In</Link>
                <Link className="btn btn-primary" href="/login">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <SearchModal open={smOpen} onClose={() => setSmOpen(false)} />
    </>
  );
}
