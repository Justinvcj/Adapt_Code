'use client';

import React, { useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onRun: () => void;
  isExecuting: boolean;
}

export default function CodeEditor({ language, code, onChange, onRun, isExecuting }: CodeEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700 text-sm">
        <div className="text-slate-300 font-semibold">{language.toUpperCase()}</div>
        <button
          onClick={onRun}
          disabled={isExecuting}
          className={`px-6 py-1.5 rounded font-bold text-white transition-colors ${
            isExecuting ? 'bg-slate-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {isExecuting ? 'Running...' : 'Run Code'}
        </button>
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
}
