import Link from 'next/link';

export default function LiveContestPage() {
  return (
    <>
      



<div className="flex-1 mt-[50px] flex overflow-hidden">



<div className="flex-1 split-pane bg-surface">

<div className="pane flex-1 min-w-[300px] flex flex-col p-lg border-r border-border-default">
<h1 className="font-headline-lg text-headline-lg mb-md">Q2. Matching Pattern in Array</h1>
<div className="flex flex-wrap gap-sm mb-lg">
<span className="bg-medium/10 text-medium px-sm py-xs rounded-full font-label-bold text-label-bold">Medium</span>
<span className="bg-surface-elevated border border-border-default text-on-surface-variant px-sm py-xs rounded-full font-label-bold text-label-bold">Array</span>
<span className="bg-surface-elevated border border-border-default text-on-surface-variant px-sm py-xs rounded-full font-label-bold text-label-bold">String Matching</span>
</div>
<div className="prose prose-invert max-w-none font-body-md text-body-md text-on-surface mb-lg">
<p className="mb-md">You are given a <strong>0-indexed</strong> integer array <code>nums</code> of size <code>n</code>, and a <strong>0-indexed</strong> integer array <code>pattern</code> of size <code>m</code> consisting of integers <code>-1</code>, <code>0</code>, and <code>1</code>.</p>
<p className="mb-md">A subarray <code>nums[i..j]</code> of size <code>m + 1</code> is said to match the <code>pattern</code> if the following conditions hold for each element <code>pattern[k]</code>:</p>
<ul className="list-disc pl-md mb-md space-y-sm">
<li><code>nums[i + k + 1] &gt; nums[i + k]</code> if <code>pattern[k] == 1</code>.</li>
<li><code>nums[i + k + 1] == nums[i + k]</code> if <code>pattern[k] == 0</code>.</li>
<li><code>nums[i + k + 1] &lt; nums[i + k]</code> if <code>pattern[k] == -1</code>.</li>
</ul>
<p>Return <em>the <strong>count</strong> of subarrays in</em> <code>nums</code> <em>that match the</em> <code>pattern</code>.</p>
</div>
<div className="bg-surface-elevated border border-border-default rounded p-md mb-md">
<p className="font-label-bold text-label-bold text-on-surface-variant mb-xs">Example 1:</p>
<div className="font-code-md text-code-md">
<p><span className="text-secondary">Input:</span> nums = [1,2,2,1,5,6], pattern = [1,0,-1,1]</p>
<p><span className="text-secondary">Output:</span> 1</p>
<p className="text-on-surface-variant text-sm mt-xs">Explanation: The pattern [1,0,-1,1] indicates that we are looking for a subarray nums[i..j] of size 5 such that:
nums[i+1] &gt; nums[i]
nums[i+2] == nums[i+1]
nums[i+3] &lt; nums[i+2]
nums[i+4] &gt; nums[i+3]</p>
</div>
</div>
<div className="bg-surface-elevated border border-border-default rounded p-md mb-lg">
<p className="font-label-bold text-label-bold text-on-surface-variant mb-xs">Constraints:</p>
<ul className="list-disc pl-md font-code-sm text-code-sm text-on-surface space-y-xs">
<li><code>2 &lt;= n == nums.length &lt;= 100</code></li>
<li><code>1 &lt;= nums[i] &lt;= 10^9</code></li>
<li><code>1 &lt;= m == pattern.length &lt; n</code></li>
<li><code>-1 &lt;= pattern[i] &lt;= 1</code></li>
</ul>
</div>
</div>

<div className="gutter" id="resizer"></div>

<div className="pane flex-1 min-w-[300px] flex flex-col bg-[#1e1e1e]">

<div className="flex justify-between items-center p-sm bg-surface-secondary border-b border-border-default">
<div className="flex gap-sm">
<select className="bg-surface-elevated border border-border-default text-text-primary text-sm rounded px-sm py-xs focus:ring-secondary focus:border-secondary font-code-sm">
<option>C++</option>
<option defaultValue="">Python3</option>
<option>Java</option>
</select>
<button className="p-xs text-on-surface-variant hover:text-text-primary rounded hover:bg-surface-elevated" title="Reset to default code">
<span className="material-symbols-outlined text-[18px]">refresh</span>
</button>
</div>
<div className="flex gap-sm items-center">
<span className="font-code-sm text-on-surface-variant mr-sm">Auto-saved</span>
<button className="bg-surface-elevated text-text-primary px-md py-xs rounded text-sm hover:bg-surface-bright transition-colors border border-border-default">Run Code</button>
<button className="bg-primary-container text-on-primary-container px-md py-xs rounded text-sm font-semibold hover:bg-primary transition-colors">Submit</button>
</div>
</div>

<div className="flex-1 flex overflow-hidden font-code-md text-code-md">

<div className="w-12 bg-surface-secondary text-on-surface-variant text-right pr-sm py-sm border-r border-border-default select-none flex flex-col items-end opacity-50">
<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div>
</div>

<div className="flex-1 p-sm bg-[#1e1e1e] text-[#d4d4d4] overflow-auto whitespace-pre outline-none" contentEditable={true} spellCheck={false}>
<span className="text-[#569cd6]">class</span> <span className="text-[#4ec9b0]">Solution</span>:
    <span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">countMatchingSubarrays</span>(<span className="text-[#9cdcfe]">self</span>, <span className="text-[#9cdcfe]">nums</span>: <span className="text-[#4ec9b0]">List</span>[<span className="text-[#4ec9b0]">int</span>], <span className="text-[#9cdcfe]">pattern</span>: <span className="text-[#4ec9b0]">List</span>[<span className="text-[#4ec9b0]">int</span>]) -&gt; <span className="text-[#4ec9b0]">int</span>:
        <span className="text-[#6a9955]"># Write your contest code here</span>
        n = <span className="text-[#dcdcaa]">len</span>(nums)
        m = <span className="text-[#dcdcaa]">len</span>(pattern)
        count = <span className="text-[#b5cea8]">0</span>
<span className="text-[#569cd6]">return</span> count
                    </div>
</div>

<div className="h-10 bg-surface-secondary border-t border-border-default flex items-center justify-between px-md cursor-pointer hover:bg-surface-bright transition-colors">
<div className="flex items-center gap-sm text-on-surface-variant font-code-sm">
<span className="material-symbols-outlined text-[16px]">terminal</span>
<span>Console</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_less</span>
</div>
</div>
</div>
</div>


    </>
  );
}