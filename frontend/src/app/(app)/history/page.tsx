"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Filter } from 'lucide-react';

type HistoryEvent = {
  event_id: string;
  concept_tag: string;
  difficulty_level: string;
  final_verdict: string;
  timestamp: string;
  problems: { title: string };
};

export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/api/history?page=${page}&limit=${limit}`);
        setEvents(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [page]);

  const getVerdictBadge = (verdict: string) => {
    if (verdict === 'Accepted') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (verdict === 'Wrong Answer') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'easy') return 'text-green-400';
    if (diff === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-slate-100 flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-400" />
            Submission History
          </h1>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-medium">
              Page {page}
            </div>
            <button 
              disabled={events.length < limit}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-800 rounded-lg" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No submissions found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Concept</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Verdict</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map((event) => (
                  <tr key={event.event_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {event.problems?.title || 'Unknown Problem'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs capitalize">
                        {event.concept_tag.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm capitalize font-medium ${getDifficultyBadge(event.difficulty_level)}`}>
                        {event.difficulty_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded border text-xs font-medium ${getVerdictBadge(event.final_verdict)}`}>
                        {event.final_verdict}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 text-right whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
