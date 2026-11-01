import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  const text = typeof toastMessage === 'string' ? toastMessage : toastMessage?.text || '';
  const type = typeof toastMessage === 'object' ? toastMessage?.type || 'info' : 'info';

  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-900/95 border text-white shadow-2xl backdrop-blur-md ${
          isSuccess
            ? 'border-emerald-500/50 shadow-emerald-500/20'
            : isWarning
            ? 'border-amber-500/50 shadow-amber-500/20'
            : 'border-indigo-500/40 shadow-indigo-500/20'
        }`}
      >
        <div
          className={`p-1.5 rounded-lg ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-400'
              : isWarning
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-indigo-500/20 text-indigo-400'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <Info className="w-5 h-5 text-indigo-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default Toast;
