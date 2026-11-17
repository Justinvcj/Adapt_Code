"use client";
import { useMemo, useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { CONCEPTS, type ConceptId } from '@/data/concepts';
import { CONCEPT_LAYERS } from '@/data/edges';

/**
 * The interactive concept map on the signed-out landing page.
 *
 * This is a demonstration with a SAMPLE learner, and the page says so. It uses
 * the real concept list and the real prerequisite edges, but the mastery
 * numbers are illustrative and nothing is sent to the backend. Touching a
 * topic lights everything it needs and everything it opens, in a cascade (the
 * same behaviour as the signed-in map in ConceptGraph.tsx). "Solve one" raises
 * the weakest open topic so a visitor can watch the next recommendation move
 * and a locked topic open.
 */
const W = 1200;
const H = 640;
const R = 38;
const RR = 31;
const LEARNED = 0.85;

const SAMPLE: Record<ConceptId, number> = {
  basic_syntax: 0.96, loops: 0.91, arrays: 0.88, strings: 0.86,
  hashing: 0.64, two_pointers: 0.41, binary_search: 0.52, recursion: 0.58,
  sliding_window: 0.1, backtracking: 0.1, trees: 0.1, dynamic_programming: 0.08,
};

type Pos = { x: number; y: number };

function layout(): Record<ConceptId, Pos> {
  const byLayer: Record<number, ConceptId[]> = {};
  for (const c of CONCEPTS) (byLayer[CONCEPT_LAYERS[c.id]] ||= []).push(c.id);
  const layers = Object.keys(byLayer).map(Number).sort((a, b) => a - b);
  const padY = 62, padX = 110;
  const stepY = (H - 2 * padY - 44) / Math.max(1, layers.length - 1);
  const pos = {} as Record<ConceptId, Pos>;
  layers.forEach((l, li) => {
    const ids = byLayer[l];
    const stepX = ids.length === 1 ? 0 : (W - 2 * padX) / (ids.length - 1);
    ids.forEach((id, i) => {
      pos[id] = { x: ids.length === 1 ? W / 2 : padX + i * stepX, y: padY + li * stepY };
    });
  });
  return pos;
}

export default function LandingMap({ onNext }: { onNext?: (info: { title: string; pct: number } | null) => void }) {
  const pos = useMemo(layout, []);
  const [mastery, setMastery] = useState(SAMPLE);
  const [touched, setTouched] = useState<ConceptId | null>(null);
  const [burst, setBurst] = useState<ConceptId | null>(null);
  const timer = useRef<number | null>(null);

  const isOpen = (id: ConceptId) =>
    CONCEPTS.find((c) => c.id === id)!.prereqs.every((p) => mastery[p] >= LEARNED);
  const focus = useMemo(() => {
    const open = CONCEPTS.filter((c) => c.prereqs.every((p) => mastery[p] >= LEARNED) && mastery[c.id] < LEARNED);
    return open.sort((a, b) => mastery[a.id] - mastery[b.id])[0] ?? null;
  }, [mastery]);

  useEffect(() => {
    onNext?.(focus ? { title: focus.title, pct: Math.round(mastery[focus.id] * 100) } : null);
  }, [focus, mastery, onNext]);

  // distance of every lit topic from the touched one (prerequisites up, unlocks down)
  const chain = useMemo(() => {
    const depth = new Map<ConceptId, number>();
    if (!touched) return depth;
    depth.set(touched, 0);
    const walk = (next: (id: ConceptId) => ConceptId[]) => {
      let layer: ConceptId[] = [touched];
      let d = 0;
      while (layer.length) {
        d += 1;
        const nx: ConceptId[] = [];
        for (const n of layer) for (const m of next(n)) if (!depth.has(m)) { depth.set(m, d); nx.push(m); }
        layer = nx;
      }
    };
    walk((id) => CONCEPTS.find((c) => c.id === id)?.prereqs ?? []);
    walk((id) => CONCEPTS.filter((c) => c.prereqs.includes(id)).map((c) => c.id));
    return depth;
  }, [touched]);

  const solve = () => {
    if (!focus) return;
    const id = focus.id;
    const before = mastery[id];
    const after = Math.min(0.97, before + 0.17);
    setMastery((m) => ({ ...m, [id]: after }));
    setBurst(id);
    if (before < LEARNED && after >= LEARNED) {
      // it just became learned: show what that opens
      setTouched(id);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setTouched(null), 2600);
    }
    window.setTimeout(() => setBurst(null), 1000);
  };
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return (
    <div className="lm">
      <svg
        className={`lm-svg ${touched ? 'has-active' : ''}`}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Sample concept map. Lit topics are learned, dashed topics are locked."
        onMouseLeave={() => setTouched(null)}
      >
        <defs>
          <linearGradient id="lm-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8E97FF" /><stop offset="1" stopColor="#FFC53D" />
          </linearGradient>
          <radialGradient id="lm-glass" cx="32%" cy="24%" r="85%">
            <stop offset="0" stopColor="#8E97FF" stopOpacity=".30" /><stop offset="1" stopColor="#8E97FF" stopOpacity=".05" />
          </radialGradient>
        </defs>

        {CONCEPTS.flatMap((c) => c.prereqs.map((p) => {
          const a = pos[p], b = pos[c.id];
          const my = (a.y + b.y) / 2;
          const d = `M${a.x} ${a.y + R}C${a.x} ${my + 14} ${b.x} ${my - 14} ${b.x} ${b.y - R}`;
          const lit = chain.has(p) && chain.has(c.id);
          const delay = Math.max(chain.get(p) ?? 0, chain.get(c.id) ?? 0);
          return (
            <g key={`${p}-${c.id}`}>
              <path className={`lm-edge ${isOpen(c.id) ? 'open' : ''} ${lit ? 'lit' : ''}`} d={d} style={{ ['--d' as string]: delay }} />
              <path className={`lm-flow ${lit ? 'lit' : ''}`} d={d} style={{ ['--d' as string]: delay }} />
            </g>
          );
        }))}

        {CONCEPTS.map((c) => {
          const p = pos[c.id];
          const open = isOpen(c.id);
          const v = mastery[c.id];
          const Icon = c.icon;
          const cls = [
            'lm-node',
            open ? '' : 'locked',
            open && v >= LEARNED ? 'done' : '',
            focus?.id === c.id ? 'focus' : '',
            chain.has(c.id) ? 'lit' : '',
            burst === c.id ? 'burst' : '',
          ].filter(Boolean).join(' ');
          return (
            <g
              key={c.id}
              className={cls}
              style={{ ['--d' as string]: chain.get(c.id) ?? 0 }}
              tabIndex={0}
              role="button"
              aria-label={`${c.title}${open ? `, ${Math.round(v * 100)} percent` : ', locked'}`}
              onMouseEnter={() => setTouched(c.id)}
              onFocus={() => setTouched(c.id)}
              onBlur={() => setTouched(null)}
              onClick={() => setTouched(c.id)}
            >
              <g className="lm-body">
                <circle className="lm-halo" cx={p.x} cy={p.y} r={R + 14} />
                <circle className="lm-glass" cx={p.x} cy={p.y} r={R} />
                <circle className="lm-track" cx={p.x} cy={p.y} r={RR} />
                <circle
                  className="lm-ring" cx={p.x} cy={p.y} r={RR} pathLength={100}
                  transform={`rotate(-90 ${p.x} ${p.y})`}
                  style={{ strokeDashoffset: open ? 100 - v * 100 : 100 }}
                />
                <foreignObject x={p.x - 13} y={p.y - 13} width={26} height={26} style={{ pointerEvents: 'none' }}>
                  <div className="lm-glyph">{open ? <Icon size={22} strokeWidth={1.7} /> : <Lock size={19} strokeWidth={1.7} />}</div>
                </foreignObject>
              </g>
              <text className="lm-label" x={p.x} y={p.y + R + 26}>{c.title}</text>
            </g>
          );
        })}
      </svg>

      <div className="lm-foot">
        <div className="lm-next">
          <span>{focus ? `Sample learner. Next, because ${focus.title} is the weakest open topic at ${Math.round(mastery[focus.id] * 100)}%` : 'Sample learner. Every topic on the map is learned'}</span>
          <strong>{focus ? `A ${focus.title} problem` : 'Nothing left to recommend'}</strong>
        </div>
        <button className="btn btn-primary ac-btn-lg" onClick={solve} disabled={!focus}>Solve one</button>
      </div>
    </div>
  );
}
