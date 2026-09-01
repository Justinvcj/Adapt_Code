import Link from 'next/link';

export default function ProfilePage() {
  return (
    <>
      

<section className="lg:w-1/3 flex flex-col gap-md">
<div className="bg-surface-elevated border border-border-default rounded-lg p-lg flex flex-col gap-md">
<div className="flex items-start gap-md">
<img className="w-24 h-24 rounded-lg border border-border-default object-cover" data-alt="A highly detailed close-up portrait of a digital avatar, stylized like a skilled programmer. The avatar wears sleek dark sci-fi glasses, set against a dark blue grid background, reflecting a professional coding environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLqjYjTz2alhUktDItzJ4vfQO8iK7RiGpB6qrThjcTL4gYy664zOmEP90aiguPq1vwihQH-rYgOgfbUgFSgQYxsvYyE_ot4SFuT-qQGOGAD1mpTevRkTb6Nfq-jhCLhDfYD41v45AewcKNi-aJwN_4BoZqTLNz2QDbtpYjVZTsimkGYU2wA_nGPrsi35HRAvej7TtIMMhqCt6N5retSxZxM1gFqIt6xxa4OV5z2JdH5d0EZnnedPxn"/>
<div>
<h1 className="font-headline-md text-headline-md text-text-primary">algotitan</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Rank: 909,633</p>
</div>
</div>
<div className="flex gap-md border-b border-border-default pb-md">
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-primary-container">42</span>
<span className="font-label-bold text-label-bold text-on-surface-variant uppercase">Followers</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-text-primary">128</span>
<span className="font-label-bold text-label-bold text-on-surface-variant uppercase">Following</span>
</div>
</div>
<div className="flex flex-col gap-sm">
<a className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined text-lg">link</span>
<span className="font-body-md">github.com/algotitan</span>
</a>
</div>
<div className="mt-sm">
<h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-sm">Community Stats</h3>
<div className="flex justify-between items-center py-xs">
<span className="flex items-center gap-sm text-on-surface-variant"><span className="material-symbols-outlined text-sm">visibility</span> Views</span>
<span className="font-code-md text-code-md text-text-primary">12,450</span>
</div>
<div className="flex justify-between items-center py-xs">
<span className="flex items-center gap-sm text-on-surface-variant"><span className="material-symbols-outlined text-sm">task_alt</span> Solutions</span>
<span className="font-code-md text-code-md text-text-primary">84</span>
</div>
<div className="flex justify-between items-center py-xs">
<span className="flex items-center gap-sm text-on-surface-variant"><span className="material-symbols-outlined text-sm">thumb_up</span> Discuss</span>
<span className="font-code-md text-code-md text-text-primary">219</span>
</div>
</div>
</div>
</section>

<section className="lg:w-2/3 flex flex-col gap-lg">

<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

<div className="bg-surface-elevated border border-border-default rounded-lg p-lg">
<h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-md">Solved Problems</h3>
<div className="flex items-center gap-lg">
<div className="relative w-24 h-24 flex-shrink-0">

<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
<circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="8"></circle>
<circle cx="50" cy="50" fill="none" r="40" stroke="#00B8A3" strokeDasharray="251.2" strokeDashoffset="180" strokeWidth="8"></circle>
<circle cx="50" cy="50" fill="none" r="40" stroke="#FFC01E" strokeDasharray="251.2" strokeDashoffset="200" strokeWidth="8" transform="rotate(70 50 50)"></circle>
<circle cx="50" cy="50" fill="none" r="40" stroke="#FF375F" strokeDasharray="251.2" strokeDashoffset="230" strokeWidth="8" transform="rotate(130 50 50)"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="font-headline-sm text-headline-sm text-text-primary">186</span>
<span className="font-code-sm text-code-sm text-on-surface-variant">/ 4033</span>
</div>
</div>
<div className="flex-1 flex flex-col gap-sm">
<div className="flex flex-col gap-xs">
<div className="flex justify-between text-code-sm text-code-sm"><span className="text-easy">Easy</span><span>94 / 850</span></div>
<div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
<div className="h-full bg-easy" style={{ width: '45%' }}></div>
</div>
</div>
<div className="flex flex-col gap-xs">
<div className="flex justify-between text-code-sm text-code-sm"><span className="text-medium">Medium</span><span>72 / 1700</span></div>
<div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
<div className="h-full bg-medium" style={{ width: '30%' }}></div>
</div>
</div>
<div className="flex flex-col gap-xs">
<div className="flex justify-between text-code-sm text-code-sm"><span className="text-hard">Hard</span><span>20 / 1483</span></div>
<div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
<div className="h-full bg-hard" style={{ width: '10%' }}></div>
</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg p-lg">
<h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-md">Badges</h3>
<div className="grid grid-cols-3 gap-sm">
<div className="aspect-square bg-surface-secondary rounded border border-border-default flex items-center justify-center group hover:border-primary transition-colors">
<span className="material-symbols-outlined text-primary-container text-3xl group-hover:scale-110 transition-transform">military_tech</span>
</div>
<div className="aspect-square bg-surface-secondary rounded border border-border-default flex items-center justify-center group hover:border-primary transition-colors">
<span className="material-symbols-outlined text-tertiary-fixed text-3xl group-hover:scale-110 transition-transform">local_fire_department</span>
</div>
<div className="aspect-square bg-surface-secondary rounded border border-border-default flex items-center justify-center group hover:border-primary transition-colors">
<span className="material-symbols-outlined text-secondary text-3xl group-hover:scale-110 transition-transform">emoji_events</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg p-lg overflow-x-auto">
<div className="flex justify-between items-end mb-md">
<h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase">Submissions in past year</h3>
<span className="font-headline-sm text-headline-sm text-text-primary">407</span>
</div>

<div className="flex gap-[3px] min-w-[700px]">

</div>
<div className="flex justify-end items-center gap-xs mt-sm text-code-sm text-code-sm text-on-surface-variant">
                    Less 
                    <div className="heatmap-cell heatmap-0"></div>
<div className="heatmap-cell heatmap-1"></div>
<div className="heatmap-cell heatmap-2"></div>
<div className="heatmap-cell heatmap-3"></div>
<div className="heatmap-cell heatmap-4"></div>
                    More
                </div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg overflow-hidden">
<div className="flex border-b border-border-default px-md pt-sm">
<button className="px-md py-sm font-label-bold text-label-bold text-primary border-b-2 border-primary">Recent AC</button>
<button className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant hover:text-text-primary transition-colors">List</button>
<button className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant hover:text-text-primary transition-colors">Solutions</button>
<button className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant hover:text-text-primary transition-colors">Discuss</button>
</div>
<div className="p-md flex flex-col gap-xs">
<div className="flex justify-between items-center py-sm border-b border-border-default hover:bg-surface-secondary px-sm -mx-sm rounded transition-colors">
<span className="font-body-md text-text-primary">Two Sum</span>
<span className="text-code-sm text-on-surface-variant">2 hours ago</span>
</div>
<div className="flex justify-between items-center py-sm border-b border-border-default hover:bg-surface-secondary px-sm -mx-sm rounded transition-colors">
<span className="font-body-md text-text-primary">LRU Cache</span>
<span className="text-code-sm text-on-surface-variant">5 hours ago</span>
</div>
<div className="flex justify-between items-center py-sm hover:bg-surface-secondary px-sm -mx-sm rounded transition-colors">
<span className="font-body-md text-text-primary">Median of Two Sorted Arrays</span>
<span className="text-code-sm text-on-surface-variant">1 day ago</span>
</div>
</div>
</div>
</section>

    </>
  );
}