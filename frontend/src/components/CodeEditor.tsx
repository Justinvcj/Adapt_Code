import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, ChevronDown, Loader2, TerminalSquare, ChevronUp } from 'lucide-react';

interface Language {
  id: number;
  name: string;
  label: string;
  defaultCode: string;
}

interface CodeEditorProps {
  lang: Language;
  languages: Language[];
  code: string;
  executing: boolean;
  onLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCodeChange: (code: string) => void;
  onResetCode: () => void;
  onRunCode: () => void;
  onRunCustom: (customInput: string) => void;
}

export default function CodeEditor({ 
  lang, 
  languages, 
  code, 
  executing, 
  onLanguageChange, 
  onCodeChange, 
  onResetCode, 
  onRunCode,
  onRunCustom
}: CodeEditorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Editor Toolbar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="relative">
          <select
            data-testid="language-select"
            value={lang.id}
            onChange={onLanguageChange}
            className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {languages.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onResetCode}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-sm font-medium ${showCustomInput ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            title="Custom Input"
          >
            <TerminalSquare className="w-4 h-4" />
          </button>

          {showCustomInput ? (
            <button 
              onClick={() => onRunCustom(customInput)}
              disabled={executing}
              className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 active:scale-[0.98] transition-all text-white rounded-lg text-sm font-medium shadow-md disabled:opacity-50 disabled:active:scale-100"
            >
              {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Custom
            </button>
          ) : (
            <button 
              onClick={onRunCode}
              disabled={executing}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white rounded-lg text-sm font-medium shadow-md disabled:opacity-50 disabled:active:scale-100"
            >
              {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Submit
            </button>
          )}
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 pt-2 relative flex flex-col">
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={lang.name}
            theme="vs-dark"
            value={code}
            onChange={(v) => onCodeChange(v || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              roundedSelection: false,
            }}
          />
        </div>
        
        {showCustomInput && (
          <div className="h-32 border-t border-slate-700 bg-slate-900 flex flex-col shrink-0">
            <div className="px-4 py-1.5 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-medium">
              Custom Input
              <button onClick={() => setShowCustomInput(false)} className="hover:text-slate-200"><ChevronDown className="w-4 h-4"/></button>
            </div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom input here..."
              className="flex-1 w-full bg-slate-900 text-slate-300 p-3 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
