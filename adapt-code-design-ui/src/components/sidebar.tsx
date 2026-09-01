'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LibraryIcon, CompassIcon, SearchIcon, GradCapIcon } from './icons';
import { useToastContext } from './toast-provider';

export function Sidebar() {
  const pathname = usePathname();
  const { toast } = useToastContext();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside className="w-[var(--side-w)] shrink-0 border-r border-[var(--border)] overflow-y-auto p-2 flex flex-col gap-0.5 max-md:hidden">
      <SideItem href="/" icon={<LibraryIcon size={18} />} active={isActive('/')}>Library</SideItem>
      <SideItem href="/explore" icon={<CompassIcon size={18} />} active={isActive('/explore')}>Quest</SideItem>
      <SideItem href="/problems" icon={<SearchIcon size={18} />} active={isActive('/problems')}>Explore</SideItem>
      <SideItem href="/interview" icon={<GradCapIcon size={18} />} active={isActive('/interview')}>Study Plan</SideItem>

      <div className="px-3 pt-2 pb-1 text-xs font-semibold text-[var(--tx-2)] flex items-center justify-between mt-2">
        My Lists
        <button className="text-sm text-[var(--tx-2)] cursor-pointer" onClick={() => toast('Create list — demo', 'info')}>+ ▾</button>
      </div>
      <SubItem icon="⭐">Favorite</SubItem>
      <SubItem icon="📋">array/string</SubItem>
      <SubItem icon="📋">001</SubItem>
      <SubItem icon="📋">PET 1</SubItem>

      <div className="px-3 pt-2 pb-1 text-xs font-semibold text-[var(--tx-2)] mt-2">Saved by me</div>
      <SubItem icon="🎨">Design</SubItem>
      <SubItem icon="📊">Array</SubItem>
    </aside>
  );
}

function SideItem({ href, icon, active, children }: { href: string; icon: React.ReactNode; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--r)] text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${
        active
          ? 'text-[var(--tx)] bg-[var(--bg-hover)]'
          : 'text-[var(--tx-1)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)]'
      }`}
    >
      <span className={active ? 'text-[var(--tx)]' : 'text-[var(--tx-2)]'}>{icon}</span>
      {children}
    </Link>
  );
}

function SubItem({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <button className="flex items-center gap-2 px-3 py-[5px] pl-5 rounded-[var(--r)] text-[13px] text-[var(--tx-2)] cursor-pointer hover:bg-[var(--bg-hover)] hover:text-[var(--tx-1)] transition-all text-left">
      <span className="text-sm w-5 text-center">{icon}</span>
      {children}
    </button>
  );
}
