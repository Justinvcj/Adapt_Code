/**
 * Route-level loading UI — shown while the next page's server component
 * work finishes. Prevents the "blank flash" users get during slow fetches.
 */
export default function RouteLoading() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 14,
      color: 'var(--tx-2)',
      background: 'var(--bg)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ffb867, #ffa116)',
        animation: 'adapt-pulse 1.1s ease-in-out infinite',
      }} />
      <span style={{ fontSize: 13 }}>Loading…</span>
      <style>{`
        @keyframes adapt-pulse {
          0%, 100% { transform: scale(1); opacity: .85; }
          50% { transform: scale(1.18); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
