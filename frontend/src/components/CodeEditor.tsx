import React from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, ChevronDown, Loader2 } from 'lucide-react';

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
}

export default function CodeEditor({ 
  lang, 
  languages, 
  code, 
  executing, 
  onLanguageChange, 
  onCodeChange, 
  onResetCode, 
  onRunCode 
}: CodeEditorProps) {
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
            onClick={onRunCode}
            disabled={executing}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white rounded-lg text-sm font-medium shadow-md disabled:opacity-50 disabled:active:scale-100"
          >
            {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Code
          </button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 pt-2 relative">
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
    </div>
  );
}
