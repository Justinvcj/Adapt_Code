import Link from 'next/link';

export default function HistoryPage() {
  return (
    <>
      


<div className="bg-surface-elevated border border-border-default rounded-lg p-md flex flex-wrap items-center gap-md justify-between">
<div className="flex flex-wrap items-center gap-sm">

<div className="relative">
<select className="appearance-none bg-surface-secondary border border-border-default rounded-md py-[6px] pl-sm pr-lg text-body-md text-text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 cursor-pointer w-[140px]">
<option value="all">All Languages</option>
<option value="cpp">C++</option>
<option value="java">Java</option>
<option value="python">Python</option>
<option value="javascript">JavaScript</option>
</select>
<span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
</div>

<div className="relative">
<select className="appearance-none bg-surface-secondary border border-border-default rounded-md py-[6px] pl-sm pr-lg text-body-md text-text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 cursor-pointer w-[140px]">
<option value="all">All Status</option>
<option value="accepted">Accepted</option>
<option value="wrong_answer">Wrong Answer</option>
<option value="tle">Time Limit Exceeded</option>
<option value="rte">Runtime Error</option>
</select>
<span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
</div>
</div>
<div className="flex items-center gap-sm relative">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
<input className="bg-surface-secondary border border-border-default rounded-md py-[6px] pl-[32px] pr-sm text-body-md text-text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 placeholder-on-surface-variant w-[200px]" placeholder="Search problems..." type="text"/>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg overflow-hidden flex-1 flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-border-default bg-surface-container/50">
<th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Time Submitted</th>
<th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Status</th>
<th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase w-full">Problem</th>
<th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Runtime</th>
<th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Memory</th>
<th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Language</th>
</tr>
</thead>
<tbody className="divide-y divide-border-default">

<tr className="hover:bg-surface-secondary transition-colors cursor-pointer group">
<td className="px-md py-[12px] text-body-md text-on-surface-variant whitespace-nowrap">Oct 24, 2023</td>
<td className="px-md py-[12px] whitespace-nowrap">
<div className="flex items-center gap-xs text-success">
<span className="font-body-md text-body-md font-bold">Accepted</span>
</div>
</td>
<td className="px-md py-[12px]">
<div className="flex items-center gap-sm">
<a className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors" href="#">1. Two Sum</a>
<span className="bg-easy/10 text-easy px-2 py-0.5 rounded-full font-code-sm text-[10px]">Easy</span>
</div>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-text-primary">8 ms</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-text-primary">10.4 MB</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="bg-surface-container-high border border-border-default px-2 py-1 rounded font-code-sm text-code-sm text-on-surface-variant">C++</span>
</td>
</tr>

<tr className="hover:bg-surface-secondary transition-colors cursor-pointer group">
<td className="px-md py-[12px] text-body-md text-on-surface-variant whitespace-nowrap">Oct 24, 2023</td>
<td className="px-md py-[12px] whitespace-nowrap">
<div className="flex items-center gap-xs text-hard">
<span className="font-body-md text-body-md font-bold">Wrong Answer</span>
</div>
</td>
<td className="px-md py-[12px]">
<div className="flex items-center gap-sm">
<a className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors" href="#">42. Trapping Rain Water</a>
<span className="bg-hard/10 text-hard px-2 py-0.5 rounded-full font-code-sm text-[10px]">Hard</span>
</div>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-on-surface-variant">N/A</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-on-surface-variant">N/A</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="bg-surface-container-high border border-border-default px-2 py-1 rounded font-code-sm text-code-sm text-on-surface-variant">Python3</span>
</td>
</tr>

<tr className="hover:bg-surface-secondary transition-colors cursor-pointer group">
<td className="px-md py-[12px] text-body-md text-on-surface-variant whitespace-nowrap">Oct 23, 2023</td>
<td className="px-md py-[12px] whitespace-nowrap">
<div className="flex items-center gap-xs text-success">
<span className="font-body-md text-body-md font-bold">Accepted</span>
</div>
</td>
<td className="px-md py-[12px]">
<div className="flex items-center gap-sm">
<a className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors" href="#">15. 3Sum</a>
<span className="bg-medium/10 text-medium px-2 py-0.5 rounded-full font-code-sm text-[10px]">Medium</span>
</div>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-text-primary">124 ms</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-text-primary">24.1 MB</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="bg-surface-container-high border border-border-default px-2 py-1 rounded font-code-sm text-code-sm text-on-surface-variant">Java</span>
</td>
</tr>

<tr className="hover:bg-surface-secondary transition-colors cursor-pointer group">
<td className="px-md py-[12px] text-body-md text-on-surface-variant whitespace-nowrap">Oct 22, 2023</td>
<td className="px-md py-[12px] whitespace-nowrap">
<div className="flex items-center gap-xs text-medium">
<span className="font-body-md text-body-md font-bold">Time Limit Exceeded</span>
</div>
</td>
<td className="px-md py-[12px]">
<div className="flex items-center gap-sm">
<a className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors" href="#">200. Number of Islands</a>
<span className="bg-medium/10 text-medium px-2 py-0.5 rounded-full font-code-sm text-[10px]">Medium</span>
</div>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-on-surface-variant">N/A</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-on-surface-variant">N/A</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="bg-surface-container-high border border-border-default px-2 py-1 rounded font-code-sm text-code-sm text-on-surface-variant">C++</span>
</td>
</tr>

<tr className="hover:bg-surface-secondary transition-colors cursor-pointer group">
<td className="px-md py-[12px] text-body-md text-on-surface-variant whitespace-nowrap">Oct 21, 2023</td>
<td className="px-md py-[12px] whitespace-nowrap">
<div className="flex items-center gap-xs text-success">
<span className="font-body-md text-body-md font-bold">Accepted</span>
</div>
</td>
<td className="px-md py-[12px]">
<div className="flex items-center gap-sm">
<a className="font-body-md text-body-md text-text-primary group-hover:text-primary transition-colors" href="#">20. Valid Parentheses</a>
<span className="bg-easy/10 text-easy px-2 py-0.5 rounded-full font-code-sm text-[10px]">Easy</span>
</div>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-text-primary">63 ms</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="font-code-sm text-code-sm text-text-primary">42.8 MB</span>
</td>
<td className="px-md py-[12px] whitespace-nowrap">
<span className="bg-surface-container-high border border-border-default px-2 py-1 rounded font-code-sm text-code-sm text-on-surface-variant">JavaScript</span>
</td>
</tr>
</tbody>
</table>
</div>

<div className="border-t border-border-default p-md flex justify-between items-center bg-surface-container/30 mt-auto">
<span className="text-body-md text-on-surface-variant">Showing 1 to 5 of 124 entries</span>
<div className="flex gap-xs">
<button className="w-8 h-8 flex items-center justify-center rounded border border-border-default bg-surface-secondary text-on-surface-variant hover:bg-surface-container-high hover:text-text-primary disabled:opacity-50 transition-colors" disabled={true}>
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary-container/10 text-primary font-body-md text-body-md font-bold">1</button>
<button className="w-8 h-8 flex items-center justify-center rounded border border-border-default bg-surface-secondary text-on-surface-variant hover:bg-surface-container-high hover:text-text-primary transition-colors font-body-md text-body-md">2</button>
<button className="w-8 h-8 flex items-center justify-center rounded border border-border-default bg-surface-secondary text-on-surface-variant hover:bg-surface-container-high hover:text-text-primary transition-colors font-body-md text-body-md">3</button>
<span className="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
<button className="w-8 h-8 flex items-center justify-center rounded border border-border-default bg-surface-secondary text-on-surface-variant hover:bg-surface-container-high hover:text-text-primary transition-colors font-body-md text-body-md">25</button>
<button className="w-8 h-8 flex items-center justify-center rounded border border-border-default bg-surface-secondary text-on-surface-variant hover:bg-surface-container-high hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>

    </>
  );
}