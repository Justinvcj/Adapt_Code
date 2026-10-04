"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bell, Star, List, Code2, Settings, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchModal from './SearchModal';
import { USER } from './data';
import { useAuth } from '@/lib/auth-context';

export default function Navbar({ active, loggedIn = true }: { active?: string; loggedIn?: boolean }) {
  const [smOpen, setSmOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const { logout } = useAuth();

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
          </div>
          <div className="nav-acts">
            <button className="nav-search" onClick={() => setSmOpen(true)}>
              <Search /> Search
            </button>
            {loggedIn ? (
              <>
                <button className="ni" onClick={() => notify('No new notifications')}>
                  <Bell /><span className="dot" />
                </button>
                <button className="ni" onClick={() => notify('Points — demo')} style={{ fontSize: 13 }}>🪙 0</button>
                <div className={`dd ${ddOpen ? 'open' : ''}`} id="userDD">
                  <button className="nav-avatar" onClick={() => setDdOpen((v) => !v)}>JV</button>
                  <div className="dd-menu" style={{ minWidth: 280 }}>
                    <div className="dd-head">
                      <div className="dd-avatar">JV</div>
                      <div>
                        <div className="dd-name">{USER.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>{USER.user}</div>
                      </div>
                    </div>
                    <div className="dd-grid">
                      {[
                        ['📋', 'My Lists', 'rgba(94,106,210,.15)', 'var(--blue)'],
                        ['📓', 'Notebook', 'rgba(94,106,210,.15)', 'var(--blue)'],
                        ['📈', 'Progress', 'rgba(39,166,68,.15)', 'var(--solved)'],
                        ['🪙', 'Points', 'rgba(255,161,22,.15)', 'var(--accent)'],
                      ].map(([ic, label, bg, color]) => (
                        <div key={label} className="dd-grid-item" onClick={() => notify(`${label} — demo`)}>
                          <div className="dd-grid-icon" style={{ background: bg, color }}>{ic}</div>
                          {label}
                        </div>
                      ))}
                    </div>
                    <button className="dd-item" onClick={() => notify('Try New Features — demo')}><Star /> Try New Features</button>
                    <button className="dd-item" onClick={() => notify('Orders — demo')}><List /> Orders</button>
                    <button className="dd-item" onClick={() => notify('My Playgrounds — demo')}><Code2 /> My Playgrounds</button>
                    <Link className="dd-item" href="/settings"><Settings /> Settings</Link>
                    <div className="dd-sep" />
                    <Link className="dd-item" href="/profile/Justinvcj"><User /> Profile</Link>
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
