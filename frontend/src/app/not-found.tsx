import Link from 'next/link';

export const metadata = {
  title: '404 · AdaptCode',
};

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      padding: '24px',
      textAlign: 'center',
      color: 'var(--tx)',
    }}>
      <div style={{
        fontSize: 72,
        fontWeight: 700,
        lineHeight: 1,
        background: 'linear-gradient(135deg, #ffb867, #ffa116)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>404</div>
      <h1 style={{ fontSize: 20, margin: 0 }}>Nothing here.</h1>
      <p style={{ color: 'var(--tx-2)', fontSize: 14, maxWidth: 420, lineHeight: 1.55 }}>
        The page you&apos;re looking for has been moved, deleted, or never existed. Try the catalogue or head home.
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Link href="/" className="btn btn-primary">Home</Link>
        <Link href="/problems" className="btn btn-ghost">Problems</Link>
      </div>
    </main>
  );
}
