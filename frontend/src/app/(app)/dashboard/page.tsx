import Link from 'next/link';

export default function HomeFeed() {
  return (
    <>
      

<div className="xl:col-span-8 flex flex-col gap-lg">

<div className="grid grid-cols-1 md:grid-cols-2 gap-md">

<div className="bg-surface-elevated border border-border-default rounded-lg p-md flex items-center justify-between hover:border-hover transition-colors duration-200 group cursor-pointer relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div className="flex items-center gap-md relative z-10">
<div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary-container border border-border-default">
<span className="material-symbols-outlined text-[24px]">emoji_events</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-primary mb-xs">Weekly Contest 389</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Starts in <span className="text-primary font-bold">4 days</span></p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors relative z-10">chevron_right</span>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg p-md flex items-center justify-between hover:border-hover transition-colors duration-200 group cursor-pointer relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-tertiary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div className="flex items-center gap-md relative z-10">
<div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-tertiary-container border border-border-default">
<span className="material-symbols-outlined text-[24px]">military_tech</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-primary mb-xs">Biweekly Contest 126</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Starts in <span className="text-tertiary font-bold">11 days</span></p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary transition-colors relative z-10">chevron_right</span>
</div>
</div>

<div className="flex flex-col gap-md mt-sm">
<div className="flex justify-between items-center mb-xs">
<h2 className="font-headline-md text-headline-md text-text-primary">Recent Updates</h2>
<button className="text-on-surface-variant font-body-md hover:text-primary transition-colors flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                    </button>
</div>

<article className="bg-surface-elevated border border-border-default rounded-lg p-lg hover:border-hover transition-colors duration-200">
<div className="flex items-start gap-md">
<div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-border-default flex-shrink-0 text-success">
<span className="material-symbols-outlined">check_circle</span>
</div>
<div className="flex-1">
<div className="flex items-center gap-sm mb-xs">
<span className="font-label-bold text-label-bold text-on-surface-variant uppercase">Editorial</span>
<span className="w-1 h-1 rounded-full bg-on-surface-variant"></span>
<span className="font-body-md text-body-md text-on-surface-variant text-[12px]">2 hours ago</span>
</div>
<a className="font-headline-sm text-headline-sm text-text-primary hover:text-primary transition-colors inline-block mb-sm" href="#">O(N) Solution for "Maximum Subarray Sum" Explained</a>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-md">
                                In this editorial, we break down Kadane's algorithm to solve the maximum subarray problem in linear time. We'll cover the intuition behind maintaining a running maximum and handling edge cases with all negative numbers...
                            </p>
<div className="flex items-center gap-md">
<button className="flex items-center gap-xs text-on-surface-variant hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">thumb_up</span>
<span className="font-body-md text-body-md">1.2k</span>
</button>
<button className="flex items-center gap-xs text-on-surface-variant hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
<span className="font-body-md text-body-md">124</span>
</button>
</div>
</div>
</div>
</article>

<article className="bg-surface-elevated border border-border-default rounded-lg p-lg hover:border-hover transition-colors duration-200">
<div className="flex items-start gap-md">
<div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-border-default flex-shrink-0 text-primary-container">
<span className="material-symbols-outlined">campaign</span>
</div>
<div className="flex-1">
<div className="flex items-center gap-sm mb-xs">
<span className="font-label-bold text-label-bold text-on-surface-variant uppercase">System Update</span>
<span className="w-1 h-1 rounded-full bg-on-surface-variant"></span>
<span className="font-body-md text-body-md text-on-surface-variant text-[12px]">5 hours ago</span>
</div>
<a className="font-headline-sm text-headline-sm text-text-primary hover:text-primary transition-colors inline-block mb-sm" href="#">New LeetCode 75 Study Plan Launched</a>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-md">
                                We've revamped our core study plan. The new 75 essential questions cover patterns more comprehensively, ensuring you build a solid foundation before tackling hard problems. Check out the updated syllabus...
                            </p>
<div className="flex items-center gap-md">
<button className="flex items-center gap-xs text-on-surface-variant hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">thumb_up</span>
<span className="font-body-md text-body-md">3.4k</span>
</button>
<button className="flex items-center gap-xs text-on-surface-variant hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
<span className="font-body-md text-body-md">452</span>
</button>
</div>
</div>
</div>
</article>
</div>
</div>

<div className="xl:col-span-4 flex flex-col gap-lg hidden xl:flex">

<div className="bg-surface-elevated border border-border-default rounded-lg p-lg">
<div className="flex items-center gap-sm mb-md">
<span className="material-symbols-outlined text-primary-container">timer</span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Upcoming Contest</h3>
</div>
<div className="mb-md">
<p className="font-body-md text-body-md text-on-surface-variant mb-xs">Weekly Contest 389</p>
<div className="flex gap-sm">
<div className="bg-surface-container-high rounded p-sm flex flex-col items-center justify-center flex-1 border border-border-default">
<span className="font-headline-md text-headline-md text-text-primary">04</span>
<span className="font-label-bold text-label-bold text-on-surface-variant text-[10px] uppercase">Days</span>
</div>
<div className="bg-surface-container-high rounded p-sm flex flex-col items-center justify-center flex-1 border border-border-default">
<span className="font-headline-md text-headline-md text-text-primary">12</span>
<span className="font-label-bold text-label-bold text-on-surface-variant text-[10px] uppercase">Hours</span>
</div>
<div className="bg-surface-container-high rounded p-sm flex flex-col items-center justify-center flex-1 border border-border-default">
<span className="font-headline-md text-headline-md text-text-primary">45</span>
<span className="font-label-bold text-label-bold text-on-surface-variant text-[10px] uppercase">Mins</span>
</div>
</div>
</div>
<button className="w-full bg-primary-container text-on-primary-container font-label-bold text-label-bold py-sm rounded hover:bg-primary transition-colors duration-200">
                    Join Contest
                </button>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg p-lg">
<div className="flex items-center justify-between mb-md">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-hard">local_fire_department</span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Trending Discussions</h3>
</div>
<a className="text-primary font-body-md text-[12px] hover:underline" href="#">View All</a>
</div>
<ul className="flex flex-col gap-md">
<li className="group">
<a className="flex flex-col gap-xs" href="#">
<h4 className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors line-clamp-1">Google Interview Experience | L4 | London | Oct 2023 | Offer</h4>
<div className="flex items-center justify-between">
<span className="font-body-md text-body-md text-on-surface-variant text-[12px]">Interview Questions</span>
<div className="flex items-center gap-xs text-on-surface-variant text-[12px]">
<span className="material-symbols-outlined text-[14px]">visibility</span> 12k
                                </div>
</div>
</a>
</li>
<li className="w-full h-px bg-border-default"></li>
<li className="group">
<a className="flex flex-col gap-xs" href="#">
<h4 className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors line-clamp-1">Dynamic Programming Patterns you must know</h4>
<div className="flex items-center justify-between">
<span className="font-body-md text-body-md text-on-surface-variant text-[12px]">Study Guide</span>
<div className="flex items-center gap-xs text-on-surface-variant text-[12px]">
<span className="material-symbols-outlined text-[14px]">visibility</span> 8.5k
                                </div>
</div>
</a>
</li>
<li className="w-full h-px bg-border-default"></li>
<li className="group">
<a className="flex flex-col gap-xs" href="#">
<h4 className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors line-clamp-1">Is competitive programming still relevant in 2024?</h4>
<div className="flex items-center justify-between">
<span className="font-body-md text-body-md text-on-surface-variant text-[12px]">General Discussion</span>
<div className="flex items-center gap-xs text-on-surface-variant text-[12px]">
<span className="material-symbols-outlined text-[14px]">visibility</span> 5.2k
                                </div>
</div>
</a>
</li>
</ul>
</div>
</div>

    </>
  );
}