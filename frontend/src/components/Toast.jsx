import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, Sparkles } from 'lucide-react';

const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-900/95 border border-indigo-500/40 text-white shadow-2xl shadow-indigo-500/20 backdrop-blur-md">
        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{toastMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default Toast;
