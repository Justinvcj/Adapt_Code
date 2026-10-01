"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CONCEPTS, MOCK_MASTERY } from '@/data/concepts';

/**
 * /learn — adaptive-path dispatcher.
 * Reads the user's mastery vector (mock for now, /api/me/mastery later),
 * finds the weakest unlocked concept, and routes to a problem in that concept.
 * Once a per-concept problem corpus is wired, this picks the next unseen problem
 * at the right difficulty based on BKT state.
 */
export default function LearnDispatcher() {
  const router = useRouter();

  useEffect(() => {
    const weakest = CONCEPTS
      .filter((c) => MOCK_MASTERY[c.id].unlocked)
      .sort((a, b) => MOCK_MASTERY[a.id].mastery - MOCK_MASTERY[b.id].mastery)[0];

    if (!weakest) {
      router.replace('/mastery');
      return;
    }

    toast(`Next up: ${weakest.title} — ${Math.round(MOCK_MASTERY[weakest.id].mastery * 100)}% mastery`, {
      icon: '🎯',
      duration: 2500,
    });

    // Until a per-concept problem corpus lands, every path leads to Two Sum.
    // Later: query a /api/me/next-problem?concept=<id> endpoint and route to the slug it returns.
    setTimeout(() => router.replace(`/problem/two-sum`), 400);
  }, [router]);

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
      <span>Picking the right problem for you…</span>
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
