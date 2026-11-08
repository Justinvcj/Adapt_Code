"use client";
import { useMemo, useState } from 'react';
import { useLiveHeatmap } from '@/lib/live-data';

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Month-view calendar backed by the real `/api/stats/heatmap` data.
 * Days the student submitted on are highlighted with `has-activity`; today
 * stays highlighted even when the user navigates to another month.
 */
export default function Calendar() {
  const { entries } = useLiveHeatmap();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const activeByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entries) m.set(e.date, e.count);
    return m;
  }, [entries]);

  const y = cursor.getFullYear();
  const mo = cursor.getMonth();
  const days = new Date(y, mo + 1, 0).getDate();
  const startDay = new Date(y, mo, 1).getDay();
  const isCurrentMonth = y === today.getFullYear() && mo === today.getMonth();
  const todayNum = today.getDate();

  const cells: React.ReactNode[] = [];
  DAY_NAMES.forEach((d, i) => cells.push(<div key={`h${i}`} className="day-h">{d}</div>));
  for (let i = 0; i < startDay; i++) cells.push(<div key={`b${i}`} className="day" />);
  let active = 0;
  for (let d = 1; d <= days; d++) {
    const iso = new Date(y, mo, d).toISOString().slice(0, 10);
    const count = activeByDate.get(iso) ?? 0;
    const isToday = isCurrentMonth && d === todayNum;
    const cls = ['day'];
    if (isToday) cls.push('today');
    else if (count > 0) cls.push('has-activity');
    if (count > 0) active += 1;
    cells.push(
      <div
        key={`d${d}`}
        className={cls.join(' ')}
        title={count > 0 ? `${count} submission${count === 1 ? '' : 's'}` : ''}
      >
        {d}
      </div>,
    );
  }
  const rem = (startDay + days) % 7;
  if (rem) for (let i = 0; i < 7 - rem; i++) cells.push(<div key={`a${i}`} className="day" />);

  const monthLabel = cursor.toLocaleString('en', { month: 'long' });
  const shiftMonth = (delta: number) => setCursor(new Date(y, mo + delta, 1));

  return (
    <div className="cal-widget">
      <div className="cal-head">
        <div className="month">{monthLabel} {y}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--tx-2)' }}>
            <b style={{ color: 'var(--solved)' }}>{active}</b> active
          </span>
          <div className="cal-arrows">
            <button onClick={() => shiftMonth(-1)} title="Previous month">‹</button>
            <button
              onClick={() => shiftMonth(1)}
              title="Next month"
              disabled={isCurrentMonth}
              style={isCurrentMonth ? { opacity: 0.4, cursor: 'default' } : undefined}
            >›</button>
          </div>
        </div>
      </div>
      <div className="cal-grid-w">{cells}</div>
    </div>
  );
}
