"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Code2, BarChart2, Clock, LogOut, Loader2, Menu, X, Flame, Trophy } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchApi('/api/stats').then(res => {
        if (res?.data?.current_streak) {
          setStreak(res.data.current_streak);
        }
      }).catch(() => {});
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: 'Practice', href: '/practice', icon: Code2 },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'History', href: '/history', icon: Clock },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 relative shrink-0"
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
          <AnimatePresence mode="popLayout">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 font-bold text-lg text-indigo-400"
              >
                <Code2 className="w-6 h-6" />
                AdaptCode
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative ${isActive ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
                  <item.icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap font-medium text-sm"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shrink-0">
              {user.display_name.charAt(0).toUpperCase()}
            </div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate text-slate-200">{user.display_name}</p>
                  <div className="flex items-center text-xs text-orange-400 gap-1 font-medium mt-0.5">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    {streak} Day Streak
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!collapsed && (
              <button onClick={logout} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-md transition-colors" title="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
