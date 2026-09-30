"use client";
import { useMemo } from 'react';
import { Edit } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import { GithubIcon } from '@/components/adapt/icons';
import { USER } from '@/components/adapt/data';

export default function ProfilePage() {
  const u = USER;
  const total = u.solved.easy + u.solved.medium + u.solved.hard;
  const allTotal = u.total.easy + u.total.medium + u.total.hard;
  const C = 2 * Math.PI * 55;
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

  return (
    <>
      <Navbar active="profile" />
      <div className="prof">
        <div className="prof-top">
          <div className="prof-left">
            <div className="prof-ava">JV</div>
            <div>
              <div className="prof-name">{u.name}</div>
              <div className="prof-user">{u.user}</div>
            </div>
            <div className="prof-rank">Rank <b>{u.rank.toLocaleString()}</b></div>
            <div className="prof-follow">
              <span><b>{u.following}</b> Following</span> |
              <span><b>{u.followers}</b> Followers</span>
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }}><Edit size={14} /> Edit Profile</button>
            <div className="prof-gh"><GithubIcon /> {u.user}</div>
            <div className="comm-stats">
              <h4>Community Stats</h4>
              {[
                { ic: '👁', label: 'Views', bg: 'rgba(94,106,210,.15)', color: 'var(--blue)' },
                { ic: '☑', label: 'Solution', bg: 'var(--easy-bg)', color: 'var(--easy)' },
                { ic: '💬', label: 'Discuss', bg: 'var(--med-bg)', color: 'var(--med)' },
                { ic: '⭐', label: 'Reputation', bg: 'rgba(255,161,22,.15)', color: 'var(--accent)' },
              ].map((s) => (
                <div key={s.label} className="cs-item">
                  <span className="cs-icon" style={{ background: s.bg, color: s.color }}>{s.ic}</span>
                  {s.label} <b>0</b>
                  <span className="cs-sub">Last week 0</span>
                </div>
              ))}
            </div>
          </div>
          <div className="prof-right">
            <div className="solved-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                <div className="donut-w">
                  <svg viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
                    <circle cx="70" cy="70" r="55" fill="none" stroke="var(--easy)" strokeWidth="10" strokeDasharray={`${eL} ${C - eL}`} strokeDashoffset="0" strokeLinecap="round" />
                    <circle cx="70" cy="70" r="55" fill="none" stroke="var(--med)" strokeWidth="10" strokeDasharray={`${mL} ${C - mL}`} strokeDashoffset={-eL} strokeLinecap="round" />
                    <circle cx="70" cy="70" r="55" fill="none" stroke="var(--hard)" strokeWidth="10" strokeDasharray={`${hL} ${C - hL}`} strokeDashoffset={-(eL + mL)} strokeLinecap="round" />
                  </svg>
                  <div className="donut-c">
                    <div className="big">{total}<span className="slash">/{allTotal}</span></div>
                    <div className="sub">✓ Solved</div>
                    <div className="sub" style={{ fontSize: 11 }}>{u.attempting} Attempting</div>
                  </div>
                </div>
                <div className="solved-side">
                  {([
                    ['Easy', u.solved.easy, u.total.easy, 'var(--easy)'],
                    ['Med.', u.solved.medium, u.total.medium, 'var(--med)'],
                    ['Hard', u.solved.hard, u.total.hard, 'var(--hard)'],
                  ] as const).map(([lbl, val, tot, color]) => (
                    <div key={lbl} className="sv-row">
                      <span className="sv-label" style={{ color }}>{lbl}</span>
                      <div className="sv-bar"><div className="sv-fill" style={{ width: `${(val / tot * 100).toFixed(0)}%`, background: color }} /></div>
                      <span className="sv-count">{val}/{tot}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="badges-card">
              <h4>Badges <span style={{ fontSize: 20, marginLeft: 4 }}>0</span></h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, color: 'var(--tx-2)' }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>Locked Badge</div>
                  Aug AdaptCoding Challenge
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="activity">
          <div className="act-head">
            <h3><span style={{ fontWeight: 700 }}>{u.subs}</span> submissions in the past one year ⓘ</h3>
            <div className="act-stats">
              <span>Total active days: <b>{u.days}</b></span>
              <span>Max streak: <b>{u.streak}</b></span>
              <select style={{ padding: '2px 6px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--bg-el)', color: 'var(--tx)', fontSize: 12 }}>
                <option>Current</option>
              </select>
            </div>
          </div>
          <div className="hm-card">
            <div className="hm-months">
              {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m) => <span key={m}>{m}</span>)}
            </div>
            <div className="hm-grid">
              <div className="hm-days">
                <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
              </div>
              <div className="hm-weeks">
                {heatmap.map((week, i) => (
                  <div key={i} className="hm-week">
                    {week.map((lvl, j) => <div key={j} className={`hm-cell h${lvl}`} />)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="prof-tabs" style={{ marginTop: 20 }}>
          <div className="prof-tabs-head">
            <div className="tabs" style={{ border: 'none' }}>
              {[['Recent AC', '📊'], ['List', '📋'], ['Solutions', '✅'], ['Discuss', '💬']].map(([l, ic], i) => (
                <span key={l} className={`tab ${i === 0 ? 'act' : ''}`}>{ic} {l}</span>
              ))}
            </div>
            <a style={{ fontSize: 12, color: 'var(--tx-2)' }}>View all submissions ›</a>
          </div>
          <div className="sub-list">
            {[
              ['Reverse String II', '15 days ago'],
              ['Two Sum', '18 days ago'],
              ['Valid Parentheses', '20 days ago'],
              ['Maximum Subarray', '22 days ago'],
              ['Climbing Stairs', '25 days ago'],
            ].map(([n, t]) => (
              <div key={n} className="sub-item">
                <span className="s-name">{n}</span>
                <span className="s-time">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
