"use client";
import { useMemo } from 'react';

export default function Calendar() {
  const now = new Date();
  const y = now.getFullYear();
  const first = new Date(y, now.getMonth(), 1);
  const days = new Date(y, now.getMonth() + 1, 0).getDate();
  const startDay = first.getDay();
  const today = now.getDate();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Deterministic mock activity: which days of this month had submissions
  const activeDays = useMemo(() => {
    let s = (y * 100 + now.getMonth() + 1) * 7;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const set = new Set<number>();
    for (let d = 1; d < today; d++) if (r() > 0.45) set.add(d);
    return set;
  }, [y, now.getMonth(), today]);

  const cells: React.ReactNode[] = [];
  dayNames.forEach((d, i) => cells.push(<div key={`h${i}`} className="day-h">{d}</div>));
  for (let i = 0; i < startDay; i++) cells.push(<div key={`b${i}`} className="day" />);
  for (let d = 1; d <= days; d++) {
    const cls = ['day'];
    if (d === today) cls.push('today');
    else if (activeDays.has(d)) cls.push('has-activity');
    cells.push(<div key={`d${d}`} className={cls.join(' ')}>{d}</div>);
  }
  const rem = (startDay + days) % 7;
  if (rem) for (let i = 0; i < 7 - rem; i++) cells.push(<div key={`a${i}`} className="day" />);

  const monthShort = now.toLocaleString('en', { month: 'long' });
  const streakThisMonth = activeDays.size;

  return (
    <div className="cal-widget">
      <div className="cal-head">
        <div className="month">{monthShort} {y}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--tx-2)' }}>
            <b style={{ color: 'var(--solved)' }}>{streakThisMonth}</b> active
          </span>
          <div className="cal-arrows"><button>‹</button><button>›</button></div>
        </div>
      </div>
      <div className="cal-grid-w">{cells}</div>
    </div>
  );
}
