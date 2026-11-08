"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CONCEPT_BY_ID } from '@/data/concepts';
import { problemsAPI, API_ENABLED, ApiOffline, ApiError } from '@/lib/api';
import { useLiveMastery, pickWeakestUnlocked } from '@/lib/live-data';

/**
 * /learn — adaptive-path dispatcher.
 *
 * Reads the student's real mastery vector from /api/mastery, finds the
 * weakest unlocked concept, then hands the final pick to /api/next-problem
 * (which runs LinUCB on the server). Falls back to local-mock routing
 * when the backend is unreachable.
 */
export default function LearnDispatcher() {
  const router = useRouter();
  const { mastery, live, loading } = useLiveMastery();

  useEffect(() => {
    if (loading) return;
    const weakestId = pickWeakestUnlocked(mastery);
    const weakest = CONCEPT_BY_ID[weakestId];
    if (!weakest) {
      router.replace('/mastery');
      return;
    }

    const weakestPct = Math.round(mastery[weakestId].mastery * 100);
    toast(`Next up: ${weakest.title} — ${weakestPct}% mastery`, {
      icon: '🎯',
      duration: 2200,
    });

    (async () => {
      // Backend picks the actual problem via LinUCB. On any failure (anon,
      // offline, 5xx) we fall back to the legacy hardcoded two-sum route so
      // the button never leads to a dead end.
      if (!API_ENABLED) {
        setTimeout(() => router.replace('/problem/two-sum'), 400);
        return;
      }
      try {
        const next = await problemsAPI.next();
        const slug = (next as { problem_id?: string; id?: string; slug?: string })
          ?.problem_id
          ?? (next as { slug?: string })?.slug
          ?? (next as { id?: string })?.id
          ?? '';
        if (slug) {
          router.replace(`/problem/${slug}`);
        } else {
          router.replace('/problem/two-sum');
        }
      } catch (err) {
        if (!(err instanceof ApiOffline || err instanceof ApiError)) {
          console.warn('[learn] next-problem failed', err);
        }
        router.replace('/problem/two-sum');
      }
    })();
  }, [loading, mastery, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      color: 'var(--tx-2)',
      fontSize: 14,
    }}>
      <div className="learn-pulse" />
      <span>{live ? 'Picking the right problem for you…' : 'Loading your path…'}</span>
      <style jsx>{`
        .learn-pulse {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #ffb867, #ffa116);
          box-shadow: 0 0 40px rgba(255,161,22,.5);
          animation: lp 1.2s ease-in-out infinite;
        }
        @keyframes lp {
          0%, 100% { transform: scale(1); opacity: .9; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
