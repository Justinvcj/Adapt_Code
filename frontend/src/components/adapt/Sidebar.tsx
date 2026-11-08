"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, GitBranch, BookOpen, User, Settings } from 'lucide-react';
import { useProfile } from '@/lib/profile-store';

/**
 * Compact left-rail used on the Practice (/problems) page. Everything here
 * links to a real destination — nothing says "coming soon".
 */
export default function Sidebar({ active: _active }: { active?: string }) {
  const path = usePathname();
  const { profile } = useProfile();
  const handle = profile.display_name || 'me';
  const is = (p: string) => path === p || path?.startsWith(`${p}/`);

  return (
    <div className="sidebar">
      <Link className={`si ${is('/') ? 'act' : ''}`} href="/"><Home /> Home</Link>
      <Link className={`si ${is('/problems') ? 'act' : ''}`} href="/problems"><BookOpen /> Practice</Link>
      <Link className={`si ${is('/mastery') ? 'act' : ''}`} href="/mastery"><Layers /> Mastery</Link>
      <Link className={`si ${is('/graph') ? 'act' : ''}`} href="/graph"><GitBranch /> Concept graph</Link>
      <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />
      <Link className={`si ${is(`/profile/${handle}`) ? 'act' : ''}`} href={`/profile/${handle}`}><User /> Profile</Link>
      <Link className={`si ${is('/settings') ? 'act' : ''}`} href="/settings"><Settings /> Settings</Link>
    </div>
  );
}
