"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({ total_solved: 0, streak: 0, total_sessions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchApi('/api/stats');
        if (res.status === 'success') {
          setStats(res.data);
        }
      } catch (e) {
        console.error("Failed to load stats", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <>
      <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-xl">
        {/* Welcome Section */}
        <div className="bg-surface-elevated border border-border-default rounded-xl p-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div>
              <div className="flex items-center gap-3 mb-xs">
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Welcome back, {user?.display_name || 'Student'}!
                </h1>
                {error && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded font-bold border border-red-500/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">wifi_off</span>
                    Offline
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Ready to continue your mastery journey? Your adaptive learning model is actively tracking your progress and selecting the best problems for you.
              </p>
            </div>
            
            <div className="flex shrink-0">
              <Link href="/problems" className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-bold text-label-bold px-lg py-sm rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]" data-icon="play_arrow" data-weight="fill">play_arrow</span>
                Resume Practice
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Stat Card 1 */}
          <div className="bg-surface-elevated border border-border-default rounded-xl p-lg flex flex-col justify-between group hover:border-border-hover transition-colors">
            <div className="flex items-center gap-3 mb-md">
              <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">task_alt</span>
              </div>
              <h3 className="font-headline-sm text-on-surface-variant">Problems Solved</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-[42px] text-text-primary leading-none tracking-tight">
                {loading ? '...' : error ? '--' : stats.total_solved || 0}
              </span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-surface-elevated border border-border-default rounded-xl p-lg flex flex-col justify-between group hover:border-border-hover transition-colors">
            <div className="flex items-center gap-3 mb-md">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
              </div>
              <h3 className="font-headline-sm text-on-surface-variant">Current Streak</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-[42px] text-text-primary leading-none tracking-tight">
                {loading ? '...' : error ? '--' : stats.streak || 0}
              </span>
              <span className="font-body-md text-on-surface-variant">days</span>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-surface-elevated border border-border-default rounded-xl p-lg flex flex-col justify-between group hover:border-border-hover transition-colors">
            <div className="flex items-center gap-3 mb-md">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <h3 className="font-headline-sm text-on-surface-variant">Total Sessions</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-[42px] text-text-primary leading-none tracking-tight">
                {loading ? '...' : error ? '--' : stats.total_sessions || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
