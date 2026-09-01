import Link from 'next/link';

export default function PlaygroundPage() {
  return (
    <>
      

<div className="h-12 bg-surface-elevated border-b border-border-default flex items-center justify-between px-md shrink-0">
<div className="flex items-center gap-sm">

<div className="relative">
<button className="flex items-center gap-xs px-sm py-xs bg-surface-container rounded border border-border-default hover:border-border-hover transition-colors text-body-md font-body-md">
<span>Python 3</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</button>
</div>
</div>
<div className="flex items-center gap-sm">
<button className="flex items-center gap-xs px-md py-xs bg-surface-container rounded border border-border-default hover:border-border-hover transition-colors text-body-md font-body-md">
<span className="material-symbols-outlined text-[16px]">save</span>
<span>Save</span>
</button>
<button className="flex items-center gap-xs px-md py-xs bg-surface-container rounded border border-border-default hover:border-border-hover transition-colors text-body-md font-body-md">
<span className="material-symbols-outlined text-[16px]">share</span>
<span>Share</span>
</button>
<button className="flex items-center gap-xs px-md py-xs bg-primary-container text-on-primary-container rounded font-label-bold text-label-bold hover:opacity-90 transition-opacity">
<span className="material-symbols-outlined text-[16px]">play_arrow</span>
<span>Run</span>
</button>
</div>
</div>

<div className="flex-1 flex flex-col min-h-0">

<div className="flex-1 flex flex-col bg-surface-elevated min-h-0 overflow-auto py-md">
<div className="font-code-md text-code-md">
<div className="code-line"><span className="line-number">1</span><span className="comment"># Welcome to the AdaptCode Playground</span></div>
<div className="code-line"><span className="line-number">2</span></div>
<div className="code-line"><span className="line-number">3</span><span className="keyword">def</span> <span className="function">solve</span>(nums):</div>
<div className="code-line"><span className="line-number">4</span> <span className="comment"># Your logic here</span></div>
<div className="code-line"><span className="line-number">5</span> <span className="keyword">return</span> nums</div>
<div className="code-line"><span className="line-number">6</span></div>
<div className="code-line"><span className="line-number">7</span><span className="keyword">if</span> __name__ == <span className="string">'__main__'</span>:</div>
<div className="code-line"><span className="line-number">8</span> <span className="function">print</span>(<span className="string">"Hello, World!"</span>)</div>
<div className="code-line"><span className="line-number">9</span> <span className="keyword">pass</span></div>
</div>
</div>

<div className="resizer-h"></div>

<div className="h-64 bg-surface-container-lowest flex flex-col shrink-0">
<div className="h-10 bg-surface-elevated border-b border-border-default flex items-center px-md gap-md">
<button className="text-primary font-label-bold text-label-bold border-b-2 border-primary h-full px-sm flex items-center">Output</button>
<button className="text-on-surface-variant font-label-bold text-label-bold h-full px-sm flex items-center hover:text-text-primary transition-colors">Terminal</button>
</div>
<div className="flex-1 p-md font-code-sm text-code-sm text-on-surface-variant overflow-auto">
<p className="text-success">Compilation successful.</p>
<p className="mt-sm">&gt; Hello, World!</p>
<p className="mt-sm opacity-50">Program exited with code 0.</p>
</div>
</div>
</div>

    </>
  );
}