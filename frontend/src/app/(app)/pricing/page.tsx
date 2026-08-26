"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Check, Sparkles, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/checkout/mock-upgrade', { method: 'POST' });
      toast.success(res.message || "Upgraded successfully!");
      // Reload to refresh auth context
      setTimeout(() => window.location.href = '/dashboard', 1500);
    } catch (e: any) {
      toast.error(e.message || "Upgrade failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-16 px-4 overflow-y-auto h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-slate-100 mb-4">Level Up Your Coding</h1>
        <p className="text-slate-400 text-lg">
          Master algorithms faster with unlimited AST-aware AI Tutoring and access to advanced problems.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full justify-center items-stretch">
        {/* Free Tier */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Basic</h2>
            <div className="text-3xl font-light text-slate-100">$0<span className="text-lg text-slate-500">/mo</span></div>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>Access to Easy and Medium problems</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>Standard Contextual Bandit Routing</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>5 AI Tutor explanations per day</span>
            </li>
          </ul>
          <button disabled className="w-full py-3 px-4 bg-slate-800 text-slate-400 rounded-xl font-medium cursor-not-allowed">
            Current Plan
          </button>
        </motion.div>

        {/* Pro Tier */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-gradient-to-b from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 flex flex-col relative shadow-2xl shadow-indigo-900/20"
        >
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-3 h-3" />
            MOST POPULAR
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-indigo-300 mb-2">AdaptCode Pro</h2>
            <div className="text-4xl font-bold text-white">$15<span className="text-lg text-slate-400 font-normal">/mo</span></div>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 shrink-0" />
              <span><strong className="text-white">Unlimited</strong> AI Tutor explanations</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 shrink-0" />
              <span>Access to <strong className="text-white">Hard</strong> algorithms & Premium tags</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 shrink-0" />
              <span>Priority execution queue</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 shrink-0" />
              <span>Exclusive "Pro" profile badge</span>
            </li>
          </ul>
          
          {user?.is_pro ? (
            <div className="w-full py-3 px-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl font-medium text-center flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              You are Pro
            </div>
          ) : (
            <button 
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white rounded-xl font-medium shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe Now"}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
