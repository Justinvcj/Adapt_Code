"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Edit, Play, Sparkles } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import ActivityRail from '@/components/adapt/ActivityRail';
import ConceptRow from '@/components/adapt/ConceptRow';
import Footer from '@/components/adapt/Footer';
import Avatar from '@/components/adapt/Avatar';
import EditProfileModal from '@/components/adapt/EditProfileModal';
import Onboarding from '@/components/adapt/Onboarding';
import { USER } from '@/components/adapt/data';
import { CONCEPTS, CONCEPT_BY_ID } from '@/data/concepts';
import { useProfile } from '@/lib/profile-store';
import { useLiveMastery, useLiveStats, pickWeakestUnlocked } from '@/lib/live-data';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const [editOpen, setEditOpen] = useState(false);

  // Live mastery + stats; both fall back to the mock when the API is offline
  // or the user is anonymous so the hero never shows NaN.
  const { mastery } = useLiveMastery();
  const { stats } = useLiveStats();

  const totalSolved = stats?.total_problems_solved
    ?? Object.values(mastery).reduce((a, b) => a + b.solved, 0);
  // Prefer the mastery-derived average over stats.avg_mastery: the latter is
  // 0 for a new account (mastery_scores table empty) but the per-concept
  // rings below still render P(L0) = 0.3, which would make the hero's "0%"
  // contradict the rings. Keep both numbers consistent by deriving from the
  // same vector.
  const avgMastery = Object.values(mastery).reduce((a, b) => a + b.mastery, 0) / 12;
  const unlockedCount = Object.values(mastery).filter((m) => m.unlocked).length;
  const streakValue = stats?.current_streak ?? USER.streak;

  const weakestUnlockedId = pickWeakestUnlocked(mastery);
  const weakestUnlocked = CONCEPT_BY_ID[weakestUnlockedId] ?? CONCEPTS[0];

  return (
    <>
      <Navbar active="home" />
      <div className="land">
        <main className="land-main">
          <div className="land-left">
            <section className="hero">
              <Avatar
                name={profile.name}
                dataUri={profile.avatar_data_uri}
                editable
                size={92}
                onChange={(uri) => update({ avatar_data_uri: uri })}
              />
              <div className="hero-info">
                <div className="hero-name">{profile.name}</div>
                <div className="hero-sub">
                  <span>@{profile.display_name}</span>
                  <span className="pill">Rank #{USER.rank.toLocaleString()}</span>
                  <span className="pill learn">
                    <Sparkles size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                    Up next · {weakestUnlocked.title}
                  </span>
                </div>
                {profile.bio && <div className="hero-bio">{profile.bio}</div>}
                <div className="hero-stats">
                  <div className="hero-stat"><b>{totalSolved}</b><span>Solved</span></div>
                  <div className="hero-stat"><b>{(avgMastery * 100).toFixed(0)}%</b><span>Mastery</span></div>
                  <div className="hero-stat"><b>{unlockedCount}/12</b><span>Unlocked</span></div>
                  <div className="hero-stat"><b>{streakValue}</b><span>Day streak</span></div>
                </div>
              </div>
              <div className="hero-cta">
                <button className="btn btn-ghost" onClick={() => setEditOpen(true)}>
                  <Edit size={14} /> Edit
                </button>
                <button className="btn btn-learn" onClick={() => router.push('/learn')}>
                  <Play size={14} fill="currentColor" /> Learn
                </button>
              </div>
            </section>

            <section className="mastery-panel">
              <div className="section-h">
                <div>
                  <h2>Your twelve concepts</h2>
                  <p className="section-sub">{unlockedCount} unlocked · scroll to see all</p>
                </div>
                <Link href="/mastery" className="section-h-link">Full catalogue <span>→</span></Link>
              </div>
              <div className="crow-list-wrap">
                {CONCEPTS.map((c) => {
                  const m = mastery[c.id];
                  const isRecommended = c.id === weakestUnlocked.id;
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
                      recommended={isRecommended}
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
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <Onboarding />
    </>
  );
}
