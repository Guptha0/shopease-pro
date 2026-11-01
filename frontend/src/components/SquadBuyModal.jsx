import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Users,
  Clock,
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const SquadBuyModal = ({ isOpen, onClose, product, onProceedCheckout }) => {
  const { addToCart } = useCart();
  const { triggerNotification } = useNotifications();

  const [squadCode] = useState(() => 'SQD-' + Math.floor(1000 + Math.random() * 9000));
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours
  const [members, setMembers] = useState([
    { name: 'You (Squad Initiator)', joined: 'Just now', isInitiator: true },
  ]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen || !product) return null;

  const originalPrice = product.price;
  const squadDiscount = Math.round(originalPrice * 0.15);
  const squadPrice = originalPrice - squadDiscount;

  const formatHours = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://shopease.pro/squad/${squadCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate a friend joining the squad
  const handleSimulateFriendJoin = () => {
    if (isCompleted) return;
    setMembers((prev) => [
      ...prev,
      { name: 'Aarav Patel (Friend)', joined: 'Just now', isInitiator: false },
    ]);
    setIsCompleted(true);

    triggerNotification({
      channel: 'SMS',
      type: 'order',
      title: 'Squad Buy Completed! (15% Saved)',
      message: `Aarav joined your Squad #${squadCode}! 15% Group Discount applied on ${product.name}. Your order will ship together!`,
      orderId: squadCode,
    });
  };

  const handleProceedWithSquadPrice = () => {
    // Add product to cart with discounted squad price
    addToCart(
      {
        ...product,
        price: squadPrice,
        mrp: originalPrice,
        isSquadDiscount: true,
      },
      1
    );
    onClose();
    if (onProceedCheckout) onProceedCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-500/30 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                "Squad Buy" Group Discount
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                15% OFF
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Team up with 1 friend to unlock wholesale group pricing on this item
            </p>
          </div>
        </div>

        {/* Product Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4 my-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs truncate">{product.name}</h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-purple-300">
                ₹{squadPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-500 line-through text-xs">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-emerald-400 font-bold text-[11px]">
                Save ₹{squadDiscount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 24-Hour Timer & Squad Code */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">Squad Code</span>
            <span className="font-mono font-black text-white text-sm">{squadCode}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Time Left</span>
            </span>
            <span className="font-mono font-black text-amber-400 text-sm">
              {formatHours(timeLeft)}
            </span>
          </div>
        </div>

        {/* Squad Members Tracker */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-300">
              Squad Members ({members.length} / 2)
            </span>
            <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isCompleted ? 'Group Complete!' : 'Needs 1 more friend'}
            </span>
          </div>

          <div className="space-y-2">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-white block">{m.name}</span>
                    <span className="text-[10px] text-slate-500">{m.joined}</span>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
            ))}

            {!isCompleted && (
              <div className="p-3 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-[10px]">
                    2
                  </div>
                  <span>Waiting for friend to join via link...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 mb-4">
          <span className="font-mono text-slate-400 truncate text-[11px]">
            https://shopease.pro/squad/{squadCode}
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          {!isCompleted ? (
            <button
              onClick={handleSimulateFriendJoin}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Simulate Friend Joining Squad</span>
            </button>
          ) : (
            <button
              onClick={handleProceedWithSquadPrice}
              className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Checkout with 15% Squad Discount (₹{squadPrice.toLocaleString('en-IN')})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SquadBuyModal;
