"use client";
import { useMemo, useRef, useState, useEffect } from 'react';
import { CONCEPTS, MOCK_MASTERY, type ConceptId } from '@/data/concepts';
import { CONCEPT_LAYERS, EDGE_NOTES, noteFor } from '@/data/edges';
import { Play, Lock, ArrowRight, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

type Pos = { x: number; y: number };
type EdgeKey = `${ConceptId}->${ConceptId}`;

const W = 1300;         // widened canvas for better spread
const H = 640;
const NODE_R = 44;
const PAD_Y = 72;
const PAD_X = 90;

function computeLayout(): Record<ConceptId, Pos> {
  const byLayer: Record<number, ConceptId[]> = {};
  for (const c of CONCEPTS) {
    const l = CONCEPT_LAYERS[c.id];
    (byLayer[l] ||= []).push(c.id);
  }
  const layers = Object.keys(byLayer).map(Number).sort((a, b) => a - b);
  const stepY = (H - 2 * PAD_Y) / Math.max(1, layers.length - 1);

  const pos: Partial<Record<ConceptId, Pos>> = {};
  for (const l of layers) {
    const ids = byLayer[l];
    const n = ids.length;
    const usable = W - 2 * PAD_X;
    const stepX = n === 1 ? 0 : usable / (n - 1);
    ids.forEach((id, i) => {
      pos[id] = {
        x: n === 1 ? W / 2 : PAD_X + i * stepX,
        y: PAD_Y + l * stepY,
      };
    });
  }
  return pos as Record<ConceptId, Pos>;
}

function curvePath(a: Pos, b: Pos): string {
  const dy = b.y - a.y;
  const c1y = a.y + dy * 0.5;
  const c2y = b.y - dy * 0.5;
  return `M ${a.x} ${a.y + NODE_R} C ${a.x} ${c1y}, ${b.x} ${c2y}, ${b.x} ${b.y - NODE_R - 4}`;
}

function conceptTier(id: ConceptId): 'done' | 'progress' | 'weak' | 'locked' {
  const m = MOCK_MASTERY[id];
  if (!m.unlocked) return 'locked';
  if (m.mastery >= 0.75) return 'done';
  if (m.mastery < 0.4)   return 'weak';
  return 'progress';
}

export default function ConceptGraph() {
  const pos = useMemo(computeLayout, []);
  const initialHover = useMemo<ConceptId | null>(() => {
    const unlocked = CONCEPTS.filter((c) => MOCK_MASTERY[c.id].unlocked);
    if (!unlocked.length) return null;
    return unlocked.sort((a, b) => MOCK_MASTERY[a.id].mastery - MOCK_MASTERY[b.id].mastery)[0].id;
  }, []);
  const [hoverNode, setHoverNode] = useState<ConceptId | null>(initialHover);
  const [pinnedNode, setPinnedNode] = useState<ConceptId | null>(initialHover);
  const [hoverEdge, setHoverEdge] = useState<EdgeKey | null>(null);

  // Zoom & pan state
  const [zoom, setZoom]     = useState(1);
  const [pan,  setPan]      = useState({ x: 0, y: 0 });
  const dragRef             = useRef<{ x: number; y: number } | null>(null);
  const wrapRef             = useRef<HTMLDivElement>(null);

  const hoverEdgeInfo = hoverEdge ? (() => {
    const [from, to] = hoverEdge.split('->') as [ConceptId, ConceptId];
    return { from, to, why: noteFor(from, to) };
  })() : null;

  const connectedToHover = (id: ConceptId) => {
    if (!hoverNode) return false;
    if (id === hoverNode) return true;
    const c = CONCEPTS.find((x) => x.id === hoverNode)!;
    if (c.prereqs.includes(id)) return true;
    return CONCEPTS.find((x) => x.id === id)?.prereqs.includes(hoverNode);
  };
  const isEdgeActive = (from: ConceptId, to: ConceptId) =>
    !!hoverNode && (from === hoverNode || to === hoverNode);

  // Pan via middle-click or alt-drag anywhere in the canvas
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
    };
    const onUp = () => { dragRef.current = null; document.body.style.cursor = ''; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  const beginPan = (e: React.MouseEvent) => {
    // Pan only when the user holds alt or middle-clicks (so node clicks still work)
    if (!(e.altKey || e.button === 1)) return;
    e.preventDefault();
    dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    document.body.style.cursor = 'grabbing';
  };

  return (
    <div className="cg-wrap" ref={wrapRef}>
      <div className="cg-legend">
        <span><i className="dot earned"   /> Mastered</span>
        <span><i className="dot progress" /> In progress</span>
        <span><i className="dot weak"     /> Low mastery</span>
        <span><i className="dot locked"   /> Locked</span>
      </div>

      <div className="cg-tools">
        <button className="cg-tool" title="Zoom in"       onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}><ZoomIn size={14} /></button>
        <button className="cg-tool" title="Zoom out"      onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}><ZoomOut size={14} /></button>
        <button className="cg-tool" title="Reset view"    onClick={resetView}><RotateCcw size={14} /></button>
        <button className="cg-tool" title="Fullscreen"    onClick={toggleFullscreen}><Maximize2 size={14} /></button>
      </div>

      <div
        className="cg-viewport"
        onMouseDown={beginPan}
        onWheel={(e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom((z) => Math.max(0.5, Math.min(2.5, z + (e.deltaY > 0 ? -0.1 : 0.1)))); } }}
        style={{ cursor: dragRef.current ? 'grabbing' : 'default' }}
      >
        <svg
          className="cg-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '50% 50%' }}
        >
          <defs>
            <linearGradient id="cg-edge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--border-h)" />
              <stop offset="100%" stopColor="var(--border-t)" />
            </linearGradient>
            <linearGradient id="cg-edge-h" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-2, var(--accent))" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
            <marker id="cg-arrow"   viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--border-t)" />
            </marker>
            <marker id="cg-arrow-h" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
            </marker>
            <linearGradient id="cg-node-earned" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2fe28a" /><stop offset="100%" stopColor="#27a644" />
            </linearGradient>
            <linearGradient id="cg-node-progress" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent-2, #ffb867)" /><stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
            <linearGradient id="cg-node-weak" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#828fff" /><stop offset="100%" stopColor="#5e6ad2" />
            </linearGradient>
            <radialGradient id="cg-node-glass" cx="30%" cy="25%" r="80%">
              <stop offset="0%" stopColor="rgba(255,255,255,.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,.02)" />
            </radialGradient>
            <filter id="cg-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          <g className="cg-edges">
            {EDGE_NOTES.map((e) => {
              const a = pos[e.from], b = pos[e.to];
              if (!a || !b) return null;
              const key: EdgeKey = `${e.from}->${e.to}`;
              const active = isEdgeActive(e.from, e.to) || hoverEdge === key;
              return (
                <g key={key}>
                  <path
                    d={curvePath(a, b)}
                    stroke={active ? 'url(#cg-edge-h)' : 'url(#cg-edge)'}
                    strokeWidth={active ? 3 : 2}
                    fill="none"
                    opacity={hoverNode && !active ? 0.22 : 1}
                    markerEnd={`url(#${active ? 'cg-arrow-h' : 'cg-arrow'})`}
                    style={{ transition: 'all .18s' }}
                  />
                  {/* Wide invisible hit path for edge hover */}
                  <path
                    d={curvePath(a, b)}
                    stroke="transparent"
                    strokeWidth={20}
                    fill="none"
                    onMouseEnter={() => setHoverEdge(key)}
                    onMouseLeave={() => setHoverEdge(null)}
                    style={{ cursor: 'help' }}
                  />
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="cg-nodes">
            {CONCEPTS.map((c) => {
              const p = pos[c.id];
              const m = MOCK_MASTERY[c.id];
              const tier = conceptTier(c.id);
              const dim  = hoverNode && !connectedToHover(c.id);
              const ringGrad = tier === 'locked'   ? 'rgba(255,255,255,.14)'
                             : tier === 'done'     ? 'url(#cg-node-earned)'
                             : tier === 'progress' ? 'url(#cg-node-progress)'
                                                   : 'url(#cg-node-weak)';
              const iconColor = tier === 'done'     ? '#2fe28a'
                              : tier === 'progress' ? 'var(--accent)'
                              : tier === 'weak'     ? '#828fff'
                                                    : 'var(--tx-3)';
              const Icon = c.icon;
              return (
                <g
                  key={c.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  className={`cg-node ${hoverNode === c.id ? 'is-hover' : ''}`}
                  opacity={dim ? 0.3 : 1}
                  style={{ transition: 'opacity .18s' }}
                  onMouseEnter={() => setHoverNode(c.id)}
                  onMouseLeave={() => setHoverNode(pinnedNode)}
                  onClick={() => setPinnedNode(c.id)}
                >
                  <circle r={NODE_R - 2} fill="url(#cg-node-glass)" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
                  <circle
                    r={NODE_R - 7} fill="none"
                    stroke="rgba(255,255,255,.07)" strokeWidth="4"
                  />
                  <circle
                    r={NODE_R - 7} fill="none"
                    stroke={ringGrad} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * (NODE_R - 7) * m.mastery} 999`}
                    transform="rotate(-90)"
                    filter={hoverNode === c.id ? 'url(#cg-glow)' : undefined}
                    style={{ transition: 'stroke-dasharray .4s' }}
                  />
                  {tier === 'done' && (
                    <circle r={10} cx={NODE_R - 10} cy={-NODE_R + 10} fill="#27a644" />
                  )}
                  {tier === 'done' && (
                    <path d={`M ${NODE_R - 14} -${NODE_R - 10} l 3 3 l 7 -7`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  <foreignObject x={-14} y={-14} width={28} height={28} style={{ pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                      {m.unlocked
                        ? <Icon size={22} color={iconColor} strokeWidth={1.75} />
                        : <Lock size={20} color="var(--tx-3)" strokeWidth={1.75} />}
                    </div>
                  </foreignObject>
                  <text
                    y={NODE_R + 20}
                    textAnchor="middle"
                    fill={tier === 'locked' ? 'var(--tx-3)' : 'var(--tx-1)'}
                    fontSize="12"
                    fontWeight="600"
                    style={{ fontFamily: 'var(--font-grotesk)', pointerEvents: 'none' }}
                  >
                    {c.title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Sidecard */}
      {hoverNode && (() => {
        const c = CONCEPTS.find((x) => x.id === hoverNode)!;
        const m = MOCK_MASTERY[c.id];
        const Icon = c.icon;
        return (
          <aside className="cg-sidecard">
            <div className="cg-sidecard-head">
              <div className="cg-sidecard-icon"><Icon size={22} color="#010102" strokeWidth={2} /></div>
              <div>
                <div className="cg-sidecard-title">{c.title}</div>
                <div className="cg-sidecard-sub">{c.short}</div>
              </div>
            </div>
            <p className="cg-sidecard-body">{c.long}</p>

            <div className="cg-sidecard-meta">
              <div><span>Mastery</span><b style={{ color: m.unlocked ? 'var(--accent)' : 'var(--tx-3)' }}>{(m.mastery * 100).toFixed(0)}%</b></div>
              <div><span>Solved</span><b>{m.solved}</b></div>
              <div><span>State</span><b style={{ color: m.unlocked ? 'var(--solved)' : 'var(--tx-3)' }}>{m.unlocked ? 'Unlocked' : 'Locked'}</b></div>
            </div>

            {c.prereqs.length > 0 && (
              <div className="cg-sidecard-block">
                <h5>Prerequisites</h5>
                <ul>
                  {c.prereqs.map((p) => {
                    const parent = CONCEPTS.find((x) => x.id === p)!;
                    return <li key={p}><ArrowRight size={12} /> {parent.title}</li>;
                  })}
                </ul>
              </div>
            )}

            <button
              className="btn btn-learn cg-sidecard-cta"
              disabled={!m.unlocked}
              onClick={() => { if (m.unlocked) window.location.href = `/mastery/${c.id}`; }}
            >
              <Play size={13} fill="currentColor" />
              {m.unlocked ? `Start ${c.title}` : 'Locked'}
            </button>
          </aside>
        );
      })()}

      {/* Edge tooltip */}
      {hoverEdgeInfo && hoverEdgeInfo.why && (
        <div className="cg-edge-tip" style={{
          left: `${((pos[hoverEdgeInfo.from].x + pos[hoverEdgeInfo.to].x) / 2 / W) * 100}%`,
          top:  `${((pos[hoverEdgeInfo.from].y + pos[hoverEdgeInfo.to].y) / 2 / H) * 100}%`,
        }}>
          <div className="cg-edge-tip-head">
            <b>{CONCEPTS.find((c) => c.id === hoverEdgeInfo.from)!.title}</b>
            <ArrowRight size={11} />
            <b>{CONCEPTS.find((c) => c.id === hoverEdgeInfo.to)!.title}</b>
          </div>
          <div className="cg-edge-tip-body">{hoverEdgeInfo.why}</div>
        </div>
      )}

      <div className="cg-hint">Alt-drag to pan · Ctrl + scroll to zoom · click a node to pin</div>
    </div>
  );
}
