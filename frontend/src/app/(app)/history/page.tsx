"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetchApi('/api/history?limit=50');
        if (res.status === 'success') {
          setHistory(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const formatDate = (ts: string) => {
    if (!ts) return "Unknown";
    return new Date(ts).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'text-success font-bold';
      case 'compile error':
      case 'compile_error':
      case 'wrong answer':
      case 'runtime error':
        return 'text-error font-bold';
      case 'abandoned': return 'text-on-surface-variant font-bold';
      default: return 'text-medium font-bold';
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-lg h-full pb-xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-headline-md text-headline-md text-text-primary">Submission History</h1>
      </div>

      <div className="bg-surface-elevated border border-border-default rounded-lg overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-surface-container/50">
                <th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Time Submitted</th>
                <th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Status</th>
                <th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase w-full">Problem</th>
                <th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Concept</th>
                <th className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-md py-xl text-center text-on-surface-variant">
                    Loading history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-md py-xl text-center text-on-surface-variant">
                    No submissions found. Start practicing to see your history!
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={h.event_id || i} className="border-b border-border-default hover:bg-surface-secondary transition-colors group">
                    <td className="px-md py-3 text-body-md text-on-surface-variant whitespace-nowrap">
                      {formatDate(h.timestamp)}
                    </td>
                    <td className={`px-md py-3 text-body-md whitespace-nowrap ${getStatusColor(h.final_verdict)}`}>
                      {h.final_verdict || "Attempted"}
                    </td>
                    <td className="px-md py-3 text-body-md">
                      <span className="text-text-primary group-hover:text-primary transition-colors font-medium">
                        {h.problems?.title || "Unknown Problem"}
                      </span>
                    </td>
                    <td className="px-md py-3 text-body-md text-on-surface-variant">
                      {h.concept_tag}
                    </td>
                    <td className="px-md py-3 text-body-md">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-label-bold capitalize bg-${h.difficulty_level}/10 text-${h.difficulty_level}`}>
                        {h.difficulty_level}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
