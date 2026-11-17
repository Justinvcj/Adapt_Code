/**
 * AdaptCode logo: an "A" drawn as a route through a graph.
 *
 * - The crossbar lands on a lit node (where the learner is) and a dotted
 *   branch leaves it (the next problem).
 * - `animate` plays the staged draw-in (used by the splash and the sign-in page).
 * - At 26px and below the fine detail (foot/apex nodes, halo, branch) is
 *   dropped so the mark stays legible in the navbar and as a favicon.
 *
 * Styling lives in globals.css under ".ac-logo". The node is knocked out of
 * the leg using `--logo-bg`, so set that variable when the logo sits on a
 * surface that is not the page background.
 */
export default function Logo({
  size = 28,
  word = true,
  animate = false,
  live = false,
  className = '',
}: {
  size?: number;
  word?: boolean;
  animate?: boolean;
  live?: boolean;
  className?: string;
}) {
  const cls = [
    'ac-logo',
    size <= 26 ? 'sm' : '',
    animate ? 'is-drawing' : '',
    live ? 'is-live' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={cls} style={{ ['--logo' as string]: `${size}px` }}>
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle className="ac-lg-halo" cx="43.8" cy="36" r="10" />
        <path className="ac-lg-l" pathLength={1} d="M12 54 32 10" stroke="currentColor" strokeWidth="6.4" strokeLinecap="round" />
        <path className="ac-lg-r" pathLength={1} d="M32 10 52 54" stroke="currentColor" strokeWidth="6.4" strokeLinecap="round" />
        <path className="ac-lg-bar" pathLength={1} d="M20.6 36H40" stroke="currentColor" strokeWidth="6.4" strokeLinecap="round" />
        <circle className="ac-lg-hole ac-lg-foot-l" cx="12" cy="54" r="1.5" />
        <circle className="ac-lg-hole ac-lg-apex" cx="32" cy="10" r="1.5" />
        <circle className="ac-lg-hole ac-lg-foot-r" cx="52" cy="54" r="1.5" />
        <path className="ac-lg-next" d="M49.6 30.2 56.4 23.4" strokeWidth="2.6" strokeLinecap="round" strokeDasharray=".1 4.6" />
        <circle className="ac-lg-end" cx="59" cy="20.8" r="2.4" />
        <circle className="ac-lg-node" cx="43.8" cy="36" r="6.6" />
      </svg>
      {word && (
        // Letters are separate spans only so the intro can stagger them; screen
        // readers get the whole word once via the label.
        <span className="ac-logo-word" role="img" aria-label="AdaptCode">
          {'AdaptCode'.split('').map((ch, k) => (
            <span key={k} aria-hidden="true" style={{ ['--k' as string]: k }}>{ch}</span>
          ))}
        </span>
      )}
    </span>
  );
}
