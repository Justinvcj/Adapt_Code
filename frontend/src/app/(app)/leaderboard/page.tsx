"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, AlertCircle } from 'lucide-react';

type LeaderboardUser = {
  user_id: string;
  display_name: string;
  solved_count: number;
  avg_mastery: number;
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchApi('/api/leaderboard');
      setUsers(res.data);
    } catch (e: any) {
      setError(e.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/3 mb-8" />
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-800 rounded-xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-slate-200 mb-2">Error Loading Leaderboard</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-light text-slate-100">Global Leaderboard</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 text-slate-400 font-medium text-sm w-16 text-center">Rank</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Coder</th>
                <th className="p-4 text-slate-400 font-medium text-sm text-right">Problems Solved</th>
                <th className="p-4 text-slate-400 font-medium text-sm text-right">Avg. Mastery</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.user_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-center font-medium">
                    {idx === 0 ? <Trophy className="w-5 h-5 text-yellow-400 mx-auto" /> :
                     idx === 1 ? <Medal className="w-5 h-5 text-slate-300 mx-auto" /> :
                     idx === 2 ? <Award className="w-5 h-5 text-orange-400 mx-auto" /> :
                     <span className="text-slate-500">{idx + 1}</span>}
                  </td>
                  <td className="p-4 text-slate-200 font-medium">
                    {u.display_name}
                  </td>
                  <td className="p-4 text-right text-indigo-400 font-bold">
                    {u.solved_count}
                  </td>
                  <td className="p-4 text-right text-slate-300">
                    {Math.round(u.avg_mastery * 100)}%
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No coders on the board yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
