import Link from 'next/link';

export default function DiscussPage() {
  return (
    <>
      

<div className="flex-1 flex flex-col gap-lg">

<div className="flex justify-between items-center pb-md border-b border-border-default">
<h1 className="font-headline-lg text-headline-lg">Discuss</h1>
<button className="bg-primary-container text-black font-label-bold text-label-bold px-md py-sm rounded hover:opacity-90 transition-opacity flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>add</span>
                        New Discussion
                    </button>
</div>

<div className="flex justify-between items-center flex-wrap gap-md">
<div className="flex gap-md bg-surface-elevated p-xs rounded border border-border-default">
<button className="px-md py-xs rounded bg-surface-secondary text-text-primary font-body-md text-body-md transition-colors">All</button>
<button className="px-md py-xs rounded text-on-surface-variant hover:text-text-primary font-body-md text-body-md transition-colors">Interview Questions</button>
<button className="px-md py-xs rounded text-on-surface-variant hover:text-text-primary font-body-md text-body-md transition-colors">Compensation</button>
<button className="px-md py-xs rounded text-on-surface-variant hover:text-text-primary font-body-md text-body-md transition-colors">General</button>
</div>
<div className="flex items-center gap-sm">
<span className="text-on-surface-variant font-label-bold text-label-bold uppercase">Sort by:</span>
<select className="bg-surface-elevated border border-border-default rounded text-body-md py-xs pl-sm pr-xl text-text-primary focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none">
<option>Hot</option>
<option>Most Votes</option>
<option>Most Recent</option>
</select>
</div>
</div>

<div className="flex flex-col gap-sm">

<div className="bg-surface-elevated border border-border-default rounded p-md flex gap-md hover:border-border-hover transition-colors group">

<div className="flex flex-col items-center gap-xs text-on-surface-variant w-12 shrink-0">
<button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>keyboard_arrow_up</span></button>
<span className="font-code-md text-code-md text-text-primary">1.2k</span>
<button className="hover:text-error transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>keyboard_arrow_down</span></button>
</div>

<div className="flex-1 flex flex-col gap-sm justify-center">
<h2 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">Google L4 Onsite Interview Experience - London (Offer)</h2>
<div className="flex gap-sm items-center flex-wrap">
<span className="bg-primary/10 text-primary font-code-sm text-code-sm px-2 py-0.5 rounded-full">Google</span>
<span className="bg-surface-variant text-on-surface-variant font-code-sm text-code-sm px-2 py-0.5 rounded-full">Onsite</span>
<span className="bg-surface-variant text-on-surface-variant font-code-sm text-code-sm px-2 py-0.5 rounded-full">System Design</span>
</div>
<div className="flex items-center gap-md text-on-surface-variant font-code-sm text-code-sm mt-xs">
<div className="flex items-center gap-xs">
<img className="w-4 h-4 rounded-full object-cover" data-alt="Small round avatar of a confident software engineer looking at camera in a dark studio setting, blue rim light." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwmdq6RW2JJreAWzQUzZI8cYDmE8mz8uuviwHC9VpeBmy4N-KZGUuYUNtzQ658KxrIkYaqzcJt49wJtO-pbpqXlHIt4HVPDZQzTowfH-xH4Cu4YK-5Jw8GpShA-fmgNPQuH674PMDASOYQTSwifiBgThamB7o0PXvB_xt6gA_vmqYGX8Vc9wXFDl3BoeArokUhIbRCy5V_5mX3chsAcpOWr28w9ULau42bBsXiMxpPYH0HMProXil4"/>
<span>algo_master</span>
</div>
<span>•</span>
<span>2 hours ago</span>
<span>•</span>
<div className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>visibility</span> 4.5k</div>
<div className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>chat_bubble</span> 128</div>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded p-md flex gap-md hover:border-border-hover transition-colors group">
<div className="flex flex-col items-center gap-xs text-on-surface-variant w-12 shrink-0">
<button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>keyboard_arrow_up</span></button>
<span className="font-code-md text-code-md text-text-primary">856</span>
<button className="hover:text-error transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>keyboard_arrow_down</span></button>
</div>
<div className="flex-1 flex flex-col gap-sm justify-center">
<h2 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">Meta E5 Full Stack Comp Negotiation (NYC) - Need Advice</h2>
<div className="flex gap-sm items-center flex-wrap">
<span className="bg-secondary/10 text-secondary font-code-sm text-code-sm px-2 py-0.5 rounded-full">Meta</span>
<span className="bg-surface-variant text-on-surface-variant font-code-sm text-code-sm px-2 py-0.5 rounded-full">Compensation</span>
</div>
<div className="flex items-center gap-md text-on-surface-variant font-code-sm text-code-sm mt-xs">
<div className="flex items-center gap-xs">
<img className="w-4 h-4 rounded-full object-cover" data-alt="Small avatar icon featuring a minimalist abstract geometric logo in shades of neon blue and orange on a dark background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2csPEFxMh_oKQBJIFoFlYFL0drvaKj7asaZxQu6KNq6sU2oW3WX8KQcXNHJep5hEuk5MQ2ZxKMszjdS92wbyz1nM3mNNEpX_I19S9OWAzIbECr9YWcRRS5-r1_MuGEofhD8rF302E3cRKKs7nqEFVgpePOWHBDzAF74rILluz2qAeG3muOTx3uOhyKfa2p0L-co_1a4bSi9evs9XAuZpS1AhGWrDAA1XnCqPabH9bM78zpQFqsika"/>
<span>dev_ninja</span>
</div>
<span>•</span>
<span>5 hours ago</span>
<span>•</span>
<div className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>visibility</span> 2.1k</div>
<div className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>chat_bubble</span> 42</div>
</div>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded p-md flex gap-md hover:border-border-hover transition-colors group">
<div className="flex flex-col items-center gap-xs text-on-surface-variant w-12 shrink-0">
<button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>keyboard_arrow_up</span></button>
<span className="font-code-md text-code-md text-text-primary">432</span>
<button className="hover:text-error transition-colors"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>keyboard_arrow_down</span></button>
</div>
<div className="flex-1 flex flex-col gap-sm justify-center">
<h2 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors cursor-pointer">Amazon SDE2 OA - Passed all test cases but no response?</h2>
<div className="flex gap-sm items-center flex-wrap">
<span className="bg-primary/10 text-primary font-code-sm text-code-sm px-2 py-0.5 rounded-full">Amazon</span>
<span className="bg-surface-variant text-on-surface-variant font-code-sm text-code-sm px-2 py-0.5 rounded-full">Online Assessment</span>
</div>
<div className="flex items-center gap-md text-on-surface-variant font-code-sm text-code-sm mt-xs">
<div className="flex items-center gap-xs">
<img className="w-4 h-4 rounded-full object-cover" data-alt="Minimalist dark mode generic user silhouette avatar with subtle purple gradient background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0u0CRSbZYvHUl9X40p32DGoPZ8PA5LLenYr6YCkHWGUHFhcLqKwAT7vqd_PrUkyOYQRs5TVDLaKX_ZwH2XzznfOvNLMPrJ_UhlJa--i2Frlrwg-tpvdwyCB4G5IKlG0QsVk4cTtxl_uDhUDdADsh3VltqFe-fdqvD2bbh5pghQ6vl0nvl7aZSYlEa-Cqme5oigsnnIFXgdI6PfiCJ46STdbFvGflDYXTk5dQzImbRM9_d254H22vD"/>
<span>coding_bee</span>
</div>
<span>•</span>
<span>12 hours ago</span>
<span>•</span>
<div className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>visibility</span> 1.8k</div>
<div className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 0" }}>chat_bubble</span> 89</div>
</div>
</div>
</div>
</div>
</div>

<div className="w-full lg:w-80 flex flex-col gap-lg shrink-0">

<div className="bg-surface-elevated border border-border-default rounded p-md">
<h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-xs">
<span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "\'FILL\' 1" }}>trending_up</span>
                        Trending Tags
                    </h3>
<div className="flex flex-wrap gap-xs">
<a className="bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-text-primary font-code-sm text-code-sm px-sm py-1 rounded transition-colors border border-transparent hover:border-border-default" href="#">Google (3.2k)</a>
<a className="bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-text-primary font-code-sm text-code-sm px-sm py-1 rounded transition-colors border border-transparent hover:border-border-default" href="#">Amazon (2.8k)</a>
<a className="bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-text-primary font-code-sm text-code-sm px-sm py-1 rounded transition-colors border border-transparent hover:border-border-default" href="#">Meta (1.9k)</a>
<a className="bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-text-primary font-code-sm text-code-sm px-sm py-1 rounded transition-colors border border-transparent hover:border-border-default" href="#">System Design (1.5k)</a>
<a className="bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-text-primary font-code-sm text-code-sm px-sm py-1 rounded transition-colors border border-transparent hover:border-border-default" href="#">Dynamic Programming (900)</a>
<a className="bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-text-primary font-code-sm text-code-sm px-sm py-1 rounded transition-colors border border-transparent hover:border-border-default" href="#">Compensation (850)</a>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded p-md">
<h3 className="font-headline-sm text-headline-sm mb-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "\'FILL\' 0" }}>info</span>
                        Community Guidelines
                    </h3>
<ul className="text-on-surface-variant font-body-md text-body-md list-disc pl-lg space-y-sm">
<li>Be respectful and constructive in your feedback.</li>
<li>Do not share exact interview questions if under NDA.</li>
<li>Search before posting to avoid duplicates.</li>
<li>Format code snippets properly using markdown.</li>
</ul>
</div>
</div>

    </>
  );
}