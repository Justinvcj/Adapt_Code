"use client";
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Menu, ChevronLeft, ChevronRight, Shuffle, Play, Check, FileText, Code2, Terminal,
  List, ThumbsUp, ThumbsDown, MessageSquare, Star, Share2, Info, Bookmark, Undo,
  Maximize2, Settings, Grid3x3, Lock, ClipboardCheck, FileCode, Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CODE, LANG_NAMES } from '@/components/adapt/data';
import HintsPanel from '@/components/adapt/HintsPanel';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const MONACO_LANG: Record<string, string> = {
  java: 'java', python: 'python', javascript: 'javascript', cpp: 'cpp',
};

export default function ProblemPage() {
  const params = useParams<{ id: string }>();
  const slug = params?.id || '';
  const [pTab, setPTab] = useState<'desc' | 'hints' | 'editorial' | 'solutions' | 'submissions'>('desc');
  useEffect(() => {
    const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (['desc', 'hints', 'editorial', 'solutions', 'submissions'].includes(h)) {
      setPTab(h as typeof pTab);
    }
  }, []);
  const [cTab, setCTab] = useState<'tc' | 'result'>('tc');
  const [lang, setLang] = useState<string>('java');
  const [code, setCode] = useState<string>(CODE.java);
  const [attemptCount, setAttemptCount] = useState(1);
  const [compileErrors, setCompileErrors] = useState(0);
  const [timeOnTask, setTimeOnTask] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTimeOnTask((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const [leftW, setLeftW] = useState(50);
  const [conBody, setConBody] = useState<React.ReactNode>(
    <>
      <div className="cl">nums =</div>
      <div className="cv" style={{ color: 'var(--tx)' }}>[2, 7, 11, 15]</div>
      <div className="cl">target =</div>
      <div className="cv" style={{ color: 'var(--tx)' }}>9</div>
    </>
  );
  const dragRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCode(CODE[lang] || ''); }, [lang]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const b = containerRef.current.getBoundingClientRect();
      const p = ((e.clientX - b.left) / b.width) * 100;
      setLeftW(Math.max(25, Math.min(75, p)));
    };
    const up = () => { dragRef.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  if (slug !== 'two-sum') {
    return (
      <>
        <div className="prob-nav">
          <Link href="/" className="logo" style={{ marginRight: 4 }}>&lt;/&gt;</Link>
          <Link className="pn-item" href="/problems"><Menu /> Problem List</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--nav-h))', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 16 }}>Problem Not Available</h2>
          <p style={{ color: 'var(--tx-2)', fontSize: 13 }}>Only Two Sum is loaded in this demo.</p>
          <Link className="btn btn-outline" href="/problems"><ChevronLeft /> Back to Problems</Link>
        </div>
      </>
    );
  }

  const runCode = () => {
    setAttemptCount((n) => n + 1);
    setCTab('result');
    setConBody(<div style={{ color: 'var(--tx-2)' }}>Running...</div>);
    setTimeout(() => {
      setConBody(
        <>
          <div style={{ color: 'var(--solved)', fontWeight: 600, marginBottom: 8 }}>✓ All test cases passed</div>
          <div className="cl">Input</div><div className="cv">nums = [2, 7, 11, 15], target = 9</div>
          <div className="cl">Output</div><div className="cv" style={{ color: 'var(--tx)' }}>[0, 1]</div>
          <div className="cl">Expected</div><div className="cv" style={{ color: 'var(--tx)' }}>[0, 1]</div>
        </>
      );
      toast.success('All test cases passed');
    }, 800);
  };

  const submitCode = () => {
    toast('Submitting...');
    setTimeout(() => toast.success('Accepted — 3ms runtime, beats 94.7%'), 1400);
  };

  return (
    <>
      <div className="prob-nav">
        <Link href="/" className="logo" style={{ marginRight: 4 }}>&lt;/&gt;</Link>
        <Link className="pn-item" href="/problems"><Menu /> Problem List</Link>
        <button className="pn-item" onClick={() => toast('Previous problem — demo')}><ChevronLeft /></button>
        <button className="pn-item" onClick={() => toast('Next problem — demo')}><ChevronRight /></button>
        <button className="pn-item" onClick={() => toast('Random — demo')}><Shuffle /></button>
        <div className="pn-right">
          <button className="pn-run" onClick={runCode}><Play size={12} /> Run</button>
          <button className="pn-submit" onClick={submitCode}><ClipboardCheck /> Submit</button>
          <button className="pn-icon" onClick={() => toast.success('Copied — demo')} title="Copy"><FileText /></button>
          <button className="pn-icon" title="AI Assistant" onClick={() => toast('AI Assistant — demo')}>✨</button>
          <span className="pn-sep" />
          <button className="pn-icon" title="Layout"><Grid3x3 /></button>
          <button className="pn-icon" title="Settings"><Settings /></button>
          <button className="pn-icon" title="Like" style={{ display: 'flex', gap: 4, width: 'auto', padding: '0 8px' }}><ThumbsUp /><span style={{ fontSize: 12 }}>0</span></button>
          <span className="pn-sep" />
          <button className="pn-icon" title="Fullscreen"><Maximize2 /></button>
        </div>
      </div>
      <div className="prob" ref={containerRef}>
        <div className="prob-l" style={{ width: `${leftW}%` }}>
          <div className="tabs">
            {([
              ['desc',        'Description',  FileText],
              ['hints',       'Hints',        Lightbulb],
              ['editorial',   'Editorial',    List],
              ['solutions',   'Solutions',    Code2],
              ['submissions', 'Submissions',  Terminal],
            ] as const).map(([k, l, Ic]) => (
              <span key={k} className={`tab ${pTab === k ? 'act' : ''}`} onClick={() => setPTab(k)}><Ic /> {l}</span>
            ))}
          </div>
          <div className="prob-l-body">
            {pTab === 'desc' && (
              <>
                <div className="p-title">
                  <h2>1. Two Sum</h2>
                  <span className="p-solved-tag"><Check size={14} /> Solved</span>
                </div>
                <div className="p-tags">
                  <span className="p-tag diff-e">Easy</span>
                  <span className="p-tag">🏷 Topics</span>
                  <span className="p-tag">🏢 Companies</span>
                  <span className="p-tag">💡 Hint</span>
                </div>
                <div className="p-desc">
                  <p>You are given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
                  <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p>
                  <p>You can return the answer in any order.</p>
                  <div className="p-ex">
                    <strong>Example 1:</strong>
                    {'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].'}
                  </div>
                  <div className="p-ex">
                    <strong>Example 2:</strong>
                    {'Input: nums = [3,2,4], target = 6\nOutput: [1,2]'}
                  </div>
                  <div className="p-ex">
                    <strong>Example 3:</strong>
                    {'Input: nums = [3,3], target = 6\nOutput: [0,1]'}
                  </div>
                  <div className="p-constraints">
                    <h4>Constraints:</h4>
                    <ul>
                      <li>2 ≤ nums.length ≤ 10<sup>4</sup></li>
                      <li>-10<sup>9</sup> ≤ nums[i] ≤ 10<sup>9</sup></li>
                      <li>-10<sup>9</sup> ≤ target ≤ 10<sup>9</sup></li>
                      <li>Only one valid answer exists.</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
            {pTab === 'hints' && (
              <HintsPanel
                problemId="two-sum"
                ctx={{
                  attempt_count:        attemptCount,
                  compile_errors:       compileErrors,
                  time_on_task_seconds: timeOnTask,
                  difficulty:           'Easy',
                }}
              />
            )}
            {pTab === 'solutions' && (
              <div style={{ padding: '4px 0' }}>
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Community Solutions</h3>
                {[
                  { t: 'Hash Map — O(n) Time, O(n) Space', u: '@algorithmist', l: 'Python 3', v: '2.4k', up: 342 },
                  { t: 'Brute Force vs Optimized — Walkthrough', u: '@codemaster', l: 'Java', v: '1.8k', up: 218 },
                  { t: 'Two-pass Hash Table with Edge Cases', u: '@devpro', l: 'C++', v: '956', up: 147 },
                ].map((s) => (
                  <div key={s.t} onClick={() => toast('Solution detail — demo')}
                    style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{s.t}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--tx-2)' }}>
                      <span>{s.u} · {s.l} · {s.v} views</span>
                      <span style={{ color: 'var(--solved)' }}>▲ {s.up}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pTab === 'editorial' && (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--tx-2)' }}>Editorial content — demo only</div>
            )}
            {pTab === 'submissions' && (
              <div style={{ padding: '4px 0' }}>
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Your Submissions</h3>
                <table className="tbl">
                  <thead><tr><th>Result</th><th>Language</th><th>Runtime</th><th>Submitted</th></tr></thead>
                  <tbody>
                    <tr><td style={{ color: 'var(--solved)', fontWeight: 500 }}>Accepted</td><td>Java</td><td>3 ms</td><td style={{ color: 'var(--tx-2)' }}>2 hours ago</td></tr>
                    <tr><td style={{ color: 'var(--hard)', fontWeight: 500 }}>Wrong Answer</td><td>Java</td><td>—</td><td style={{ color: 'var(--tx-2)' }}>3 hours ago</td></tr>
                    <tr><td style={{ color: 'var(--hard)', fontWeight: 500 }}>Wrong Answer</td><td>Java</td><td>—</td><td style={{ color: 'var(--tx-2)' }}>3 hours ago</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="p-bottom">
            <button><ThumbsUp /> <span className="count">69.7K</span></button>
            <button><ThumbsDown /></button>
            <button><MessageSquare /> <span className="count">2.1K</span></button>
            <button onClick={() => toast.success('Bookmarked!')}><Star /></button>
            <button onClick={() => toast.success('Link copied!')}><Share2 /></button>
            <button><Info /></button>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--solved)' }}>● 1005 Online</span>
          </div>
        </div>
        <div
          className="prob-div"
          onMouseDown={(e) => { dragRef.current = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); }}
        />
        <div className="prob-r" style={{ flex: 'none', width: `${100 - leftW - 0.3}%` }}>
          <div className="ed-head">
            <span className="ed-label"><FileCode /> Code</span>
            <select className="lang-sel" value={lang} onChange={(e) => setLang(e.target.value)}>
              {Object.keys(CODE).map((k) => <option key={k} value={k}>{LANG_NAMES[k]}</option>)}
            </select>
            <span className="ed-auto"><Lock /> Auto</span>
            <div className="ed-icons">
              <button className="ed-icon" title="Format" onClick={() => toast('Format — demo')}><Menu /></button>
              <button className="ed-icon" title="Bookmark" onClick={() => toast('Bookmark — demo')}><Bookmark /></button>
              <button className="ed-icon" title="Reset" onClick={() => setCode(CODE[lang])}><Undo /></button>
              <button className="ed-icon" title="Fullscreen"><Maximize2 /></button>
            </div>
          </div>
          <div className="ed-area">
            <MonacoEditor
              height="100%"
              theme="vs-dark"
              language={MONACO_LANG[lang]}
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                padding: { top: 12 },
              }}
            />
          </div>
          <div className="ed-status"><span>Restored from local</span><span>Ln 1, Col 1</span></div>
          <div className="console">
            <div className="con-tabs">
              {([['tc', 'Testcase', ClipboardCheck], ['result', 'Test Result', Terminal]] as const).map(([k, l, Ic]) => (
                <span key={k} className={`con-tab ${cTab === k ? 'act' : ''}`} onClick={() => setCTab(k)}><Ic /> {l}</span>
              ))}
            </div>
            <div className="con-body">
              {cTab === 'tc' ? (
                <>
                  <div className="cl">nums =</div>
                  <div className="cv" style={{ color: 'var(--tx)' }}>[2, 7, 11, 15]</div>
                  <div className="cl">target =</div>
                  <div className="cv" style={{ color: 'var(--tx)' }}>9</div>
                </>
              ) : conBody}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
