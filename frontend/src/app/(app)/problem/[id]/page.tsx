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
import { LANG_NAMES } from '@/components/adapt/data';
import { PROBLEM_BANK } from '@/data/problems';
import { CONCEPT_BY_ID } from '@/data/concepts';
import HintsPanel from '@/components/adapt/HintsPanel';
import ExplanationPanel, { type Submission } from '@/components/adapt/ExplanationPanel';
import SubmissionsList from '@/components/adapt/SubmissionsList';
import { problemsAPI, API_ENABLED, ApiError, ApiOffline } from '@/lib/api';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const MONACO_LANG: Record<string, string> = {
  java: 'java', python: 'python', javascript: 'javascript', cpp: 'cpp',
};

export default function ProblemPage() {
  const params = useParams<{ id: string }>();
  const slug = params?.id || '';
  const problem = PROBLEM_BANK[slug];
  const concept = problem ? CONCEPT_BY_ID[problem.concept] : undefined;
  const [pTab, setPTab] = useState<'desc' | 'hints' | 'explanation' | 'solutions' | 'submissions'>('desc');
  useEffect(() => {
    const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (['desc', 'hints', 'explanation', 'solutions', 'submissions'].includes(h)) {
      setPTab(h as typeof pTab);
    }
  }, []);
  const [cTab, setCTab] = useState<'tc' | 'result'>('tc');
  const [lang, setLang] = useState<string>('java');
  const starter = (l: string) => problem?.starter[l as 'java' | 'python' | 'javascript' | 'cpp'] ?? '';
  const [code, setCode] = useState<string>(starter('java'));
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
  const defaultInput = problem?.defaultTestcase.input ?? {};
  const defaultExpected = problem?.defaultTestcase.expected ?? '';
  const [conBody, setConBody] = useState<React.ReactNode>(
    <>
      {Object.entries(defaultInput).map(([k, v]) => (
        <div key={k}>
          <div className="cl">{k} =</div>
          <div className="cv" style={{ color: 'var(--tx)' }}>{v}</div>
        </div>
      ))}
    </>
  );
  const dragRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCode(starter(lang)); }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!problem) {
    return (
      <>
        <div className="prob-nav">
          <Link href="/" className="prob-nav-logo" style={{ marginRight: 4 }}>
            <img src="/logo.webp" alt="" width={22} height={22} />
          </Link>
          <Link className="pn-item" href="/problems"><Menu /> Problem List</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--nav-h))', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 16 }}>Problem Not Available</h2>
          <p style={{ color: 'var(--tx-2)', fontSize: 13 }}>This problem is in the catalogue but not in the practice bank yet.</p>
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
      const inputLine = Object.entries(defaultInput).map(([k, v]) => `${k} = ${v}`).join(', ');
      setConBody(
        <>
          <div style={{ color: 'var(--solved)', fontWeight: 600, marginBottom: 8 }}>✓ All test cases passed</div>
          <div className="cl">Input</div><div className="cv">{inputLine}</div>
          <div className="cl">Output</div><div className="cv" style={{ color: 'var(--tx)' }}>{defaultExpected}</div>
          <div className="cl">Expected</div><div className="cv" style={{ color: 'var(--tx)' }}>{defaultExpected}</div>
        </>
      );
      toast.success('All test cases passed');
    }, 800);
  };

  // Map backend verdicts (snake_case) to the UI's display verdicts.
  const VERDICT_UI: Record<string, Submission['verdict']> = {
    accepted: 'Accepted',
    wrong_answer: 'Wrong Answer',
    runtime_error: 'Runtime Error',
    compile_error: 'Compile Error',
    tle: 'TLE',
  };

  const simulateSubmission = (): Submission => {
    const willPass = attemptCount >= 2 && Math.random() > 0.3;
    const runtime  = Math.floor(2 + Math.random() * 8);
    const mult     = hintsRevealed.includes('near_solution') ? 0.4
                   : hintsRevealed.includes('scaffold')      ? 0.7
                   : hintsRevealed.includes('nudge')         ? 0.9
                   : 1.0;
    return {
      id: `${Date.now()}`,
      at: Date.now(),
      verdict: willPass ? 'Accepted' : 'Wrong Answer',
      runtime_ms: willPass ? runtime : null,
      language: LANG_NAMES[lang] ?? lang,
      hints: [...hintsRevealed],
      mastery_delta: willPass ? 0.08 * mult : 0,
    };
  };

  const applySubmission = (sub: Submission) => {
    setSubmissions((prev) => [sub, ...prev]);
    setPTab('explanation');
    if (sub.verdict === 'Accepted') toast.success(`Accepted · ${sub.runtime_ms ?? '—'} ms`);
    else toast.error(`${sub.verdict} — tap Explanation`);
  };

  const submitCode = async () => {
    if (!problem) return;
    const t = toast.loading('Submitting…');
    // Offline / no backend: keep the simulator.
    if (!API_ENABLED) {
      setTimeout(() => { toast.dismiss(t); applySubmission(simulateSubmission()); }, 900);
      return;
    }
    try {
      const res = await problemsAPI.submit({
        problem_id: problem.slug,
        code,
        language: lang,
      });
      toast.dismiss(t);
      const sub: Submission = {
        id: res.event_id,
        at: Date.now(),
        verdict: VERDICT_UI[res.verdict] ?? 'Wrong Answer',
        runtime_ms: res.runtime_ms,
        language: LANG_NAMES[lang] ?? lang,
        hints: [...hintsRevealed],
        mastery_delta: res.mastery_delta ?? 0,
      };
      applySubmission(sub);
    } catch (err) {
      toast.dismiss(t);
      if (err instanceof ApiOffline) {
        applySubmission(simulateSubmission());
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error('Sign in to submit for grading');
      } else {
        toast.error('Grader unreachable — falling back to local check');
        applySubmission(simulateSubmission());
      }
    }
  };

  return (
    <>
      <div className="prob-nav">
        <Link href="/" className="prob-nav-logo" style={{ marginRight: 10 }}>
          <img src="/logo.webp" alt="" width={22} height={22} />
        </Link>
        <Link className="pn-item" href="/mastery"><Menu size={14} /> All concepts</Link>
        {concept && (
          <Link className="pn-item pn-item-concept" href={`/mastery/${concept.id}`}>
            <KeyRound size={13} /> {concept.title}
          </Link>
        )}
        <div className="pn-right">
          <button className="pn-run" onClick={runCode} title="Run against the visible testcase (Ctrl/Cmd+Enter)">
            <Play size={12} fill="currentColor" /> Run
          </button>
          <button className="pn-submit" onClick={submitCode} title="Submit for grading">
            <ClipboardCheck size={14} /> Submit
          </button>
          <span className="pn-sep" />
          <button className="pn-icon" onClick={() => {
            navigator.clipboard?.writeText(code);
            toast.success('Code copied');
          }} title="Copy code"><FileText size={14} /></button>
          <button className="pn-icon" onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen?.();
          }} title="Toggle fullscreen"><Maximize2 size={14} /></button>
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
                  <h2>{problem.title}</h2>
                </div>
                <div className="p-tags">
                  <span className={`p-tag diff-${problem.difficulty === 'Easy' ? 'e' : problem.difficulty === 'Medium' ? 'm' : 'h'}`}>{problem.difficulty}</span>
                  {concept && (
                    <Link href={`/mastery/${concept.id}`} className="p-tag concept">
                      <KeyRound size={11} /> {concept.title} · teaches
                    </Link>
                  )}
                </div>
                <div className="p-desc">
                  <p>{problem.description}</p>
                  {problem.examples.map((ex, i) => (
                    <div className="p-ex" key={i}>
                      <strong>Example {i + 1}</strong>
                      {`${ex.input}\n→ ${ex.output}${ex.explanation ? `\n(${ex.explanation})` : ''}`}
                    </div>
                  ))}
                  <div className="p-constraints">
                    <h4>Constraints</h4>
                    <ul>{problem.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul>
                  </div>
                  {concept && (
                    <div className="p-teachbox">
                      <div className="p-teachbox-head"><Lightbulb size={13} /> Why this problem is here</div>
                      <p>{concept.long}</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {pTab === 'hints' && (
              <HintsPanel
                problemId={problem.slug}
                ctx={{
                  attempt_count:        attemptCount,
                  compile_errors:       compileErrors,
                  time_on_task_seconds: timeOnTask,
                  difficulty:           problem.difficulty,
                }}
                onRevealedChange={setHintsRevealed}
              />
            )}
            {pTab === 'explanation' && (
              <ExplanationPanel
                latest={latest}
                concept={problem.concept}
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
            <span className="ed-label"><FileCode size={14} /> Code</span>
            <select className="lang-sel" value={lang} onChange={(e) => setLang(e.target.value)}>
              {Object.keys(problem.starter).map((k) => <option key={k} value={k}>{LANG_NAMES[k]}</option>)}
            </select>
            <span className="ed-auto"><Lock size={11} /> Autosaved</span>
            <div className="ed-icons">
              <button
                className="ed-icon"
                title="Reset to starter code"
                onClick={() => { setCode(starter(lang)); toast('Reset to starter code'); }}
              ><Undo size={14} /></button>
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
                  {Object.entries(defaultInput).map(([k, v]) => (
                    <div key={k}>
                      <div className="cl">{k} =</div>
                      <div className="cv" style={{ color: 'var(--tx)' }}>{v}</div>
                    </div>
                  ))}
                </>
              ) : conBody}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
