"use client";

/**
 * AdaptCode logo lockup. Placeholder animation runs on hover + load.
 * Swap the inner <svg> + remove the animation CSS when the real logo is ready.
 * The outer <span className="ac-logo"> is the stable mount point — keep it.
 */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="ac-logo" style={{ ['--logo-size' as string]: `${size}px` }}>
      <span className="ac-logo-mark" aria-hidden>
        <svg viewBox="0 0 32 32" width={size} height={size}>
          <defs>
            <linearGradient id="ac-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffb867" />
              <stop offset="100%" stopColor="#ffa116" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#ac-grad)" />
          <g fill="#010102" fontFamily="'Fira Code', monospace" fontWeight="800">
            <text x="7"  y="21" fontSize="12">&lt;</text>
            <text x="13" y="21" fontSize="12">/</text>
            <text x="19" y="21" fontSize="12">&gt;</text>
          </g>
        </svg>
      </span>
      <span className="ac-logo-word">AdaptCode</span>
    </span>
  );
}
