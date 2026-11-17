"use client";
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Logo from './Logo';
import LandingMap from './LandingMap';

/**
 * Signed-out landing page (rendered by app/page.tsx for anonymous visitors).
 *
 * Copy rule: every sentence here describes something the product does today.
 * In particular it does NOT promise a placement test, review of fading topics,
 * hint-weighted scoring, or an evidence rule for "learned" — those are on the
 * roadmap (docs/roadmap/PHASES.md) and get added here when they ship.
 */
export default function Landing() {
  const root = useRef<HTMLDivElement | null>(null);

  // reveal sections as they scroll into view
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>('[data-reveal]') ?? [];
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { threshold: 0.18 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp" ref={root}>
      <div className="lp-wrap">
        <header className="lp-bar ac-rise">
          <Link href="/" aria-label="AdaptCode home"><Logo size={30} /></Link>
          <nav>
            <Link className="btn ac-btn-quiet" href="/login">Sign in</Link>
            <Link className="btn btn-primary" href="/login?mode=signup">Create account</Link>
          </nav>
        </header>

        <section className="lp-hero">
          <div>
            <h1 className="lp-display ac-rise" style={{ ['--i' as string]: 1 }}>Practice the problem you are ready for.</h1>
            <p className="lp-sub ac-rise" style={{ ['--i' as string]: 2 }}>
              AdaptCode keeps a running estimate of what you know across twelve areas of data structures and
              algorithms, and picks your next problem from it. Touch a topic on the map to see what it leads to.
            </p>
            <div className="lp-cta ac-rise" style={{ ['--i' as string]: 3 }}>
              <Link className="btn btn-primary ac-btn-lg" href="/login?mode=signup">Create a free account</Link>
              <span>Free to use.</span>
            </div>
          </div>
          <div className="ac-stage lp-demo ac-rise" style={{ ['--i' as string]: 2 }}>
            <LandingMap />
          </div>
        </section>
      </div>

      <section className="lp-band">
        <div className="lp-wrap">
          <h2 className="lp-title" data-reveal>One loop, repeated every time you submit.</h2>
          <ol className="lp-how">
            <li data-reveal style={{ ['--i' as string]: 0 }}>
              <div className="lp-art">
                <div className="lp-tests"><div>test 1<b>passed</b></div><div>test 2<b>passed</b></div><div>test 3<b>passed</b></div></div>
              </div>
              <h3>Your code runs for real</h3>
              <p>Every submission is executed against hidden tests in an isolated sandbox, and you get a verdict back in seconds.</p>
            </li>
            <li data-reveal style={{ ['--i' as string]: 1 }}>
              <div className="lp-art">
                <div className="lp-move">
                  <div><b>Two Pointers</b><span>41% to 58%</span></div>
                  <div className="ac-meter"><span style={{ width: '58%' }} /></div>
                </div>
              </div>
              <h3>The estimate moves</h3>
              <p>Each result updates the probability that you know that concept, so a lucky pass or a careless slip does not swing it too far.</p>
            </li>
            <li data-reveal style={{ ['--i' as string]: 2 }}>
              <div className="lp-art">
                <div className="lp-pick"><div>Something easier</div><div className="on">Step up in difficulty</div><div>Back to a prerequisite</div></div>
              </div>
              <h3>The next problem is chosen</h3>
              <p>Easier, the same, harder, or a step back to a concept you are missing. It is picked from your own results, not from a fixed list.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="lp-band">
        <div className="lp-wrap lp-proof">
          <p className="lp-quote" data-reveal>A concept opens only when the ones before it are learned.</p>
          <div className="lp-list" data-reveal style={{ ['--i' as string]: 1 }}>
            <div><b>When your code fails, you get a diagnosis</b><span>What went wrong, why the approach breaks, and what to review. Never the answer.</span></div>
            <div><b>Twelve concepts, one map</b><span>From basic syntax to dynamic programming, with every dependency drawn.</span></div>
            <div><b>Your data is yours</b><span>Export everything or delete your account from Settings.</span></div>
          </div>
        </div>
      </section>

      <section className="lp-band lp-closer">
        <div data-reveal><Logo size={76} word={false} live /></div>
        <h2 className="lp-title" data-reveal style={{ ['--i' as string]: 1 }}>Find out where you really are.</h2>
        <div data-reveal style={{ ['--i' as string]: 2 }}>
          <Link className="btn btn-primary ac-btn-lg" href="/login?mode=signup">Create a free account</Link>
        </div>
      </section>

      <footer className="lp-wrap lp-foot">
        <Logo size={22} />
        <nav><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Sign in</Link></nav>
      </footer>
    </div>
  );
}
