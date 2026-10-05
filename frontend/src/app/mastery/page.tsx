"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import { CONCEPTS, MOCK_MASTERY, CONCEPT_BY_ID, type ConceptId } from '@/data/concepts';
import { masteryAPI, API_ENABLED } from '@/lib/api';
import toast from 'react-hot-toast';

type MasteryMap = Record<string, { mastery: number; solved: number; unlocked: boolean }>;

export default function MasteryPage() {
  const router = useRouter();
  const [mastery, setMastery] = useState<MasteryMap>(MOCK_MASTERY as MasteryMap);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!API_ENABLED) return;
    (async () => {
      try {
        const res = await masteryAPI.list();
        const next: MasteryMap = {};
        for (const row of res.data) {
          next[row.concept_tag] = {
            mastery: row.mastery_probability,
            solved: row.problems_solved,
            unlocked: row.is_unlocked,
          };
        }
        // Keep mocks for any concept the backend didn't return (shouldn't happen,
        // but survives partial responses without a blank grid).
        for (const c of CONCEPTS) if (!next[c.id]) next[c.id] = MOCK_MASTERY[c.id as ConceptId];
        setMastery(next);
        setIsLive(true);
      } catch {
        // keep mock fallback
      }
    })();
  }, []);

  const unlockedCount = useMemo(() => Object.values(mastery).filter((m) => m.unlocked).length, [mastery]);
  const avgMastery = useMemo(() => Object.values(mastery).reduce((a, b) => a + b.mastery, 0) / Math.max(1, Object.keys(mastery).length), [mastery]);
  const totalSolved = useMemo(() => Object.values(mastery).reduce((a, b) => a + b.solved, 0), [mastery]);

  const C = 2 * Math.PI * 28;
  const dash = C * avgMastery;

  return (
    <>
      <Navbar active="mastery" />
      <div className="land">
        <main className="mast-main">
          <header className="mast-head">
            <div className="mast-head-text">
              <h1>Mastery</h1>
              <p>Twelve concepts, prerequisite-gated. Earn each ring to unlock what builds on top of it.</p>
            </div>
            <div className="mast-overall">
              <div className="mast-overall-ring">
                <svg viewBox="0 0 68 68" width="68" height="68">
                  <defs>
                    <linearGradient id="mo-g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffb867" />
                      <stop offset="100%" stopColor="#ffa116" />
                    </linearGradient>
                  </defs>
                  <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
                  <circle cx="34" cy="34" r="28" fill="none" stroke="url(#mo-g)" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={`${dash} 999`} />
                </svg>
                <div className="mast-overall-ring-pct">{Math.round(avgMastery * 100)}%</div>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div className="mast-overall-meta"><span>Unlocked</span><b>{unlockedCount}/12</b></div>
                <div className="mast-overall-meta"><span>Solved</span><b>{totalSolved}</b></div>
              </div>
            </div>
          </header>

          <div className="mast-cat-grid">
            {CONCEPTS.map((c) => {
              const m = mastery[c.id] ?? MOCK_MASTERY[c.id];
              const Icon = c.icon;
              const total = c.problems.easy + c.problems.medium + c.problems.hard;
              const tier = !m.unlocked ? 'locked'
                         : m.mastery >= 0.75 ? 'done'
                         : m.mastery < 0.4  ? 'weak'
                         : 'progress';
              const blockedBy = c.prereqs.filter((p) => (mastery[p]?.mastery ?? MOCK_MASTERY[p]?.mastery ?? 0) < 0.5);

              return (
                <button
                  key={c.id}
                  id={c.id}
                  className={`mast-tile mast-tile-${tier} ${m.unlocked ? '' : 'locked'}`}
                  onClick={() => m.unlocked
                    ? router.push(`/mastery/${c.id}`)
                    : toast(`Locked — reach 50% in ${blockedBy.map((b) => CONCEPT_BY_ID[b].title).join(', ')}`)}
                >
                  <div className="mast-tile-head">
                    <div className="mast-tile-icon">
                      {m.unlocked
                        ? <Icon size={22} strokeWidth={1.75} />
                        : <Lock size={20} strokeWidth={1.75} />}
                    </div>
                    <div>
                      <div className="mast-tile-title">{c.title}</div>
                      <div className="mast-tile-short">{c.short}</div>
                    </div>
                    {tier === 'done' && <span className="mast-tile-badge">Mastered</span>}
                  </div>

                  <div className="mast-tile-bar">
                    <div className={`mast-tile-fill ${tier}`} style={{ width: `${m.mastery * 100}%` }} />
                  </div>

                  <div className="mast-tile-meta">
                    <div>
                      <b>{m.solved}</b> / {total} solved · <b>{Math.round(m.mastery * 100)}%</b>
                    </div>
                    <div className="mast-tile-diff">
                      <span className="d"><span className="dot e" />{c.problems.easy}</span>
                      <span className="d"><span className="dot m" />{c.problems.medium}</span>
                      <span className="d"><span className="dot h" />{c.problems.hard}</span>
                    </div>
                  </div>

                  {!m.unlocked && blockedBy.length > 0 && (
                    <div className="mast-tile-lock">
                      <Lock size={11} />
                      Unlock after {blockedBy.map((b) => CONCEPT_BY_ID[b].title).join(' & ')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
