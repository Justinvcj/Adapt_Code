"use client";
import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { PROBLEMS } from './data';

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(-1);

  const results = (q
    ? PROBLEMS.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
    : PROBLEMS
  ).slice(0, 8);

  useEffect(() => {
    if (open) { setQ(''); setFocus(-1); }
  }, [open]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocus((f) => Math.min(f + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocus((f) => Math.max(f - 1, 0)); }
    if (e.key === 'Enter' && focus >= 0) {
      const p = results[focus];
      if (p) { window.location.href = `/problem/${p.id === 1 ? 'two-sum' : 'coming-soon'}`; onClose(); }
    }
  }, [open, results, focus, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!open) return null;
  return (
    <div className="sm-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sm">
        <div className="sm-input">
          <Search />
          <input autoFocus placeholder="Search questions" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sm-results">
          {results.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--tx-2)', fontSize: 13 }}>No results found</div>
          ) : (
            results.map((p, i) => {
              const dc = p.diff === 'Easy' ? 'e' : p.diff === 'Medium' ? 'm' : 'h';
              return (
                <Link
                  key={p.id}
                  href={`/problem/${p.id === 1 ? 'two-sum' : 'coming-soon'}`}
                  onClick={onClose}
                  className={`sm-r ${focus === i ? 'focused' : ''}`}
                >
                  <span className="num">{p.id}</span>
                  <span>{p.title}</span>
                  <span className="d"><span className={`diff diff-${dc}`}>{p.diff}</span></span>
                </Link>
              );
            })
          )}
        </div>
        <div className="sm-hint">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
