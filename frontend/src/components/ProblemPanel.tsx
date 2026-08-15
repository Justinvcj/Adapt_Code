import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Clock, Loader2, Lightbulb } from 'lucide-react';

interface ProblemPanelProps {
  problem: any;
  timeSeconds: number;
  attempts: number;
  hint: string | null;
  loadingHint: boolean;
  onShowHint: () => void;
}

export default function ProblemPanel({ problem, timeSeconds, attempts, hint, loadingHint, onShowHint }: ProblemPanelProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
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
                onClick={onShowHint}
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
    </div>
  );
}
