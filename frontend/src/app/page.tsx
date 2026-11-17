"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Play, Route } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import ActivityRail from '@/components/adapt/ActivityRail';
import ConceptRow from '@/components/adapt/ConceptRow';
import Footer from '@/components/adapt/Footer';
import Onboarding from '@/components/adapt/Onboarding';
import { CONCEPTS, CONCEPT_BY_ID } from '@/data/concepts';
import { useProfile } from '@/lib/profile-store';
import { useAuth } from '@/lib/auth-context';
import { useLiveMastery, useLiveStats, pickWeakestUnlocked } from '@/lib/live-data';

// A concept counts as learned at the same threshold the backend uses to
// unlock what follows it (MASTERY_THRESHOLD in services/prerequisites.py).
const LEARNED = 0.85;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Today — the signed-in home page.
 *
 * Everything shown here is derived from the live mastery vector and stats
 * (with the usual offline fallback inside the hooks). The page deliberately
 * shows only what the backend can back up: the concept that is next and why,
 * real counts, and the concept list. It does not name a specific next problem,
 * because that is chosen by `/learn` at the moment the learner starts.
 */
export default function TodayPage() {
  const router = useRouter();
  const { status, user } = useAuth();
  const { profile } = useProfile();
  // Hooks run unconditionally, before the auth early-return below.
  const { mastery } = useLiveMastery();
  const { stats } = useLiveStats();

  // Anonymous visitors are sent to sign in and returned here afterwards.
  useEffect(() => {
    if (status === 'anonymous') router.replace('/login?next=/');
  }, [status, router]);
  if (status === 'loading' || status === 'anonymous') {
    return <div style={{ minHeight: '100dvh', background: 'var(--bg)' }} />;
  }

  const displayName = user?.display_name || profile.name || user?.email?.split('@')[0] || 'Learner';
  const firstName = displayName.split(/\s+/)[0];

  const entries = CONCEPTS.map((c) => ({ c, m: mastery[c.id] }));
  const learnedCount = entries.filter((e) => e.m.unlocked && e.m.mastery >= LEARNED).length;
  const inProgress = entries
    .filter((e) => e.m.unlocked && e.m.mastery < LEARNED)
    .sort((a, b) => a.m.mastery - b.m.mastery);
  const totalSolved = stats?.total_problems_solved
    ?? Object.values(mastery).reduce((a, b) => a + b.solved, 0);
  // Only trust the real backend streak; never fabricate one.
  const streak = stats?.current_streak ?? 0;

  const nextId = pickWeakestUnlocked(mastery);
  const next = CONCEPT_BY_ID[nextId] ?? CONCEPTS[0];
  const nextM = mastery[next.id];
  const nextPct = Math.round((nextM?.mastery ?? 0) * 100);
  // What learning this concept opens — real edges from the prerequisite graph.
  const opens = CONCEPTS.filter((c) => c.prereqs.includes(next.id) && !mastery[c.id]?.unlocked);
  const NextIcon = next.icon;

  const why = inProgress.length <= 1
    ? `${next.title} is the concept you have open right now, at ${nextPct}%.`
    : `${next.title} is the weakest of your ${inProgress.length} open concepts, at ${nextPct}%.`;
  const opensLine = opens.length
    ? ` Learning it opens ${opens.map((c) => c.title).join(' and ')}.`
    : '';

  return (
    <>
      <Navbar active="home" />
      <div className="land">
        <main className="land-main">
          <div className="land-left">
            <header className="today-head ac-rise">
              <h1>{greeting()}, {firstName}</h1>
              <p>
                {inProgress.length === 0
                  ? 'Every open concept is learned. Review keeps them that way.'
                  : `${inProgress.length} ${inProgress.length === 1 ? 'concept' : 'concepts'} in progress.`}
              </p>
            </header>

            <section className="ac-stage ac-rise" style={{ ['--i' as string]: 1 }}>
              <span className="ac-stage-label">Next up</span>
              <h2 className="ac-stage-title">
                <span className="ac-stage-icon"><NextIcon size={22} strokeWidth={1.8} /></span>
                {next.title}
              </h2>
              <p className="ac-stage-sub">{next.short}</p>

              <div className="ac-stage-meter" role="img" aria-label={`${next.title} mastery ${nextPct} percent`}>
                <div className="ac-meter"><span style={{ width: `${nextPct}%` }} /></div>
                <b>{nextPct}%</b>
              </div>

              <div className="ac-stage-why">
                <Route size={18} />
                <p>{why}{opensLine}</p>
              </div>

              <div className="ac-stage-actions">
                <button className="btn btn-primary ac-btn-lg" onClick={() => router.push('/learn')}>
                  <Play size={15} fill="currentColor" /> Start practising
                </button>
                <Link className="btn ac-btn-quiet ac-btn-lg" href={`/mastery/${next.id}`}>See this concept</Link>
              </div>

              <div className="ac-stats">
                <div><b>{learnedCount}<small> of 12</small></b><span>concepts learned</span></div>
                <div><b>{totalSolved}</b><span>problems solved</span></div>
                <div><b>{streak}</b><span>day streak</span></div>
              </div>
            </section>

            <section className="mastery-panel ac-rise" style={{ ['--i' as string]: 2 }}>
              <div className="section-h">
                <div>
                  <h2>Your twelve concepts</h2>
                  <p className="section-sub">{learnedCount} learned, {inProgress.length} in progress</p>
                </div>
                <Link href="/graph" className="section-h-link">See the map</Link>
              </div>
              <div className="crow-list-wrap">
                {CONCEPTS.map((c) => {
                  const m = mastery[c.id];
                  const blockedBy = c.prereqs
                    .filter((p) => (mastery[p]?.mastery ?? 0) < 0.5)
                    .map((p) => CONCEPT_BY_ID[p].title)
                    .join(' & ');
                  return (
                    <ConceptRow
                      key={c.id}
                      concept={c}
                      mastery={m}
                      unlockBlockedBy={blockedBy || undefined}
                      recommended={c.id === next.id}
                    />
                  );
                })}
              </div>
            </section>
          </div>

          <ActivityRail />
        </main>
        <Footer />
      </div>
      <Onboarding />
    </>
  );
}
