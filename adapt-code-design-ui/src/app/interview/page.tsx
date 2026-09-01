'use client';

import { AppLayout } from '@/components/app-layout';
import { GradCapIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';

const COMPANIES = [
  { name: 'Google', problems: 892, emoji: '🔍' },
  { name: 'Meta', problems: 756, emoji: '🌐' },
  { name: 'Amazon', problems: 834, emoji: '📦' },
  { name: 'Apple', problems: 423, emoji: '🍎' },
  { name: 'Microsoft', problems: 612, emoji: '🪟' },
  { name: 'Netflix', problems: 178, emoji: '🎬' },
  { name: 'Bloomberg', problems: 534, emoji: '💹' },
  { name: 'Uber', problems: 345, emoji: '🚗' },
];

const TRACKS = [
  { title: 'Data Structures', desc: 'Arrays, linked lists, trees, graphs, and more', count: 60, difficulty: 'Mixed', emoji: '🏗️' },
  { title: 'Algorithms', desc: 'Sorting, searching, divide & conquer, greedy', count: 50, difficulty: 'Medium', emoji: '⚙️' },
  { title: 'System Design', desc: 'Design large-scale distributed systems', count: 25, difficulty: 'Hard', emoji: '🏛️' },
  { title: 'Object-Oriented Design', desc: 'Design patterns, SOLID principles, UML', count: 20, difficulty: 'Medium', emoji: '🧱' },
  { title: 'Behavioral', desc: 'Common behavioral questions and frameworks', count: 30, difficulty: 'N/A', emoji: '🗣️' },
  { title: 'SQL & Databases', desc: 'Joins, subqueries, window functions, indexing', count: 40, difficulty: 'Mixed', emoji: '🗄️' },
];

export default function InterviewPage() {
  const { toast } = useToastContext();

  return (
    <AppLayout>
      <div className="px-5 py-5 max-w-[1000px] mx-auto">
        <h1 className="text-xl font-bold tracking-[-0.02em] mb-2 flex items-center gap-2"><GradCapIcon size={22} /> Interview Prep</h1>
        <p className="text-sm text-[var(--tx-2)] mb-6">Prepare for technical interviews at top companies</p>

        {/* Company tags */}
        <h2 className="text-sm font-semibold mb-3">Top Companies</h2>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {COMPANIES.map((c) => (
            <div key={c.name} className="p-3 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-md)] cursor-pointer hover:border-[var(--border-h)] transition-all flex items-center gap-2.5" onClick={() => toast(`${c.name} problems — demo`, 'info')}>
              <span className="text-xl">{c.emoji}</span>
              <div>
                <div className="text-[13px] font-medium">{c.name}</div>
                <div className="text-[11px] text-[var(--tx-2)]">{c.problems} problems</div>
              </div>
            </div>
          ))}
        </div>

        {/* Interview tracks */}
        <h2 className="text-sm font-semibold mb-3">Interview Tracks</h2>
        <div className="grid grid-cols-2 gap-3">
          {TRACKS.map((t) => (
            <div key={t.title} className="p-4 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] cursor-pointer hover:border-[var(--border-h)] transition-all" onClick={() => toast(`${t.title} — demo`, 'info')}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <h3 className="text-sm font-semibold">{t.title}</h3>
                  <p className="text-xs text-[var(--tx-2)]">{t.count} problems · {t.difficulty}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--tx-2)] leading-relaxed">{t.desc}</p>
              <button className="mt-3 px-3 py-1.5 rounded-[var(--r)] text-xs font-medium text-[var(--blue)] border border-[var(--blue)] hover:bg-[rgba(94,106,210,0.1)] transition-colors">Start Track →</button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
