"use client";

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { fetchApi } from '@/lib/api';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
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
    return () => endSession();
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
      
      const res = await fetchApi('/api/problem/next');
      if (res.problem) {
        setProblem(res.problem);
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
      
      if (res.is_correct) {
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
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/50 overflow-hidden min-h-[50vh] lg:min-h-0">
        
        {/* Toolbar */}
        <div className="h-14 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${
              problem.difficulty_level === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
              problem.difficulty_level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {problem.difficulty_level}
            </span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 capitalize">
              {problem.concept_tag.replaceAll('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow-inner">
              <Clock className="w-4 h-4 text-indigo-400" />
              {formatTime(timeSeconds)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-slate-100">{problem.title}</h1>
          
          <div className="prose prose-invert max-w-none text-slate-300">
            <ReactMarkdown>{problem.description}</ReactMarkdown>
          </div>

          {problem.test_cases && problem.test_cases.length > 0 && (
            <div className="space-y-3 mt-8">
              <h3 className="text-lg font-medium text-slate-200">Examples</h3>
              {problem.test_cases.slice(0, 2).map((tc: any, i: number) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm">
                  <div className="mb-2"><span className="text-slate-500 select-none">Input: </span><span className="text-indigo-300">{tc.input}</span></div>
                  <div><span className="text-slate-500 select-none">Output: </span><span className="text-green-300">{tc.expected_output}</span></div>
                </div>
              ))}
            </div>
          )}

          {/* Hint Section */}
          {(attempts >= 2 || hint) && (
            <div className="mt-8 p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl">
              {!hint ? (
                <button 
                  onClick={handleShowHint}
                  disabled={loadingHint}
                  className="flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                >
                  {loadingHint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                  Show Hint (May reduce mastery gain)
                </button>
              ) : (
                <div>
                  <h4 className="flex items-center gap-2 text-indigo-400 font-medium mb-2"><Lightbulb className="w-4 h-4" /> Hint</h4>
                  <p className="text-slate-300">{hint}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between">
          <button 
            onClick={startNewSessionAndProblem}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip Problem
          </button>
          {result?.is_correct && (
            <motion.button 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={startNewSessionAndProblem}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2"
            >
              Next Problem <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

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
                    onClick={() => setAiTutorOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors mt-2"
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
        isOpen={aiTutorOpen && !!result?.explanation} 
        explanation={result?.explanation || ''} 
        onClose={() => setAiTutorOpen(false)} 
        onTrySimilar={() => { setAiTutorOpen(false); startNewSessionAndProblem(); }} 
      />

    </div>
  );
}
