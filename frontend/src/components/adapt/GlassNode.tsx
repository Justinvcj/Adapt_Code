"use client";
import { Lock, Check, type LucideIcon } from 'lucide-react';

type Props = {
  Icon: LucideIcon;
  title: string;
  mastery: number;        // 0..1
  solved: number;
  unlocked: boolean;
  onClick?: () => void;
  size?: number;          // outer size in px
  recommended?: boolean;  // the engine's current "up next" concept
  unlockProgress?: number;// 0..1 — how close a locked node is to unlocking
};

/**
 * Glass mastery node. Double-ringed: a thin outer ring + an inner ring
 * whose stroke-dasharray fills clockwise to represent mastery (0..1).
 * The frosted glass look comes from backdrop-filter blur on the inner panel.
 */
export default function GlassNode({ Icon, title, mastery, solved, unlocked, onClick, size = 140, recommended = false, unlockProgress = 0 }: Props) {
  const mastered = unlocked && mastery >= 0.9;
  const RING_W = 13;                      // bold progress ring
  const r      = size / 2 - RING_W / 2 - 3;
  const C      = 2 * Math.PI * r;
  const dash   = C * mastery;
  const pct    = Math.round(mastery * 100);
  const gradId = `gn-grad-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const stops  = unlocked
    ? mastery >= 0.75 ? ['#2fe28a', '#27a644']
    : mastery >= 0.4  ? ['#ffb867', '#ffa116']
    : ['#828fff', '#5e6ad2']
    : ['rgba(255,255,255,.08)', 'rgba(255,255,255,.08)'];

  return (
    <button
      className={`glass-node ${unlocked ? '' : 'locked'} ${recommended ? 'recommended' : ''} ${mastered ? 'mastered' : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      aria-label={`${title} — ${unlocked ? `${pct}% mastery, ${solved} solved` : `locked, ${Math.round(unlockProgress * 100)}% toward unlock`}${recommended ? ' (recommended next)' : ''}`}
    >
      {recommended && <span className="glass-rec-pill">Up next</span>}
      <svg className="glass-rings" viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        </defs>
        {/* Outer thin ring */}
        <circle cx={size/2} cy={size/2} r={size/2 - 2} fill="none"
          stroke="rgba(255,255,255,.10)" strokeWidth="2" />
        {/* Inner track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,.06)" strokeWidth={RING_W} />
        {/* Inner progress ring — thick, gradient, rounded caps */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={`url(#${gradId})`} strokeWidth={RING_W} strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`}
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className="glass-core">
        {unlocked ? (
          <>
            <Icon size={Math.round(size * 0.26)} className="glass-icon" strokeWidth={1.75} />
            {mastered && <span className="glass-check"><Check size={10} strokeWidth={3} /></span>}
            <span className="glass-title">{title}</span>
            <span className="glass-sub">
              {mastered ? 'Mastered' : <><b>{pct}%</b> · {solved}</>}
            </span>
          </>
        ) : (
          <>
            <Lock size={Math.round(size * 0.24)} className="glass-lock" strokeWidth={1.75} />
            <span className="glass-title">{title}</span>
            <span className="glass-sub">
              {unlockProgress > 0
                ? <><b>{Math.round(unlockProgress * 100)}%</b> toward unlock</>
                : 'Earn prerequisites first'}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
