'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { SearchIcon, SortIcon, FilterIcon, ShuffleIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';
import { PROBLEMS, TAGS, Problem } from '@/lib/data';
import { CalendarWidget } from '@/components/calendar-widget';

function RightSidebar() {
  const { toast } = useToastContext();
  return (
    <>
      <CalendarWidget />
      <div className="bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] p-3 mt-3">
        <h5 className="text-[13px] font-semibold mb-2 flex items-center justify-between">
          Trending Companies
          <span className="flex gap-1">
            <button className="text-[var(--tx-2)]" onClick={() => toast('Prev — demo', 'info')}>‹</button>
            <button className="text-[var(--tx-2)]" onClick={() => toast('Next — demo', 'info')}>›</button>
          </span>
        </h5>
        <input className="w-full px-2.5 py-[7px] rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-xs" placeholder="Search for a company..." onClick={() => toast('Company search — demo', 'info')} readOnly />
      </div>
    </>
  );
}

export default function ProblemsPage() {
  const { toast } = useToastContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filtered = PROBLEMS.filter((p) => {
    if (filter !== 'all' && p.diff.toLowerCase() !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const solved = PROBLEMS.filter((p) => p.st === 'solved').length;

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="px-5 py-3">
        {/* Tags row */}
        <div className="flex gap-2 flex-wrap py-4 border-b border-[var(--border)]">
          {TAGS.map((t) => (
            <span key={t.n} className="px-2.5 py-1 rounded-full bg-[var(--bg-hover)] text-xs text-[var(--tx-1)] cursor-pointer hover:bg-[var(--bg-active)] hover:text-[var(--tx)] transition-all whitespace-nowrap">
              {t.n} <span className="text-[var(--tx-2)] ml-1">{t.c}</span>
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-full text-xs text-[var(--blue)] cursor-pointer">Expand ▾</span>
        </div>

        {/* Category tabs */}
        <div className="flex gap-0.5 py-3 border-b border-[var(--border)] overflow-x-auto">
          {['All Topics', 'Algorithms', 'Database', 'Shell', 'Concurrency', 'JavaScript'].map((t, i) => (
            <span key={t} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium cursor-pointer whitespace-nowrap transition-all border ${i === 0 ? 'bg-[var(--bg-el)] text-[var(--tx)] border-[var(--border)]' : 'text-[var(--tx-2)] hover:text-[var(--tx-1)] border-transparent'}`} onClick={() => toast(`${t} — demo`, 'info')}>
              {t}
            </span>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 py-3">
          <div className="flex-1 relative max-w-[300px]">
            <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--tx-3)]" />
            <input type="text" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-[7px] px-2.5 pl-8 rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[13px] focus:border-[var(--blue)] transition-colors" />
          </div>
          <div className="flex gap-0.5">
            <IconBtn onClick={() => toast('Sort — demo', 'info')}><SortIcon size={16} /></IconBtn>
            <IconBtn onClick={() => toast('Filter — demo', 'info')}><FilterIcon size={16} /></IconBtn>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[13px] text-[var(--tx-2)]">
            <svg viewBox="0 0 20 20" width={16} height={16}><circle cx="10" cy="10" r="8" fill="none" stroke="var(--border)" strokeWidth={2} /><circle cx="10" cy="10" r="8" fill="none" stroke="var(--solved)" strokeWidth={2} strokeDasharray={`${(solved / 4033 * 50.3).toFixed(1)} 50.3`} transform="rotate(-90 10 10)" /></svg>
            {solved}/4033 Solved
          </div>
          <IconBtn onClick={() => toast('Random problem — demo', 'info')}><ShuffleIcon size={16} /></IconBtn>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)] w-9" />
              <th className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)] w-12">#</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)]">Title</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)] w-[90px]">Acceptance</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)] w-20">Difficulty</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)] w-[70px]">Frequency</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)] w-9" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <ProblemRow key={p.id} problem={p} />
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center gap-0.5 mt-4">
          <PgBtn active>1</PgBtn>
          <PgBtn>2</PgBtn>
          <PgBtn>3</PgBtn>
          <span className="min-w-8 h-8 flex items-center justify-center text-[13px] text-[var(--tx-2)]">…</span>
          <PgBtn>81</PgBtn>
        </div>
      </div>
    </AppLayout>
  );
}

function ProblemRow({ problem: p }: { problem: Problem }) {
  const dc = p.diff === 'Easy' ? 'e' : p.diff === 'Medium' ? 'm' : 'h';
  const diffClasses = { e: 'text-[var(--easy)] bg-[var(--easy-bg)]', m: 'text-[var(--med)] bg-[var(--med-bg)]', h: 'text-[var(--hard)] bg-[var(--hard-bg)]' };
  const freq = ((p.id * 7 + 13) % 80 + 10) / 100;

  return (
    <tr className="hover:bg-[var(--bg-hover)] group">
      <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-sm">
        {p.st === 'solved' && <span className="text-[var(--solved)] text-sm">✓</span>}
        {p.st === 'attempted' && <span className="text-[var(--med)] text-sm">○</span>}
      </td>
      <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px] text-[var(--tx-2)]">{p.id}.</td>
      <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px]">
        <Link href={p.id === 1 ? '/problem/two-sum' : '/problems'} className="text-[var(--tx)] hover:text-[var(--blue-h)] cursor-pointer transition-colors">
          {p.title}
        </Link>
      </td>
      <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px] text-[var(--tx-1)]">{p.acc}%</td>
      <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)]">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${diffClasses[dc]}`}>{p.diff}</span>
      </td>
      <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)]">
        <div className="w-[50px] h-2.5 bg-[rgba(255,255,255,0.06)] rounded-sm overflow-hidden inline-block align-middle">
          <div className="h-full bg-[var(--bg-sf)] rounded-sm" style={{ width: `${(freq * 100).toFixed(0)}%` }} />
        </div>
      </td>
      <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[var(--tx-3)] cursor-pointer text-sm">☆</td>
    </tr>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button className="w-[30px] h-[30px] rounded-[var(--r)] flex items-center justify-center text-[var(--tx-2)] cursor-pointer hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all" onClick={onClick}>
      {children}
    </button>
  );
}

function PgBtn({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`min-w-8 h-8 rounded-[var(--r)] flex items-center justify-center text-[13px] cursor-pointer transition-all ${active ? 'bg-[var(--bg-el)] text-[var(--tx)]' : 'text-[var(--tx-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)]'}`}>
      {children}
    </button>
  );
}
