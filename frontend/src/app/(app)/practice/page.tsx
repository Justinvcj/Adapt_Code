/* eslint-disable react/jsx-no-comment-textnodes */
import Link from 'next/link';

export default function PracticePage() {
  return (
    <>
      



<div className="h-[40px] mt-[50px] bg-surface-elevated border-b border-border-default flex items-center justify-between px-md flex-shrink-0">
<div className="flex items-center gap-sm">
<button className="flex items-center gap-1 text-on-surface-variant hover:text-text-primary px-2 py-1 rounded hover:bg-surface-secondary transition-colors font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[18px]">list</span> Problem List
            </button>
<div className="h-4 w-px bg-border-default mx-1"></div>
<button className="text-on-surface-variant hover:text-text-primary p-1 rounded hover:bg-surface-secondary transition-colors">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button className="text-on-surface-variant hover:text-text-primary p-1 rounded hover:bg-surface-secondary transition-colors">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
<div className="flex items-center gap-sm">
<button className="text-primary-container hover:text-primary p-1 rounded hover:bg-surface-secondary transition-colors" title="AI Assistant">
<span className="material-symbols-outlined text-[18px]">auto_awesome</span>
</button>
<button className="flex items-center gap-1 bg-surface-secondary text-text-primary px-3 py-1 rounded border border-border-default hover:border-border-hover transition-colors font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[16px]">play_arrow</span> Run
            </button>
<button className="flex items-center gap-1 bg-success/10 text-success px-3 py-1 rounded border border-success/20 hover:bg-success/20 transition-colors font-label-bold text-label-bold">
                Submit
            </button>
</div>
</div>

<div className="split-pane bg-background overflow-hidden">

<div className="pane-left bg-surface overflow-hidden">

<div className="flex items-center border-b border-border-default bg-surface-elevated px-2 gap-1 overflow-x-auto scrollbar-hide flex-shrink-0 h-[40px]">
<button className="flex items-center gap-1 text-text-primary px-3 py-1.5 rounded-md bg-surface-secondary font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[16px]">description</span> Description
                </button>
<button className="flex items-center gap-1 text-on-surface-variant hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-secondary transition-colors font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[16px]">menu_book</span> Editorial
                </button>
<button className="flex items-center gap-1 text-on-surface-variant hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-secondary transition-colors font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[16px]">science</span> Solutions
                </button>
<button className="flex items-center gap-1 text-on-surface-variant hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-secondary transition-colors font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[16px]">history</span> Submissions
                </button>
</div>

<div className="p-lg overflow-y-auto flex-1">
<div className="flex items-center justify-between mb-md">
<h1 className="font-headline-md text-headline-md text-text-primary">1. Two Sum</h1>
</div>
<div className="flex items-center gap-md mb-lg">
<span className="px-2 py-0.5 rounded-full bg-easy/10 text-easy font-label-bold text-label-bold">Easy</span>
<button className="text-on-surface-variant hover:text-text-primary transition-colors flex items-center">
<span className="material-symbols-outlined text-[18px]">thumb_up</span> <span className="ml-1 text-xs">49.2K</span>
</button>
<button className="text-on-surface-variant hover:text-text-primary transition-colors flex items-center">
<span className="material-symbols-outlined text-[18px]">thumb_down</span> <span className="ml-1 text-xs">1.6K</span>
</button>
<button className="text-on-surface-variant hover:text-text-primary transition-colors flex items-center ml-auto">
<span className="material-symbols-outlined text-[18px]">star</span>
</button>
<button className="text-on-surface-variant hover:text-text-primary transition-colors flex items-center">
<span className="material-symbols-outlined text-[18px]">share</span>
</button>
</div>
<div className="text-on-surface-variant font-body-md text-body-md space-y-md">
<p>Given an array of integers <code className="font-code-sm text-code-sm bg-surface-secondary px-1 py-0.5 rounded text-text-primary">nums</code> and an integer <code className="font-code-sm text-code-sm bg-surface-secondary px-1 py-0.5 rounded text-text-primary">target</code>, return <em>indices of the two numbers such that they add up to <code className="font-code-sm text-code-sm bg-surface-secondary px-1 py-0.5 rounded text-text-primary">target</code></em>.</p>
<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>
<p>You can return the answer in any order.</p>
</div>
<div className="mt-xl space-y-lg">

<div>
<h3 className="font-label-bold text-label-bold text-text-primary mb-2">Example 1:</h3>
<div className="bg-surface-elevated border border-border-default rounded-md p-sm font-code-md text-code-md text-on-surface-variant">
<div><span className="text-text-primary font-semibold">Input:</span> nums = [2,7,11,15], target = 9</div>
<div><span className="text-text-primary font-semibold">Output:</span> [0,1]</div>
<div><span className="text-text-primary font-semibold">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].</div>
</div>
</div>

<div>
<h3 className="font-label-bold text-label-bold text-text-primary mb-2">Example 2:</h3>
<div className="bg-surface-elevated border border-border-default rounded-md p-sm font-code-md text-code-md text-on-surface-variant">
<div><span className="text-text-primary font-semibold">Input:</span> nums = [3,2,4], target = 6</div>
<div><span className="text-text-primary font-semibold">Output:</span> [1,2]</div>
</div>
</div>
</div>
<div className="mt-xl">
<h3 className="font-label-bold text-label-bold text-text-primary mb-2">Constraints:</h3>
<ul className="list-disc list-inside text-on-surface-variant font-code-sm text-code-sm space-y-1">
<li><code className="bg-surface-secondary px-1 rounded">2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
<li><code className="bg-surface-secondary px-1 rounded">-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
<li><code className="bg-surface-secondary px-1 rounded">-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
<li><strong>Only one valid answer exists.</strong></li>
</ul>
</div>
</div>

<div className="h-[40px] border-t border-border-default bg-surface-elevated flex items-center justify-between px-md flex-shrink-0">
<div className="flex items-center gap-md text-xs text-on-surface-variant">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">comment</span> 12.4K</span>
</div>
<div className="text-xs text-on-surface-variant">
                    © 2024 AdaptCode. 1005 Online
                </div>
</div>
</div>
<div className="resizer" id="resizer"></div>

<div className="pane-right bg-[#1E1E2E] overflow-hidden flex flex-col">

<div className="h-[40px] border-b border-border-default bg-surface-elevated flex items-center justify-between px-md flex-shrink-0">
<div className="flex items-center gap-sm">
<div className="relative">
<button className="flex items-center gap-1 text-text-primary bg-surface-secondary px-2 py-1 rounded hover:bg-surface-variant transition-colors font-label-bold text-label-bold border border-border-default">
                            Java <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
</button>
</div>
<button className="flex items-center gap-1 text-on-surface-variant hover:text-text-primary px-2 py-1 rounded hover:bg-surface-secondary transition-colors font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[16px]">sync</span> Auto
                    </button>
</div>
<div className="flex items-center gap-2">
<button className="text-on-surface-variant hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">settings</span>
</button>
<button className="text-on-surface-variant hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">fullscreen</span>
</button>
</div>
</div>

<div className="flex-1 overflow-auto p-4 font-code-md text-code-md leading-relaxed relative">

<div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1E1E2E] border-r border-border-default flex flex-col items-end py-4 pr-2 text-[#5c6370] select-none">
<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
</div>

<div className="ml-10 text-[#a6accd]">
<pre><code><span className="sh-keyword">class</span> <span className="sh-function">Solution</span> {"{"}
    <span className="sh-keyword">public</span> <span className="sh-keyword">int</span>[] <span className="sh-function">twoSum</span>(<span className="sh-keyword">int</span>[] nums, <span className="sh-keyword">int</span> target) {"{"}
        <span className="sh-comment">// Write your logic here</span>
        <span className="sh-keyword">return</span> <span className="sh-keyword">new</span> <span className="sh-keyword">int</span>[]{"{}"};
    {"}"}
{"}"}</code></pre>
</div>

<div className="absolute top-[34px] left-0 right-0 h-[22px] bg-white/5 pointer-events-none"></div>
</div>

<div className="h-[200px] border-t border-border-default bg-surface-elevated flex flex-col flex-shrink-0">
<div className="flex items-center border-b border-border-default px-2 gap-1 h-[36px]">
<button className="flex items-center gap-1 text-text-primary px-3 py-1 rounded-md bg-surface-secondary font-label-bold text-label-bold">
                        Testcase
                    </button>
<button className="flex items-center gap-1 text-on-surface-variant hover:text-text-primary px-3 py-1 rounded-md hover:bg-surface-secondary transition-colors font-label-bold text-label-bold">
<span className="material-symbols-outlined text-[16px]">terminal</span> Result
                    </button>
</div>
<div className="flex-1 p-sm overflow-auto">
<div className="flex gap-2 mb-2">
<button className="px-3 py-1 bg-surface-secondary text-text-primary rounded text-xs border border-border-hover">Case 1</button>
<button className="px-3 py-1 text-on-surface-variant hover:bg-surface-secondary rounded text-xs">Case 2</button>
<button className="px-3 py-1 text-on-surface-variant hover:bg-surface-secondary rounded text-xs">Case 3</button>
<button className="px-2 py-1 text-on-surface-variant hover:bg-surface-secondary rounded text-xs flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">add</span></button>
</div>
<div className="space-y-2">
<div>
<div className="text-xs text-on-surface-variant mb-1">nums =</div>
<div className="bg-surface border border-border-default rounded p-2 font-code-sm text-code-sm text-text-primary">[2,7,11,15]</div>
</div>
<div>
<div className="text-xs text-on-surface-variant mb-1">target =</div>
<div className="bg-surface border border-border-default rounded p-2 font-code-sm text-code-sm text-text-primary">9</div>
</div>
</div>
</div>
</div>
</div>
</div>


    </>
  );
}