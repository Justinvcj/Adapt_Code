"use client";
import { Lightbulb, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TIER_LABEL, type HintTier } from '@/data/hints';

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
  hintsRevealed: HintTier[];
  onGoToHints: () => void;
};

/**
 * Explanation panel — the post-submit teaching moment.
 * Three sections: what went wrong, why the approach fails, what to review.
 * On accepted, pat on the back + what the mastery multiplier settled at.
 */
export default function ExplanationPanel({ latest, hintsRevealed, onGoToHints }: Props) {
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
              Mastery for <b>Hashing</b> went up by <b>{(latest.mastery_delta * 100).toFixed(1)} pts</b>
              {hintsRevealed.length > 0 && (
                <> (multiplier applied for {hintsRevealed.length} hint{hintsRevealed.length > 1 ? 's' : ''})</>
              )}
              .
            </p>
          </div>
        </div>

        <section className="expl-card">
          <h4>What your solution did well</h4>
          <p>You used a hash map to look up the complement of each number as you walked the array. That turns the problem into one pass, O(n) time, O(n) space. Clean trade.</p>
        </section>

        <section className="expl-card">
          <h4>Where to go next</h4>
          <p>Hashing patterns show up again in Sliding Window and Longest Consecutive Sequence. The lookup-by-key habit you just built is the same primitive — different shape.</p>
          <a className="btn btn-ghost btn-sm expl-link" onClick={onGoToHints}>
            See similar problems <ArrowRight size={12} />
          </a>
        </section>
      </div>
    );
  }

  // Any failed verdict — the real teaching moment
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
          <h4>What went wrong</h4>
        </div>
        <p>Your code returned <code>[0, 1]</code> for <code>nums = [3, 2, 4], target = 6</code>. The grader expected <code>[1, 2]</code>. Your loop started matching the first number it saw against itself; the complement check needs to look at numbers you&apos;ve already *passed*, not at <code>i</code>.</p>
      </section>

      <section className="expl-card">
        <div className="expl-card-head">
          <span className="expl-chip">2</span>
          <h4>Why that approach doesn&apos;t work</h4>
        </div>
        <p>A single-pass lookup needs a store of "numbers I have seen so far". If you insert the current number into the map <em>before</em> checking for its complement, you&apos;ll find the number itself and declare a false match. The order has to be: check for the complement first, then insert.</p>
      </section>

      <section className="expl-card">
        <div className="expl-card-head">
          <span className="expl-chip">3</span>
          <h4>What to review</h4>
        </div>
        <p>Hashing — specifically the <b>one-pass lookup</b> idiom. The pattern is: iterate, derive the key you&apos;re looking for from the current element, probe the map, then insert. Try the first two problems in <b>Hashing</b> on the Mastery page to lock it in.</p>
        <a className="btn btn-ghost btn-sm expl-link" onClick={onGoToHints}>
          Reveal a hint <ArrowRight size={12} />
        </a>
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
