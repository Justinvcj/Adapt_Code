'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { BellIcon, CheckIcon } from '@/components/icons';
import { useToastContext } from '@/components/toast-provider';

const NOTIFICATIONS = [
  { id: 1, type: 'contest', title: 'Weekly Contest 517 starts in 4 days', time: '2 hours ago', read: false, emoji: '🏆' },
  { id: 2, type: 'reply', title: 'techWizard replied to your solution on "Two Sum"', time: '5 hours ago', read: false, emoji: '💬' },
  { id: 3, type: 'streak', title: 'Amazing! You\'ve maintained a 142-day streak!', time: '1 day ago', read: false, emoji: '🔥' },
  { id: 4, type: 'badge', title: 'You earned the "100 Solved" badge!', time: '2 days ago', read: true, emoji: '🏅' },
  { id: 5, type: 'contest', title: 'Biweekly Contest 189 results: Rank #127', time: '3 days ago', read: true, emoji: '📊' },
  { id: 6, type: 'system', title: 'New feature: Interview Prep tracks are now live', time: '5 days ago', read: true, emoji: '🚀' },
  { id: 7, type: 'reply', title: 'dpMaster upvoted your solution on "Longest Substring"', time: '1 week ago', read: true, emoji: '👍' },
  { id: 8, type: 'challenge', title: 'Daily Challenge: "Merge Intervals" is today\'s problem', time: '1 week ago', read: true, emoji: '🎯' },
];

export default function NotificationsPage() {
  const { toast } = useToastContext();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const displayed = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast('All marked as read', 'success');
  }

  return (
    <AppLayout>
      <div className="px-5 py-5 max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold tracking-[-0.02em] flex items-center gap-2"><BellIcon size={22} /> Notifications</h1>
          <div className="flex items-center gap-2">
            <div className="flex rounded-[var(--r)] border border-[var(--border)] overflow-hidden">
              {(['all', 'unread'] as const).map((f) => (
                <button key={f} className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-[var(--bg-el)] text-[var(--tx)]' : 'text-[var(--tx-2)] hover:bg-[var(--bg-hover)]'}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <button className="px-3 py-1.5 rounded-[var(--r)] text-xs font-medium text-[var(--blue)] hover:bg-[rgba(94,106,210,0.1)] transition-colors flex items-center gap-1" onClick={markAllRead}><CheckIcon size={14} /> Mark all read</button>
          </div>
        </div>

        <div className="space-y-1">
          {displayed.map((n) => (
            <div key={n.id} className={`p-4 rounded-[var(--r-md)] border transition-colors cursor-pointer ${n.read ? 'border-[var(--border)] bg-[var(--bg-el)] opacity-70' : 'border-[var(--border-h)] bg-[var(--bg-el)]'}`} onClick={() => { setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x)); }}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{n.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-relaxed ${n.read ? 'text-[var(--tx-2)]' : 'text-[var(--tx)] font-medium'}`}>{n.title}</p>
                  <span className="text-xs text-[var(--tx-3)] mt-1 block">{n.time}</span>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--blue)] shrink-0 mt-1.5" />}
              </div>
            </div>
          ))}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-sm text-[var(--tx-2)]">No unread notifications</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
