import Link from 'next/link';

export default function ExplorePage() {
  return (
    <>
      

<section className="bg-surface-elevated rounded-xl border border-border-default p-xl flex flex-col md:flex-row items-center justify-between gap-xl relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none"></div>
<div className="flex flex-col gap-md z-10 max-w-2xl">
<h1 className="font-headline-lg text-headline-lg text-text-primary">Start your coding journey</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">Master algorithms and data structures with the comprehensive AdaptCode 75 plan. Curated by experts to get you interview-ready.</p>
<div className="flex gap-md mt-sm">
<button className="bg-primary-container text-background font-label-bold text-label-bold px-lg py-sm rounded-DEFAULT hover:opacity-90 transition-opacity">Start AdaptCode 75</button>
<button className="border border-border-default text-text-primary font-label-bold text-label-bold px-lg py-sm rounded-DEFAULT hover:border-border-hover transition-colors">View Details</button>
</div>
</div>
<div className="z-10 w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border border-border-default relative">
<img alt="Coding Journey Hero Image" className="object-cover w-full h-full" data-alt="A conceptual 3D illustration of interconnected code blocks forming a glowing path upwards, symbolizing a learning journey. Dark background with neon orange and blue highlights." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbmB4LvObUxbGXAvYhr5hOA9iK3Nk0SfkNLo8xejTlQ1Obkj6pZhtezLhMVmhSUap0dGjWq2XIIMxuPpkvO9h1QJ-lIwspIVLkJMggCLmBZELkf86JTM0xVN498cku0IIS6GePsZHjAWJLotDnZ4zAZX8RxEmQAhFfH8BU3tbmJ-J0p8qDw6Naxi4nySBBSHGd-Q6xM633_ESJpsUS2DfPDhfFesMrVQxfMxjDXqEqFI9BCDqntx32"/>
</div>
</section>

<section className="flex flex-col gap-md">
<h2 className="font-headline-md text-headline-md text-text-primary">Featured Plans</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">

<div className="bg-surface-elevated border border-border-default rounded-xl p-md flex flex-col gap-md hover:border-border-hover transition-colors cursor-pointer group">
<div className="flex justify-between items-start">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-medium">
<span className="material-symbols-outlined" data-icon="star">star</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">Top Interview 150</h3>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center gap-sm text-on-surface-variant font-code-md text-code-md">
<span>150 Problems</span>
<span className="w-1 h-1 rounded-full bg-border-default"></span>
<span className="px-xs py-[2px] rounded text-medium bg-medium/10">Medium</span>
</div>
<div className="flex flex-col gap-xs mt-auto">
<div className="flex justify-between text-code-sm font-code-sm text-on-surface-variant">
<span>Progress</span>
<span>45/150</span>
</div>
<div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
<div className="h-full bg-success w-[30%]"></div>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-xl p-md flex flex-col gap-md hover:border-border-hover transition-colors cursor-pointer group">
<div className="flex justify-between items-start">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined" data-icon="database">database</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">SQL 50</h3>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center gap-sm text-on-surface-variant font-code-md text-code-md">
<span>50 Problems</span>
<span className="w-1 h-1 rounded-full bg-border-default"></span>
<span className="px-xs py-[2px] rounded text-easy bg-easy/10">Easy</span>
</div>
<div className="flex flex-col gap-xs mt-auto">
<div className="flex justify-between text-code-sm font-code-sm text-on-surface-variant">
<span>Progress</span>
<span>10/50</span>
</div>
<div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
<div className="h-full bg-success w-[20%]"></div>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-xl p-md flex flex-col gap-md hover:border-border-hover transition-colors cursor-pointer group">
<div className="flex justify-between items-start">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-hard">
<span className="material-symbols-outlined" data-icon="moving">moving</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">Dynamic Programming</h3>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
</div>
<div className="flex items-center gap-sm text-on-surface-variant font-code-md text-code-md">
<span>70 Problems</span>
<span className="w-1 h-1 rounded-full bg-border-default"></span>
<span className="px-xs py-[2px] rounded text-hard bg-hard/10">Hard</span>
</div>
<div className="flex flex-col gap-xs mt-auto">
<div className="flex justify-between text-code-sm font-code-sm text-on-surface-variant">
<span>Progress</span>
<span>0/70</span>
</div>
<div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
<div className="h-full bg-success w-0"></div>
</div>
</div>
</div>
</div>
</section>

    </>
  );
}