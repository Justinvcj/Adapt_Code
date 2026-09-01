'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from './icons';
import { PROBLEMS } from '@/lib/data';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? PROBLEMS.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : PROBLEMS.slice(0, 8);

  useEffect(() => {
    if (open) {
      setQuery('');
      setFocusIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && focusIdx >= 0 && filtered[focusIdx]) {
        const p = filtered[focusIdx];
        onClose();
        router.push(p.id === 1 ? '/problem/two-sum' : '/problems');
      }
    },
    [filtered, focusIdx, onClose, router]
  );

  if (!open) return null;

  const diffClass = (d: string) => (d === 'Easy' ? 'text-[var(--easy)] bg-[var(--easy-bg)]' : d === 'Medium' ? 'text-[var(--med)] bg-[var(--med-bg)]' : 'text-[var(--hard)] bg-[var(--hard-bg)]');

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[300] flex items-start justify-center pt-[120px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-[90%] max-w-[540px] bg-[var(--bg-sf)] border border-[var(--border-h)] rounded-[var(--r-lg)] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,0,0,0.4)] overflow-hidden animate-sm-in">
        {/* Input */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--border)]">
          <SearchIcon size={18} className="text-[var(--tx-2)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search questions"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocusIdx(-1); }}
            className="flex-1 text-[15px] text-[var(--tx)] placeholder:text-[var(--tx-3)] bg-transparent"
          />
        </div>

        {/* Results */}
        <div className="p-1 max-h-[340px] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((p, i) => (
              <button
                key={p.id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--r)] cursor-pointer transition-colors text-[13px] text-[var(--tx-1)] w-full text-left ${
                  i === focusIdx ? 'bg-[var(--bg-hover)] text-[var(--tx)]' : 'hover:bg-[var(--bg-hover)] hover:text-[var(--tx)]'
                }`}
                onClick={() => {
                  onClose();
                  router.push(p.id === 1 ? '/problem/two-sum' : '/problems');
                }}
              >
                <span className="text-[var(--tx-2)] text-xs w-7 text-right shrink-0">{p.id}</span>
                <span className="flex-1">{p.title}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${diffClass(p.diff)}`}>{p.diff}</span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-[var(--tx-2)] text-[13px]">No results found</div>
          )}
        </div>

        {/* Hints */}
        <div className="px-3.5 py-2 border-t border-[var(--border)] flex gap-4 text-[11px] text-[var(--tx-3)]">
          <span><kbd className="text-[10px] px-[5px] py-px rounded-[3px] bg-[rgba(255,255,255,0.06)] border border-[var(--border)]">↑</kbd><kbd className="text-[10px] px-[5px] py-px rounded-[3px] bg-[rgba(255,255,255,0.06)] border border-[var(--border)] ml-0.5">↓</kbd> Navigate</span>
          <span><kbd className="text-[10px] px-[5px] py-px rounded-[3px] bg-[rgba(255,255,255,0.06)] border border-[var(--border)]">↵</kbd> Open</span>
          <span><kbd className="text-[10px] px-[5px] py-px rounded-[3px] bg-[rgba(255,255,255,0.06)] border border-[var(--border)]">esc</kbd> Close</span>
        </div>
      </div>

      <style>{`
        @keyframes sm-in { from { opacity: 0; transform: scale(0.97) translateY(-8px); } to { opacity: 1; transform: none; } }
        .animate-sm-in { animation: sm-in 0.2s ease; }
      `}</style>
    </div>
  );
}
