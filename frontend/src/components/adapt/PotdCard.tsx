"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Check, ArrowRight, Calendar } from 'lucide-react';
import { potdAPI, API_ENABLED, type ApiPotd } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CONCEPT_BY_ID, type ConceptId } from '@/data/concepts';

export default function PotdCard() {
  const { status } = useAuth();
  const [potd, setPotd] = useState<ApiPotd | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'hidden'>(
    API_ENABLED ? 'loading' : 'hidden',
  );

  useEffect(() => {
    if (!API_ENABLED) return;
    // POTD endpoint requires auth — hide the card for anonymous visitors
    // rather than rendering a sad empty state.
    if (status === 'anonymous' || status === 'offline') {
      setState('hidden');
      return;
    }
    if (status !== 'authed') return;
    let cancelled = false;
    (async () => {
      try {
        const r = await potdAPI.today();
        if (!cancelled && r?.data) {
          setPotd(r.data);
          setState('ready');
        }
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [status]);

  if (state === 'hidden' || state === 'error') return null;

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const concept = potd && CONCEPT_BY_ID[potd.concept_tag as ConceptId];
  const difficulty = potd ? potd.difficulty_level.charAt(0).toUpperCase() + potd.difficulty_level.slice(1) : '';
  const diffColor = potd?.difficulty_level === 'hard'
    ? 'var(--red, #ff6b6b)'
    : potd?.difficulty_level === 'medium'
      ? 'var(--accent, #ffb867)'
      : 'var(--solved, #2fe28a)';

  return (
    <div
      style={{
        position: 'relative',
        padding: '20px 24px',
        marginBottom: 24,
        borderRadius: 12,
        border: '1px solid var(--border-t)',
        background: 'linear-gradient(135deg, rgba(255,184,103,.06) 0%, rgba(94,106,210,.04) 100%)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(1200px 160px at 10% -40%, rgba(255,184,103,.14), transparent 60%)',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
        <div style={{
          flexShrink: 0,
          width: 48, height: 48, borderRadius: 12,
          display: 'grid', placeItems: 'center',
          background: potd?.is_solved
            ? 'linear-gradient(135deg, #2fe28a, #27a644)'
            : 'linear-gradient(135deg, #ffb867, #ffa116)',
          boxShadow: potd?.is_solved
            ? '0 0 24px rgba(47,226,138,.25)'
            : '0 0 24px rgba(255,184,103,.3)',
        }}>
          {potd?.is_solved
            ? <Check size={22} color="#061016" strokeWidth={2.5} />
            : <Flame size={22} color="#061016" strokeWidth={2.2} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
            textTransform: 'uppercase', color: 'var(--tx-2)', marginBottom: 4,
          }}>
            <Calendar size={11} /> Problem of the day
            <span style={{ color: 'var(--tx-3)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>· {today}</span>
          </div>
          {state === 'loading' && (
            <div style={{ fontSize: 15, color: 'var(--tx-2)' }}>Loading today&apos;s challenge…</div>
          )}
          {state === 'ready' && potd && (
            <>
              <div style={{
                fontSize: 18, fontWeight: 600, color: 'var(--tx-1)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {potd.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 12, color: 'var(--tx-2)' }}>
                <span style={{ color: diffColor, fontWeight: 600 }}>{difficulty}</span>
                {concept && <><span>·</span><span>{concept.title}</span></>}
                {potd.is_solved && (
                  <>
                    <span>·</span>
                    <span style={{ color: 'var(--solved, #2fe28a)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={11} /> Solved
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {state === 'ready' && potd && (
          <Link
            href={`/problem/${potd.problem_id}`}
            className="btn btn-learn"
            style={{ flexShrink: 0, textDecoration: 'none' }}
          >
            {potd.is_solved ? 'Review' : 'Solve'} <ArrowRight size={13} />
          </Link>
        )}
      </div>
    </div>
  );
}
