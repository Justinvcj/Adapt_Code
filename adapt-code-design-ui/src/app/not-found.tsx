import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg)] text-[var(--tx)]">
      <div className="w-12 h-12 rounded-[var(--r-lg)] bg-[var(--accent)] flex items-center justify-center text-xl font-extrabold text-[#010102] font-[var(--font-mono)]">&lt;/&gt;</div>
      <h1 className="text-6xl font-bold tracking-[-0.04em]">404</h1>
      <p className="text-[var(--tx-2)] text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-2 px-5 py-2.5 rounded-[var(--r-md)] bg-[var(--blue)] text-white text-sm font-medium hover:bg-[var(--blue-h)] transition-colors">
        Go Home
      </Link>
    </div>
  );
}
