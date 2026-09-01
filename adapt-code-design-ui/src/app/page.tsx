'use client';

import { AppLayout } from '@/components/app-layout';
import { TrophyIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';

function RightSidebar() {
  const { toast } = useToastContext();
  return (
    <>
      <div className="bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] p-4 mb-3">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><TrophyIcon size={16} /> AdaptCode Contest</h4>
        <p className="text-[13px] text-[var(--tx-2)] mb-3">Participate and win prizes.</p>
        <button
          className="px-4 py-1 rounded-[var(--r)] border border-[var(--solved)] text-[var(--solved)] text-[13px] font-medium hover:bg-[rgba(39,166,68,0.1)] transition-colors"
          onClick={() => toast('Contest — demo', 'info')}
        >
          Join Contest
        </button>
      </div>
      <div className="bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] p-4">
        <h4 className="text-sm font-semibold mb-2">💬 Discuss Now</h4>
        <p className="text-[13px] text-[var(--tx-2)]">Share interview questions.<br />Get solutions.</p>
      </div>
    </>
  );
}

export default function HomePage() {
  const { toast } = useToastContext();

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="max-w-[900px] mx-auto px-6 py-5">
        {[
          { title: 'Biweekly Contest 190', time: 'in 4 days' },
          { title: 'Weekly Contest 517', time: 'in 4 days' },
        ].map((c) => (
          <div key={c.title} className="flex gap-3 items-center py-4 border-b border-[var(--border)]">
            <div className="w-9 h-9 flex items-center justify-center text-[22px]">🏆</div>
            <div>
              <div className="text-xs text-[var(--tx-2)]">{c.time}</div>
              <div className="text-sm">
                Join our next Contest{' '}
                <button className="text-[var(--blue)] hover:underline cursor-pointer" onClick={() => toast('Contest — demo', 'info')}>{c.title}</button>
              </div>
            </div>
          </div>
        ))}

        <FeedItem icon="🔄" iconBg="var(--easy-bg)" time="9 days ago"
          title={<>AdaptCode posted 📌 <button className="text-[var(--blue)] hover:underline cursor-pointer">Back to School 2026 — Become our Campus Ambassador!</button></>}
          body="Hi AdaptCoders! 👋 Starting August 24, 2026, for a limited time, get together with your classmates and become an AdaptCode Campus Ambassador. Represent your college, host events, and..." />
        <FeedItem icon="📱" iconBg="rgba(94,106,210,0.15)" time="4 months ago"
          title={<>AdaptCode posted 📱 <button className="text-[var(--blue)] hover:underline cursor-pointer">AdaptCode at Your Fingertips</button></>}
          body="Introducing the AdaptCode mobile app, now available for smartphones and tablets. One problem a day keeps your reasoning in play. Jump in for quick practice, browse your collections, and..." />
        <FeedItem icon="👤" iconBg="var(--hard-bg)" time="an hour ago"
          title={<>oBo posted <span className="text-[var(--hard)]">3 AM !!</span></>} />
      </div>
    </AppLayout>
  );
}

function FeedItem({ icon, iconBg, time, title, body }: { icon: string; iconBg: string; time: string; title: React.ReactNode; body?: string }) {
  return (
    <div className="py-5 border-b border-[var(--border)]">
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: iconBg }}>{icon}</div>
        <div>
          <div className="text-xs text-[var(--tx-2)] mb-1">{time}</div>
          <div className="text-sm">{title}</div>
          {body && <div className="text-[13px] text-[var(--tx-1)] mt-1.5 leading-relaxed">{body}</div>}
        </div>
      </div>
    </div>
  );
}
