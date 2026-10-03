"use client";
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Menu, ChevronLeft, ChevronRight, Shuffle, Play, Check, FileText, Code2, Terminal,
  List, ThumbsUp, ThumbsDown, MessageSquare, Star, Share2, Info, Bookmark, Undo,
  Maximize2, Settings, Grid3x3, Lock, ClipboardCheck, FileCode, Lightbulb,
  KeyRound, Timer, Sparkles, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CODE, LANG_NAMES } from '@/components/adapt/data';
import HintsPanel from '@/components/adapt/HintsPanel';
import ExplanationPanel, { type Submission } from '@/components/adapt/ExplanationPanel';
import SubmissionsList from '@/components/adapt/SubmissionsList';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const MONACO_LANG: Record<string, string> = {
  java: 'java', python: 'python', javascript: 'javascript', cpp: 'cpp',
};

export default function ProblemPage() {
  const params = useParams<{ id: string }>();
  const slug = params?.id || '';
  const [pTab, setPTab] = useState<'desc' | 'hints' | 'explanation' | 'solutions' | 'submissions'>('desc');
  useEffect(() => {
    const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (['desc', 'hints', 'explanation', 'solutions', 'submissions'].includes(h)) {
      setPTab(h as typeof pTab);
    }
  }, []);
  const [cTab, setCTab] = useState<'tc' | 'result'>('tc');
  const [lang, setLang] = useState<string>('java');
  const [code, setCode] = useState<string>(CODE.java);
  const [attemptCount, setAttemptCount] = useState(1);
  const [compileErrors, setCompileErrors] = useState(0);
  const [timeOnTask, setTimeOnTask] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState<('nudge'|'scaffold'|'near_solution')[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const latest = submissions[0];
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
    toast('Submitting…');
    setTimeout(() => {
      // 70% accepted on first try after at least 2 runs, otherwise simulate failure path
      const willPass = attemptCount >= 2 && Math.random() > 0.3;
      const runtime  = Math.floor(2 + Math.random() * 8);
      const mult     = hintsRevealed.includes('near_solution') ? 0.4
                     : hintsRevealed.includes('scaffold')      ? 0.7
                     : hintsRevealed.includes('nudge')         ? 0.9
                     : 1.0;
      const sub: Submission = {
        id:       `${Date.now()}`,
        at:       Date.now(),
        verdict:  willPass ? 'Accepted' : 'Wrong Answer',
        runtime_ms: willPass ? runtime : null,
        language: LANG_NAMES[lang] ?? lang,
        hints:    [...hintsRevealed],
        mastery_delta: willPass ? 0.08 * mult : 0,
      };
      setSubmissions((prev) => [sub, ...prev]);
      if (willPass) {
        toast.success(`Accepted · ${runtime} ms`);
        setPTab('explanation');
      } else {
        toast.error('Wrong answer — tap Explanation');
        setPTab('explanation');
      }
    }, 1200);
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
              ['desc',         'Description',   FileText],
              ['hints',        'Hints',         Lightbulb],
              ['explanation',  'Explanation',   Sparkles],
              ['solutions',    'Solutions',     Code2],
              ['submissions',  'Submissions',   Terminal],
            ] as const).map(([k, l, Ic]) => (
              <span
                key={k}
                className={`tab ${pTab === k ? 'act' : ''} ${k === 'explanation' && latest ? 'tab-dot' : ''}`}
                onClick={() => setPTab(k)}
              >
                <Ic /> {l}
                {k === 'submissions' && submissions.length > 0 && <span className="tab-count">{submissions.length}</span>}
              </span>
            ))}
          </div>
          <div className="prob-l-body">
            {pTab === 'desc' && (
              <>
                <div className="p-title">
                  <h2>Pair sum lookup</h2>
                </div>
                <div className="p-tags">
                  <span className="p-tag diff-e">Easy</span>
                  <Link href="/mastery/hashing" className="p-tag concept"><KeyRound size={11} /> Hashing · teaches</Link>
                  <span className="p-tag">⏱ ~ 8 min</span>
                </div>
                <div className="p-desc">
                  <p><strong>The task.</strong> Walk an array of whole numbers and find the two positions whose values add up to a given <code>target</code>. Return those two positions.</p>
                  <p><strong>What&apos;s promised.</strong> There is always exactly one valid pair in the input. You can&apos;t use the same position twice.</p>
                  <p><strong>Order of your answer.</strong> Either index order works — the grader accepts <code>[i, j]</code> and <code>[j, i]</code> as the same answer.</p>
                  <div className="p-ex">
                    <strong>Walkthrough 1</strong>
                    {'nums   = [2, 7, 11, 15]\ntarget = 9\n→ positions [0, 1]  because 2 + 7 = 9'}
                  </div>
                  <div className="p-ex">
                    <strong>Walkthrough 2</strong>
                    {'nums   = [3, 2, 4]\ntarget = 6\n→ positions [1, 2]  because 2 + 4 = 6'}
                  </div>
                  <div className="p-ex">
                    <strong>Walkthrough 3 — same value twice</strong>
                    {'nums   = [3, 3]\ntarget = 6\n→ positions [0, 1]  (the two 3s are at different positions, so this is allowed)'}
                  </div>
                  <div className="p-constraints">
                    <h4>Limits</h4>
                    <ul>
                      <li>2 to 10 000 values in <code>nums</code></li>
                      <li>Each value fits in a signed 32-bit integer</li>
                      <li><code>target</code> fits in a signed 32-bit integer</li>
                      <li>A valid pair is guaranteed; one, and only one, exists</li>
                    </ul>
                  </div>
                  <div className="p-teachbox">
                    <div className="p-teachbox-head"><Lightbulb size={13} /> Why this problem is here</div>
                    <p>The brute-force answer is a double loop, which runs in O(n²). The point of this problem is to notice that you can replace the inner loop with a hash-map lookup — turning the whole thing into one pass over the array. That trade (space for time, with a map) is the floor of the Hashing concept.</p>
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
                onRevealedChange={setHintsRevealed}
              />
            )}
            {pTab === 'explanation' && (
              <ExplanationPanel
                latest={latest}
                onGoToHints={() => setPTab('hints')}
                hintsRevealed={hintsRevealed}
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
            {pTab === 'submissions' && (
              <SubmissionsList submissions={submissions} />
            )}
          </div>
          <div className="p-bottom">
            <span className="p-session-stat"><Timer size={13} /> This session · <b>{Math.floor(timeOnTask / 60)}m {timeOnTask % 60}s</b></span>
            <span className="p-session-stat">Attempt <b>{attemptCount}</b></span>
            <span className="p-session-stat">Compile errors <b>{compileErrors}</b></span>
            <button className="p-bottom-action" onClick={() => toast.success('Bookmarked')} title="Save for later"><Star size={14} /></button>
            <button className="p-bottom-action" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied'); }} title="Copy link"><Share2 size={14} /></button>
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
