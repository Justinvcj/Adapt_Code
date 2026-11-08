/**
 * Shared hooks that fetch live backend data with graceful offline fallback.
 *
 * Every component that reads mastery / stats / heatmap goes through these
 * so the offline fallback (`API_ENABLED === false` or API 5xx) is handled
 * in one place instead of being reinvented per component — CLAUDE.md
 * requires the UI never crash when the backend is unreachable.
 */
"use client";

import { useEffect, useState } from 'react';
import {
  masteryAPI,
  statsAPI,
  API_ENABLED,
  ApiOffline,
  ApiError,
  type ApiMasteryEntry,
  type ApiStatsSummary,
} from './api';
import { CONCEPTS, MOCK_MASTERY, type ConceptId } from '@/data/concepts';

export type LiveMasteryMap = Record<ConceptId, {
  mastery: number;
  unlocked: boolean;
  solved: number;
  attempted: number;
  prerequisites: string[];
}>;

/**
 * Build a `MOCK_MASTERY`-shaped map from the backend response.
 * Any concept the backend didn't return (first login, no events yet) falls
 * back to the mock value so the UI never shows NaN.
 */
function adaptMasteryList(list: ApiMasteryEntry[]): LiveMasteryMap {
  const byId = new Map(list.map((e) => [e.concept_tag as ConceptId, e]));
  const out = {} as LiveMasteryMap;
  for (const c of CONCEPTS) {
    const real = byId.get(c.id);
    const fallback = MOCK_MASTERY[c.id];
    out[c.id] = real
      ? {
          mastery: real.mastery_probability,
          unlocked: real.is_unlocked,
          solved: real.problems_solved,
          attempted: real.problems_attempted,
          prerequisites: real.prerequisites,
        }
      : {
          mastery: fallback.mastery,
          unlocked: fallback.unlocked,
          solved: fallback.solved,
          attempted: 0,
          prerequisites: c.prereqs,
        };
  }
  return out;
}

export function fallbackMasteryMap(): LiveMasteryMap {
  const out = {} as LiveMasteryMap;
  for (const c of CONCEPTS) {
    const m = MOCK_MASTERY[c.id];
    out[c.id] = {
      mastery: m.mastery,
      unlocked: m.unlocked,
      solved: m.solved,
      attempted: 0,
      prerequisites: c.prereqs,
    };
  }
  return out;
}

export type LiveMasteryState = {
  mastery: LiveMasteryMap;
  live: boolean;      // true when the data came from the backend, false when it's the mock
  loading: boolean;
};

/**
 * Mastery for the signed-in student (or mock if the backend is offline /
 * the user is anonymous). Shape matches MOCK_MASTERY so legacy components
 * keep working without changes.
 */
export function useLiveMastery(): LiveMasteryState {
  const [state, setState] = useState<LiveMasteryState>({
    mastery: fallbackMasteryMap(),
    live: false,
    loading: API_ENABLED,
  });

  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await masteryAPI.list();
        if (!cancelled && r?.data) {
          setState({ mastery: adaptMasteryList(r.data), live: true, loading: false });
        } else if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch (err) {
        if (!cancelled) {
          // 401 (anonymous) or offline — keep the mock, no console noise.
          setState((s) => ({ ...s, loading: false }));
          if (!(err instanceof ApiOffline || err instanceof ApiError)) {
            // Only log the unexpected cases.
            console.warn('[live-data] mastery fetch failed', err);
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

export type LiveStatsState = {
  stats: ApiStatsSummary | null;
  live: boolean;
  loading: boolean;
};

export function useLiveStats(): LiveStatsState {
  const [state, setState] = useState<LiveStatsState>({
    stats: null,
    live: false,
    loading: API_ENABLED,
  });

  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await statsAPI.summary();
        if (!cancelled && r?.data) {
          setState({ stats: r.data, live: true, loading: false });
        } else if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
          if (!(err instanceof ApiOffline || err instanceof ApiError)) {
            console.warn('[live-data] stats fetch failed', err);
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

export type HeatmapEntry = { date: string; count: number };
export type LiveHeatmapState = {
  entries: HeatmapEntry[];
  live: boolean;
  loading: boolean;
};

export function useLiveHeatmap(): LiveHeatmapState {
  const [state, setState] = useState<LiveHeatmapState>({
    entries: [],
    live: false,
    loading: API_ENABLED,
  });

  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await statsAPI.heatmap();
        if (!cancelled && r?.data) {
          setState({ entries: r.data, live: true, loading: false });
        } else if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
          if (!(err instanceof ApiOffline || err instanceof ApiError)) {
            console.warn('[live-data] heatmap fetch failed', err);
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

export function pickWeakestUnlocked(mastery: LiveMasteryMap): ConceptId {
  const unlocked = CONCEPTS.filter((c) => mastery[c.id].unlocked);
  if (unlocked.length === 0) return CONCEPTS[0].id;
  return unlocked.sort((a, b) => mastery[a.id].mastery - mastery[b.id].mastery)[0].id;
}
