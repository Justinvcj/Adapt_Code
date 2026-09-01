'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToastContext } from '@/components/toast-provider';
import { CODE, LANG_NAMES } from '@/lib/data';
import { highlight } from '@/lib/utils';
import {
  MenuIcon, ChevLeftIcon, ChevRightIcon, ShuffleIcon,
  SubmitIcon, DocIcon, GridIcon, SettingsIcon,
  ThumbUpIcon, ThumbDownIcon, CommentIcon, StarIcon,
  ShareIcon, InfoIcon, CodeIcon, CheckIcon, BookmarkIcon,
  UndoIcon, ExpandIcon, LockIcon, TerminalIcon, TestcaseIcon,
} from '@/components/icons';

export default function ProblemPage() {
  const { toast } = useToastContext();
  const [pTab, setPTab] = useState<'desc' | 'editorial' | 'solutions' | 'submissions'>('desc');
  const [cTab, setCTab] = useState<'tc' | 'result'>('tc');
  const [lang, setLang] = useState('java');
  const [code, setCode] = useState(CODE.java);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const hlRef = useRef<HTMLPreElement>(null);
  const lnRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Update code when lang changes
  useEffect(() => {
    setCode(CODE[lang] || CODE.java);
  }, [lang]);

  // Sync scroll + highlight
  const syncEditor = useCallback(() => {
    if (hlRef.current) hlRef.current.innerHTML = highlight(code, lang);
    if (lnRef.current) {
      const lines = code.split('\n').length;
      lnRef.current.innerHTML = Array.from({ length: lines }, (_, i) => `<span>${i + 1}</span>`).join('');
    }
  }, [code, lang]);

  useEffect(() => { syncEditor(); }, [syncEditor]);

  function handleScroll() {
    if (!taRef.current || !hlRef.current || !lnRef.current) return;
    hlRef.current.scrollTop = taRef.current.scrollTop;
    hlRef.current.scrollLeft = taRef.current.scrollLeft;
    lnRef.current.scrollTop = taRef.current.scrollTop;
  }

  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = taRef.current!;
      const s = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, s) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 4; }, 0);
    }
  }

  // Splitter
  useEffect(() => {
    const div = divRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!div || !left || !right) return;

    let dragging = false;
    function onDown(e: MouseEvent) {
      dragging = true;
      div!.classList.add('!bg-[var(--blue)]');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }
    function onMove(e: MouseEvent) {
      if (!dragging || !left || !right) return;
      const parent = left.parentElement!;
      const pct = ((e.clientX - parent.getBoundingClientRect().left) / parent.offsetWidth) * 100;
      const clamped = Math.max(25, Math.min(75, pct));
      left.style.width = clamped + '%';
      right.style.flex = 'none';
      right.style.width = (100 - clamped - 0.3) + '%';
    }
    function onUp() {
      if (dragging) {
        dragging = false;
        div!.classList.remove('!bg-[var(--blue)]');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    }
    div.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      div.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  function runCode() {
    setCTab('result');
    setConsoleOutput('running');
    setTimeout(() => {
      setConsoleOutput('passed');
      toast('All test cases passed', 'success');
    }, 800);
  }

  function submitCode() {
    toast('Submitting...', 'info');
    setTimeout(() => toast('Accepted — 3ms runtime, beats 94.7%', 'success'), 1400);
  }

  const lines = code.split('\n').length;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Problem nav bar */}
      <div className="flex items-center h-[var(--nav-h)] px-3 bg-[var(--bg-sf)] border-b border-[var(--border)] gap-1 shrink-0">
        <Link href="/" className="w-7 h-7 rounded-[var(--r-sm)] bg-[var(--accent)] flex items-center justify-center text-[11px] font-extrabold text-[#010102] font-[var(--font-mono)] mr-1">&lt;/&gt;</Link>
        <Link href="/problems" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--r)] text-[13px] text-[var(--tx-1)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all"><MenuIcon size={16} /> Problem List</Link>
        <PnBtn onClick={() => toast('Previous problem — demo', 'info')}><ChevLeftIcon size={16} /></PnBtn>
        <PnBtn onClick={() => toast('Next problem — demo', 'info')}><ChevRightIcon size={16} /></PnBtn>
        <PnBtn onClick={() => toast('Random — demo', 'info')}><ShuffleIcon size={16} /></PnBtn>
        <div className="ml-auto flex items-center gap-1">
          <button className="px-3.5 py-1.5 rounded-[var(--r)] text-[13px] font-medium bg-[var(--bg-sf3)] flex items-center gap-1.5 hover:bg-[rgba(255,255,255,0.12)] transition-all" onClick={runCode}>▶ Run</button>
          <button className="px-3.5 py-1.5 rounded-[var(--r)] text-[13px] font-semibold text-white bg-[var(--solved)] flex items-center gap-1.5 hover:bg-[#2fba50] transition-all" onClick={submitCode}><SubmitIcon size={14} /> Submit</button>
          <PnBtn onClick={() => toast('Copied — demo', 'success')}><DocIcon size={16} /></PnBtn>
          <PnBtn>✨</PnBtn>
          <span className="w-px h-5 bg-[var(--border)] mx-1" />
          <PnBtn><GridIcon size={16} /></PnBtn>
          <PnBtn><SettingsIcon size={16} /></PnBtn>
          <button className="h-8 rounded-[var(--r)] flex items-center gap-1 px-2 text-[var(--tx-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all"><ThumbUpIcon size={16} /> <span className="text-xs">0</span></button>
          <span className="w-px h-5 bg-[var(--border)] mx-1" />
          <PnBtn><ExpandIcon size={16} /></PnBtn>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem description */}
        <div ref={leftRef} className="w-1/2 min-w-[320px] flex flex-col overflow-hidden border-r border-[var(--border)]">
          {/* Tabs */}
          <div className="flex border-b border-[var(--border)]">
            {([['desc', 'Description', <DocIcon key="d" size={14} />], ['editorial', 'Editorial', <ListTabIcon key="e" />], ['solutions', 'Solutions', <CodeIcon key="s" size={14} />], ['submissions', 'Submissions', <TerminalIcon key="t" size={14} />]] as const).map(([k, l, ic]) => (
              <button key={k} className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-all relative flex items-center gap-1.5 ${pTab === k ? 'text-[var(--tx)]' : 'text-[var(--tx-2)] hover:text-[var(--tx-1)]'}`} onClick={() => setPTab(k)}>
                {ic} {l}
                {pTab === k && <span className="absolute bottom-[-1px] left-4 right-4 h-0.5 bg-[var(--tx)] rounded-t-sm" />}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {pTab === 'desc' && <DescriptionTab />}
            {pTab === 'solutions' && <SolutionsTab />}
            {pTab === 'editorial' && <div className="py-4 text-center text-[var(--tx-2)]">Editorial content — demo only</div>}
            {pTab === 'submissions' && <SubmissionsTab />}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-[var(--border)] text-[13px] text-[var(--tx-2)]">
            <button className="flex items-center gap-1 hover:text-[var(--tx)] transition-colors"><ThumbUpIcon size={16} /> <span className="font-semibold">69.7K</span></button>
            <button className="flex items-center gap-1 hover:text-[var(--tx)] transition-colors"><ThumbDownIcon size={16} /></button>
            <button className="flex items-center gap-1 hover:text-[var(--tx)] transition-colors"><CommentIcon size={16} /> <span className="font-semibold">2.1K</span></button>
            <button className="hover:text-[var(--tx)] transition-colors" onClick={() => toast('Bookmarked!', 'success')}><StarIcon size={16} /></button>
            <button className="hover:text-[var(--tx)] transition-colors" onClick={() => toast('Link copied!', 'success')}><ShareIcon size={16} /></button>
            <button className="hover:text-[var(--tx)] transition-colors"><InfoIcon size={16} /></button>
            <span className="ml-auto text-xs text-[var(--solved)]">● 1005 Online</span>
          </div>
        </div>

        {/* Divider */}
        <div ref={divRef} className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-[var(--blue)] transition-colors" />

        {/* Right: Code editor */}
        <div ref={rightRef} className="flex-1 flex flex-col overflow-hidden bg-[var(--bg)]">
          {/* Editor header */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold"><CodeIcon size={16} className="text-[var(--solved)]" /> Code</span>
            <select className="px-2 py-1 rounded-[var(--r)] bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--tx)] text-xs cursor-pointer" value={lang} onChange={(e) => setLang(e.target.value)}>
              {Object.entries(LANG_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <span className="text-xs text-[var(--tx-2)] flex items-center gap-1 ml-1"><LockIcon size={12} /> Auto</span>
            <div className="ml-auto flex gap-0.5">
              <EdBtn><MenuIcon size={14} /></EdBtn>
              <EdBtn><BookmarkIcon size={14} /></EdBtn>
              <EdBtn><UndoIcon size={14} /></EdBtn>
              <EdBtn><ExpandIcon size={14} /></EdBtn>
            </div>
          </div>

          {/* Editor area */}
          <div className="flex-1 flex overflow-hidden relative bg-[#0a0a0c]">
            <div ref={lnRef} className="py-3 text-[var(--tx-3)] font-[var(--font-mono)] text-[13px] leading-[1.65] text-right select-none overflow-hidden min-w-[44px] shrink-0 border-r border-[var(--border)] [&>span]:block [&>span]:px-2 [&>span]:pl-1">
              {Array.from({ length: lines }, (_, i) => <span key={i}>{i + 1}</span>)}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <pre ref={hlRef} className="absolute inset-0 p-3 font-[var(--font-mono)] text-[13px] leading-[1.65] whitespace-pre overflow-auto m-0 pointer-events-none text-[var(--tx)]" dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
              <textarea ref={taRef} className="relative z-[2] block w-full h-full p-3 font-[var(--font-mono)] text-[13px] leading-[1.65] bg-transparent text-transparent caret-[var(--tx)] resize-none whitespace-pre overflow-auto [tab-size:4] selection:bg-[rgba(94,106,210,0.25)]" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} onScroll={handleScroll} onKeyDown={handleTab} />
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1 border-t border-[var(--border)] text-xs text-[var(--tx-2)] bg-[rgba(255,255,255,0.02)]">
            <span>Restored from local</span>
            <span>Ln 1, Col 1</span>
          </div>

          {/* Console */}
          <div className="border-t border-[var(--border)] shrink-0">
            <div className="flex bg-[rgba(255,255,255,0.02)] px-2 border-b border-[var(--border)]">
              {([['tc', 'Testcase', <TestcaseIcon key="tc" size={14} />], ['result', 'Test Result', <TerminalIcon key="tr" size={14} />]] as const).map(([k, l, ic]) => (
                <button key={k} className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors relative flex items-center gap-1.5 ${cTab === k ? 'text-[var(--tx)]' : 'text-[var(--tx-2)] hover:text-[var(--tx-1)]'}`} onClick={() => setCTab(k)}>
                  {ic} {l}
                  {cTab === k && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--tx)] rounded-t-sm" />}
                </button>
              ))}
            </div>
            <div className="p-3 bg-[#0a0a0c] font-[var(--font-mono)] text-xs text-[var(--tx-2)] min-h-[70px] max-h-[140px] overflow-y-auto">
              {cTab === 'tc' ? (
                <>
                  <div className="text-[var(--tx-3)] text-[11px] mb-0.5 uppercase tracking-wider">nums =</div>
                  <div className="text-[var(--tx)] mb-2">[2, 7, 11, 15]</div>
                  <div className="text-[var(--tx-3)] text-[11px] mb-0.5 uppercase tracking-wider">target =</div>
                  <div className="text-[var(--tx)]">9</div>
                </>
              ) : consoleOutput === 'running' ? (
                <div className="text-[var(--tx-2)]">Running...</div>
              ) : consoleOutput === 'passed' ? (
                <>
                  <div className="text-[var(--solved)] font-semibold mb-2">✓ All test cases passed</div>
                  <div className="text-[var(--tx-3)] text-[11px] mb-0.5 uppercase tracking-wider">Input</div>
                  <div className="text-[var(--tx-1)] mb-2">nums = [2, 7, 11, 15], target = 9</div>
                  <div className="text-[var(--tx-3)] text-[11px] mb-0.5 uppercase tracking-wider">Output</div>
                  <div className="text-[var(--tx)] mb-2">[0, 1]</div>
                  <div className="text-[var(--tx-3)] text-[11px] mb-0.5 uppercase tracking-wider">Expected</div>
                  <div className="text-[var(--tx)]">[0, 1]</div>
                </>
              ) : (
                <div className="text-center py-3 text-[var(--tx-3)]">You must run your code first</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListTabIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={14} height={14}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}

function PnBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button className="w-8 h-8 rounded-[var(--r)] flex items-center justify-center text-[var(--tx-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all" onClick={onClick}>{children}</button>;
}

function EdBtn({ children }: { children: React.ReactNode }) {
  return <button className="w-7 h-7 rounded-[var(--r)] flex items-center justify-center text-[var(--tx-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--tx)] transition-all">{children}</button>;
}

function DescriptionTab() {
  return (
    <>
      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">1. Two Sum</h2>
        <span className="text-[var(--solved)] text-[13px] font-medium flex items-center gap-1"><CheckIcon size={14} /> Solved</span>
      </div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium text-[var(--easy)] bg-[var(--easy-bg)]">Easy</span>
        <span className="px-2.5 py-1 rounded-full text-xs bg-[var(--bg-hover)] text-[var(--tx-2)]">🏷 Topics</span>
        <span className="px-2.5 py-1 rounded-full text-xs bg-[var(--bg-hover)] text-[var(--tx-2)]">🏢 Companies</span>
        <span className="px-2.5 py-1 rounded-full text-xs bg-[var(--bg-hover)] text-[var(--tx-2)]">💡 Hint</span>
      </div>
      <div className="text-sm text-[var(--tx-1)] leading-[1.8]">
        <p className="mb-3">You are given an array of integers <code className="bg-[rgba(255,255,255,0.06)] px-1.5 py-px rounded-[var(--r)] font-[var(--font-mono)] text-xs text-[var(--tx)]">nums</code> and an integer <code className="bg-[rgba(255,255,255,0.06)] px-1.5 py-px rounded-[var(--r)] font-[var(--font-mono)] text-xs text-[var(--tx)]">target</code>, return <em>indices of the two numbers such that they add up to <code className="bg-[rgba(255,255,255,0.06)] px-1.5 py-px rounded-[var(--r)] font-[var(--font-mono)] text-xs text-[var(--tx)]">target</code></em>.</p>
        <p className="mb-3">You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p>
        <p className="mb-3">You can return the answer in any order.</p>

        {[
          { n: 1, input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
          { n: 2, input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
          { n: 3, input: 'nums = [3,3], target = 6', output: '[0,1]' },
        ].map((ex) => (
          <div key={ex.n} className="bg-[rgba(255,255,255,0.03)] rounded-[var(--r-md)] px-4 py-3.5 my-2 font-[var(--font-mono)] text-[13px] leading-[1.8] text-[var(--tx-1)]">
            <strong className="block mb-1 font-[var(--font-sans)] text-sm font-semibold text-[var(--tx)]">Example {ex.n}:</strong>
            <strong className="text-[13px] font-[var(--font-mono)] text-[var(--tx)]">Input:</strong> {ex.input}<br />
            <strong className="text-[13px] font-[var(--font-mono)] text-[var(--tx)]">Output:</strong> {ex.output}
            {ex.explanation && <><br /><strong className="text-[13px] font-[var(--font-mono)] text-[var(--tx)]">Explanation:</strong> {ex.explanation}</>}
          </div>
        ))}

        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-1.5">Constraints:</h4>
          <ul className="pl-5 list-disc">
            {['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', '-10⁹ ≤ target ≤ 10⁹', 'Only one valid answer exists.'].map((c) => (
              <li key={c} className="text-[13px] text-[var(--tx-1)] mb-0.5 font-[var(--font-mono)] leading-relaxed">{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function SolutionsTab() {
  return (
    <div className="py-1">
      <h3 className="text-sm mb-3">Community Solutions</h3>
      {[
        { t: 'Hash Map — O(n) Time, O(n) Space', u: '@algorithmist', l: 'Python 3', v: '2.4k', up: 342 },
        { t: 'Brute Force vs Optimized — Walkthrough', u: '@codemaster', l: 'Java', v: '1.8k', up: 218 },
        { t: 'Two-pass Hash Table with Edge Cases', u: '@devpro', l: 'C++', v: '956', up: 147 },
      ].map((s) => (
        <div key={s.t} className="p-3 border border-[var(--border)] rounded-[var(--r-md)] mb-2 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
          <div className="font-semibold mb-1 text-[13px]">{s.t}</div>
          <div className="flex justify-between text-xs text-[var(--tx-2)]">
            <span>{s.u} · {s.l} · {s.v} views</span>
            <span className="text-[var(--solved)]">▲ {s.up}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubmissionsTab() {
  return (
    <div className="py-1">
      <h3 className="text-sm mb-3">Your Submissions</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Result', 'Language', 'Runtime', 'Submitted'].map((h) => (
              <th key={h} className="text-left px-3 py-2 text-xs font-medium text-[var(--tx-2)] border-b border-[var(--border)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { r: 'Accepted', c: 'var(--solved)', l: 'Java', rt: '3 ms', t: '2 hours ago' },
            { r: 'Wrong Answer', c: 'var(--hard)', l: 'Java', rt: '—', t: '3 hours ago' },
            { r: 'Wrong Answer', c: 'var(--hard)', l: 'Java', rt: '—', t: '3 hours ago' },
          ].map((s, i) => (
            <tr key={i}>
              <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px] font-medium" style={{ color: `${s.c}` }}>{s.r}</td>
              <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px] text-[var(--tx-1)]">{s.l}</td>
              <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px] text-[var(--tx-1)]">{s.rt}</td>
              <td className="px-3 py-2 border-b border-[rgba(255,255,255,0.03)] text-[13px] text-[var(--tx-2)]">{s.t}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
