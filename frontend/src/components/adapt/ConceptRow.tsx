"use client";
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, BookOpen, type LucideIcon } from 'lucide-react';
import type { Concept, MasteryEntry } from '@/data/concepts';

type Props = {
  concept: Concept;
  mastery: MasteryEntry;
  unlockBlockedBy?: string;        // names of unmet prereqs for locked rows
  recommended?: boolean;
};

export default function ConceptRow({ concept, mastery, unlockBlockedBy, recommended }: Props) {
  const router = useRouter();
  const Icon: LucideIcon = concept.icon;
  const pct = Math.round(mastery.mastery * 100);
  const total = concept.problems.easy + concept.problems.medium + concept.problems.hard;

  // Donut geometry
  const R = 42;
  const C = 2 * Math.PI * R;
  const dash = C * mastery.mastery;

  const solvedByDiff = {
    easy:   Math.min(concept.problems.easy,   Math.round(mastery.solved * 0.55)),
    medium: Math.min(concept.problems.medium, Math.round(mastery.solved * 0.35)),
    hard:   Math.min(concept.problems.hard,   Math.round(mastery.solved * 0.10)),
  };

  const openConcept = () => {
    if (!mastery.unlocked) return;
    router.push(`/mastery/${concept.id}`);
  };

  return (
    <article
      className={`crow ${mastery.unlocked ? '' : 'locked'} ${recommended ? 'recommended' : ''}`}
      onClick={openConcept}
    >
      {recommended && <span className="crow-rec-tag">Up next</span>}

      {/* Donut */}
      <div className="crow-donut">
        <svg viewBox="0 0 100 100" width="104" height="104">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r={R} fill="none"
            stroke={mastery.unlocked ? 'url(#crow-grad)' : 'var(--border-h)'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C - dash}`}
            transform="rotate(-90 50 50)"
          />
          <defs>
            <linearGradient id="crow-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent-2, var(--accent))" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="crow-donut-text">
          <b>{pct}<span>%</span></b>
          <span>mastery</span>
        </div>
      </div>

      {/* Content column */}
      <div className="crow-main">
        <header className="crow-head">
          <div className="crow-icon">
            {mastery.unlocked ? <Icon size={18} strokeWidth={1.75} /> : <Lock size={16} />}
          </div>
          <div className="crow-title-wrap">
            <h3>{concept.title}</h3>
            <p>{concept.long.split('.')[0]}.</p>
          </div>
          <span className="crow-count"><BookOpen size={11} /> {total} problems</span>
        </header>

        {/* Progress bar */}
        <div className="crow-bar">
          <div className="crow-bar-track">
            <div
              className="crow-bar-fill"
              style={{ width: `${mastery.unlocked ? pct : 0}%` }}
            />
          </div>
          <span className="crow-bar-val">{mastery.unlocked ? `${pct}%` : 'Locked'}</span>
        </div>

        {/* Difficulty tiles + Practice CTA */}
        <footer className="crow-foot">
          {mastery.unlocked ? (
            <>
              <div className="crow-diffs">
                <DiffTile kind="e" solved={solvedByDiff.easy}   total={concept.problems.easy}   label="Easy" />
                <DiffTile kind="m" solved={solvedByDiff.medium} total={concept.problems.medium} label="Medium" />
                <DiffTile kind="h" solved={solvedByDiff.hard}   total={concept.problems.hard}   label="Hard" />
              </div>
              <button
                className="crow-cta"
                onClick={(e) => { e.stopPropagation(); router.push(`/mastery/${concept.id}`); }}
              >
                Practice <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <div className="crow-locked-note">
              <Lock size={12} /> Unlock after reaching 50 % in {unlockBlockedBy}
            </div>
          )}
        </footer>
      </div>
    </article>
  );
}

function DiffTile({ kind, solved, total, label }: { kind: 'e' | 'm' | 'h'; solved: number; total: number; label: string }) {
  return (
    <div className={`crow-diff crow-diff-${kind}`}>
      <div className="crow-diff-icon"><BookOpen size={13} strokeWidth={1.75} /></div>
      <div>
        <span className="crow-diff-label">{label}</span>
        <b>{solved} <span>/ {total}</span></b>
      </div>
    </div>
  );
}
