import React from 'react';
import { useCart } from '../context/CartContext';
import { Lock, Clock, ShieldCheck, Check, X, Sparkles } from 'lucide-react';

const PriceLockModal = ({ product, onClose }) => {
  const { lockPrice, isPriceLocked } = useCart();
  if (!product) return null;

  const currentLock = isPriceLocked(product._id);

  const handleConfirmLock = () => {
    lockPrice(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
          <Lock className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SmartSense™ 48-Hour Price Lock</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          Freeze this Price for 48 Hours
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Planning to buy later this week? Lock in today's flash price of{' '}
          <strong className="text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </strong>{' '}
          (MRP: ₹{product.mrp?.toLocaleString('en-IN')}). If the price increases or flash deal ends, your reserved price will stay locked in your cart for 48 hours!
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 text-left space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Guaranteed zero price hikes during the 48-hour window.</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Inventory allocated with priority dispatch upon checkout.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-400 shrink-0" />
            <span>No upfront payment or cancellation penalty required.</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLock}
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-all"
          >
            {currentLock ? 'Update Price-Lock' : 'Lock Price Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceLockModal;
