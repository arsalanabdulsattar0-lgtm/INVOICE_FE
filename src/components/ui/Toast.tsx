import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  messages: string[];
  duration?: number;
  type?: 'error' | 'success';
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  title = "Required Fields Missing",
  messages,
  duration = 5000,
  type = 'error'
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-6 right-6 z-[99999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`pointer-events-auto w-80 bg-white border-l-4 rounded-r-xl shadow-2xl p-4 border flex gap-3 ${
              isSuccess ? 'border-l-emerald-500 border-y-slate-100 border-r-slate-100' : 'border-l-red-500 border-y-slate-100 border-r-slate-100'
            }`}
          >
            <div className={`shrink-0 mt-0.5 ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
              {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 tracking-wide uppercase">{title}</h4>
              <ul className={`mt-1.5 list-disc pl-4 ${messages.length > 1 ? 'space-y-1' : 'list-none pl-0'}`}>
                {messages.map((msg, i) => (
                  <li key={i} className="text-[11px] font-normal text-slate-600 leading-relaxed">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors h-5 w-5 flex items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
