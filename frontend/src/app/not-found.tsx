import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <>
      

<h1 className="text-[120px] md:text-[180px] font-headline-lg leading-none tracking-tighter text-primary-container glitch-effect mb-md drop-shadow-[0_0_15px_rgba(255,161,22,0.3)]">
            404
        </h1>

<div className="bg-surface-elevated border border-border-default rounded-xl p-md mb-xl flex items-center gap-sm shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
<span className="material-symbols-outlined text-hard" style={{ fontVariationSettings: "\'FILL\' 1" }}>error</span>
<span className="font-code-md text-body-lg text-on-surface-variant">
                Exception in thread "main" <span className="text-text-primary">java.lang.PageNotFoundException:</span>
<br className="hidden md:block"/> The requested URL was not found on this server.
            </span>
</div>

<a className="bg-primary-container text-black font-label-bold text-label-bold px-xl py-md rounded-DEFAULT hover:bg-primary transition-colors duration-200 flex items-center gap-sm group" href="/">
<span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
            Return to Dashboard
        </a>

<pre className="font-code-sm text-code-sm text-surface-variant mt-xl md:mt-[64px] opacity-50 select-none">     _.-^^---....,,--       
 _--                  --_  
&lt;                        &gt;)
|                         | 
 \._                   _./</pre>
    </>
  );
}