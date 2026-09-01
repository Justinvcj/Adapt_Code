'use client';

import { AppLayout } from '@/components/app-layout';
import { CompassIcon, StarIcon, TrophyIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';

const STUDY_PLANS = [
  { title: 'Top Interview 150', desc: 'Must-do list for interview prep', count: 150, color: 'var(--blue)', emoji: '🎯' },
  { title: 'AdaptCode 75', desc: 'Best practice problems chosen by the community', count: 75, color: 'var(--solved)', emoji: '⚡' },
  { title: 'Dynamic Programming', desc: 'Master DP patterns from easy to hard', count: 45, color: 'var(--accent)', emoji: '🧩' },
  { title: 'Binary Search', desc: 'All binary search patterns explained', count: 32, color: 'var(--easy)', emoji: '🔍' },
  { title: 'Graph Theory', desc: 'BFS, DFS, shortest path, topological sort', count: 48, color: 'var(--med)', emoji: '🕸️' },
  { title: 'SQL 50', desc: 'Essential SQL questions for interviews', count: 50, color: 'var(--hard)', emoji: '🗄️' },
];

const TOPICS = [
  { name: 'Array', count: 1432, solved: 234 },
  { name: 'String', count: 678, solved: 89 },
  { name: 'Hash Table', count: 534, solved: 145 },
  { name: 'Dynamic Programming', count: 467, solved: 56 },
  { name: 'Math', count: 498, solved: 123 },
  { name: 'Sorting', count: 356, solved: 78 },
  { name: 'Greedy', count: 345, solved: 45 },
  { name: 'Tree', count: 234, solved: 67 },
  { name: 'Graph', count: 312, solved: 34 },
  { name: 'Binary Search', count: 267, solved: 89 },
  { name: 'Stack', count: 189, solved: 56 },
  { name: 'Linked List', count: 78, solved: 34 },
];

export default function ExplorePage() {
  const { toast } = useToastContext();

  return (
    <AppLayout>
      <div className="px-5 py-5 max-w-[1000px] mx-auto">
        <h1 className="text-xl font-bold tracking-[-0.02em] mb-2 flex items-center gap-2"><CompassIcon size={22} /> Explore</h1>
        <p className="text-sm text-[var(--tx-2)] mb-6">Discover study plans, topics, and curated problem sets</p>

        {/* Study Plans */}
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><StarIcon size={16} /> Study Plans</h2>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {STUDY_PLANS.map((p) => (
            <div key={p.title} className="p-4 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] cursor-pointer hover:border-[var(--border-h)] transition-all group" onClick={() => toast(`${p.title} — demo`, 'info')}>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <h3 className="text-[13px] font-semibold group-hover:text-[var(--blue)] transition-colors">{p.title}</h3>
                  <p className="text-xs text-[var(--tx-2)]">{p.count} problems</p>
                </div>
              </div>
              <p className="text-xs text-[var(--tx-2)] leading-relaxed">{p.desc}</p>
              <div className="mt-3 w-full h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.random() * 60 + 10}%`, background: p.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Topics */}
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><TrophyIcon size={16} /> Topics</h2>
        <div className="grid grid-cols-4 gap-2">
          {TOPICS.map((t) => {
            const pct = t.count ? (t.solved / t.count * 100) : 0;
            return (
              <div key={t.name} className="p-3 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-md)] cursor-pointer hover:border-[var(--border-h)] transition-all" onClick={() => toast(`${t.name} — demo`, 'info')}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-medium">{t.name}</span>
                  <span className="text-[11px] text-[var(--tx-2)]">{t.solved}/{t.count}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--solved)]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
