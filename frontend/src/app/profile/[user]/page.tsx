"use client";
import { useMemo, useState } from 'react';
import { Edit, Globe, Trophy, TrendingUp, Flame, Calendar } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import Avatar from '@/components/adapt/Avatar';
import EditProfileModal from '@/components/adapt/EditProfileModal';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '@/components/adapt/icons';
import { USER } from '@/components/adapt/data';
import { useProfile } from '@/lib/profile-store';

type Skill = { name: string; count: number };

const SKILLS_ADVANCED: Skill[]   = [{ name: 'Dynamic Programming', count: 6 }, { name: 'Divide and Conquer', count: 2 }, { name: 'Trie', count: 1 }];
const SKILLS_INTERMEDIATE: Skill[]= [{ name: 'Hash Table', count: 24 }, { name: 'Math', count: 18 }, { name: 'Two Pointers', count: 12 }, { name: 'Binary Search', count: 9 }, { name: 'Sorting', count: 8 }, { name: 'Greedy', count: 7 }];
const SKILLS_FUNDAMENTAL: Skill[]= [{ name: 'Array', count: 62 }, { name: 'String', count: 41 }, { name: 'Linked List', count: 11 }, { name: 'Recursion', count: 6 }, { name: 'Simulation', count: 4 }];

export default function ProfilePage() {
  const u = USER;
  const { profile, update } = useProfile();
  const [editOpen, setEditOpen] = useState(false);

  const total    = u.solved.easy + u.solved.medium + u.solved.hard;
  const allTotal = u.total.easy + u.total.medium + u.total.hard;
  const R = 70;
  const C = 2 * Math.PI * R;
  const eL = C * (u.solved.easy / allTotal);
  const mL = C * (u.solved.medium / allTotal);
  const hL = C * (u.solved.hard / allTotal);

  const heatmap = useMemo(() => {
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
  }, []);

  const renderSkill = (s: Skill) => {
    const earned  = s.count >= 10;
    const trophy  = s.count >= 25;
    return (
      <span key={s.name} className={`skill-chip ${earned ? 'earned' : ''} ${trophy ? 'trophy' : ''}`}>
        {trophy && <Trophy size={11} />} {s.name}<span className="n">×{s.count}</span>
      </span>
    );
  };

  return (
    <>
      <Navbar active="profile" />
      <div className="prof2">
        <aside className="prof2-side">
          <Avatar
            name={profile.name}
            dataUri={profile.avatar_data_uri}
            editable
            size={120}
            onChange={(uri) => update({ avatar_data_uri: uri })}
          />
          <div>
            <div className="prof2-name">{profile.name}</div>
            <div className="prof2-user">@{profile.display_name}</div>
          </div>
          {profile.bio && <p className="prof2-bio">{profile.bio}</p>}

          <div className="prof2-stat-row">
            <div><b>{u.following}</b><span>Following</span></div>
            <div><b>{u.followers}</b><span>Followers</span></div>
            <div><b>#{u.rank.toLocaleString()}</b><span>Rank</span></div>
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

          <div className="prof2-card">
            <h4>Languages</h4>
            {[
              { n: 'Java', c: 142 },
              { n: 'Python 3', c: 38 },
              { n: 'C++', c: 5 },
              { n: 'JavaScript', c: 1 },
            ].map((l) => (
              <div key={l.n} className="lang-row">
                <span className="lang-pill">{l.n}</span>
                <span className="lang-count"><b>{l.c}</b> solved</span>
              </div>
            ))}
          </div>

          <div className="prof2-card">
            <h4>Skills</h4>
            <div className="skill-group" style={{ ['--dot' as string]: 'var(--hard)' }}>
              <h5>Advanced</h5>
              <div className="skill-chips">{SKILLS_ADVANCED.map(renderSkill)}</div>
            </div>
            <div className="skill-group" style={{ ['--dot' as string]: 'var(--med)' }}>
              <h5>Intermediate</h5>
              <div className="skill-chips">{SKILLS_INTERMEDIATE.map(renderSkill)}</div>
            </div>
            <div className="skill-group" style={{ ['--dot' as string]: 'var(--easy)' }}>
              <h5>Fundamental</h5>
              <div className="skill-chips">{SKILLS_FUNDAMENTAL.map(renderSkill)}</div>
            </div>
          </div>
        </aside>

        <main className="prof2-main">
          {/* Hero: donut + difficulty bars — enlarged */}
          <section className="prof2-progress">
            <div className="prof2-donut">
              <svg viewBox="0 0 180 180" width="180" height="180">
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--bg-sf)" strokeWidth="12" />
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--easy)" strokeWidth="12" strokeDasharray={`${eL} ${C - eL}`} strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 90 90)" />
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--med)"  strokeWidth="12" strokeDasharray={`${mL} ${C - mL}`} strokeDashoffset={-eL} strokeLinecap="round" transform="rotate(-90 90 90)" />
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--hard)" strokeWidth="12" strokeDasharray={`${hL} ${C - hL}`} strokeDashoffset={-(eL + mL)} strokeLinecap="round" transform="rotate(-90 90 90)" />
              </svg>
              <div className="prof2-donut-c">
                <b>{total}</b>
                <span>of {allTotal} solved</span>
                {u.attempting > 0 && <span className="prof2-donut-attempting">· {u.attempting} attempting</span>}
              </div>
            </div>

            <div className="prof2-progress-bars">
              {([
                ['Easy',   u.solved.easy,   u.total.easy,   'e'],
                ['Medium', u.solved.medium, u.total.medium, 'm'],
                ['Hard',   u.solved.hard,   u.total.hard,   'h'],
              ] as const).map(([lbl, val, tot, cls]) => (
                <div key={lbl} className={`prof2-pbar prof2-pbar-${cls}`}>
                  <div className="prof2-pbar-head">
                    <span>{lbl}</span>
                    <b>{val}<i> / {tot}</i></b>
                  </div>
                  <div className="prof2-pbar-track"><div className="prof2-pbar-fill" style={{ width: `${(val / tot * 100).toFixed(1)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          {/* Promoted heatmap */}
          <section className="prof2-heatmap-card">
            <header>
              <div className="prof2-heatmap-title">
                <h3>{u.subs} submissions in the last year</h3>
                <div className="prof2-heatmap-stats">
                  <span><Flame size={12} /> Streak <b>{u.streak}</b></span>
                  <span><Calendar size={12} /> Active <b>{u.days}</b> days</span>
                  <span><TrendingUp size={12} /> This week <b>12</b></span>
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

          {/* Recent AC submissions */}
          <section className="prof2-recent">
            <header>
              <h3>Recent accepted</h3>
              <Link href="/problems" className="section-h-link">All submissions <span>→</span></Link>
            </header>
            <ul>
              {[
                ['Reverse String II',    'Strings',  '15 days ago'],
                ['Two Sum',              'Hashing',  '18 days ago'],
                ['Valid Parentheses',    'Arrays',   '20 days ago'],
                ['Maximum Subarray',     'Arrays',   '22 days ago'],
                ['Climbing Stairs',      'Recursion','25 days ago'],
              ].map(([n, concept, t]) => (
                <li key={n}>
                  <span className="prof2-recent-name">{n}</span>
                  <span className="prof2-recent-concept">{concept}</span>
                  <span className="prof2-recent-time">{t}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
      <Footer />
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
