'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SearchIcon, BellIcon, SettingsIcon, LogoutIcon, UserIcon, StarIcon, ListIcon, CodeIcon } from './icons';
import { useToastContext } from './toast-provider';
import { SearchModal } from './search-modal';
import { USER } from '@/lib/data';

export function Navbar() {
  const pathname = usePathname();
  const { toast } = useToastContext();
  const [ddOpen, setDdOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setDdOpen(false);
      }
    }
    if (ddOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [ddOpen]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      <nav className="sticky top-0 z-[100] h-[var(--nav-h)] flex items-center px-4 bg-[rgba(1,1,2,0.92)] backdrop-blur-[24px] saturate-[1.4] border-b border-[var(--border)]">
        <div className="flex items-center w-full gap-1">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 font-bold text-[15px] mr-4 shrink-0 tracking-[-0.03em]">
            <span className="w-7 h-7 rounded-[var(--r-sm)] bg-[var(--accent)] flex items-center justify-center text-[11px] font-extrabold text-[#010102] font-[var(--font-mono)]">&lt;/&gt;</span>
            AdaptCode
          </Link>

          {/* Nav links */}
          <div className="flex gap-0.5 flex-1">
            <NavLink href="/problems" active={isActive('/problems')}>Problems</NavLink>
            <NavLink href="/contests" active={isActive('/contests')}>Contest</NavLink>
            <NavLink href="/discuss" active={isActive('/discuss')}>Discuss</NavLink>
            <NavLink href="/interview" active={isActive('/interview')}>Interview <span className="text-[10px] ml-0.5 opacity-50">▾</span></NavLink>
            <NavLink href="/explore" active={isActive('/explore')}>Store <span className="text-[10px] ml-0.5 opacity-50">▾</span></NavLink>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-[5px] rounded-[var(--r-md)] bg-[rgba(255,255,255,0.06)] border border-[var(--border)] text-[var(--tx-2)] text-[13px] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] hover:border-[var(--border-h)] transition-all min-w-[160px]"
            >
              <SearchIcon size={14} /> Search
            </button>

            <button className="w-[34px] h-[34px] rounded-[var(--r-md)] flex items-center justify-center text-[var(--tx-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all relative" onClick={() => toast('No new notifications', 'info')}>
              <BellIcon size={18} />
              <span className="absolute top-[5px] right-[6px] w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
            </button>

            <button className="w-[34px] h-[34px] rounded-[var(--r-md)] flex items-center justify-center text-[var(--tx-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all text-[13px]" onClick={() => toast('Points — demo', 'info')}>
              🪙 0
            </button>

            {/* Avatar dropdown */}
            <div className="relative inline-flex" ref={ddRef}>
              <button
                onClick={() => setDdOpen(!ddOpen)}
                className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#06d6a0] to-[#0ab4e0] flex items-center justify-center text-[11px] font-bold text-[#010102] cursor-pointer shrink-0"
              >
                JV
              </button>

              {ddOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 min-w-[280px] bg-[var(--bg-sf)] border border-[var(--border-h)] rounded-[var(--r-lg)] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,0,0,0.3)] p-1.5 z-[200] animate-dd-in">
                  {/* Header */}
                  <div className="p-3 flex gap-3 items-center border-b border-[var(--border)] mb-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06d6a0] to-[#0ab4e0] flex items-center justify-center text-base font-bold text-[#010102] shrink-0">JV</div>
                    <div>
                      <div className="font-semibold text-sm">{USER.name}</div>
                      <div className="text-xs text-[var(--tx-2)]">{USER.user}</div>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-4 gap-1 p-2 border-b border-[var(--border)] mb-1">
                    {[
                      { icon: '📋', label: 'My Lists', bg: 'rgba(94,106,210,0.15)', color: 'var(--blue)' },
                      { icon: '📓', label: 'Notebook', bg: 'rgba(94,106,210,0.15)', color: 'var(--blue)' },
                      { icon: '📈', label: 'Progress', bg: 'rgba(39,166,68,0.15)', color: 'var(--solved)' },
                      { icon: '🪙', label: 'Points', bg: 'rgba(255,161,22,0.15)', color: 'var(--accent)' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className="flex flex-col items-center gap-1 p-2.5 rounded-[var(--r-md)] cursor-pointer hover:bg-[var(--bg-hover)] text-[11px] text-[var(--tx-2)] transition-colors"
                        onClick={() => toast(`${item.label} — demo`, 'info')}
                      >
                        <div className="w-8 h-8 rounded-[var(--r-md)] flex items-center justify-center text-base" style={{ background: item.bg, color: item.color }}>{item.icon}</div>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Menu items */}
                  <DDItem icon={<StarIcon size={16} />} onClick={() => toast('Try New Features — demo', 'info')}>Try New Features</DDItem>
                  <DDItem icon={<ListIcon size={16} />} onClick={() => toast('Orders — demo', 'info')}>Orders</DDItem>
                  <DDItem icon={<CodeIcon size={16} />} onClick={() => toast('My Playgrounds — demo', 'info')}>My Playgrounds</DDItem>
                  <Link href="/settings"><DDItem icon={<SettingsIcon size={16} />}>Settings</DDItem></Link>
                  <div className="h-px bg-[var(--border)] mx-1.5 my-1" />
                  <Link href="/profile/Justinvcj"><DDItem icon={<UserIcon size={16} />}>Profile</DDItem></Link>
                  <DDItem icon={<LogoutIcon size={16} />} danger onClick={() => toast('Signed out', 'success')}>Sign Out</DDItem>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <style>{`
        @keyframes dd-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        .animate-dd-in { animation: dd-in 0.2s ease; }
      `}</style>
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-[var(--r)] text-sm font-medium transition-colors whitespace-nowrap ${
        active ? 'text-[var(--tx)]' : 'text-[var(--tx-1)] hover:text-[var(--tx)]'
      }`}
    >
      {children}
    </Link>
  );
}

function DDItem({
  icon,
  children,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--r)] text-[13px] text-[var(--tx-1)] cursor-pointer hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all w-full ${
        danger ? 'hover:!text-[var(--hard)]' : ''
      }`}
      onClick={onClick}
    >
      <span className="text-[var(--tx-2)] shrink-0">{icon}</span>
      {children}
    </button>
  );
}
