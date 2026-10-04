"use client";
import Link from 'next/link';
import { Lightbulb, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TIER_LABEL, type HintTier } from '@/data/hints';
import { CONCEPT_BY_ID, type ConceptId } from '@/data/concepts';
import { CONCEPT_TEACHING, PROBLEMS_BY_CONCEPT, PROBLEM_BANK } from '@/data/problems';

export type Submission = {
  id: string;
  at: number;
  verdict: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compile Error' | 'TLE';
  runtime_ms: number | null;
  language: string;
  hints: HintTier[];
  mastery_delta: number;
};

type Props = {
  latest?: Submission;
  concept: ConceptId;
  hintsRevealed: HintTier[];
  onGoToHints: () => void;
};

/**
 * Explanation panel — the post-submit teaching moment.
 * Teaching copy is driven by the problem's concept so every concept speaks
 * in its own voice instead of the generic hashing lesson.
 */
export default function ExplanationPanel({ latest, concept, hintsRevealed, onGoToHints }: Props) {
  const c = CONCEPT_BY_ID[concept];
  const teaching = CONCEPT_TEACHING[concept];
  const sibling = (PROBLEMS_BY_CONCEPT[concept] ?? []).slice(0, 3);

  if (!latest) {
    return (
      <div className="expl-empty">
        <Sparkles size={32} />
        <h4>Nothing to explain yet</h4>
        <p>Submit your solution and I&apos;ll walk you through what the code did, what the grader saw, and what concept to brush up on if you&apos;re stuck.</p>
      </div>
    );
  }

  if (latest.verdict === 'Accepted') {
    return (
      <div className="expl">
        <div className="expl-verdict ok">
          <CheckCircle2 size={20} />
          <div>
            <h3>Accepted · {latest.runtime_ms ?? '—'} ms</h3>
            <p>
              Mastery for <b>{c?.title ?? concept}</b> went up by <b>{(latest.mastery_delta * 100).toFixed(1)} pts</b>
              {hintsRevealed.length > 0 && (
                <> (multiplier applied for {hintsRevealed.length} hint{hintsRevealed.length > 1 ? 's' : ''})</>
              )}
              .
            </p>
          </div>
        </div>

        <section className="expl-card">
          <h4>What this problem rehearsed</h4>
          <p>{teaching.idiom}</p>
        </section>

        <section className="expl-card">
          <h4>Where to go next</h4>
          <p>The <b>{teaching.nextTopic}</b> concept builds directly on this one. If you want more reps on {c?.title ?? concept} first, these problems share the same idea in a different shape:</p>
          {sibling.length > 0 && (
            <ul className="expl-sibling-list">
              {sibling.map((slug) => {
                const p = PROBLEM_BANK[slug];
                if (!p) return null;
                return (
                  <li key={slug}>
                    <Link href={`/problem/${slug}`}>
                      <span className="expl-sibling-title">{p.title}</span>
                      <span className={`expl-sibling-diff diff-${p.difficulty === 'Easy' ? 'e' : p.difficulty === 'Medium' ? 'm' : 'h'}`}>{p.difficulty}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link className="btn btn-ghost btn-sm expl-link" href={`/mastery/${concept}`}>
            Go to {c?.title ?? concept} <ArrowRight size={12} />
          </Link>
        </section>
      </div>
    );
  }

  const problemText = {
    'Wrong Answer':   'The grader expected a different output.',
    'Runtime Error':  'Your code crashed before finishing.',
    'Compile Error':  'The compiler rejected your code.',
    'TLE':            'Your solution ran out of time before answering.',
  }[latest.verdict];

  return (
    <div className="expl">
      <div className="expl-verdict bad">
        <AlertCircle size={20} />
        <div>
          <h3>{latest.verdict}</h3>
          <p>{problemText}</p>
        </div>
      </div>

      <section className="expl-card">
        <div className="expl-card-head">
          <span className="expl-chip">1</span>
          <h4>What usually goes wrong here</h4>
        </div>
        <p>{teaching.commonMistake}</p>
      </section>

      <section className="expl-card">
        <div className="expl-card-head">
          <span className="expl-chip">2</span>
          <h4>The idea this problem rehearses</h4>
        </div>
        <p>{teaching.idiom}</p>
      </section>

      <section className="expl-card">
        <div className="expl-card-head">
          <span className="expl-chip">3</span>
          <h4>What to review</h4>
        </div>
        <p>Open the <b>{c?.title ?? concept}</b> concept and work through its first problems — the shape of the idea becomes obvious once you&apos;ve seen it in two different problems.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm expl-link" onClick={onGoToHints}>
            Reveal a hint <ArrowRight size={12} />
          </button>
          <Link className="btn btn-ghost btn-sm expl-link" href={`/mastery/${concept}`}>
            Open {c?.title ?? concept} <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {hintsRevealed.length > 0 && (
        <div className="expl-hints-used">
          <Lightbulb size={13} />
          Hints revealed this session: {hintsRevealed.map((h) => TIER_LABEL[h]).join(', ')}
        </div>
      )}
    </div>
  );
}
