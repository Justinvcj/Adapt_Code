"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import { leaderboardAPI, API_ENABLED, type ApiLeaderboardEntry } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Row = ApiLeaderboardEntry & { rank: number };

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(API_ENABLED);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!API_ENABLED) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const r = await leaderboardAPI.list();
        if (cancelled) return;
        const ranked: Row[] = (r?.data ?? [])
          .sort((a, b) => b.solved_count - a.solved_count || b.avg_mastery - a.avg_mastery)
          .map((e, i) => ({ ...e, rank: i + 1 }));
        setRows(ranked);
        setLive(true);
      } catch {
        // backend unreachable — keep empty state, UI handles it below
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const myRow = user ? rows.find((r) => r.user_id === user.user_id) : null;

  return (
    <>
      <Navbar active="leaderboard" />
      <div className="land">
        <main className="mast-main">
          <header className="mast-head">
            <div className="mast-head-text">
              <h1>Leaderboard</h1>
              <p>Who&apos;s learning fastest across the twelve concepts. Ranked by problems solved, broken by average mastery.</p>
            </div>
            {myRow && (
              <div className="mast-overall" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 44, fontWeight: 700, color: 'var(--accent)' }}>#{myRow.rank}</div>
                <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>your rank</div>
              </div>
            )}
          </header>

          {loading && (
            <section style={{ padding: 60, textAlign: 'center', color: 'var(--tx-2)' }}>
              Loading leaderboard…
            </section>
          )}

          {!loading && rows.length === 0 && (
            <section style={{ padding: 60, textAlign: 'center', color: 'var(--tx-2)' }}>
              <p style={{ fontSize: 15 }}>
                {live
                  ? 'No ranked learners yet. Solve a problem to be the first on the board.'
                  : 'Leaderboard is offline. Try again in a moment.'}
              </p>
              <Link href="/learn" style={{ color: 'var(--accent)', marginTop: 12, display: 'inline-block' }}>
                Start learning →
              </Link>
            </section>
          )}

          {!loading && rows.length > 0 && (
            <section>
              <div className="section-h">
                <h2 style={{ fontSize: 16 }}>Top learners</h2>
                <span className="meta">{rows.length} ranked{live ? ' · live' : ''}</span>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Rank</th>
                    <th>Learner</th>
                    <th style={{ width: 120 }}>Solved</th>
                    <th style={{ width: 140 }}>Avg mastery</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isMe = user && r.user_id === user.user_id;
                    const name = r.display_name || 'anonymous';
                    return (
                      <tr key={r.user_id} style={isMe ? { background: 'rgba(255,184,103,.06)' } : undefined}>
                        <td style={{ fontWeight: 600 }}>
                          {r.rank === 1 && <Trophy size={14} color="#ffd166" style={{ verticalAlign: '-2px', marginRight: 6 }} />}
                          {r.rank === 2 && <Medal size={14} color="#c9d1d9" style={{ verticalAlign: '-2px', marginRight: 6 }} />}
                          {r.rank === 3 && <Award size={14} color="#cd7f32" style={{ verticalAlign: '-2px', marginRight: 6 }} />}
                          {r.rank}
                        </td>
                        <td>
                          {name}
                          {isMe && <span style={{ color: 'var(--accent)', marginLeft: 8, fontSize: 11 }}>you</span>}
                        </td>
                        <td>{r.solved_count}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, maxWidth: 80, height: 5, background: 'var(--border-t)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.round(r.avg_mastery * 100)}%`, height: '100%', background: 'var(--accent)' }} />
                            </div>
                            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--tx-2)' }}>{Math.round(r.avg_mastery * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
