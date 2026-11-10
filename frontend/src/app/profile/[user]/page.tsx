"use client";
import { useEffect, useMemo, useState } from 'react';
import { Edit, Globe, Flame, Calendar } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import Avatar from '@/components/adapt/Avatar';
import EditProfileModal from '@/components/adapt/EditProfileModal';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '@/components/adapt/icons';
import { useProfile } from '@/lib/profile-store';
import { useAuth } from '@/lib/auth-context';
import { statsAPI, API_ENABLED, API_BASE, type ApiStatsSummary } from '@/lib/api';
import { useLiveHeatmap, useLiveMastery } from '@/lib/live-data';

type HistoryEvent = {
  event_id: string;
  concept_tag: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  final_verdict: string;
  timestamp: string;
  problems?: { title?: string };
};

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, update } = useProfile();
  const { mastery } = useLiveMastery();
  const [editOpen, setEditOpen] = useState(false);
  const [liveStats, setLiveStats] = useState<ApiStatsSummary | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  useEffect(() => {
    if (!API_ENABLED) return;
    (async () => {
      try {
        const r = await statsAPI.summary();
        setLiveStats(r.data);
      } catch { /* leave null */ }
      try {
        const r = await fetch(`${API_BASE}/api/history`, { credentials: 'include' });
        if (r.ok) {
          const data = await r.json();
          setHistory(data?.data || []);
        }
      } catch { /* leave empty */ }
    })();
  }, []);

  const displayName = user?.display_name || profile.name || user?.email?.split('@')[0] || 'Learner';
  const handle = profile.display_name || user?.email?.split('@')[0] || 'me';

  // Donut shows mastery across all 12 concepts rather than a fabricated
  // Easy/Medium/Hard breakdown we don't have data for.
  const totalSolved = liveStats?.total_problems_solved ?? 0;
  const conceptsUnlocked = Object.values(mastery).filter((m) => m.unlocked).length;
  const avgMastery = Object.values(mastery).reduce((a, b) => a + b.mastery, 0) / Math.max(12, 1);
  const streakValue = liveStats?.current_streak ?? 0;
  const strongest = liveStats?.strongest_concept;
  const weakest = liveStats?.weakest_concept;

  const R = 70;
  const C = 2 * Math.PI * R;
  const masteryArc = C * avgMastery;

  const acceptedHistory = history.filter((h) => h.final_verdict === 'Accepted');

  // Real heatmap when the backend is up; synthetic PRNG when it isn't so the
  // profile never shows an empty grid in offline/preview mode.
  const { entries: heatmapEntries, live: heatmapLive } = useLiveHeatmap();
  const heatmap = useMemo(() => {
    if (heatmapLive && heatmapEntries.length) {
      // Build a date→count map, then walk 52 weeks × 7 days back from today
      // so the grid aligns with the current calendar week (rightmost column).
      const counts = new Map<string, number>();
      for (const e of heatmapEntries) counts.set(e.date, e.count);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const weeks: number[][] = [];
      for (let w = 51; w >= 0; w--) {
        const week: number[] = [];
        for (let d = 6; d >= 0; d--) {
          const cell = new Date(today);
          cell.setUTCDate(today.getUTCDate() - (w * 7 + d));
          const key = cell.toISOString().slice(0, 10);
          const n = counts.get(key) ?? 0;
          week.push(n >= 7 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0);
        }
        weeks.push(week);
      }
      return weeks;
    }
    // Offline fallback — deterministic synthetic pattern.
    let s = 42;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const weeks: number[][] = [];
    for (let w = 0; w < 52; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        const v = r();
        week.push(v > 0.88 ? 4 : v > 0.74 ? 3 : v > 0.58 ? 2 : v > 0.4 ? 1 : 0);
      }
      weeks.push(week);
    }
    return weeks;
  }, [heatmapEntries, heatmapLive]);

  return (
    <>
      <Navbar active="profile" />
      <div className="prof2">
        <aside className="prof2-side">
          <Avatar
            name={displayName}
            dataUri={profile.avatar_data_uri}
            editable
            size={120}
            onChange={(uri) => update({ avatar_data_uri: uri })}
          />
          <div>
            <div className="prof2-name">{displayName}</div>
            <div className="prof2-user">@{handle}</div>
          </div>
          {profile.bio && <p className="prof2-bio">{profile.bio}</p>}

          <div className="prof2-stat-row">
            <div><b>{totalSolved}</b><span>Solved</span></div>
            <div><b>{conceptsUnlocked}/12</b><span>Unlocked</span></div>
            <div><b>{(avgMastery * 100).toFixed(0)}%</b><span>Mastery</span></div>
          </div>

          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setEditOpen(true)}>
            <Edit size={14} /> Edit profile
          </button>

          {(profile.socials.github || profile.socials.linkedin || profile.socials.twitter || profile.socials.website) && (
            <div className="prof2-socials">
              {profile.socials.github && (
                <a className="prof-social" href={`https://github.com/${profile.socials.github}`} target="_blank" rel="noreferrer">
                  <GithubIcon /> {profile.socials.github}
                </a>
              )}
              {profile.socials.linkedin && (
                <a className="prof-social" href={`https://linkedin.com/in/${profile.socials.linkedin}`} target="_blank" rel="noreferrer">
                  <LinkedinIcon size={14} /> {profile.socials.linkedin}
                </a>
              )}
              {profile.socials.twitter && (
                <a className="prof-social" href={`https://x.com/${profile.socials.twitter}`} target="_blank" rel="noreferrer">
                  <TwitterIcon size={14} /> @{profile.socials.twitter}
                </a>
              )}
              {profile.socials.website && (
                <a className="prof-social" href={profile.socials.website} target="_blank" rel="noreferrer">
                  <Globe size={14} /> Website
                </a>
              )}
            </div>
          )}

          {(strongest || weakest) && (
            <div className="prof2-card">
              <h4>Concepts</h4>
              {strongest && (
                <div className="lang-row">
                  <span className="lang-pill">Strongest</span>
                  <span className="lang-count"><b>{strongest.replace(/_/g, ' ')}</b></span>
                </div>
              )}
              {weakest && weakest !== strongest && (
                <div className="lang-row">
                  <span className="lang-pill">Weakest</span>
                  <span className="lang-count"><b>{weakest.replace(/_/g, ' ')}</b></span>
                </div>
              )}
            </div>
          )}
        </aside>

        <main className="prof2-main">
          {/* Hero: mastery donut + top unlocked concepts */}
          <section className="prof2-progress">
            <div className="prof2-donut">
              <svg viewBox="0 0 180 180" width="180" height="180">
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--bg-sf)" strokeWidth="12" />
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--learn)" strokeWidth="12"
                  strokeDasharray={`${masteryArc} ${C - masteryArc}`} strokeDashoffset="0" strokeLinecap="round"
                  transform="rotate(-90 90 90)" />
              </svg>
              <div className="prof2-donut-c">
                <b>{(avgMastery * 100).toFixed(0)}%</b>
                <span>average mastery</span>
                <span className="prof2-donut-attempting">· {totalSolved} solved</span>
              </div>
            </div>

            <div className="prof2-progress-bars">
              {Object.entries(mastery).slice(0, 4).map(([id, m]) => (
                <div key={id} className="prof2-pbar prof2-pbar-e">
                  <div className="prof2-pbar-head">
                    <span style={{ textTransform: 'capitalize' }}>{id.replace(/_/g, ' ')}</span>
                    <b>{(m.mastery * 100).toFixed(0)}%<i> · {m.solved}/{m.solved + m.attempted} solved</i></b>
                  </div>
                  <div className="prof2-pbar-track">
                    <div className="prof2-pbar-fill" style={{ width: `${(m.mastery * 100).toFixed(1)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Heatmap — drives from real /api/stats/heatmap */}
          <section className="prof2-heatmap-card">
            <header>
              <div className="prof2-heatmap-title">
                <h3>{totalSolved} submission{totalSolved === 1 ? '' : 's'} in the last year</h3>
                <div className="prof2-heatmap-stats">
                  <span><Flame size={12} /> Streak <b>{streakValue}</b></span>
                  <span><Calendar size={12} /> Unlocked <b>{conceptsUnlocked}/12</b></span>
                </div>
              </div>
            </header>
            <div className="prof2-heatmap">
              <div className="prof2-heatmap-months">
                {['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'].map((m) => <span key={m}>{m}</span>)}
              </div>
              <div className="prof2-heatmap-grid">
                <div className="prof2-heatmap-days">
                  <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
                </div>
                <div className="prof2-heatmap-weeks">
                  {heatmap.map((week, i) => (
                    <div key={i} className="prof2-heatmap-week">
                      {week.map((lvl, j) => <div key={j} className={`prof2-heatmap-cell lvl-${lvl}`} />)}
                    </div>
                  ))}
                </div>
              </div>
              <footer>
                <span>Less</span>
                <i className="lvl-0" /><i className="lvl-1" /><i className="lvl-2" /><i className="lvl-3" /><i className="lvl-4" />
                <span>More</span>
              </footer>
            </div>
          </section>

          {/* Recent AC submissions — drives from /api/history */}
          <section className="prof2-recent">
            <header>
              <h3>Recent accepted</h3>
              <Link href="/problems" className="section-h-link">All problems <span>→</span></Link>
            </header>
            {acceptedHistory.length === 0 ? (
              <p style={{ padding: '14px 0', color: 'var(--tx-2)', fontSize: 13 }}>
                No accepted submissions yet. <Link href="/problems" style={{ color: 'var(--learn)' }}>Start practising →</Link>
              </p>
            ) : (
              <ul>
                {acceptedHistory.slice(0, 10).map((h) => (
                  <li key={h.event_id}>
                    <span className="prof2-recent-name">{h.problems?.title || h.event_id.slice(0, 8)}</span>
                    <span className="prof2-recent-concept">{h.concept_tag.replace(/_/g, ' ')}</span>
                    <span className="prof2-recent-time">{relTime(h.timestamp)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
      <Footer />
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
