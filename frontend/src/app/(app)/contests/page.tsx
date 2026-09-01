import Link from 'next/link';

export default function ContestsPage() {
  return (
    <>
      
<div className="max-w-[1220px] mx-auto p-margin-mobile md:p-margin-desktop space-y-xl">

<section className="relative w-full rounded-xl overflow-hidden bg-surface-elevated border border-border-default h-64 md:h-80 flex items-center p-lg">
<div className="absolute inset-0 z-0">
<img alt="Contest Arena Banner" className="w-full h-full object-cover opacity-40" data-alt="A wide, sweeping digital illustration representing competitive programming. Dark mode aesthetic with glowing orange and blue geometric shapes resembling a digital arena or futuristic coliseum. Code snippets subtly integrated into the background. High contrast, cinematic lighting, sleek modern developer tool aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtPZ0A5uBm3wAWNdBoCfJrxYofIpYGJCoZDHhZl5n-z6HdilebFRklqJXntPLlnPz_098ZzHTufAb_xHeLG7IKYq7FFQA9RsDqCma-GmQJK415IdlS9TIGUmQTH1jaYXv0Z9ZdMaWQbjavKH6SIXpjlcBfcr8o0jdOf8LOc03_07o-lYwci3H-VIi4jP3L_ke-mHgfVC9eRc1KQKh9ZC5PzD_1ZvZO9D5_t2VXxrYMauUJjeZd5H2s"/>
<div className="absolute inset-0 bg-gradient-to-r from-surface-elevated via-surface-elevated/80 to-transparent"></div>
</div>
<div className="relative z-10 max-w-2xl">
<h1 className="font-headline-lg text-headline-lg text-text-primary mb-sm">AdaptCode Contests</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-lg">Compete with top developers worldwide. Solve algorithmic challenges, climb the leaderboard, and showcase your skills.</p>
<button className="bg-primary-container text-black font-label-bold text-label-bold px-lg py-sm rounded hover:bg-primary-container/90 transition-colors">
                        View Global Ranking
                    </button>
</div>
</section>

<section>
<h2 className="font-headline-md text-headline-md text-text-primary mb-md border-b border-border-default pb-xs">Upcoming Contests</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-md">

<div className="bg-surface-elevated border border-border-default rounded-lg p-md hover:border-border-hover transition-colors flex flex-col justify-between h-full">
<div className="flex items-start justify-between mb-md">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined" data-icon="emoji_events">emoji_events</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Weekly Contest 384</h3>
<p className="font-code-sm text-code-sm text-on-surface-variant">Sunday, Feb 11 2024</p>
</div>
</div>
<span className="bg-surface-secondary text-on-surface-variant font-code-sm text-code-sm px-2 py-1 rounded">2h 30m</span>
</div>
<div className="flex items-center justify-between mt-auto pt-md border-t border-border-default">
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]" data-icon="group">group</span>
<span className="font-code-sm text-code-sm">12,450 Registered</span>
</div>
<button className="bg-primary-container text-black font-label-bold text-label-bold px-md py-sm rounded hover:bg-primary-container/90 transition-colors">
                                Register
                            </button>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg p-md hover:border-border-hover transition-colors flex flex-col justify-between h-full">
<div className="flex items-start justify-between mb-md">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined" data-icon="military_tech">military_tech</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Biweekly Contest 124</h3>
<p className="font-code-sm text-code-sm text-on-surface-variant">Saturday, Feb 17 2024</p>
</div>
</div>
<span className="bg-surface-secondary text-on-surface-variant font-code-sm text-code-sm px-2 py-1 rounded">2h 00m</span>
</div>
<div className="flex items-center justify-between mt-auto pt-md border-t border-border-default">
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]" data-icon="group">group</span>
<span className="font-code-sm text-code-sm">8,102 Registered</span>
</div>
<button className="border border-border-default text-text-primary font-label-bold text-label-bold px-md py-sm rounded hover:bg-surface-secondary transition-colors">
                                Virtual Participate
                            </button>
</div>
</div>
</div>
</section>
</div>

    </>
  );
}