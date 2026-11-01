import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Gift,
  X,
  Sparkles,
  CreditCard,
  Send,
  Check,
  CheckCircle2,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Mail,
  RefreshCw,
} from 'lucide-react';

const THEMES = [
  { id: 'tech', name: 'Tech Geek', bg: 'from-indigo-600 via-purple-600 to-slate-900', icon: '💻' },
  { id: 'birthday', name: 'Birthday Surprise', bg: 'from-pink-600 via-rose-600 to-amber-600', icon: '🎂' },
  { id: 'festive', name: 'Festive Celebration', bg: 'from-amber-500 via-yellow-600 to-emerald-700', icon: '✨' },
  { id: 'corporate', name: 'VIP Reward', bg: 'from-slate-800 via-slate-900 to-zinc-950', icon: '🏆' },
];

const PRESETS = [500, 1000, 2500, 5000, 10000];

const GiftCardModal = ({ isOpen, onClose }) => {
  const { addMoney } = useWallet();
  const { triggerNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'redeem'
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('Enjoy shopping top gadgets on ShopEase Pro!');

  const [purchasedCode, setPurchasedCode] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchaseCard = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const code = 'GFT-' + Math.floor(1000 + Math.random() * 9000) + '-' + selectedTheme.id.toUpperCase();
      setPurchasedCode({
        code,
        amount: selectedAmount,
        recipientName: recipientName || 'Friend',
        theme: selectedTheme,
      });
      setLoading(false);

      triggerNotification({
        channel: 'SMS',
        type: 'wallet',
        title: 'Gift Card Issued',
        message: `Your ShopEase ₹${selectedAmount.toLocaleString('en-IN')} Gift Card (${code}) has been generated and dispatched to ${recipientEmail || 'your email'}!`,
        orderId: code,
      });
    }, 600);
  };

  const handleRedeemCard = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setLoading(true);
    try {
      const amount = 1000; // Simulated gift card value
      await addMoney(amount, 'ShopEase Digital Gift Card', redeemCode.toUpperCase());
      setRedeemSuccess({ code: redeemCode.toUpperCase(), amount });

      triggerNotification({
        channel: 'SMS',
        type: 'wallet',
        title: 'Gift Card Redeemed!',
        message: `Success! Digital Gift Card ${redeemCode.toUpperCase()} redeemed. ₹${amount.toLocaleString('en-IN')} has been added to your ShopEase Wallet!`,
        orderId: redeemCode,
      });
      setRedeemCode('');
    } catch (err) {
      alert('Failed to redeem gift card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                ShopEase Digital Gift Cards
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Instant Delivery
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Gift tech, gaming gear, and gadgets redeemable directly into Virtual Wallets
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 bg-slate-950 rounded-xl p-1 my-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('buy')}
            className={`py-2 rounded-lg font-bold transition-all ${
              activeTab === 'buy'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Buy & Send Gift Card
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`py-2 rounded-lg font-bold transition-all ${
              activeTab === 'redeem'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Redeem into Wallet
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'buy' && (
            <>
              {/* Card Live Preview */}
              <div
                className={`p-6 rounded-2xl bg-gradient-to-tr ${selectedTheme.bg} border border-white/20 text-white shadow-2xl relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span className="text-lg">{selectedTheme.icon}</span>
                    <h4 className="font-black text-base tracking-tight">ShopEase Pro Gift Card</h4>
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">
                      {selectedTheme.name} Edition
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black block">
                      ₹{selectedAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] opacity-75">Pre-loaded Balance</span>
                  </div>
                </div>

                <div className="flex items-end justify-between text-[11px]">
                  <div>
                    <span className="text-[9px] opacity-60 block">RECIPIENT</span>
                    <span className="font-bold">{recipientName || 'Lucky Recipient'}</span>
                  </div>
                  <div className="font-mono text-[10px] opacity-80 tracking-wider">
                    {purchasedCode ? purchasedCode.code : '•••• •••• •••• TECH'}
                  </div>
                </div>
              </div>

              {purchasedCode ? (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Gift Card Created Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    Your gift code is <strong className="font-mono text-white text-xs">{purchasedCode.code}</strong>. It has been credited to your invoice ledger and simulated notification dispatched to {recipientEmail || 'recipient'}.
                  </p>
                  <button
                    onClick={() => setPurchasedCode(null)}
                    className="text-[10px] font-bold text-emerald-400 underline pt-1 block"
                  >
                    Buy Another Card
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePurchaseCard} className="space-y-4">
                  {/* Amount Presets */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Select Gift Amount
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESETS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSelectedAmount(amt)}
                          className={`py-2 rounded-xl font-bold border transition-all ${
                            selectedAmount === amt
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          ₹{amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Themes */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Card Design Theme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setSelectedTheme(theme)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            selectedTheme.id === theme.id
                              ? 'bg-slate-800 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-base block mb-0.5">{theme.icon}</span>
                          <span className="font-bold text-[11px] block text-white truncate">
                            {theme.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        placeholder="priya@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Personal Greeting Message
                    </label>
                    <input
                      type="text"
                      placeholder="Add a personalized note..."
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-black bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Purchase & Send Gift Card (₹{selectedAmount.toLocaleString('en-IN')})</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {activeTab === 'redeem' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Wallet className="w-4 h-4 text-indigo-400" />
                  <span>Instant Wallet Credit</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter your 16-character digital gift voucher code below to instantly deposit the balance into your Virtual Wallet.
                </p>
              </div>

              {redeemSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>₹{redeemSuccess.amount.toLocaleString('en-IN')} Credited to Wallet!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    Voucher code <code className="font-mono text-white">{redeemSuccess.code}</code> was successfully redeemed. Check your wallet passbook!
                  </p>
                </div>
              )}

              <form onSubmit={handleRedeemCard} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Gift Voucher Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GFT-9842-TECH"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-white text-sm focus:outline-none focus:border-indigo-500 tracking-wider"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !redeemCode.trim()}
                  className="w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Redeem Code & Add to Wallet</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftCardModal;
