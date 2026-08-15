import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AITutorPanelProps {
  isOpen: boolean;
  explanation: string;
  onClose: () => void;
  onTrySimilar: () => void;
}

export default function AITutorPanel({ isOpen, explanation, onClose, onTrySimilar }: AITutorPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && explanation && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
          />
          {/* Sheet */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute right-0 top-0 bottom-0 w-full sm:w-[450px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-indigo-950/30">
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <Sparkles className="w-5 h-5" />
                AI Tutor Analysis
              </div>
              <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose prose-invert prose-indigo max-w-none text-sm">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <button 
                onClick={() => { onClose(); onTrySimilar(); }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-lg font-medium text-slate-200 border border-slate-700"
              >
                Try a similar problem
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
