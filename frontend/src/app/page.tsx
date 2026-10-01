"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Play, Sparkles } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import Calendar from '@/components/adapt/Calendar';
import GlassNode from '@/components/adapt/GlassNode';
import SubmissionHeatmap from '@/components/adapt/SubmissionHeatmap';
import Footer from '@/components/adapt/Footer';
import { USER } from '@/components/adapt/data';
import { CONCEPTS, MOCK_MASTERY } from '@/data/concepts';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const router = useRouter();

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
              <div className="hero-ava" onClick={() => toast('Avatar upload — Phase 4')}>JV</div>
              <div className="hero-info">
                <div className="hero-name">{USER.name}</div>
                <div className="hero-sub">
                  <span>@{USER.user}</span>
                  <span className="pill">Rank #{USER.rank.toLocaleString()}</span>
                  <span className="pill learn">
                    <Sparkles size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                    Learning: {weakestUnlocked.title}
                  </span>
                </div>
                <div className="hero-stats">
                  <div className="hero-stat"><b>{totalSolved}</b><span>Solved</span></div>
                  <div className="hero-stat"><b>{(avgMastery * 100).toFixed(0)}%</b><span>Mastery</span></div>
                  <div className="hero-stat"><b>{unlockedCount}/12</b><span>Unlocked</span></div>
                  <div className="hero-stat"><b>{USER.streak}</b><span>Day streak</span></div>
                </div>
              </div>
              <div className="hero-cta">
                <button className="btn btn-ghost" onClick={() => toast('Edit profile — Phase 4')}>
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
                  return (
                    <GlassNode
                      key={c.id}
                      Icon={c.icon}
                      title={c.title}
                      mastery={m.mastery}
                      solved={m.solved}
                      unlocked={m.unlocked}
                      size={150}
                      onClick={() => m.unlocked
                        ? router.push(`/mastery#${c.id}`)
                        : toast('Locked — complete prerequisites first')}
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
    </>
  );
}
