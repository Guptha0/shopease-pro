import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  MessageSquare,
  Trash2,
  CheckCheck,
  ExternalLink,
  Wallet,
  Package,
  Flame,
  ArrowRight,
} from 'lucide-react';

const NotificationsPage = ({ onNavigateToOrders, onNavigateToWallet, onExploreStore }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ORDERS' | 'WALLET' | 'DEALS'

  const filtered = notifications.filter((n) => {
    if (activeTab === 'ORDERS') return n.type === 'order';
    if (activeTab === 'WALLET') return n.type === 'wallet';
    if (activeTab === 'DEALS') return n.type === 'deal';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Transactional Alert Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated SMS dispatches, WhatsApp order tracking alerts, and cashback credits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark all as read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/20 text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 text-xs mb-6">
        {[
          { id: 'ALL', label: `All Alerts (${notifications.length})` },
          { id: 'ORDERS', label: 'Order Tracking (SMS & WhatsApp)' },
          { id: 'WALLET', label: 'FinTech & Cashback' },
          { id: 'DEALS', label: 'Flash Deals & Radar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No notifications yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When your orders update, wallet is credited, or flash deals drop, live alerts will appear here.
          </p>
          <button
            onClick={onExploreStore}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isWhatsApp = item.channel === 'WHATSAPP';
            const isOrder = item.type === 'order';
            const isWallet = item.type === 'wallet';

            const timeStr = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: 'short',
                })
              : 'Recently';

            return (
              <div
                key={item.id}
                onClick={() => !item.read && markAsRead(item.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                  item.read
                    ? 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-900/90 border-indigo-500/40 text-slate-200 shadow-md shadow-indigo-500/5'
                }`}
              >
                {/* Unread Indicator Dot */}
                {!item.read && (
                  <span className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                )}

                <div className="flex items-start gap-4">
                  {/* Channel / Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isWhatsApp
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isWallet
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {isWhatsApp ? (
                      <MessageSquare className="w-5 h-5" />
                    ) : isWallet ? (
                      <Wallet className="w-5 h-5" />
                    ) : isOrder ? (
                      <Package className="w-5 h-5" />
                    ) : (
                      <Flame className="w-5 h-5 text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isWhatsApp
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {item.channel} Alert
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {timeStr}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed font-mono sm:font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mt-2">
                      {item.message}
                    </p>

                    {/* Direct Action Link */}
                    <div className="mt-3 flex items-center gap-3">
                      {isOrder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateToOrders) onNavigateToOrders(item.orderId);
                          }}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
                        >
                          <span>Track Live in Orders</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      {isWallet && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateToWallet) onNavigateToWallet();
                          }}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5"
                        >
                          <span>View Wallet Balance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {!item.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item.id);
                          }}
                          className="text-[11px] text-slate-400 hover:text-white underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
