"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, BrainCircuit, LineChart, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/practice');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <nav className="h-20 border-b border-slate-900/50 flex items-center justify-between px-6 md:px-12 z-10 relative">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
          <Code2 className="w-8 h-8" />
          AdaptCode
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-6 z-10 text-center -mt-10">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-6">
            Adaptive coding practice that learns how you learn.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto font-light">
            Master algorithms faster with personalized problem selection, continuous knowledge tracking, and an AI tutor that explains your specific mistakes.
          </p>
          <Link href="/register">
            <button className="text-lg font-medium bg-white text-slate-900 hover:bg-indigo-50 px-8 py-4 rounded-full transition-all active:scale-95 shadow-xl flex items-center gap-2 mx-auto">
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24">
          <motion.div 
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.6, delay: 0.1 }}
            className="group bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-indigo-500/30 p-8 rounded-[2rem] text-left backdrop-blur-md transition-all shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="w-14 h-14 bg-indigo-500/10 group-hover:bg-indigo-500/20 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20 transition-all">
              <BrainCircuit className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-slate-100 group-hover:text-indigo-300 transition-colors">Adaptive Contextual Bandits</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Stop grinding blindly. Our LinUCB Contextual Bandit agent dynamically selects problems modeled exactly for your current skill level, keeping you perfectly engaged in your zone of proximal development.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.6, delay: 0.2 }}
            className="group bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-purple-500/30 p-8 rounded-[2rem] text-left backdrop-blur-md transition-all shadow-lg hover:shadow-purple-500/10"
          >
            <div className="w-14 h-14 bg-purple-500/10 group-hover:bg-purple-500/20 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 transition-all">
              <LineChart className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-slate-100 group-hover:text-purple-300 transition-colors">Bayesian Knowledge Tracing</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              We mathematically model your brain. As you solve challenges, AdaptCode updates your hidden mastery state across a 12-node prerequisite graph using continuous-evidence BKT algorithms.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.6, delay: 0.3 }}
            className="group bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-cyan-500/30 p-8 rounded-[2rem] text-left backdrop-blur-md transition-all shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="w-14 h-14 bg-cyan-500/10 group-hover:bg-cyan-500/20 group-hover:scale-110 rounded-2xl flex items-center justify-center mb-8 border border-cyan-500/20 transition-all">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-slate-100 group-hover:text-cyan-300 transition-colors">GLM-4 Flash AI Tutor</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Never stay stuck. When your test cases fail, our integrated LLM tutor analyzes your specific logic errors and runtime crashes to provide targeted, Socratic feedback without spoiling the answer.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
