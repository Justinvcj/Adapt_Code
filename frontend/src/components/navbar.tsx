import Link from 'next/link';

export default function Navbar() {
  return (
    <nav aria-label="Top Navigation" className="fixed top-0 w-full h-[50px] z-50 bg-surface/80 backdrop-blur-md border-b border-border-default flex justify-between items-center px-margin-desktop max-w-7xl mx-auto md:max-w-none md:w-full">
      <div className="flex items-center gap-xl h-full">
        <Link className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2" href="/problems">
          <span className="material-symbols-outlined" data-icon="code" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
          AdaptCode
        </Link>
        <div className="hidden md:flex items-center gap-lg h-full">
          <Link aria-current="page" className="h-full flex items-center text-primary font-bold border-b-2 border-primary pt-[2px] opacity-80" href="/problems">Problems</Link>
          <Link className="h-full flex items-center text-on-surface-variant font-body-md hover:text-primary transition-colors duration-200" href="/contests">Contest</Link>
          <Link className="h-full flex items-center text-on-surface-variant font-body-md hover:text-primary transition-colors duration-200" href="/discuss">Discuss</Link>
          <Link className="h-full flex items-center text-on-surface-variant font-body-md hover:text-primary transition-colors duration-200" href="/interview">Interview</Link>
          <Link className="h-full flex items-center text-on-surface-variant font-body-md hover:text-primary transition-colors duration-200" href="/explore">Store</Link>
        </div>
      </div>
      <div className="flex items-center gap-md">
        <button aria-label="Search" className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">search</span>
        </button>
        <button aria-label="Notifications" className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button aria-label="Premium" className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">monetization_on</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border-default overflow-hidden flex items-center justify-center ml-2 cursor-pointer">
          <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4-YCdnQ3_puxZVXpmsXcGHrgklDuBD86RQZuky40MD9kHNadpHkM6hCNusJJtOG6TDKfvrl94Yj4XRqpjXbMgE1T2BeGzUavQcgpTwxsTZANxdPXGlPKSkBT4iW3S_HqJ5QTwJu9NjKqKP3pJ07zmQSc0lyryx81ZUthgjZ003deRIIvbF7d-Am4LNt5a6mFwS_p0zhgLq_hkXZun2p1Wqjrp-JYU8h_aINvM7YsE7FShIqcKBSYA" />
        </div>
      </div>
    </nav>
  );
}
