'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { SearchIcon, CommentIcon, ThumbUpIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';

const CATEGORIES = ['All', 'General', 'Interview', 'Algorithms', 'Career', 'Compensation'] as const;

const POSTS = [
  { id: 1, title: 'Google L5 Interview Experience — 4 rounds, got the offer!', author: 'techWizard', cat: 'Interview', time: '2h ago', replies: 42, likes: 156, tags: ['Google', 'System Design'] },
  { id: 2, title: 'Best approach to Dynamic Programming problems?', author: 'dpMaster', cat: 'Algorithms', time: '4h ago', replies: 28, likes: 89, tags: ['DP', 'Patterns'] },
  { id: 3, title: 'Is it worth grinding 500+ problems?', author: 'newbieCoder', cat: 'General', time: '6h ago', replies: 67, likes: 203, tags: ['Strategy'] },
  { id: 4, title: 'Meta E5 comp thread 2026 — share your numbers', author: 'anonPoster', cat: 'Compensation', time: '8h ago', replies: 134, likes: 312, tags: ['Meta', 'Salary'] },
  { id: 5, title: 'System Design: Rate Limiter — my detailed notes', author: 'sysDesigner', cat: 'Interview', time: '12h ago', replies: 56, likes: 178, tags: ['System Design'] },
  { id: 6, title: 'From 0 to 300 problems in 6 months — my journey', author: 'grindMode', cat: 'General', time: '1d ago', replies: 91, likes: 445, tags: ['Motivation'] },
  { id: 7, title: 'Sliding Window template that solves 90% of problems', author: 'patternPro', cat: 'Algorithms', time: '1d ago', replies: 73, likes: 267, tags: ['Sliding Window', 'Template'] },
  { id: 8, title: 'Career switch at 35 — worth learning DSA?', author: 'lateBloomer', cat: 'Career', time: '2d ago', replies: 108, likes: 389, tags: ['Career Change'] },
];

export default function DiscussPage() {
  const { toast } = useToastContext();
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = POSTS.filter((p) => {
    if (cat !== 'All' && p.cat !== cat) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="px-5 py-5 max-w-[900px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold tracking-[-0.02em] flex items-center gap-2"><CommentIcon size={22} /> Discuss</h1>
          <button className="px-4 py-2 rounded-[var(--r)] text-[13px] font-medium bg-[var(--blue)] text-white hover:bg-[var(--blue-h)] transition-colors" onClick={() => toast('New post — demo', 'info')}>New Post</button>
        </div>

        {/* Search + categories */}
        <div className="relative mb-4">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tx-3)]" />
          <input type="text" placeholder="Search discussions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-[9px] px-3 pl-9 rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm focus:border-[var(--blue)] transition-colors" />
        </div>

        <div className="flex gap-1 mb-5 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button key={c} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border ${cat === c ? 'bg-[var(--bg-el)] text-[var(--tx)] border-[var(--border)]' : 'text-[var(--tx-2)] hover:text-[var(--tx-1)] border-transparent'}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-1">
          {filtered.map((p) => (
            <div key={p.id} className="p-4 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--bg-el)] hover:border-[var(--border-h)] transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[13px] font-bold text-[var(--tx-1)] shrink-0">{p.author.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-semibold mb-1 hover:text-[var(--blue)] transition-colors">{p.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[var(--tx-2)]">
                    <span>@{p.author}</span>
                    <span>{p.time}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[11px]">{p.cat}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {p.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-[rgba(94,106,210,0.1)] text-[var(--blue)] text-[11px]">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--tx-2)] shrink-0">
                  <span className="flex items-center gap-1"><ThumbUpIcon size={14} /> {p.likes}</span>
                  <span className="flex items-center gap-1"><CommentIcon size={14} /> {p.replies}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
