"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Settings, User, LogOut, Home, BookOpen, Layers, GitBranch, Trophy, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchModal from './SearchModal';
import Logo from './Logo';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-store';

/**
 * App shell navigation.
 *
 * Since the 2026-11 rebrand this renders a fixed left sidebar on desktop and a
 * bottom tab bar on phones, not a top bar. The component keeps its old name
 * and props so every page that already renders `<Navbar active="…" />` picks
 * up the new shell without changes. The page offset is handled in CSS
 * (`body:has(.ac-side)` in globals.css), which also sets `--nav-h` to 0 so
 * layouts written as `calc(100vh - var(--nav-h))` keep working.
 *
 * The problem workspace does not render this component and keeps its own
 * full-width header.
 */
type Item = { key: string; href: string; label: string; icon: typeof Home; match: (p: string) => boolean };

const ITEMS: Item[] = [
  { key: 'home',        href: '/',            label: 'Today',       icon: Home,      match: (p) => p === '/' },
  { key: 'problems',    href: '/problems',    label: 'Practice',    icon: BookOpen,  match: (p) => p.startsWith('/problems') },
  { key: 'mastery',     href: '/mastery',     label: 'Mastery',     icon: Layers,    match: (p) => p.startsWith('/mastery') },
  { key: 'graph',       href: '/graph',       label: 'Concept map', icon: GitBranch, match: (p) => p.startsWith('/graph') },
  { key: 'leaderboard', href: '/leaderboard', label: 'Leaderboard', icon: Trophy,    match: (p) => p.startsWith('/leaderboard') },
];

export default function Navbar({ active, loggedIn = true }: { active?: string; loggedIn?: boolean }) {
  const path = usePathname() || '/';
  const [smOpen, setSmOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const { logout, user } = useAuth();
  const { profile } = useProfile();
  const displayName = user?.display_name || profile.name || 'Learner';
  const initials = displayName
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

  const items = user?.role === 'admin'
    ? [...ITEMS, { key: 'admin', href: '/admin', label: 'Admin', icon: Shield, match: (p: string) => p.startsWith('/admin') }]
    : ITEMS;
  const isActive = (it: Item) => (active ? active === it.key : it.match(path));
  const activeIndex = items.findIndex(isActive);

  return (
    <>
      <aside className="ac-side">
        <Link className="ac-side-brand" href="/" aria-label="AdaptCode home">
          <Logo size={30} />
        </Link>

        <button className="ac-side-search" onClick={() => setSmOpen(true)}>
          <Search size={15} /> <span>Search</span> <kbd>Ctrl K</kbd>
        </button>

        <nav className="ac-side-nav" aria-label="Main">
          {activeIndex >= 0 && (
            <span className="ac-side-pill" style={{ transform: `translateY(${activeIndex * 44}px)` }} aria-hidden />
          )}
          {items.map((it) => {
            const Icon = it.icon;
            const on = isActive(it);
            return (
              <Link key={it.key} href={it.href} className={`ac-side-link ${on ? 'act' : ''}`} aria-current={on ? 'page' : undefined}>
                <Icon size={18} strokeWidth={1.7} /> <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ac-side-foot">
          {loggedIn ? (
            <div className={`dd ${ddOpen ? 'open' : ''}`} id="userDD" style={{ width: '100%' }}>
              <button className="ac-side-me" onClick={() => setDdOpen((v) => !v)} aria-haspopup="menu" aria-expanded={ddOpen}>
                <span className="ac-side-avatar">{initials}</span>
                <span className="ac-side-name">{displayName}</span>
              </button>
              <div className="dd-menu" style={{ minWidth: 240 }} role="menu">
                <div className="dd-head">
                  <div className="dd-avatar">{initials}</div>
                  <div>
                    <div className="dd-name">{displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>@{handle}</div>
                  </div>
                </div>
                <Link className="dd-item" href={`/profile/${handle}`}><User /> Profile</Link>
                <Link className="dd-item" href="/settings"><Settings /> Settings</Link>
                <div className="dd-sep" />
                <button className="dd-item danger" onClick={async () => { await logout(); toast.success('Signed out'); window.location.href = '/'; }}>
                  <LogOut /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link className="btn btn-primary" href="/login" style={{ width: '100%' }}>Sign in</Link>
          )}
        </div>
      </aside>
      <SearchModal open={smOpen} onClose={() => setSmOpen(false)} />
    </>
  );
}
