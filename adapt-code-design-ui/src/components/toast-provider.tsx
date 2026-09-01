'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useToast, Toast } from '@/hooks/use-toast';

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
});

export function useToastContext() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useToast();
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={value.toasts} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const icons = { success: '✓', error: '✕', info: 'i' };
  const bgMap = {
    success: 'bg-[rgba(39,166,68,0.2)] text-[var(--solved)]',
    error: 'bg-[var(--hard-bg)] text-[var(--hard)]',
    info: 'bg-[rgba(94,106,210,0.2)] text-[var(--blue)]',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[400] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-md)] bg-[var(--bg-sf)] border border-[var(--border-h)] text-[var(--tx)] text-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] max-w-[360px] ${
            t.exiting ? 'animate-toast-out' : 'animate-toast-in'
          }`}
        >
          <span
            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${bgMap[t.type]}`}
          >
            {icons[t.type]}
          </span>
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
        @keyframes toast-out { to { opacity: 0; transform: translateX(20px); } }
        .animate-toast-in { animation: toast-in 0.3s ease; }
        .animate-toast-out { animation: toast-out 0.2s ease forwards; }
      `}</style>
    </div>
  );
}
