"use client";
import { useMemo } from 'react';
import { Flame, Target, TrendingUp } from 'lucide-react';
import { usePrefs } from '@/lib/profile-store';

const WEEKS = 52;
const DAYS  = 7;

/**
 * Consolidated activity rail — replaces the separate Calendar + Heatmap duo.
 *
 * Top:    today's progress ring + three stat chips (streak, done today, goal)
 * Bottom: 52-week submission heatmap, hoverable, with a legend.
 *
 * One widget tells the whole "did you practice" story — this-month and
 * all-year — without the duplicated signal of the old pair.
 */
export default function ActivityRail({ seed = 7 }: { seed?: number }) {
  const { prefs } = usePrefs();

  const data = useMemo(() => {
    let s = seed;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const cells: { lvl: 0|1|2|3|4; count: number }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const col: { lvl: 0|1|2|3|4; count: number }[] = [];
      for (let d = 0; d < DAYS; d++) {
        const v = r();
        const count = v > 0.88 ? Math.floor(6 + r() * 6)
                   : v > 0.72 ? Math.floor(3 + r() * 4)
                   : v > 0.55 ? Math.floor(1 + r() * 3)
                   : v > 0.35 ? 1 : 0;
        const lvl: 0|1|2|3|4 = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
        col.push({ lvl, count });
      }
      cells.push(col);
    }
    return cells;
  }, [seed]);

  const totalSubs    = data.flat().reduce((a, b) => a + b.count, 0);
  const activeDays   = data.flat().filter((c) => c.lvl > 0).length;
  const streak       = 14;
  const todayDone    = 2;
  const dailyGoal    = prefs.daily_goal ?? 3;
  const goalPct      = Math.min(1, todayDone / dailyGoal);
  const R = 26;
  const C = 2 * Math.PI * R;
  const dash = C * goalPct;

  const monthLabels = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];

  return (
    <aside className="ar">
      <section className="ar-today">
        <div className="ar-today-ring">
          <svg viewBox="0 0 68 68" width="68" height="68">
            <defs>
              <linearGradient id="ar-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent-2, var(--accent))" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            <circle cx="34" cy="34" r={R} fill="none" stroke="var(--bg-sf)" strokeWidth="6" />
            <circle
              cx="34" cy="34" r={R} fill="none"
              stroke="url(#ar-grad)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${dash} ${C - dash}`}
              transform="rotate(-90 34 34)"
            />
          </svg>
          <div className="ar-today-ring-text">
            <b>{todayDone}</b>
            <span>/ {dailyGoal}</span>
          </div>
        </div>
        <div className="ar-today-meta">
          <h3>Today</h3>
          <p>
            {todayDone >= dailyGoal
              ? <>Goal hit · nice work</>
              : <>{dailyGoal - todayDone} to go</>}
          </p>
        </div>
      </section>

      <div className="ar-stats">
        <div className="ar-stat">
          <Flame size={14} />
          <div><b>{streak}</b><span>Day streak</span></div>
        </div>
        <div className="ar-stat">
          <Target size={14} />
          <div><b>{dailyGoal}/day</b><span>Current goal</span></div>
        </div>
        <div className="ar-stat">
          <TrendingUp size={14} />
          <div><b>{activeDays}</b><span>Active days</span></div>
        </div>
      </div>

      <section className="ar-hm">
        <header>
          <div>
            <b>{totalSubs}</b> submissions · last year
          </div>
        </header>
        <div className="ar-hm-months">
          {monthLabels.map((m) => <span key={m}>{m}</span>)}
        </div>
        <div className="ar-hm-grid">
          {data.map((col, i) => (
            <div key={i} className="ar-hm-week">
              {col.map((cell, j) => (
                <div
                  key={j}
                  className={`ar-hm-cell lvl-${cell.lvl}`}
                  title={cell.count ? `${cell.count} submission${cell.count > 1 ? 's' : ''}` : 'No submissions'}
                />
              ))}
            </div>
          ))}
        </div>
        <footer>
          <span>Less</span>
          <i className="lvl-0" /><i className="lvl-1" /><i className="lvl-2" /><i className="lvl-3" /><i className="lvl-4" />
          <span>More</span>
        </footer>
      </section>
    </aside>
  );
}
