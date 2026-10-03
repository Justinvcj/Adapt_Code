"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Edit, Play, Sparkles } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import Calendar from '@/components/adapt/Calendar';
import GlassNode from '@/components/adapt/GlassNode';
import SubmissionHeatmap from '@/components/adapt/SubmissionHeatmap';
import Footer from '@/components/adapt/Footer';
import Avatar from '@/components/adapt/Avatar';
import EditProfileModal from '@/components/adapt/EditProfileModal';
import Onboarding from '@/components/adapt/Onboarding';
import { USER } from '@/components/adapt/data';
import { CONCEPTS, MOCK_MASTERY, CONCEPT_BY_ID } from '@/data/concepts';
import { useProfile } from '@/lib/profile-store';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const [editOpen, setEditOpen] = useState(false);

  const totalSolved = Object.values(MOCK_MASTERY).reduce((a, b) => a + b.solved, 0);
  const avgMastery = Object.values(MOCK_MASTERY).reduce((a, b) => a + b.mastery, 0) / 12;
  const unlockedCount = Object.values(MOCK_MASTERY).filter((m) => m.unlocked).length;

  const weakestUnlocked = CONCEPTS
    .filter((c) => MOCK_MASTERY[c.id].unlocked)
    .sort((a, b) => MOCK_MASTERY[a.id].mastery - MOCK_MASTERY[b.id].mastery)[0];

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
                  <div className="hero-stat"><b>{USER.streak}</b><span>Day streak</span></div>
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
                  <h2>Your 12 concepts</h2>
                </div>
                <Link href="/mastery">View all →</Link>
              </div>
              <div className="mastery-grid">
                {CONCEPTS.map((c) => {
                  const m = MOCK_MASTERY[c.id];
                  const isRecommended = c.id === weakestUnlocked.id;
                  // Unlock progress for locked nodes = avg mastery of prereqs against the 0.5 threshold
                  const unlockProgress = m.unlocked ? 0
                    : c.prereqs.length === 0 ? 0
                    : Math.min(1, c.prereqs.reduce((a, p) => a + (MOCK_MASTERY[p]?.mastery ?? 0), 0) / c.prereqs.length / 0.5);
                  return (
                    <GlassNode
                      key={c.id}
                      Icon={c.icon}
                      title={c.title}
                      mastery={m.mastery}
                      solved={m.solved}
                      unlocked={m.unlocked}
                      recommended={isRecommended}
                      unlockProgress={unlockProgress}
                      size={180}
                      onClick={() => m.unlocked
                        ? router.push(`/mastery#${c.id}`)
                        : toast(`Unlock after reaching 50 % in ${c.prereqs.map((p) => CONCEPT_BY_ID[p].title).join(' & ')}`)}
                    />
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="land-right">
            <Calendar />
            <SubmissionHeatmap />
          </aside>
        </main>
        <Footer />
      </div>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <Onboarding />
    </>
  );
}
