"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import { CONCEPTS, type ConceptId } from '@/data/concepts';
import { api, API_ENABLED, ApiError, ApiOffline } from '@/lib/api';

/**
 * /onboarding — one-question cold-start survey.
 *
 * Posts to /api/onboarding/complete which upserts mastery_scores at the
 * MASTERY_THRESHOLD for every concept the student checks, so the LinUCB
 * agent doesn't start from P(L0) = 0.3 on concepts they already know.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<ConceptId>>(new Set());
  const [busy, setBusy] = useState(false);

  const toggle = (id: ConceptId) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const finish = async (skip = false) => {
    if (busy) return;
    const chosen = skip ? [] : Array.from(selected);
    setBusy(true);
    if (!API_ENABLED) {
      toast.success('Welcome — using local mode');
      router.push('/');
      return;
    }
    try {
      await api.post('/api/onboarding/complete', { mastered_concepts: chosen });
      toast.success(skip ? 'Let’s go' : `${chosen.length} concept${chosen.length === 1 ? '' : 's'} set`);
      router.push('/learn');
    } catch (err) {
      if (err instanceof ApiOffline) {
        toast.success('Welcome — using local mode');
        router.push('/');
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error('Sign in to save your onboarding');
        router.push('/login');
      } else {
        toast.error('Could not save — moving on anyway');
        router.push('/');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '64px 24px 96px',
      color: 'var(--tx)',
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>What do you already know?</h1>
      <p style={{ color: 'var(--tx-2)', fontSize: 14, marginBottom: 24, lineHeight: 1.55 }}>
        Tick anything you&apos;ve already got solid. We&apos;ll skip the warm-ups for those and
        send you straight to the frontier. You can always override this later.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {CONCEPTS.map((c) => {
          const on = selected.has(c.id);
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 14px',
                textAlign: 'left',
                borderRadius: 10,
                border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                background: on ? 'var(--accent-soft, rgba(255,161,22,.08))' : 'transparent',
                color: 'var(--tx)',
                cursor: 'pointer',
                transition: 'border-color .15s, background .15s',
              }}
            >
              <Icon size={18} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'var(--tx-2)' }}>{c.short}</div>
              </div>
              {on && <CheckCircle2 size={16} style={{ color: 'var(--accent, #ffa116)' }} />}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => finish(true)}
        >
          Skip — I&apos;m starting from zero
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => finish(false)}
        >
          {busy ? 'Saving…' : `Continue${selected.size ? ` (${selected.size})` : ''}`}
        </button>
      </div>
    </main>
  );
}
