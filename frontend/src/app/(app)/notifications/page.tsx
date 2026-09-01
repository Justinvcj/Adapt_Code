import Link from 'next/link';

export default function NotificationsPage() {
  return (
    <>
      

<div className="bg-surface-elevated border border-border-default rounded-xl overflow-hidden flex flex-col min-h-[600px]">

<div className="flex items-center border-b border-border-default px-md overflow-x-auto no-scrollbar">
<button className="font-label-bold text-label-bold text-primary border-b-2 border-primary py-md px-md whitespace-nowrap">All</button>
<button className="font-label-bold text-label-bold text-on-surface-variant hover:text-text-primary transition-colors py-md px-md whitespace-nowrap border-b-2 border-transparent">Comments</button>
<button className="font-label-bold text-label-bold text-on-surface-variant hover:text-text-primary transition-colors py-md px-md whitespace-nowrap border-b-2 border-transparent">Likes</button>
<button className="font-label-bold text-label-bold text-on-surface-variant hover:text-text-primary transition-colors py-md px-md whitespace-nowrap border-b-2 border-transparent">System</button>
</div>

<div className="flex-1 flex flex-col">

<div className="p-md border-b border-border-default hover:bg-surface-secondary transition-colors cursor-pointer flex gap-md items-start group relative">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
<div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-default flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-text-primary text-[20px]">forum</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start gap-sm mb-xs">
<p className="font-body-md text-body-md text-text-primary">
<span className="font-label-bold text-label-bold">AlexChen</span> replied to your comment on <span className="font-label-bold text-label-bold text-tertiary-fixed-dim">Two Sum - O(n) Solution</span>
</p>
<span className="font-code-sm text-code-sm text-on-surface-variant shrink-0">2m ago</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 bg-surface-container/50 p-sm rounded-DEFAULT border border-border-default/50 mt-sm">
                                "Great approach! Have you considered using a hash map to reduce the time complexity even further? It avoids the inner loop entirely."
                            </p>
</div>
</div>

<div className="p-md border-b border-border-default hover:bg-surface-secondary transition-colors cursor-pointer flex gap-md items-start group relative">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
<div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-default flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[20px]">military_tech</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start gap-sm mb-xs">
<p className="font-body-md text-body-md text-text-primary">
<span className="font-label-bold text-label-bold text-primary">Achievement Unlocked!</span> You completed the 30-Day Coding Challenge.
                                </p>
<span className="font-code-sm text-code-sm text-on-surface-variant shrink-0">1h ago</span>
</div>
</div>
</div>

<div className="p-md border-b border-border-default hover:bg-surface-secondary transition-colors cursor-pointer flex gap-md items-start group opacity-70 hover:opacity-100">
<div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-default flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-success text-[20px]">thumb_up</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start gap-sm mb-xs">
<p className="font-body-md text-body-md text-text-primary">
<span className="font-label-bold text-label-bold">Dev_Ninja</span> liked your solution for <span className="font-label-bold text-label-bold text-tertiary-fixed-dim">Median of Two Sorted Arrays</span>
</p>
<span className="font-code-sm text-code-sm text-on-surface-variant shrink-0">4h ago</span>
</div>
</div>
</div>

<div className="p-md border-b border-border-default hover:bg-surface-secondary transition-colors cursor-pointer flex gap-md items-start group opacity-70 hover:opacity-100">
<div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-default flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant text-[20px]">update</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start gap-sm mb-xs">
<p className="font-body-md text-body-md text-text-primary">
                                    Platform Update: Weekly Contest 384 registrations are now open.
                                </p>
<span className="font-code-sm text-code-sm text-on-surface-variant shrink-0">Yesterday</span>
</div>
</div>
</div>

<div className="p-md border-b border-border-default hover:bg-surface-secondary transition-colors cursor-pointer flex gap-md items-start group opacity-70 hover:opacity-100">
<div className="w-10 h-10 rounded-full bg-surface-container-high border border-border-default flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-text-primary text-[20px]">forum</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start gap-sm mb-xs">
<p className="font-body-md text-body-md text-text-primary">
<span className="font-label-bold text-label-bold">SarahJ</span> mentioned you in <span className="font-label-bold text-label-bold text-tertiary-fixed-dim">Discussion: Dynamic Programming Strategies</span>
</p>
<span className="font-code-sm text-code-sm text-on-surface-variant shrink-0">2 days ago</span>
</div>
</div>
</div>
</div>
<div className="p-md border-t border-border-default bg-surface-container text-center">
<button className="font-label-bold text-label-bold text-on-surface-variant hover:text-text-primary transition-colors">Load More</button>
</div>
</div>

    </>
  );
}