'use client';

import { AppLayout } from '@/components/app-layout';
import { TrophyIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';
import { CalendarWidget } from '@/components/calendar-widget';

function RightSidebar() {
  return (
    <>
      <CalendarWidget />
      <div className="bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] p-3 mt-3">
        <h5 className="text-[13px] font-semibold mb-2 flex items-center gap-1.5"><TrophyIcon size={14} /> Your Stats</h5>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between"><span className="text-[var(--tx-2)]">Contests</span><span>24</span></div>
          <div className="flex justify-between"><span className="text-[var(--tx-2)]">Best Rank</span><span className="text-[var(--solved)]">#127</span></div>
          <div className="flex justify-between"><span className="text-[var(--tx-2)]">Rating</span><span>1,847</span></div>
        </div>
      </div>
    </>
  );
}

export default function ContestsPage() {
  const { toast } = useToastContext();

  const upcoming = [
    { title: 'Biweekly Contest 190', date: 'Sep 2, 2026', time: '8:00 PM IST', duration: '1.5 hours', participants: '12,341' },
    { title: 'Weekly Contest 517', date: 'Sep 6, 2026', time: '8:00 AM IST', duration: '1.5 hours', participants: '18,562' },
    { title: 'Biweekly Contest 191', date: 'Sep 16, 2026', time: '8:00 PM IST', duration: '1.5 hours', participants: '—' },
  ];

  const past = [
    { title: 'Weekly Contest 516', date: 'Aug 23, 2026', rank: '#342', solved: '3/4', rating: '+18' },
    { title: 'Biweekly Contest 189', date: 'Aug 19, 2026', rank: '#127', solved: '4/4', rating: '+45' },
    { title: 'Weekly Contest 515', date: 'Aug 16, 2026', rank: '#891', solved: '2/4', rating: '-12' },
    { title: 'Weekly Contest 514', date: 'Aug 9, 2026', rank: '#456', solved: '3/4', rating: '+22' },
  ];

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="px-5 py-5">
        <h1 className="text-xl font-bold tracking-[-0.02em] mb-5 flex items-center gap-2"><TrophyIcon size={22} /> Contests</h1>

        {/* Upcoming */}
        <h2 className="text-sm font-semibold mb-3 text-[var(--tx-1)]">Upcoming Contests</h2>
        <div className="grid gap-3 mb-8">
          {upcoming.map((c) => (
            <div key={c.title} className="p-4 bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold mb-1">{c.title}</div>
                <div className="text-xs text-[var(--tx-2)]">{c.date} · {c.time} · {c.duration}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[var(--tx-2)]">{c.participants} registered</span>
                <button className="px-4 py-2 rounded-[var(--r)] text-[13px] font-medium border border-[var(--solved)] text-[var(--solved)] hover:bg-[rgba(39,166,68,0.1)] transition-colors" onClick={() => toast(`Registered for ${c.title}`, 'success')}>Register</button>
              </div>
            </div>
          ))}
        </div>

        {/* Past */}
        <h2 className="text-sm font-semibold mb-3 text-[var(--tx-1)]">Past Contests</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Contest', 'Date', 'Rank', 'Solved', 'Rating Change'].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {past.map((c) => (
              <tr key={c.title} className="hover:bg-[var(--bg-hover)]">
                <td className="px-3 py-3 text-[13px] border-b border-[rgba(255,255,255,0.03)] font-medium">{c.title}</td>
                <td className="px-3 py-3 text-[13px] text-[var(--tx-1)] border-b border-[rgba(255,255,255,0.03)]">{c.date}</td>
                <td className="px-3 py-3 text-[13px] text-[var(--blue)] border-b border-[rgba(255,255,255,0.03)] font-medium">{c.rank}</td>
                <td className="px-3 py-3 text-[13px] text-[var(--tx-1)] border-b border-[rgba(255,255,255,0.03)]">{c.solved}</td>
                <td className={`px-3 py-3 text-[13px] border-b border-[rgba(255,255,255,0.03)] font-medium ${c.rating.startsWith('+') ? 'text-[var(--solved)]' : 'text-[var(--hard)]'}`}>{c.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
