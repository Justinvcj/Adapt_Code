"use client";
import { useState } from 'react';
import { Lightbulb, Lock, Unlock, Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getHints, isHintAvailable, nextAvailableAt,
  TIER_LABEL, TIER_PENALTY_LABEL,
  type HintTier, type HintCtx,
} from '@/data/hints';

type Props = {
  problemId: string;
  ctx: HintCtx;
};

const ORDER: HintTier[] = ['nudge', 'scaffold', 'near_solution'];

export default function HintsPanel({ problemId, ctx }: Props) {
  const data = getHints(problemId);
  const [revealed, setRevealed] = useState<Set<HintTier>>(new Set());
  const [confirmTier, setConfirmTier] = useState<HintTier | null>(null);

  if (!data) {
    return (
      <div className="hint-empty">
        <Lightbulb size={32} />
        <p>No hints available for this problem yet.</p>
      </div>
    );
  }

  const canUnlock = (tier: HintTier): boolean => {
    const idx = ORDER.indexOf(tier);
    for (let i = 0; i < idx; i++) if (!revealed.has(ORDER[i])) return false;
    return true;
  };

  const reveal = (tier: HintTier, forceEarly = false) => {
    setRevealed((prev) => new Set(prev).add(tier));
    setConfirmTier(null);
    toast.success(
      forceEarly ? `${TIER_LABEL[tier]} unlocked early — mastery penalty applied.` : `${TIER_LABEL[tier]} unlocked.`,
      { icon: forceEarly ? '⚠️' : '💡' }
    );
  };

  return (
    <div className="hints-panel">
      <div className="hints-intro">
        <Sparkles size={14} />
        <span>Three graduated hints. Each affects your mastery weight on the next correct solve.</span>
      </div>

      {ORDER.map((tier) => {
        const hint = data.hints[tier];
        const available = isHintAvailable(ctx, tier);
        const isRevealed = revealed.has(tier);
        const canOrder = canUnlock(tier);

        return (
          <div
            key={tier}
            className={`hint-card ${isRevealed ? 'revealed' : available && canOrder ? 'available' : 'locked'}`}
          >
            <div className="hint-head">
              <div className="hint-badge">
                {isRevealed ? <Unlock size={14} /> : <Lock size={14} />}
                {TIER_LABEL[tier]}
              </div>
              <span className="hint-penalty">{TIER_PENALTY_LABEL[tier]}</span>
            </div>

            {isRevealed ? (
              <>
                <h4 className="hint-title">{hint.title}</h4>
                <div className={`hint-body ${tier === 'near_solution' ? 'mono' : ''}`}>{hint.body}</div>
              </>
            ) : (
              <>
                <div className="hint-status">
                  {available && canOrder
                    ? 'Ready to reveal.'
                    : !canOrder
                    ? `Unlock ${TIER_LABEL[ORDER[ORDER.indexOf(tier) - 1]]} first.`
                    : nextAvailableAt(ctx, tier)}
                </div>
                <div className="hint-progress">
                  Attempt <b>{ctx.attempt_count}</b> · {ctx.compile_errors} compile errors · {ctx.time_on_task_seconds}s
                </div>
                <div className="hint-actions">
                  {available && canOrder ? (
                    <button className="btn btn-primary btn-sm" onClick={() => reveal(tier)}>
                      Reveal {TIER_LABEL[tier]}
                    </button>
                  ) : canOrder ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmTier(tier)}>
                      Reveal early
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        );
      })}

      {confirmTier && (
        <div className="hint-confirm">
          <div className="hint-confirm-box">
            <AlertTriangle size={28} color="var(--med)" />
            <h4>Reveal early?</h4>
            <p>
              {TIER_LABEL[confirmTier]} isn&apos;t available yet. Unlocking it now
              counts as if you&apos;d hit the threshold — the mastery penalty
              ({TIER_PENALTY_LABEL[confirmTier]}) applies on your next correct solve.
            </p>
            <div className="hint-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmTier(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => reveal(confirmTier, true)}>Reveal anyway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
