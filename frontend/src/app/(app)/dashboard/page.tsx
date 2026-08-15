"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Activity, Lock, CheckCircle2, AlertCircle, ArrowRight, Code2 } from 'lucide-react';

type Stats = {
  total_problems_solved: number;
  total_sessions: number;
  current_streak: number;
  strongest_concept: string | null;
  weakest_concept: string | null;
  avg_mastery: number;
};

type Concept = {
  concept_tag: string;
  mastery_probability: number;
  is_unlocked: boolean;
  prerequisites: string[];
  problems_attempted: number;
  problems_solved: number;
};

const CONCEPT_ORDER = [
  ['basic_syntax'],
  ['loops'],
  ['arrays', 'recursion'],
  ['strings', 'hashing', 'two_pointers', 'binary_search', 'backtracking', 'trees', 'dynamic_programming'],
  ['sliding_window']
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, masteryRes] = await Promise.all([
        fetchApi('/api/stats'),
        fetchApi('/api/mastery')
      ]);
      setStats(statsRes.data);
      setConcepts(masteryRes.data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMasteryColor = (prob: number) => {
    if (prob < 0.4) return 'bg-red-500';
    if (prob < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMasteryTextClass = (prob: number) => {
    if (prob < 0.4) return 'text-red-400';
    if (prob < 0.7) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-800 rounded-xl" />)}
        </div>
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto h-full flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-slate-200 mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button 
          onClick={loadData}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white rounded-lg text-sm font-medium shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      >
        <h1 className="text-3xl font-light text-slate-100 mb-8">Mastery Dashboard</h1>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="font-medium">Problems Solved</span>
            </div>
            <div className="text-4xl font-light text-slate-100">{stats?.total_problems_solved || 0}</div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-medium">Current Streak</span>
            </div>
            <div className="text-4xl font-light text-slate-100">{stats?.current_streak || 0} <span className="text-xl text-slate-500">days</span></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <span className="font-medium">Avg. Mastery</span>
            </div>
            <div className="text-4xl font-light text-slate-100">{Math.round((stats?.avg_mastery || 0) * 100)}%</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="font-medium">Total Sessions</span>
            </div>
            <div className="text-4xl font-light text-slate-100">{stats?.total_sessions || 0}</div>
          </div>
        </div>

        {/* Highlight Insights */}
        {stats?.total_problems_solved === 0 ? (
          <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-2xl p-8 mb-10 text-center">
            <h3 className="text-xl text-indigo-400 font-medium mb-2">Welcome to AdaptCode!</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">You haven't solved any problems yet. Start your first practice session to generate your knowledge map and insights.</p>
            <a href="/practice" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              <Code2 className="w-5 h-5" />
              Start Practice
            </a>
          </div>
        ) : (
          (stats?.strongest_concept || stats?.weakest_concept) && (
            <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-2xl p-6 mb-10 flex flex-col md:flex-row gap-6">
              {stats.strongest_concept && (
                <div className="flex-1">
                  <h3 className="text-indigo-400 font-medium mb-1 text-sm uppercase tracking-wider">Strongest Concept</h3>
                  <p className="text-xl text-slate-200 capitalize">{stats.strongest_concept.replaceAll('_', ' ')}</p>
                </div>
              )}
              {stats.weakest_concept && (
                <div className="flex-1">
                  <h3 className="text-orange-400 font-medium mb-1 text-sm uppercase tracking-wider">Needs Work</h3>
                  <p className="text-xl text-slate-200 capitalize">{stats.weakest_concept.replaceAll('_', ' ')}</p>
                  <p className="text-sm text-slate-400 mt-1">Focus your next practice session here.</p>
                </div>
              )}
            </div>
          )
        )}

        {/* Knowledge Graph UI */}
        <h2 className="text-xl font-medium text-slate-200 mb-6">Knowledge Map</h2>
        <div className="space-y-6">
          {CONCEPT_ORDER.map((tier, idx) => (
            <div key={idx} className="flex flex-wrap gap-4">
              {tier.map(tag => {
                const c = concepts.find(x => x.concept_tag === tag);
                if (!c) return null;
                const pct = Math.round(c.mastery_probability * 100);
                
                return (
                  <div 
                    key={c.concept_tag} 
                    className={`relative p-5 rounded-xl border ${c.is_unlocked ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-60'} w-64 flex flex-col`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-slate-200 capitalize">{c.concept_tag.replaceAll('_', ' ')}</h3>
                      {!c.is_unlocked ? (
                        <Lock className="w-4 h-4 text-slate-500" />
                      ) : (
                        <span className={`text-sm font-bold ${getMasteryTextClass(c.mastery_probability)}`}>{pct}%</span>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, type: "spring" }}
                          className={`h-full rounded-full ${getMasteryColor(c.mastery_probability)}`}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{c.problems_attempted} attempted</span>
                        <span>{c.problems_solved} solved</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
