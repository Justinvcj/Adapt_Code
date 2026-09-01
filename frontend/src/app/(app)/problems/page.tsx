import Link from 'next/link';

export default function ProblemsPage() {
  return (
    <>
      
<div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-lg">

<div className="xl:col-span-9 flex flex-col gap-lg">

<div className="flex flex-col gap-md">

<div className="flex flex-wrap items-center gap-2">
<span className="text-on-surface-variant font-label-bold text-label-bold mr-2 uppercase tracking-wider">Topics</span>
<button className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border-default text-text-primary hover:border-border-hover transition-colors flex items-center gap-2 text-sm group">
<span>Array</span>
<span className="bg-surface-bright text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-sm">2238</span>
</button>
<button className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border-default text-text-primary hover:border-border-hover transition-colors flex items-center gap-2 text-sm group">
<span>String</span>
<span className="bg-surface-bright text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-sm">893</span>
</button>
<button className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border-default text-text-primary hover:border-border-hover transition-colors flex items-center gap-2 text-sm group">
<span>Hash Table</span>
<span className="bg-surface-bright text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-sm">742</span>
</button>
<button className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border-default text-text-primary hover:border-border-hover transition-colors flex items-center gap-2 text-sm group">
<span>Dynamic Programming</span>
<span className="bg-surface-bright text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-sm">621</span>
</button>
<button className="px-3 py-1.5 rounded-full bg-surface-elevated border border-border-default text-on-surface-variant hover:text-text-primary hover:border-border-hover transition-colors flex items-center gap-1 text-sm bg-surface-bright/50">
<span className="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span>
<span>Expand</span>
</button>
</div>

<div className="flex border-b border-border-default overflow-x-auto no-scrollbar">
<button className="px-4 py-2 border-b-2 border-primary text-text-primary font-label-bold text-label-bold whitespace-nowrap">All Topics</button>
<button className="px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-text-primary hover:border-border-hover transition-all font-label-bold text-label-bold whitespace-nowrap">Algorithms</button>
<button className="px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-text-primary hover:border-border-hover transition-all font-label-bold text-label-bold whitespace-nowrap">Database</button>
<button className="px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-text-primary hover:border-border-hover transition-all font-label-bold text-label-bold whitespace-nowrap">Shell</button>
<button className="px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-text-primary hover:border-border-hover transition-all font-label-bold text-label-bold whitespace-nowrap">Concurrency</button>
</div>
</div>

<div className="glass-panel rounded-xl p-md flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-3 flex-1 min-w-[280px]">
<div className="relative w-full max-w-sm">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
<input className="w-full bg-surface-elevated border border-border-default rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/70" placeholder="Search questions" type="text"/>
</div>
<button className="p-2 rounded-lg bg-surface-elevated border border-border-default text-on-surface-variant hover:text-text-primary hover:border-border-hover transition-colors" title="Sort">
<span className="material-symbols-outlined" data-icon="sort">sort</span>
</button>
<button className="p-2 rounded-lg bg-surface-elevated border border-border-default text-on-surface-variant hover:text-text-primary hover:border-border-hover transition-colors flex items-center gap-2" title="Filter">
<span className="material-symbols-outlined" data-icon="tune">tune</span>
<span className="text-sm font-label-bold hidden sm:inline">Filter</span>
</button>
<button className="p-2 rounded-lg bg-surface-elevated border border-border-default text-primary hover:bg-primary/10 transition-colors flex items-center gap-2 ml-auto sm:ml-0" title="Pick One">
<span className="material-symbols-outlined" data-icon="shuffle">shuffle</span>
<span className="text-sm font-label-bold hidden sm:inline">Pick One</span>
</button>
</div>
<div className="flex items-center gap-3 pl-4 border-l border-border-default">
<div className="relative w-8 h-8 flex items-center justify-center">
<svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-bright" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="4"></path>
<path className="text-success" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="45, 100" strokeWidth="4"></path>
</svg>
</div>
<div className="flex flex-col">
<span className="text-xs text-on-surface-variant leading-none">Solved</span>
<span className="font-label-bold text-sm text-text-primary leading-none mt-1">124 / 2894</span>
</div>
</div>
</div>

<div className="bg-surface-elevated rounded-xl border border-border-default overflow-hidden">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-border-default bg-surface-bright/30">
<th className="py-3 px-4 w-12 text-center text-on-surface-variant font-label-bold text-xs uppercase tracking-wider">Status</th>
<th className="py-3 px-4 w-16 text-on-surface-variant font-label-bold text-xs uppercase tracking-wider">#</th>
<th className="py-3 px-4 text-on-surface-variant font-label-bold text-xs uppercase tracking-wider">Title</th>
<th className="py-3 px-4 w-24 text-center text-on-surface-variant font-label-bold text-xs uppercase tracking-wider">Acceptance</th>
<th className="py-3 px-4 w-28 text-center text-on-surface-variant font-label-bold text-xs uppercase tracking-wider">Difficulty</th>
<th className="py-3 px-4 w-20 text-center text-on-surface-variant font-label-bold text-xs uppercase tracking-wider">Freq</th>
</tr>
</thead>
<tbody className="font-body-md text-sm">

<tr className="border-b border-border-default hover:bg-surface-secondary transition-colors group cursor-pointer">
<td className="py-3 px-4 text-center">
<span className="material-symbols-outlined text-success text-[18px]" data-icon="check_circle" data-weight="fill" style={{ fontVariationSettings: "\'FILL\' 1" }}>check_circle</span>
</td>
<td className="py-3 px-4 text-on-surface-variant">1</td>
<td className="py-3 px-4">
<div className="flex items-center justify-between">
<a className="text-text-primary hover:text-secondary transition-colors font-medium" href="#">Two Sum</a>
<button className="text-border-default group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
<span className="material-symbols-outlined text-[18px]" data-icon="star" data-weight="fill">star</span>
</button>
</div>
</td>
<td className="py-3 px-4 text-center text-on-surface-variant">52.3%</td>
<td className="py-3 px-4 text-center">
<span className="inline-block px-2 py-0.5 rounded-full bg-easy/10 text-easy text-xs font-label-bold w-full max-w-[80px]">Easy</span>
</td>
<td className="py-3 px-4">
<div className="w-full h-1.5 bg-surface-bright rounded-full overflow-hidden">
<div className="h-full bg-secondary w-[95%]"></div>
</div>
</td>
</tr>

<tr className="border-b border-border-default hover:bg-surface-secondary transition-colors group cursor-pointer">
<td className="py-3 px-4 text-center">
</td>
<td className="py-3 px-4 text-on-surface-variant">2</td>
<td className="py-3 px-4">
<div className="flex items-center justify-between">
<a className="text-text-primary hover:text-secondary transition-colors font-medium" href="#">Add Two Numbers</a>
<button className="text-border-default group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
<span className="material-symbols-outlined text-[18px]" data-icon="star">star</span>
</button>
</div>
</td>
<td className="py-3 px-4 text-center text-on-surface-variant">41.8%</td>
<td className="py-3 px-4 text-center">
<span className="inline-block px-2 py-0.5 rounded-full bg-medium/10 text-medium text-xs font-label-bold w-full max-w-[80px]">Medium</span>
</td>
<td className="py-3 px-4">
<div className="w-full h-1.5 bg-surface-bright rounded-full overflow-hidden">
<div className="h-full bg-secondary w-[85%]"></div>
</div>
</td>
</tr>

<tr className="border-b border-border-default hover:bg-surface-secondary transition-colors group cursor-pointer bg-surface-secondary/20">
<td className="py-3 px-4 text-center">
<span className="material-symbols-outlined text-primary text-[18px]" data-icon="schedule">schedule</span>
</td>
<td className="py-3 px-4 text-on-surface-variant">4</td>
<td className="py-3 px-4">
<div className="flex items-center justify-between">
<a className="text-text-primary hover:text-secondary transition-colors font-medium" href="#">Median of Two Sorted Arrays</a>
<button className="text-border-default group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
<span className="material-symbols-outlined text-[18px]" data-icon="star">star</span>
</button>
</div>
</td>
<td className="py-3 px-4 text-center text-on-surface-variant">38.9%</td>
<td className="py-3 px-4 text-center">
<span className="inline-block px-2 py-0.5 rounded-full bg-hard/10 text-hard text-xs font-label-bold w-full max-w-[80px]">Hard</span>
</td>
<td className="py-3 px-4">
<div className="w-full h-1.5 bg-surface-bright rounded-full overflow-hidden">
<div className="h-full bg-secondary w-[90%]"></div>
</div>
</td>
</tr>

<tr className="border-b border-border-default hover:bg-surface-secondary transition-colors group cursor-pointer">
<td className="py-3 px-4 text-center"></td>
<td className="py-3 px-4 text-on-surface-variant">5</td>
<td className="py-3 px-4">
<div className="flex items-center justify-between">
<a className="text-text-primary hover:text-secondary transition-colors font-medium" href="#">Longest Palindromic Substring</a>
<button className="text-border-default group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
<span className="material-symbols-outlined text-[18px]" data-icon="star">star</span>
</button>
</div>
</td>
<td className="py-3 px-4 text-center text-on-surface-variant">33.5%</td>
<td className="py-3 px-4 text-center">
<span className="inline-block px-2 py-0.5 rounded-full bg-medium/10 text-medium text-xs font-label-bold w-full max-w-[80px]">Medium</span>
</td>
<td className="py-3 px-4">
<div className="w-full h-1.5 bg-surface-bright rounded-full overflow-hidden">
<div className="h-full bg-secondary w-[80%]"></div>
</div>
</td>
</tr>
</tbody>
</table>

<div className="p-4 border-t border-border-default flex items-center justify-between text-sm">
<div className="text-on-surface-variant">
                            Showing 1 to 50 of 2894 problems
                        </div>
<div className="flex items-center gap-1">
<button className="p-1 rounded bg-surface-bright text-on-surface-variant hover:text-text-primary disabled:opacity-50"><span className="material-symbols-outlined text-[20px]" data-icon="chevron_left">chevron_left</span></button>
<button className="w-8 h-8 rounded bg-primary/20 text-primary font-bold">1</button>
<button className="w-8 h-8 rounded hover:bg-surface-bright text-on-surface-variant">2</button>
<button className="w-8 h-8 rounded hover:bg-surface-bright text-on-surface-variant">3</button>
<span className="px-1 text-on-surface-variant">...</span>
<button className="w-8 h-8 rounded hover:bg-surface-bright text-on-surface-variant">58</button>
<button className="p-1 rounded bg-surface-bright text-on-surface-variant hover:text-text-primary"><span className="material-symbols-outlined text-[20px]" data-icon="chevron_right">chevron_right</span></button>
</div>
</div>
</div>
</div>

<div className="xl:col-span-3 flex flex-col gap-lg">

<div className="bg-surface-elevated rounded-xl border border-border-default p-md">
<div className="flex items-center justify-between mb-4">
<h3 className="font-headline-sm text-[16px] text-text-primary">Daily Coding Challenge</h3>
<div className="flex gap-1">
<span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer hover:text-text-primary" data-icon="chevron_left">chevron_left</span>
<span className="text-sm font-label-bold text-on-surface-variant">Oct 2023</span>
<span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer hover:text-text-primary" data-icon="chevron_right">chevron_right</span>
</div>
</div>

<div className="grid grid-cols-7 gap-1 text-center mb-2">
<div className="text-[10px] font-label-bold text-on-surface-variant uppercase">S</div>
<div className="text-[10px] font-label-bold text-on-surface-variant uppercase">M</div>
<div className="text-[10px] font-label-bold text-on-surface-variant uppercase">T</div>
<div className="text-[10px] font-label-bold text-on-surface-variant uppercase">W</div>
<div className="text-[10px] font-label-bold text-on-surface-variant uppercase">T</div>
<div className="text-[10px] font-label-bold text-on-surface-variant uppercase">F</div>
<div className="text-[10px] font-label-bold text-on-surface-variant uppercase">S</div>

<div className="aspect-square flex items-center justify-center text-xs text-on-surface-variant/30 rounded-sm">24</div>
<div className="aspect-square flex items-center justify-center text-xs text-on-surface-variant/30 rounded-sm">25</div>
<div className="aspect-square flex items-center justify-center text-xs text-on-surface-variant/30 rounded-sm">26</div>
<div className="aspect-square flex items-center justify-center text-xs text-on-surface-variant/30 rounded-sm">27</div>
<div className="aspect-square flex items-center justify-center text-xs text-on-surface-variant/30 rounded-sm">28</div>
<div className="aspect-square flex items-center justify-center text-xs text-on-surface-variant/30 rounded-sm">29</div>
<div className="aspect-square flex items-center justify-center text-xs text-on-surface-variant/30 rounded-sm">30</div>
<div className="aspect-square flex items-center justify-center text-xs bg-success/20 text-success rounded-sm font-bold">1</div>
<div className="aspect-square flex items-center justify-center text-xs bg-success/20 text-success rounded-sm font-bold">2</div>
<div className="aspect-square flex items-center justify-center text-xs text-text-primary bg-surface-bright rounded-sm hover:bg-surface-bright/80 cursor-pointer">3</div>
<div className="aspect-square flex items-center justify-center text-xs text-text-primary hover:bg-surface-bright rounded-sm cursor-pointer">4</div>

</div>
<button className="w-full py-2 mt-2 bg-primary text-on-primary font-label-bold rounded-lg hover:bg-primary/90 transition-colors">Go to Challenge</button>
</div>

<div className="bg-surface-elevated rounded-xl border border-border-default p-md">
<h3 className="font-headline-sm text-[16px] text-text-primary mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]" data-icon="trending_up">trending_up</span>
                        Trending Companies
                    </h3>
<div className="relative mb-4">
<span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" data-icon="search">search</span>
<input className="w-full bg-background border border-border-default rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all" placeholder="Search company" type="text"/>
</div>
<div className="flex flex-col gap-2">
<a className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-bright transition-colors group" href="#">
<div className="flex items-center gap-3">
<div className="w-6 h-6 rounded bg-surface-bright flex items-center justify-center text-xs font-bold text-text-primary border border-border-default">G</div>
<span className="text-sm text-text-primary group-hover:text-secondary transition-colors">Google</span>
</div>
<span className="bg-surface-bright px-2 py-0.5 rounded-full text-xs text-on-surface-variant">142</span>
</a>
<a className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-bright transition-colors group" href="#">
<div className="flex items-center gap-3">
<div className="w-6 h-6 rounded bg-surface-bright flex items-center justify-center text-xs font-bold text-text-primary border border-border-default">M</div>
<span className="text-sm text-text-primary group-hover:text-secondary transition-colors">Meta</span>
</div>
<span className="bg-surface-bright px-2 py-0.5 rounded-full text-xs text-on-surface-variant">89</span>
</a>
<a className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-bright transition-colors group" href="#">
<div className="flex items-center gap-3">
<div className="w-6 h-6 rounded bg-surface-bright flex items-center justify-center text-xs font-bold text-text-primary border border-border-default">A</div>
<span className="text-sm text-text-primary group-hover:text-secondary transition-colors">Amazon</span>
</div>
<span className="bg-surface-bright px-2 py-0.5 rounded-full text-xs text-on-surface-variant">215</span>
</a>
</div>
</div>
</div>
</div>


    </>
  );
}