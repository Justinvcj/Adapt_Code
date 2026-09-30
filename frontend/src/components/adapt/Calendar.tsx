"use client";
export default function Calendar() {
  const now = new Date();
  const y = now.getFullYear();
  const first = new Date(y, now.getMonth(), 1);
  const days = new Date(y, now.getMonth() + 1, 0).getDate();
  const startDay = first.getDay();
  const today = now.getDate();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const cells: React.ReactNode[] = [];
  dayNames.forEach((d, i) => cells.push(<div key={`h${i}`} className="day-h">{d}</div>));
  for (let i = 0; i < startDay; i++) cells.push(<div key={`b${i}`} className="day" />);
  for (let d = 1; d <= days; d++) cells.push(<div key={`d${d}`} className={`day ${d === today ? 'today' : ''}`}>{d}</div>);
  const rem = (startDay + days) % 7;
  if (rem) for (let i = 0; i < 7 - rem; i++) cells.push(<div key={`a${i}`} className="day" />);
  const monthShort = now.toLocaleString('en', { month: 'short' }).toUpperCase();
  const left = Math.ceil((new Date(y, 11, 31).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="cal-widget">
      <div className="cal-head">
        <div className="month">Day {today} <span style={{ fontSize: 12, color: 'var(--tx-2)' }}>{left} left</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="badge-num" style={{ fontSize: 9 }}>{monthShort}</div>
          <div className="cal-arrows"><button>‹</button><button>›</button></div>
        </div>
      </div>
      <div className="cal-grid-w">{cells}</div>
    </div>
  );
}
