"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function ProblemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>('');
  
  // Behavioral tracking
  const [startTime] = useState(Date.now());
  const [compileErrors, setCompileErrors] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintAtAttempt, setHintAtAttempt] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  
  // Execution state
  const [executing, setExecuting] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [explanationStatus, setExplanationStatus] = useState<string>('not_needed');
  const [explanation, setExplanation] = useState<any>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function loadProblem() {
      try {
        const res = await fetchApi(`/api/problems/${params.id}`);
        setProblem(res.problem);
        setCode(res.problem.starter_code?.python || 'def solve():\n    pass');
      } catch (err) {
        toast.error("Failed to load problem");
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [params.id]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!solved && problem) {
        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/abandon`, JSON.stringify({
          problem_id: problem.id,
          compile_error_count: compileErrors,
          time_on_task_seconds: (Date.now() - startTime) / 1000,
          attempt_count: attemptCount,
        }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [solved, compileErrors, attemptCount, problem, startTime]);
  
  // Polling for explanation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (explanationStatus === 'pending' && activeEventId) {
      interval = setInterval(async () => {
        try {
          const res = await fetchApi(`/api/explanation/${activeEventId}`);
          if (res.status === 'completed') {
            setExplanation(res);
            setExplanationStatus('completed');
            clearInterval(interval);
          } else if (res.status === 'failed') {
            setExplanationStatus('failed');
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [explanationStatus, activeEventId]);

  const handleHint = () => {
    setHintUsed(true);
    setHintAtAttempt(attemptCount);
    toast("Hint revealed (penalty applied to BKT)", { icon: '💡' });
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setExecuting(true);
    setAttemptCount(prev => prev + 1);
    const timeOnTask = (Date.now() - startTime) / 1000;
    
    try {
      const res = await fetchApi('/api/submit', {
        method: 'POST',
        body: JSON.stringify({
          problem_id: problem.id || problem.problem_id,
          code,
          language: 'python',
          compile_error_count: compileErrors,
          time_on_task_seconds: timeOnTask,
          hint_used: hintUsed,
          hint_used_at_attempt: hintAtAttempt,
          attempt_count: attemptCount + 1,
        })
      });
      
      setVerdict(res.verdict);
      if (res.verdict === 'compile_error') {
        setCompileErrors(prev => prev + 1);
      }
      
      if (res.verdict === 'accepted') {
        setSolved(true);
        toast.success(`Accepted! +${(res.effective_weight).toFixed(2)} mastery`);
        // Show next problem card
      } else {
        toast.error(`Failed: ${res.verdict}`);
        if (res.explanation_status === 'pending' && res.event_id) {
          setExplanationStatus('pending');
          setActiveEventId(res.event_id);
          setExplanation(null);
        }
      }
    } catch (err) {
      toast.error("Execution failed");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-on-surface-variant flex flex-col items-center justify-center h-full"><span className="material-symbols-outlined animate-spin mb-2">sync</span> Loading Problem...</div>;
  if (error || !problem) return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center">
      <div className="bg-surface-elevated border border-border-default rounded-xl p-8 max-w-md w-full shadow-lg">
        <span className="material-symbols-outlined text-[48px] text-red-500 mb-4">cloud_off</span>
        <h2 className="font-headline-sm text-xl text-text-primary mb-2">Connection Failed</h2>
        <p className="text-on-surface-variant mb-6 text-sm">We couldn't connect to the server to load this problem. Make sure the backend is running.</p>
        <button onClick={() => router.push('/problems')} className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors font-label-bold">
          Back to Library
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <div className="h-[40px] bg-surface-elevated border-b border-border-default flex items-center justify-between px-md flex-shrink-0">
        <div className="flex items-center gap-sm">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-on-surface-variant hover:text-text-primary px-2 py-1 rounded hover:bg-surface-secondary transition-colors font-label-bold text-label-bold">
            <span className="material-symbols-outlined text-[18px]">list</span> Dashboard
          </button>
        </div>
        <div className="flex items-center gap-sm">
          <button 
            onClick={handleSubmit}
            disabled={executing}
            className="flex items-center gap-1 bg-success/10 text-success px-3 py-1 rounded border border-success/20 hover:bg-success/20 transition-colors font-label-bold text-label-bold disabled:opacity-50"
          >
            {executing ? 'Running...' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-background">
        {/* Left Panel: Description */}
        <div className="w-1/2 bg-surface overflow-y-auto p-6 border-r border-border-default">
          <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
          <div className="flex gap-2 mb-6">
            <span className={`px-2 py-0.5 rounded-full bg-${problem.difficulty_level}/10 text-${problem.difficulty_level} font-label-bold text-xs`}>
              {problem.difficulty_level}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-xs">{problem.concept || problem.concept_tag}</span>
          </div>
          
          <div className="prose prose-invert max-w-none mb-8">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>
          
          <div className="mb-8">
            <button 
              onClick={() => setHintUsed(true)}
              disabled={hintUsed}
              className="text-sm font-label-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              {hintUsed ? 'Hint Revealed' : 'Show Hint'}
            </button>
            {hintUsed && problem.hint_text && (
              <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded text-sm text-on-surface-variant">
                {problem.hint_text}
              </div>
            )}
          </div>

          {/* Explanation Panel */}
          {explanationStatus !== 'not_needed' && (
            <div className="mt-8 border-t border-border-default pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                AI Tutor Diagnosis
              </h3>
              
              {explanationStatus === 'pending' ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
                  <div className="h-4 bg-surface-secondary rounded w-full"></div>
                  <div className="h-4 bg-surface-secondary rounded w-5/6"></div>
                </div>
              ) : explanationStatus === 'completed' && explanation ? (
                <div className="space-y-4 text-sm">
                  <div className="bg-error/10 border border-error/20 p-3 rounded">
                    <strong className="text-error block mb-1">What went wrong:</strong>
                    {explanation.what_went_wrong}
                  </div>
                  <div className="bg-surface-elevated border border-border-default p-3 rounded">
                    <strong className="text-text-primary block mb-1">Why this approach fails:</strong>
                    {explanation.why_approach_fails}
                  </div>
                  <div className="bg-primary/10 border border-primary/20 p-3 rounded">
                    <strong className="text-primary block mb-1">Concept to review:</strong>
                    {explanation.concept_to_review}
                  </div>
                </div>
              ) : (
                <div className="text-on-surface-variant">Explanation failed to load.</div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Editor */}
        <div className="w-1/2 flex flex-col bg-[#1E1E2E]">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
              }}
            />
          </div>
          <div className="h-[200px] border-t border-border-default bg-surface-elevated p-4 overflow-y-auto">
            <h3 className="font-bold mb-2">Execution Result</h3>
            {verdict ? (
              <div className={`p-3 rounded border ${verdict === 'accepted' ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error'}`}>
                {verdict}
              </div>
            ) : (
              <div className="text-on-surface-variant text-sm">Submit your code to see results.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
