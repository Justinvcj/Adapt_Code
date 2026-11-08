"use client";
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import EditProfileModal from '@/components/adapt/EditProfileModal';
import Onboarding from '@/components/adapt/Onboarding';
import { CONCEPTS, CONCEPT_BY_ID } from '@/data/concepts';
import { useProfile } from '@/lib/profile-store';
import {
  useLiveMastery,
  useLiveStats,
  useLiveHeatmap,
  pickWeakestUnlocked,
} from '@/lib/live-data';

export default function Home() {
  const { profile } = useProfile();
  const [editOpen, setEditOpen] = useState(false);

  const { mastery } = useLiveMastery();
  const { stats } = useLiveStats();
  const { entries } = useLiveHeatmap();

  const totalSolved =
    stats?.total_problems_solved ??
    Object.values(mastery).reduce((a, b) => a + b.solved, 0);
  const avgMastery =
    Object.values(mastery).reduce((a, b) => a + b.mastery, 0) / 12;
  const unlockedCount = Object.values(mastery).filter((m) => m.unlocked).length;
  const streakValue = stats?.current_streak ?? 0;
  const activeDays = entries.filter((e) => e.count > 0).length;

  const weakestId = pickWeakestUnlocked(mastery);
  const next = CONCEPT_BY_ID[weakestId] ?? CONCEPTS[0];

  const firstName = (profile.name || 'friend').split(' ')[0];
  const hour = new Date().getHours();
  const greet =
    hour < 5 ? 'Still up' :
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' : 'Good evening';

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short',
  });

  return (
    <>
      <Navbar active="home" />
      <main className="hp">
        <section className="hp-hero">
          <div className="hp-hero-meta">
            <span className="hp-mono">{dateStr}</span>
            <span className="hp-hero-sep" aria-hidden />
            <span className="hp-mono">Day {Math.max(1, activeDays)}</span>
          </div>

          <h1 className="hp-hero-h">{greet}, {firstName}.</h1>

          <p className="hp-hero-p">
            You&apos;ve solved{' '}
            <span className="hp-stat">{totalSolved}</span>{' '}
            problems. Mastery sits at{' '}
            <span className="hp-stat">{Math.round(avgMastery * 100)}%</span>{' '}
            across{' '}
            <span className="hp-stat">{unlockedCount}</span>{' '}
            of twelve concepts. {next.title} is where you have the most to gain next.
          </p>

          <div className="hp-hero-act">
            <Link href={`/mastery/${next.id}`} className="hp-cta">
              <span>Continue in {next.title.toLowerCase()}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <button className="hp-ghost" onClick={() => setEditOpen(true)}>
              Edit profile
            </button>
          </div>
        </section>

        <hr className="hp-rule" />

        <section className="hp-sec">
          <header className="hp-sec-head">
            <h2>The twelve</h2>
            <Link href="/mastery" className="hp-sec-link">
              Full catalogue
            </Link>
          </header>

          <ol className="hp-list">
            {CONCEPTS.map((c, i) => {
              const m = mastery[c.id];
              const pct = Math.round(m.mastery * 100);
              const isNext = c.id === next.id;
              const isLocked = !m.unlocked;
              const Icon = c.icon;
              return (
                <li
                  key={c.id}
                  className={[
                    'hp-row',
                    isLocked ? 'is-locked' : '',
                    isNext ? 'is-next' : '',
                  ].join(' ')}
                >
                  <Link
                    href={isLocked ? '/mastery' : `/mastery/${c.id}`}
                    className="hp-row-link"
                  >
                    <span className="hp-row-n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="hp-row-ic" aria-hidden>
                      <Icon size={15} strokeWidth={1.75} />
                    </span>
                    <span className="hp-row-main">
                      <span className="hp-row-name">{c.title}</span>
                      <span className="hp-row-gist">{c.short.toLowerCase()}</span>
                    </span>
                    <span className="hp-row-rail" aria-hidden>
                      <span
                        className="hp-row-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="hp-row-pct">
                      {isLocked ? '—' : pct}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <hr className="hp-rule" />

        <section className="hp-sec">
          <header className="hp-sec-head">
            <h2>Submissions</h2>
            <span className="hp-sec-meta hp-mono">
              {entries.reduce((a, b) => a + b.count, 0)} in the last year · {streakValue} day streak
            </span>
          </header>
          <HeatmapStrip entries={entries} />
        </section>

        <Footer />
      </main>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <Onboarding />
    </>
  );
}

/**
 * Lightweight heatmap rendered inline. 53 columns × 7 rows of 10px cells,
 * level by cell.count / maxCount using the same quintile buckets the old
 * card used so the eye reads continuity.
 */
function HeatmapStrip({ entries }: { entries: { date: string; count: number }[] }) {
  // Build 371 days back; map date → count
  const byDate = new Map(entries.map((e) => [e.date, e.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: { date: Date; count: number }[] = [];
  for (let i = 371 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    cells.push({ date: d, count: byDate.get(k) ?? 0 });
  }

  const max = Math.max(1, ...cells.map((c) => c.count));
  const level = (n: number) =>
    n === 0 ? 0 :
    n / max > 0.75 ? 4 :
    n / max > 0.50 ? 3 :
    n / max > 0.25 ? 2 : 1;

  // Chunk into weeks (columns)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="hp-hm">
      <div className="hp-hm-grid" role="img" aria-label="Submission activity for the last year">
        {weeks.map((week, wi) => (
          <div key={wi} className="hp-hm-week">
            {week.map((cell, di) => (
              <span
                key={di}
                className={`hp-hm-cell lv-${level(cell.count)}`}
                title={`${cell.date.toDateString()} · ${cell.count}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="hp-hm-legend">
        <span>Less</span>
        <span className="hp-hm-cell lv-0" />
        <span className="hp-hm-cell lv-1" />
        <span className="hp-hm-cell lv-2" />
        <span className="hp-hm-cell lv-3" />
        <span className="hp-hm-cell lv-4" />
        <span>More</span>
      </div>
    </div>
  );
}
