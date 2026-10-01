"use client";
import { useMemo, useState } from 'react';

type Props = { seed?: number };

const WEEKS = 52;
const DAYS  = 7;

export default function SubmissionHeatmap({ seed = 7 }: Props) {
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
                   : v > 0.35 ? 1
                   : 0;
        const lvl: 0|1|2|3|4 = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
        col.push({ lvl, count });
      }
      cells.push(col);
    }
    return cells;
  }, [seed]);

  const totalSubs = data.flat().reduce((a, b) => a + b.count, 0);
  const activeDays = data.flat().filter((c) => c.lvl > 0).length;
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="ac-hm">
      <div className="ac-hm-head">
        <div>
          <b>{totalSubs}</b> submissions in the last year
        </div>
        <div className="ac-hm-head-stats">
          <span>Active days <b>{activeDays}</b></span>
          <span>Max streak <b>14</b></span>
        </div>
      </div>
      <div className="ac-hm-grid">
        <div className="ac-hm-days">
          <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
        </div>
        <div className="ac-hm-weeks">
          {data.map((col, i) => (
            <div key={i} className="ac-hm-week">
              {col.map((cell, j) => (
                <div
                  key={j}
                  className={`ac-hm-cell lvl-${cell.lvl}`}
                  onMouseEnter={() => setHover(`${cell.count} submissions`)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="ac-hm-foot">
        <span>{hover ?? 'Hover a square for details'}</span>
        <span className="ac-hm-legend">
          Less
          <i className="lvl-0" /><i className="lvl-1" /><i className="lvl-2" /><i className="lvl-3" /><i className="lvl-4" />
          More
        </span>
      </div>
    </div>
  );
}
