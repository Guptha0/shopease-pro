import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { MessageSquare, ExternalLink, X, Bell, ShieldCheck } from 'lucide-react';

const NotificationToastBanner = ({ onNavigateToOrders, onNavigateToWallet }) => {
  const { activePushToast, dismissPushToast } = useNotifications();

  if (!activePushToast) return null;

  const isWhatsApp = activePushToast.channel === 'WHATSAPP';
  const isSMS = activePushToast.channel === 'SMS';

  const handleClickAction = () => {
    if (activePushToast.type === 'wallet' && onNavigateToWallet) {
      onNavigateToWallet();
    } else if (onNavigateToOrders) {
      onNavigateToOrders(activePushToast.orderId);
    }
    dismissPushToast();
  };

  return (
    <aside aria-label="Order and wallet alerts" className="fixed top-5 right-4 sm:right-6 z-50 max-w-md w-full animate-slideDown pointer-events-auto">
      <div
        className={`relative p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all ${
          isWhatsApp
            ? 'bg-slate-900/95 border-emerald-500/40 shadow-emerald-500/20'
            : 'bg-slate-900/95 border-indigo-500/40 shadow-indigo-500/20'
        }`}
      >
        {/* Top App Bar Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isWhatsApp ? (
              <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950">
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                <Bell className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              {isWhatsApp ? 'WHATSAPP • ShopEase Pro' : 'SMS ALERT • VK-SHPEAS'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Just now</span>
            <button
              onClick={dismissPushToast}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notification Body */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-white mb-0.5">
              {activePushToast.title}
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed font-mono sm:font-sans">
              {activePushToast.message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Simulated Live Dispatch
          </span>
          <button
            onClick={handleClickAction}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-white shadow-sm ${
              isWhatsApp
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            <span>
              {activePushToast.type === 'wallet' ? 'Open Wallet' : 'Track Live'}
            </span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default NotificationToastBanner;
