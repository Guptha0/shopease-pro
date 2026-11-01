import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Wallet as WalletIcon,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Copy,
  Check,
  Share2,
  Search,
  Sparkles,
  CreditCard,
  QrCode,
  ShieldCheck,
  Gift,
  Zap,
  Clock,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';

const WalletPage = ({ onExploreStore }) => {
  const { user } = useAuth();
  const {
    balance,
    rewardsCoins,
    transactions,
    addMoney,
    claimReferral,
  } = useWallet();
  const { triggerNotification } = useNotifications();

  // Add Money Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [upiHandle, setUpiHandle] = useState('rohan@okaxis');
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState('');

  // Referral State
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulatingReferral, setSimulatingReferral] = useState(false);

  // Passbook Filter State
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'CREDIT' | 'DEBIT' | 'CASHBACK'
  const [searchQuery, setSearchQuery] = useState('');

  // Referral Link Generator
  const referralCode = user?.name
    ? user.name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) + '100'
    : 'GUPTHA0';
  const referralUrl = `shopease.pro/ref/${referralCode}`;

  // Handle Add Money
  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    if (topUpAmount <= 0) return;

    setIsAdding(true);
    setAddSuccessMessage('');

    try {
      await addMoney(topUpAmount, paymentMode, upiHandle);
      setAddSuccessMessage(`₹${Number(topUpAmount).toLocaleString('en-IN')} added successfully!`);

      // Trigger Simulated SMS Notification
      triggerNotification({
        channel: 'SMS',
        type: 'wallet',
        title: 'Wallet Credit Alert',
        message: `₹${Number(topUpAmount).toLocaleString('en-IN')} has been added to your ShopEase Wallet via ${paymentMode}. New balance: ₹${(balance + Number(topUpAmount)).toLocaleString('en-IN')}`,
      });

      setTimeout(() => {
        setIsAdding(false);
        setShowAddModal(false);
        setAddSuccessMessage('');
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to add money');
      setIsAdding(false);
    }
  };

  // Handle Copy Referral
  const handleCopyReferral = () => {
    navigator.clipboard?.writeText?.(`https://${referralUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handle Simulate Friend Referral
  const handleSimulateReferral = async () => {
    setSimulatingReferral(true);
    try {
      await claimReferral(referralCode);

      // Trigger Simulated WhatsApp Notification
      triggerNotification({
        channel: 'WHATSAPP',
        type: 'wallet',
        title: 'Referral Cash Bonus Credited!',
        message: `🎉 Great news! Your friend joined ShopEase Pro using referral code ${referralCode}. ₹100 Wallet Cash has been credited instantly!`,
      });
    } catch (err) {
      console.warn(err);
    } finally {
      setSimulatingReferral(false);
    }
  };

  // Filter Transactions
  const filteredTransactions = transactions.filter((txn) => {
    if (filterType === 'CREDIT' && txn.type !== 'CREDIT') return false;
    if (filterType === 'DEBIT' && txn.type !== 'DEBIT') return false;
    if (filterType === 'CASHBACK' && !txn.description?.toLowerCase().includes('cashback') && !txn.description?.toLowerCase().includes('coin')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const descMatch = txn.description?.toLowerCase().includes(q);
      const refMatch = txn.referenceId?.toLowerCase().includes(q);
      const idMatch = txn.id?.toLowerCase().includes(q);
      return descMatch || refMatch || idMatch;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>ShopEase Pro FinTech Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Digital Wallet & Cashback Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Instant 1-click checkouts, loyalty reward redemption, and real-time passbook tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Money to Wallet</span>
          </button>
        </div>
      </div>

      {/* Hero FinTech Section: Virtual Card + Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Holographic Virtual Debit Card */}
        <div className="lg:col-span-5">
          <div className="relative h-60 sm:h-64 rounded-3xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-2xl border border-indigo-400/30 bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 group">
            {/* Metallic Sheen Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-white">
                  <WalletIcon className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <span className="font-extrabold text-xs tracking-wider text-white">
                    ShopEase <span className="text-indigo-300">PRO</span>
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-indigo-300/80 font-bold">
                    FinTech Pass
                  </span>
                </div>
              </div>

              {/* Contactless Wave Icon */}
              <div className="flex items-center gap-1.5 text-slate-300/80">
                <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none">
                  <path d="M8.5 16.5C9.5 15.5 9.5 13.5 8.5 12.5" strokeWidth="2" strokeLinecap="round" />
                  <path d="M11.5 19.5C13.5 17.5 13.5 12.5 11.5 10.5" strokeWidth="2" strokeLinecap="round" />
                  <path d="M14.5 22.5C17.5 19.5 17.5 10.5 14.5 7.5" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] font-mono font-bold tracking-widest">NFC</span>
              </div>
            </div>

            {/* EMV Chip & Hologram */}
            <div className="flex items-center gap-4 relative z-10 my-1">
              {/* Metallic Chip SVG */}
              <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/60 shadow-md flex items-center justify-center p-1 relative overflow-hidden">
                <div className="w-full h-full border border-amber-800/40 rounded flex flex-col justify-between py-1">
                  <div className="h-0.5 bg-amber-800/40 w-full" />
                  <div className="h-0.5 bg-amber-800/40 w-full" />
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 tracking-widest">
                •••• •••• •••• 8842
              </span>
            </div>

            {/* Available Balance on Card */}
            <div className="relative z-10">
              <span className="text-[10px] text-slate-300/80 uppercase tracking-wider block font-medium">
                Live Available Balance
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span>₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Card Footer: Name & Expiry */}
            <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Cardholder
                </span>
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  {user?.name || 'Rohan Sharma'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold text-right">
                    Expires
                  </span>
                  <span className="text-xs font-mono text-white">10/29</span>
                </div>
                {/* Platinum RuPay Logo */}
                <div className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-black italic text-white tracking-tighter">
                  RuPay <span className="text-indigo-400 text-[8px] font-normal not-italic">PLATINUM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Stat Cards & Rewards Summary */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stat 1: Available Balance Quick Action */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Available Wallet Cash
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  ₹{Number(balance).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                RBI Compliant Safe Escrow
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>+ Top Up</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Stat 2: Reward Coins (Cashback Engine) */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>ShopEase Reward Coins</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-baseline gap-1.5">
                  <span>{rewardsCoins}</span>
                  <span className="text-xs font-semibold text-amber-400 font-mono">
                    Coins (= ₹{rewardsCoins})
                  </span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Gift className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Earn <strong className="text-slate-200">5% Cashback</strong> on all purchases
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                1 Coin = ₹1
              </span>
            </div>
          </div>

          {/* Stat 3: Total Lifetime Cashback Earned */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Total Cashback Earned
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  ₹
                  {transactions
                    .filter((t) => t.type === 'CREDIT' && (t.description?.includes('Cashback') || t.description?.includes('Reward') || t.description?.includes('Bonus')))
                    .reduce((acc, t) => acc + (t.amount || 0), 0)
                    .toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Credited automatically to your ShopEase coin treasury with zero expiry.
            </p>
          </div>

          {/* Stat 4: 1-Click Fast Checkout Status */}
          <div className="p-6 rounded-3xl glass-card border border-indigo-500/20 bg-indigo-950/20 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant 1-Click Checkout</span>
                </span>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Your wallet is pre-funded and ready. Bypass payment gateways and OTP delays at checkout.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400">
                1-Click Ready (Balance &gt; ₹0)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Refer-and-Earn Widget */}
      <div className="mb-10 p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
              <Gift className="w-3.5 h-3.5" />
              <span>Earn ₹100 Wallet Cash per Referral</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Invite friends to ShopEase Pro & get ₹100 each!
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              Share your exclusive invite link. When your friend signs up, they receive ₹5,000 demo float + ₹100 bonus, and you instantly receive ₹100 cash in your digital wallet.
            </p>

            {/* Referral Link Copy Bar */}
            <div className="mt-5 flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-lg">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-indigo-300 font-mono text-xs flex items-center justify-between truncate shadow-inner">
                <span className="truncate">{referralUrl}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase ml-2">Code: {referralCode}</span>
              </div>
              <button
                onClick={handleCopyReferral}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Simulation & Share Actions */}
          <div className="md:col-span-5 flex flex-col gap-3 justify-center">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Instant Simulator</span>
                </span>
                <span className="text-[10px] text-slate-400">Evaluator Tool</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Click below to simulate a friend signing up via your link right now and experience real-time wallet crediting:
              </p>
              <button
                onClick={handleSimulateReferral}
                disabled={simulatingReferral}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {simulatingReferral ? (
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Simulate Friend Sign-up (+₹100)</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={`https://wa.me/?text=Hey!%20Join%20ShopEase%20Pro%20and%20get%20instant%20wallet%20cash%20and%205%25%20cashback:%20https://${referralUrl}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Passbook / Transaction History Table */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Passbook & Transaction History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Itemized ledger of credits, debits, cashback disbursements, and orders.
            </p>
          </div>

          {/* Search bar inside Passbook */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description or reference ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: `All (${transactions.length})` },
            { id: 'CREDIT', label: 'Credits (Money In)' },
            { id: 'DEBIT', label: 'Debits (Money Out)' },
            { id: 'CASHBACK', label: 'Cashback & Rewards' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactions match your search criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold hidden sm:table-cell">Reference ID</th>
                  <th className="pb-3 font-semibold hidden md:table-cell">Date & Time</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((txn, idx) => {
                  const isCredit = txn.type === 'CREDIT';
                  const dateStr = txn.createdAt
                    ? new Date(txn.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recently';

                  return (
                    <tr key={txn.id || idx} className="hover:bg-slate-900/40 transition-colors">
                      {/* Type Icon Badge */}
                      <td className="py-3.5 pr-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isCredit
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 stroke-[3]" />
                          )}
                          <span>{txn.type}</span>
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 pr-3">
                        <p className="font-bold text-white text-xs">{txn.description}</p>
                        <span className="text-[10px] text-slate-500 sm:hidden block mt-0.5">
                          {txn.referenceId} • {dateStr}
                        </span>
                      </td>

                      {/* Reference ID */}
                      <td className="py-3.5 pr-3 hidden sm:table-cell">
                        <span className="font-mono text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {txn.referenceId || txn.id}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 pr-3 text-slate-400 hidden md:table-cell">
                        {dateStr}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 pr-3 text-right">
                        <span
                          className={`font-black text-xs sm:text-sm font-mono ${
                            isCredit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isCredit ? '+' : '-'}₹
                          {Number(txn.amount).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Success</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* "Add Money to Wallet" Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-800 p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Top Up Wallet</h3>
                  <p className="text-[10px] text-slate-400">
                    Instant UPI & Card Simulated Payment
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addSuccessMessage ? (
              <div className="py-8 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-white">Payment Successful</h4>
                <p className="text-xs text-emerald-300">{addSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleAddMoneySubmit} className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="10"
                      max="100000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-black text-lg focus:outline-none focus:border-indigo-500 shadow-inner"
                    />
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Quick Preset Amounts
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[500, 1000, 2000, 5000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setTopUpAmount(preset)}
                        className={`py-2 rounded-xl font-bold transition-all ${
                          topUpAmount === preset
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/40'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        +₹{preset >= 1000 ? `${preset / 1000}K` : preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Mode Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'UPI', label: 'Instant UPI', icon: QrCode },
                      { id: 'Card', label: 'Debit/Credit', icon: CreditCard },
                      { id: 'NetBanking', label: 'NetBanking', icon: ShieldCheck },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setPaymentMode(m.id)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                            paymentMode === m.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-indigo-400" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* UPI ID Field if UPI selected */}
                {paymentMode === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiHandle}
                      onChange={(e) => setUpiHandle(e.target.value)}
                      placeholder="e.g. rohan@okaxis"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span>Presets:</span>
                      {['@okaxis', '@okhdfcbank', '@paytm'].map((suf) => (
                        <button
                          type="button"
                          key={suf}
                          onClick={() => setUpiHandle(user?.name ? user.name.toLowerCase().replace(/\s+/g, '') + suf : 'user' + suf)}
                          className="hover:text-indigo-300 underline"
                        >
                          {suf}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || topUpAmount <= 0}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                  >
                    {isAdding ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Add ₹{Number(topUpAmount).toLocaleString('en-IN')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;

