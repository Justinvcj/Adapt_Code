import React from 'react';

interface Problem {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  conceptTag: string;
}

interface ProblemPanelProps {
  problem: Problem;
  hintText: string | null;
  onShowHint: () => void;
  showHintButton: boolean;
}

export default function ProblemPanel({ problem, hintText, onShowHint, showHintButton }: ProblemPanelProps) {
  const diffColor = {
    easy: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    hard: 'text-red-400 bg-red-400/10'
  }[problem.difficulty];

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 overflow-y-auto text-slate-300">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${diffColor}`}>
          {problem.difficulty}
        </span>
        <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase text-blue-400 bg-blue-400/10">
          {problem.conceptTag.replace('_', ' ')}
        </span>
      </div>

      <div className="prose prose-invert max-w-none mb-8">
        {/* In a real app we'd use a Markdown parser here like react-markdown */}
        <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
      </div>

      {showHintButton && !hintText && (
        <div className="mt-8 p-4 bg-slate-900 border border-slate-700 rounded-lg">
          <p className="text-sm text-slate-400 mb-3">You've made a few attempts. Would you like a hint?</p>
          <button 
            onClick={onShowHint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-sm transition-colors"
          >
            Show Hint
          </button>
        </div>
      )}

      {hintText && (
        <div className="mt-8 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
          <h3 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
            💡 Hint
          </h3>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{hintText}</p>
        </div>
      )}
    </div>
  );
}
