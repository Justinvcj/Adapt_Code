"use client";
import { useEffect, useState } from 'react';

const SEEN_KEY = 'adaptcode.onboarding.seen.v1';

type Step = {
  target: string;        // CSS selector
  title: string;
  body: React.ReactNode;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

const STEPS: Step[] = [
  {
    target: '.mastery-panel',
    title: 'Your twelve concepts',
    body: (
      <>
        Each ring fills as you solve. The <b>pulsing orange node</b> is what AdaptCode thinks you should tackle next — based on where your mastery is weakest among the concepts you&apos;ve already unlocked.
      </>
    ),
    placement: 'top',
  },
  {
    target: '.hero',
    title: 'Prerequisite-gated progression',
    body: (
      <>
        Concepts unlock once you hit 50 % mastery in whatever came before. Locked nodes show you how close you are. Nothing is paywalled — the gate is <b>competence</b>.
      </>
    ),
    placement: 'bottom',
  },
  {
    target: '.btn-learn',
    title: 'One button to pick what to do',
    body: (
      <>
        <b>Learn</b> reads your mastery vector, finds the weakest unlocked concept, and routes you to the next problem in it. No decision fatigue, no browsing a thousand problems.
      </>
    ),
    placement: 'left',
  },
];

export default function Onboarding() {
  const [idx, setIdx]       = useState<number>(0);
  const [visible, setVis]   = useState<boolean>(false);
  const [rect, setRect]     = useState<DOMRect | null>(null);

  // Show on first visit only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(SEEN_KEY)) {
        // Delay a frame so the page is laid out before we spotlight anything
        setTimeout(() => setVis(true), 400);
      }
    } catch { /* storage unavailable */ }
  }, []);

  // Measure the currently-targeted element
  useEffect(() => {
    if (!visible) return;
    const measure = () => {
      const el = document.querySelector(STEPS[idx].target) as HTMLElement | null;
      if (el) setRect(el.getBoundingClientRect());
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [idx, visible]);

  // ESC closes
  useEffect(() => {
    if (!visible) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [visible]);

  function dismiss() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* storage */ }
    setVis(false);
  }

  function next() {
    if (idx < STEPS.length - 1) setIdx(idx + 1);
    else dismiss();
  }

  if (!visible) return null;
  const step = STEPS[idx];

  // Card placement based on target rect + preferred side
  let cardStyle: React.CSSProperties = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  if (rect) {
    const PAD = 20;
    const CARD_W = 380, CARD_H = 220;
    switch (step.placement) {
      case 'top':
        cardStyle = {
          left: Math.min(window.innerWidth - CARD_W - 20, Math.max(20, rect.left + rect.width / 2 - CARD_W / 2)),
          top:  Math.max(20, rect.top - CARD_H - PAD),
        };
        break;
      case 'bottom':
        cardStyle = {
          left: Math.min(window.innerWidth - CARD_W - 20, Math.max(20, rect.left + rect.width / 2 - CARD_W / 2)),
          top:  Math.min(window.innerHeight - CARD_H - 20, rect.bottom + PAD),
        };
        break;
      case 'left':
        cardStyle = {
          left: Math.max(20, rect.left - CARD_W - PAD),
          top:  Math.max(20, rect.top + rect.height / 2 - CARD_H / 2),
        };
        break;
      case 'right':
        cardStyle = {
          left: Math.min(window.innerWidth - CARD_W - 20, rect.right + PAD),
          top:  Math.max(20, rect.top + rect.height / 2 - CARD_H / 2),
        };
        break;
    }
  }

  const spotStyle: React.CSSProperties | null = rect ? {
    left:   rect.left - 6,
    top:    rect.top - 6,
    width:  rect.width + 12,
    height: rect.height + 12,
  } : null;

  return (
    <div className="onb-overlay" role="dialog" aria-modal="true" aria-label={step.title}>
      {spotStyle && <div className="onb-spot" style={spotStyle} />}
      <div className="onb-card" style={cardStyle}>
        <div className="onb-step">Step {idx + 1} of {STEPS.length}</div>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <div className="onb-actions">
          <span className="onb-dots">
            {STEPS.map((_, i) => <i key={i} className={i === idx ? 'act' : ''} />)}
          </span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="onb-skip" onClick={dismiss}>Skip tour</button>
            <button className="onb-next" onClick={next}>
              {idx === STEPS.length - 1 ? "Let's go" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
