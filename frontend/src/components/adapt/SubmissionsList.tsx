"use client";
import { Lightbulb, Inbox } from 'lucide-react';
import { TIER_LABEL, type HintTier } from '@/data/hints';
import type { Submission } from './ExplanationPanel';

const TIER_SHORT: Record<HintTier, string> = {
  nudge: 'N',
  scaffold: 'S',
  near_solution: 'NS',
};

function timeAgo(ms: number): string {
  const d = (Date.now() - ms) / 1000;
  if (d < 10) return 'just now';
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function SubmissionsList({ submissions }: { submissions: Submission[] }) {
  if (!submissions.length) {
    return (
      <div className="subs-empty">
        <Inbox size={32} />
        <h4>No submissions yet</h4>
        <p>Hit <b>Run</b> to test your code, then <b>Submit</b> when you&apos;re ready. Every submission lands here with its verdict, runtime, and which hints you used.</p>
      </div>
    );
  }

  return (
    <div className="subs">
      <div className="subs-head">
        <h3>Your submissions</h3>
        <span className="subs-count">{submissions.length} total</span>
      </div>
      <table className="tbl subs-tbl">
        <thead>
          <tr>
            <th>Verdict</th>
            <th>Lang</th>
            <th>Runtime</th>
            <th>Hints</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const color =
              s.verdict === 'Accepted'    ? 'var(--solved)' :
              s.verdict === 'TLE'         ? 'var(--med)'    :
                                            'var(--hard)';
            return (
              <tr key={s.id}>
                <td style={{ color, fontWeight: 600 }}>{s.verdict}</td>
                <td style={{ color: 'var(--tx-2)' }}>{s.language}</td>
                <td style={{ color: 'var(--tx-2)', fontVariantNumeric: 'tabular-nums' }}>
                  {s.runtime_ms !== null ? `${s.runtime_ms} ms` : '—'}
                </td>
                <td>
                  {s.hints.length === 0 ? (
                    <span style={{ color: 'var(--tx-3)' }}>—</span>
                  ) : (
                    <span className="subs-hint-badges">
                      {s.hints.map((h) => (
                        <span key={h} className={`subs-hint-badge tier-${h}`} title={`${TIER_LABEL[h]} used`}>
                          <Lightbulb size={9} /> {TIER_SHORT[h]}
                        </span>
                      ))}
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--tx-2)' }}>{timeAgo(s.at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
