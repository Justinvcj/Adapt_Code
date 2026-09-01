'use client';

export function CalendarWidget() {
  const now = new Date();
  const today = now.getDate();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const startDay = first.getDay();
  const daysLeft = Math.ceil((new Date(now.getFullYear(), 11, 31).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const monthShort = now.toLocaleString('en', { month: 'short' }).toUpperCase();

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-[var(--bg-el)] border border-[var(--border)] rounded-[var(--r-lg)] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold flex items-center gap-2">
          Day {today}
          <span className="text-xs text-[var(--tx-2)]">{daysLeft} left</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--blue)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {monthShort}
          </div>
          <div className="flex gap-1">
            <button className="w-6 h-6 rounded-[var(--r)] flex items-center justify-center text-[var(--tx-2)] text-sm hover:bg-[var(--bg-hover)] transition-colors">‹</button>
            <button className="w-6 h-6 rounded-[var(--r)] flex items-center justify-center text-[var(--tx-2)] text-sm hover:bg-[var(--bg-hover)] transition-colors">›</button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {dayNames.map((d, i) => (
          <div key={i} className="text-[var(--tx-3)] text-[11px] py-1">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`e${i}`} className="py-1.5" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const isToday = d === today;
          return (
            <div
              key={d}
              className={`py-1.5 rounded-[var(--r)] cursor-pointer transition-all ${
                isToday
                  ? 'bg-[var(--blue)] text-white font-semibold rounded-full'
                  : 'text-[var(--tx-2)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
