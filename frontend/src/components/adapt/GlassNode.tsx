"use client";
import { Lock, type LucideIcon } from 'lucide-react';

type Props = {
  Icon: LucideIcon;
  title: string;
  mastery: number;        // 0..1
  solved: number;
  unlocked: boolean;
  onClick?: () => void;
  size?: number;          // outer size in px
};

/**
 * Glass mastery node. Double-ringed: a thin outer ring + an inner ring
 * whose stroke-dasharray fills clockwise to represent mastery (0..1).
 * The frosted glass look comes from backdrop-filter blur on the inner panel.
 */
export default function GlassNode({ Icon, title, mastery, solved, unlocked, onClick, size = 140 }: Props) {
  const r      = size / 2 - 6;      // inner-ring radius
  const C      = 2 * Math.PI * r;   // circumference
  const dash   = C * mastery;
  const pct    = Math.round(mastery * 100);
  const strokeColor = unlocked
    ? mastery >= 0.75 ? 'var(--solved)'
    : mastery >= 0.4  ? 'var(--accent)'
    : 'var(--blue)'
    : 'rgba(255,255,255,.1)';

  return (
    <button
      className={`glass-node ${unlocked ? '' : 'locked'}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      aria-label={`${title} — ${pct}% mastery, ${solved} solved`}
    >
      <svg className="glass-rings" viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {/* Outer thin ring */}
        <circle cx={size/2} cy={size/2} r={size/2 - 2} fill="none"
          stroke="rgba(255,255,255,.08)" strokeWidth="1.5" />
        {/* Inner track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,.06)" strokeWidth="4" />
        {/* Inner progress ring */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={strokeColor} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`}
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className="glass-core">
        {unlocked ? (
          <>
            <Icon size={size * 0.28} className="glass-icon" />
            <span className="glass-title">{title}</span>
            <span className="glass-sub">{pct}% · {solved} solved</span>
          </>
        ) : (
          <>
            <Lock size={size * 0.26} className="glass-lock" />
            <span className="glass-title">{title}</span>
            <span className="glass-sub">Locked</span>
          </>
        )}
      </div>
    </button>
  );
}
