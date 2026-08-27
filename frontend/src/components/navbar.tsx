'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('#userDD')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const IC = {
    search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  };

  if (pathname === '/practice' || pathname.startsWith('/practice/')) {
    // Return null since practice page has its own custom nav
    return null;
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="nav-brand" href="/">
          <span className="logo">&lt;/&gt;</span> AdaptCode
        </Link>
        <div className="nav-links">
          <Link className={`nav-link ${pathname === '/dashboard' ? 'act' : ''}`} href="/dashboard">Problems</Link>
          <Link className={`nav-link ${pathname === '/leaderboard' ? 'act' : ''}`} href="/leaderboard">Contest</Link>
          <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); alert('Coming soon'); }}>Discuss</a>
          <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); alert('Coming soon'); }}>Interview <span className="chev">▾</span></a>
          <Link className={`nav-link store-link ${pathname === '/pricing' ? 'act' : ''}`} href="/pricing">Store <span className="chev">▾</span></Link>
        </div>
        <div className="nav-acts">
          <button className="nav-search">{IC.search} Search</button>
          {!loading && user ? (
            <>
              <button className="ni">{IC.bell}<span className="dot"></span></button>
              <button className="ni" style={{fontSize: '13px'}}>🪙 0</button>
              {!user.is_pro && <Link href="/pricing"><button className="premium-badge">Premium</button></Link>}
              
              <div className={`dd ${dropdownOpen ? 'open' : ''}`} id="userDD">
                <button className="nav-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {user.username.substring(0,2).toUpperCase()}
                </button>
                <div className="dd-menu" style={{minWidth: '280px'}}>
                  <div className="dd-head">
                    <div className="dd-avatar">{user.username.substring(0,2).toUpperCase()}</div>
                    <div>
                      <div className="dd-name">{user.username}</div>
                      {!user.is_pro && <div className="dd-upsell">Access all features with our<br/>Premium subscription!</div>}
                      {user.is_pro && <div className="dd-upsell" style={{color: 'var(--solved)'}}>Pro Member</div>}
                    </div>
                  </div>
                  <div className="dd-grid">
                    <div className="dd-grid-item"><div className="dd-grid-icon" style={{background: 'rgba(91,141,239,.15)', color: 'var(--blue)'}}>📋</div>My Lists</div>
                    <div className="dd-grid-item"><div className="dd-grid-icon" style={{background: 'rgba(91,141,239,.15)', color: 'var(--blue)'}}>📓</div>Notebook</div>
                    <div className="dd-grid-item"><div className="dd-grid-icon" style={{background: 'rgba(44,187,93,.15)', color: 'var(--solved)'}}>📈</div>Progress</div>
                    <div className="dd-grid-item"><div className="dd-grid-icon" style={{background: 'rgba(255,161,22,.15)', color: 'var(--premium)'}}>🪙</div>Points</div>
                  </div>
                  <Link className="dd-item" href="#">{IC.star} Try New Features</Link>
                  <Link className="dd-item" href="#">{IC.list} Orders</Link>
                  <Link className="dd-item" href="/history">{IC.code} My Playgrounds</Link>
                  <Link className="dd-item" href="#">{IC.settings} Settings</Link>
                  <div className="dd-sep"></div>
                  <Link className="dd-item" href="#">{IC.user} Profile</Link>
                  <button className="dd-item danger" onClick={logout}>{IC.logout} Sign Out</button>
                </div>
              </div>
            </>
          ) : (
            !loading && (
              <>
                <Link className="btn btn-ghost" href="/login">Sign In</Link>
                <Link className="btn btn-primary" href="/register">Get Started</Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
