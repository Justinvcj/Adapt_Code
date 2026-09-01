'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { CalendarWidget } from '@/components/calendar-widget';
import { EditIcon, ExternalIcon, GithubIcon, StarIcon, TrophyIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';
import { USER, PROBLEMS, Problem } from '@/lib/data';

function DonutChart({ easy, med, hard, total }: { easy: number; med: number; hard: number; total: number }) {
  const r = 54, c = 2 * Math.PI * r;
  const eP = (easy / total) * c, mP = (med / total) * c, hP = (hard / total) * c;
  const eOff = 0, mOff = eP, hOff = eP + mP;
  return (
    <svg viewBox="0 0 140 140" className="w-[140px] h-[140px]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--easy)" strokeWidth="10" strokeDasharray={`${eP} ${c - eP}`} strokeDashoffset={-eOff} transform="rotate(-90 70 70)" strokeLinecap="round" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--med)" strokeWidth="10" strokeDasharray={`${mP} ${c - mP}`} strokeDashoffset={-mOff} transform="rotate(-90 70 70)" strokeLinecap="round" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--hard)" strokeWidth="10" strokeDasharray={`${hP} ${c - hP}`} strokeDashoffset={-hOff} transform="rotate(-90 70 70)" strokeLinecap="round" />
      <text x="70" y="66" textAnchor="middle" fill="var(--tx)" fontSize="22" fontWeight="700">{easy + med + hard}</text>
      <text x="70" y="82" textAnchor="middle" fill="var(--tx-2)" fontSize="11">/ {total}</text>
    </svg>
  );
}

function Heatmap() {
  const weeks = 52, days = 7;
  const cells: { x: number; y: number; level: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const seed = ((w * 7 + d) * 2654435761) >>> 0;
      const level = w > 40 ? (seed % 5) : w > 30 ? (seed % 4) : (seed % 3);
      cells.push({ x: w, y: d, level });
    }
  }
  const fills = ['var(--bg-hover)', 'rgba(39,166,68,0.2)', 'rgba(39,166,68,0.45)', 'rgba(39,166,68,0.7)', 'var(--solved)'];
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${weeks * 14 + 4} ${days * 14 + 4}`} className="w-full min-w-[700px]" style={{ maxHeight: 110 }}>
        {cells.map((c, i) => (
          <rect key={i} x={c.x * 14 + 2} y={c.y * 14 + 2} width="11" height="11" rx="2" fill={fills[c.level]} />
        ))}
      </svg>
    </div>
  );
}

function RightSidebar() {
  return (
    <>
      <CalendarWidget />
      <div className="bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] p-3 mt-3">
        <h5 className="text-[13px] font-semibold mb-2 flex items-center gap-1.5"><StarIcon size={14} /> Badges</h5>
        <div className="grid grid-cols-3 gap-2">
          {['🔥 50-Day', '⚡ Speed', '🧠 Hard x10', '🏆 Contest', '📚 100 Solved', '🎯 Daily'].map((b) => (
            <div key={b} className="flex flex-col items-center gap-1 p-2 rounded-[var(--r)] bg-[var(--bg-hover)] text-center">
              <span className="text-lg">{b.split(' ')[0]}</span>
              <span className="text-[10px] text-[var(--tx-2)] leading-tight">{b.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  const { toast } = useToastContext();
  const [tab, setTab] = useState<'overview' | 'submissions' | 'progress'>('overview');

  const easy = PROBLEMS.filter((p: Problem) => p.diff === 'Easy' && p.st === 'solved').length;
  const med = PROBLEMS.filter((p: Problem) => p.diff === 'Medium' && p.st === 'solved').length;
  const hard = PROBLEMS.filter((p: Problem) => p.diff === 'Hard' && p.st === 'solved').length;
  const totalE = PROBLEMS.filter((p: Problem) => p.diff === 'Easy').length;
  const totalM = PROBLEMS.filter((p: Problem) => p.diff === 'Medium').length;
  const totalH = PROBLEMS.filter((p: Problem) => p.diff === 'Hard').length;

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="px-5 py-5">
        {/* Profile header */}
        <div className="flex gap-5 items-start mb-6">
          <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[var(--blue)] to-[var(--accent)] flex items-center justify-center text-3xl font-bold text-white shrink-0">
            {USER.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold tracking-[-0.02em]">{USER.name}</h1>
              <button className="w-7 h-7 rounded-[var(--r)] flex items-center justify-center text-[var(--tx-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all" onClick={() => toast('Edit profile — demo', 'info')}><EditIcon size={14} /></button>
            </div>
            <p className="text-[13px] text-[var(--tx-2)] mb-2">@{USER.user} · Rank #{USER.rank.toLocaleString()}</p>
            <div className="flex gap-4 text-xs text-[var(--tx-2)]">
              <span className="flex items-center gap-1"><GithubIcon size={14} /> github.com/{USER.user}</span>
              <span className="flex items-center gap-1"><ExternalIcon size={14} /> adaptcode.io/{USER.user}</span>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            {[
              { n: USER.subs.toLocaleString(), l: 'Submissions' },
              { n: '142', l: 'Streak' },
              { n: `#${USER.rank.toLocaleString()}`, l: 'Rank' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-lg font-bold">{s.n}</div>
                <div className="text-xs text-[var(--tx-2)]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-[var(--border)] mb-5">
          {(['overview', 'submissions', 'progress'] as const).map((t) => (
            <button key={t} className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-all relative capitalize ${tab === t ? 'text-[var(--tx)]' : 'text-[var(--tx-2)] hover:text-[var(--tx-1)]'}`} onClick={() => setTab(t)}>
              {t}
              {tab === t && <span className="absolute bottom-[-1px] left-4 right-4 h-0.5 bg-[var(--tx)] rounded-t-sm" />}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <StatCard label="Easy" solved={easy} total={totalE} color="var(--easy)" />
              <StatCard label="Medium" solved={med} total={totalM} color="var(--med)" />
              <StatCard label="Hard" solved={hard} total={totalH} color="var(--hard)" />
            </div>

            {/* Donut + progress */}
            <div className="flex gap-5 items-center mb-6 p-4 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)]">
              <DonutChart easy={easy} med={med} hard={hard} total={PROBLEMS.length} />
              <div className="flex-1 space-y-3">
                <ProgressBar label="Easy" solved={easy} total={totalE} color="var(--easy)" />
                <ProgressBar label="Medium" solved={med} total={totalM} color="var(--med)" />
                <ProgressBar label="Hard" solved={hard} total={totalH} color="var(--hard)" />
              </div>
            </div>

            {/* Heatmap */}
            <div className="p-4 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] mb-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><TrophyIcon size={16} /> 487 submissions in the past year</h3>
              <Heatmap />
            </div>

            {/* Recent Activity */}
            <div className="p-4 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)]">
              <h3 className="text-sm font-semibold mb-3">Recent Submissions</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Problem', 'Result', 'Language', 'Runtime', 'When'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { p: 'Two Sum', r: 'Accepted', c: 'var(--solved)', l: 'Java', rt: '3 ms', t: '2 hours ago' },
                    { p: 'Add Two Numbers', r: 'Accepted', c: 'var(--solved)', l: 'Python', rt: '48 ms', t: '5 hours ago' },
                    { p: 'Longest Substring', r: 'Wrong Answer', c: 'var(--hard)', l: 'C++', rt: '—', t: '1 day ago' },
                    { p: 'Median of Arrays', r: 'Accepted', c: 'var(--solved)', l: 'Java', rt: '7 ms', t: '2 days ago' },
                    { p: 'Longest Palindrome', r: 'TLE', c: 'var(--med)', l: 'Python', rt: '—', t: '3 days ago' },
                  ].map((s, i) => (
                    <tr key={i} className="hover:bg-[var(--bg-hover)]">
                      <td className="px-3 py-2 text-[13px] border-b border-[rgba(255,255,255,0.03)]">{s.p}</td>
                      <td className="px-3 py-2 text-[13px] border-b border-[rgba(255,255,255,0.03)] font-medium" style={{ color: s.c }}>{s.r}</td>
                      <td className="px-3 py-2 text-[13px] text-[var(--tx-1)] border-b border-[rgba(255,255,255,0.03)]">{s.l}</td>
                      <td className="px-3 py-2 text-[13px] text-[var(--tx-1)] border-b border-[rgba(255,255,255,0.03)]">{s.rt}</td>
                      <td className="px-3 py-2 text-[13px] text-[var(--tx-2)] border-b border-[rgba(255,255,255,0.03)]">{s.t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'submissions' && (
          <div className="text-center py-12 text-[var(--tx-2)]">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">Full submission history — demo page</p>
          </div>
        )}

        {tab === 'progress' && (
          <div className="text-center py-12 text-[var(--tx-2)]">
            <p className="text-4xl mb-3">📈</p>
            <p className="text-sm">Progress analytics — demo page</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) {
  return (
    <div className="p-3 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)]">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
        <span className="text-xs text-[var(--tx-2)]">{solved}/{total}</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${total ? (solved / total * 100) : 0}%`, background: color }} />
      </div>
    </div>
  );
}

function ProgressBar({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color }}>{label}</span>
        <span className="text-[var(--tx-2)]">{solved}/{total}</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${total ? (solved / total * 100) : 0}%`, background: color }} />
      </div>
    </div>
  );
}
