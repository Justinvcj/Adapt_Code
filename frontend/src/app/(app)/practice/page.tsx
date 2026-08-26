"use client";

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { fetchApi } from '@/lib/api';
import { Analytics } from '@/lib/analytics';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Lightbulb, ChevronRight, CheckCircle2, XCircle, Code2, Sparkles, X, ChevronDown, Clock, Loader2 } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import ProblemPanel from '@/components/ProblemPanel';
import AITutorPanel from '@/components/AITutorPanel';

const LANGUAGES = [
  { id: 71, name: 'python', label: 'Python 3', defaultCode: '# Write your solution here\n' },
  { id: 63, name: 'javascript', label: 'JavaScript', defaultCode: '// Write your solution here\n' },
  { id: 54, name: 'cpp', label: 'C++', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n' },
  { id: 62, name: 'java', label: 'Java', defaultCode: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n' },
];

export default function PracticePage() {
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  
  // Execution State
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Progress State
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Timer State
  const [timeSeconds, setTimeSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startNewSessionAndProblem();
    return () => { endSession(); };
  }, []);

  useEffect(() => {
    if (problem) {
      timerRef.current = setInterval(() => {
        setTimeSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [problem]);

  const startNewSessionAndProblem = async () => {
    setLoading(true);
    setResult(null);
    setAiTutorOpen(false);
    setHint(null);
    setAttempts(0);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeSeconds(0);
    
    try {
      if (!sessionId) {
        const sessionRes = await fetchApi('/api/session/start', { method: 'POST' });
        setSessionId(sessionRes.session_id);
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const forcedProblemId = urlParams.get('problem_id');
      const endpoint = forcedProblemId ? `/api/problem/next?problem_id=${forcedProblemId}` : '/api/problem/next';
      const res = await fetchApi(endpoint);
      if (res.problem) {
        setProblem(res.problem);
        Analytics.trackEvent('Problem Started', { 
            problem_id: res.problem.problem_id, 
            difficulty: res.problem.difficulty_level 
        });
        const savedCode = localStorage.getItem(`code_${res.problem.problem_id}`);
        setCode(savedCode || lang.defaultCode);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load problem");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (sessionId) {
      try {
        await fetchApi('/api/session/end', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId })
        });
      } catch (e) {}
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = LANGUAGES.find(l => l.id.toString() === e.target.value);
    if (selected) {
      setLang(selected);
      // Only replace code if they haven't typed much, or prompt them in a real app.
      const savedCode = problem ? localStorage.getItem(`code_${problem.problem_id}`) : null;
      setCode(savedCode || selected.defaultCode);
    }
  };

  const handleCodeChange = (c: string) => {
    setCode(c);
    if (problem) {
      localStorage.setItem(`code_${problem.problem_id}`, c);
    }
  };

  const handleShowHint = async () => {
    if (!problem) return;
    setLoadingHint(true);
    Analytics.trackEvent('Hint Requested', { problem_id: problem.problem_id });
    try {
      const res = await fetchApi(`/api/hint/${problem.problem_id}`, { method: 'POST' });
      setHint(res.hint_text);
    } catch (e: any) {
      toast.error(e.message || "Failed to load hint");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    setExecuting(true);
    setResult(null);
    setAiTutorOpen(false);
    
    try {
      const res = await fetchApi('/api/execute', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language_id: lang.id,
          problem_id: problem.problem_id,
          concept_tag: problem.concept_tag,
          difficulty_level: problem.difficulty_level,
          session_id: sessionId,
          time_on_task_seconds: timeSeconds,
          hint_used: hint !== null,
          attempt_count: attempts + 1
        })
      });
      
      setResult(res);
      setAttempts(prev => prev + 1);
      
      if (res.explanation === "PAYWALL_LIMIT_REACHED") {
         Analytics.trackEvent('Paywall Hit', { reason: 'AI Tutor Daily Limit' });
      } else {
         Analytics.trackEvent('Code Executed', { 
            problem_id: problem.problem_id, 
            is_correct: res.is_correct,
            attempt_number: attempts + 1
         });
      }
      
      if (res.is_correct && !res.explanation) {
        toast.success("Correct Answer!");
      } else {
        toast.error(`Failed: ${res.verdict}`);
        if (res.explanation) {
          setAiTutorOpen(true);
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Execution failed");
    } finally {
      setExecuting(false);
    }
  };

  const handleRunCustom = async (customInput: string) => {
    if (!problem) return;
    setExecuting(true);
    setResult(null);
    setAiTutorOpen(false);
    
    try {
      const res = await fetchApi('/api/execute_custom', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language_id: lang.id,
          problem_id: problem.problem_id,
          custom_input: customInput
        })
      });
      setResult(res);
      // Don't update attempts, BKT, or LinUCB for custom runs
    } catch (e: any) {
      toast.error(e.message || "Custom execution failed");
    } finally {
      setExecuting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-slate-400 mb-4">No problem available</p>
        <button onClick={startNewSessionAndProblem} className="px-4 py-2 bg-indigo-600 rounded text-white">Refresh</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full relative">
      
      {/* Left Panel: Problem */}
      <ProblemPanel 
        problem={problem} 
        timeSeconds={timeSeconds} 
        attempts={attempts} 
        hint={hint} 
        loadingHint={loadingHint} 
        onShowHint={handleShowHint} 
      />

      {/* Right Panel: Editor & Output */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#1e1e1e] flex-1">
        <CodeEditor 
          lang={lang}
          languages={LANGUAGES}
          code={code}
          executing={executing}
          onLanguageChange={handleLanguageChange}
          onCodeChange={handleCodeChange}
          onResetCode={() => setCode(lang.defaultCode)}
          onRunCode={handleRun}
          onRunCustom={handleRunCustom}
        />

        {/* Output Panel */}
        <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col shrink-0">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400 bg-slate-900/50">
            <span>Execution Result</span>
            {result && (
              <span className="flex gap-4">
                <span>Time: {result.execution_time_ms}ms</span>
                <span>Mem: {result.memory_used_kb}KB</span>
                <span className="text-slate-300 border-l border-slate-700 pl-4">Attempt: {attempts}</span>
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            {!result ? (
              <div className="text-slate-500 h-full flex items-center justify-center italic">Run code to see results</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg">
                  {result.is_correct ? (
                    <><CheckCircle2 className="w-6 h-6 text-green-500" /><span className="text-green-400 font-semibold">Accepted</span></>
                  ) : (
                    <><XCircle className="w-6 h-6 text-red-500" /><span className="text-red-400 font-semibold">{result.verdict}</span></>
                  )}
                </div>
                
                {!result.is_correct && result.explanation && (
                    <button 
                      onClick={() => {
                          setAiTutorOpen(true);
                          Analytics.trackEvent('AI Tutor Opened', { problem_id: problem.problem_id, is_correct: result.is_correct });
                      }}
                      className="mt-3 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium px-4 py-2 rounded-lg bg-indigo-500/10 transition-colors"
                    >
                    <Sparkles className="w-4 h-4" /> View AI Tutor Analysis
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Tutor Side Sheet */}
      <AITutorPanel 
        isOpen={aiTutorOpen && !!result?.explanation && result.explanation !== "PAYWALL_LIMIT_REACHED"} 
        explanation={result?.explanation || ''} 
        onClose={() => setAiTutorOpen(false)} 
        onTrySimilar={() => { setAiTutorOpen(false); startNewSessionAndProblem(); }} 
      />

      {/* Paywall Modal */}
      <AnimatePresence>
        {result?.explanation === "PAYWALL_LIMIT_REACHED" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-indigo-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h2>
              <p className="text-slate-400 mb-8 text-sm">
                You've hit the limit of 5 AI Tutor explanations for today on the Free tier. Upgrade to Pro for unlimited guidance!
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setResult(null)} 
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
                <a 
                  href="/pricing" 
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
                >
                  View Plans
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
