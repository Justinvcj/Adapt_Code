import React from 'react';

type HeatmapProps = {
  data: { date: string; count: number }[];
};

export default function Heatmap({ data }: HeatmapProps) {
  // We want to show a year of data (52 weeks * 7 days)
  // Let's just generate the last 365 days
  const today = new Date();
  const days = [];
  
  // Data map for quick lookup
  const dataMap = new Map(data.map(d => [d.date, d.count]));

  // Start 365 days ago
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = dataMap.get(dateStr) || 0;
    days.push({ date: dateStr, count });
  }

  // To build a GitHub style grid (cols are weeks, rows are days of week)
  // We need to offset the first column so it matches the day of the week
  const firstDay = new Date(days[0].date).getDay(); // 0 is Sunday
  const padding = Array(firstDay).fill(null);
  
  const cells = [...padding, ...days];

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-800';
    if (count <= 2) return 'bg-indigo-900';
    if (count <= 4) return 'bg-indigo-700';
    if (count <= 6) return 'bg-indigo-500';
    return 'bg-indigo-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
      <h2 className="text-xl font-medium text-slate-200 mb-4">Activity</h2>
      <div className="min-w-max flex flex-col gap-1">
        <div className="flex gap-1">
          {/* We just wrap in a flex column of flex rows... wait, better to use grid with 53 cols and 7 rows */}
          <div className="grid grid-rows-7 grid-flow-col gap-1">
            {cells.map((cell, idx) => (
              cell ? (
                <div 
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} problems`}
                  className={`w-3 h-3 rounded-sm ${getColor(cell.count)} hover:ring-1 hover:ring-white transition-all`}
                />
              ) : (
                <div key={`pad-${idx}`} className="w-3 h-3" />
              )
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 justify-end">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-indigo-900" />
          <div className="w-3 h-3 rounded-sm bg-indigo-700" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500" />
          <div className="w-3 h-3 rounded-sm bg-indigo-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
