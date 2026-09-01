'use client';

import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { useToastContext } from '@/components/toast-provider';
import { CODE, LANG_NAMES } from '@/lib/data';
import { highlight } from '@/lib/utils';
import { ExpandIcon, TerminalIcon } from '@/components/icons';

export default function PlaygroundPage() {
  const { toast } = useToastContext();
  const [lang, setLang] = useState('python3');
  const [code, setCode] = useState(CODE.python3 || '');
  const [output, setOutput] = useState<string | null>(null);
  const hlRef = useRef<HTMLPreElement>(null);
  const lnRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setCode(CODE[lang] || CODE.python3 || ''); }, [lang]);

  useEffect(() => {
    if (hlRef.current) hlRef.current.innerHTML = highlight(code, lang);
    if (lnRef.current) {
      const lines = code.split('\n').length;
      lnRef.current.innerHTML = Array.from({ length: lines }, (_, i) => `<span>${i + 1}</span>`).join('');
    }
  }, [code, lang]);

  function handleScroll() {
    if (!taRef.current || !hlRef.current || !lnRef.current) return;
    hlRef.current.scrollTop = taRef.current.scrollTop;
    hlRef.current.scrollLeft = taRef.current.scrollLeft;
    lnRef.current.scrollTop = taRef.current.scrollTop;
  }

  function runCode() {
    setOutput('running');
    setTimeout(() => {
      setOutput('Hello, World!\n\nExecution time: 12ms\nMemory: 8.2 MB');
      toast('Code executed', 'success');
    }, 600);
  }

  const lines = code.split('\n').length;

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-sf)]">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold flex items-center gap-1.5"><TerminalIcon size={16} /> Playground</h1>
            <select className="px-2 py-1 rounded-[var(--r)] bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--tx)] text-xs cursor-pointer" value={lang} onChange={(e) => setLang(e.target.value)}>
              {Object.entries(LANG_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 rounded-[var(--r)] text-[13px] font-medium bg-[var(--solved)] text-white hover:bg-[#2fba50] transition-colors" onClick={runCode}>▶ Run Code</button>
            <button className="w-8 h-8 rounded-[var(--r)] flex items-center justify-center text-[var(--tx-2)] hover:bg-[var(--bg-hover)] transition-all"><ExpandIcon size={16} /></button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex overflow-hidden relative bg-[#0a0a0c]">
            <div ref={lnRef} className="py-3 text-[var(--tx-3)] font-[var(--font-mono)] text-[13px] leading-[1.65] text-right select-none overflow-hidden min-w-[44px] shrink-0 border-r border-[var(--border)] [&>span]:block [&>span]:px-2 [&>span]:pl-1">
              {Array.from({ length: lines }, (_, i) => <span key={i}>{i + 1}</span>)}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <pre ref={hlRef} className="absolute inset-0 p-3 font-[var(--font-mono)] text-[13px] leading-[1.65] whitespace-pre overflow-auto m-0 pointer-events-none text-[var(--tx)]" dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
              <textarea ref={taRef} className="relative z-[2] block w-full h-full p-3 font-[var(--font-mono)] text-[13px] leading-[1.65] bg-transparent text-transparent caret-[var(--tx)] resize-none whitespace-pre overflow-auto [tab-size:4] selection:bg-[rgba(94,106,210,0.25)]" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} onScroll={handleScroll} />
            </div>
          </div>

          {/* Output panel */}
          <div className="w-[360px] border-l border-[var(--border)] flex flex-col bg-[var(--bg)]">
            <div className="px-3 py-2 border-b border-[var(--border)] text-xs font-medium text-[var(--tx-1)] flex items-center gap-1.5"><TerminalIcon size={14} /> Output</div>
            <div className="flex-1 p-3 font-[var(--font-mono)] text-[13px] text-[var(--tx-1)] overflow-auto">
              {output === 'running' ? (
                <span className="text-[var(--tx-2)]">Running...</span>
              ) : output ? (
                <pre className="whitespace-pre-wrap">{output}</pre>
              ) : (
                <span className="text-[var(--tx-3)]">Click &quot;Run Code&quot; to see output</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
