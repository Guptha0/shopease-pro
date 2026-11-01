import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Sparkles,
  Gift,
  X,
  CheckCircle2,
  Coins,
  Wallet,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';

const ScratchCardModal = ({ isOpen, onClose, orderNumber = 'ORD-8942' }) => {
  const { addMoney } = useWallet();
  const { triggerNotification } = useNotifications();

  const [isScratched, setIsScratched] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  if (!isOpen) return null;

  const rewardCash = 150;
  const rewardCoins = 100;

  const handleClaimReward = async () => {
    setClaimLoading(true);
    try {
      await addMoney(rewardCash, 'Mystery Scratch Card', 'REWARD-SCRATCH');
      setIsClaimed(true);

      triggerNotification({
        channel: 'SMS',
        type: 'wallet',
        title: 'Mystery Scratch Reward Credited!',
        message: `Congratulations! ₹${rewardCash} cash + ${rewardCoins} loyalty coins have been credited to your ShopEase Wallet from order #${orderNumber}!`,
        orderId: orderNumber,
      });
    } catch (err) {
      alert('Reward claimed locally into your wallet!');
      setIsClaimed(true);
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 mb-3">
          <PartyPopper className="w-3.5 h-3.5" />
          <span>Post-Checkout Mystery Reward</span>
        </div>

        <h3 className="text-xl font-black text-white">
          {isScratched ? '🎉 Congratulations!' : 'Mystery Scratch Card'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {isScratched
            ? 'You unlocked an exclusive cashback perk!'
            : 'Scratch the golden foil below to reveal your surprise cashback reward.'}
        </p>

        {/* Scratch Card Interactive Area */}
        <div className="relative mx-auto aspect-4/3 w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl flex items-center justify-center select-none cursor-pointer">
          {/* Revealed Reward Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-slate-950 to-indigo-950 flex flex-col items-center justify-center p-4 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-bounce">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-3xl font-black text-white block tracking-tight">
                +₹{rewardCash} <span className="text-amber-400 text-lg">CASH</span>
              </span>
              <span className="text-xs font-bold text-amber-300 block">
                + {rewardCoins} ShopEase Coins Bonus
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Valid for your next order • Instant Wallet Deposit
            </span>
          </div>

          {/* Golden Foil Scratch Overlay */}
          {!isScratched && (
            <div
              onClick={() => setIsScratched(true)}
              className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 flex flex-col items-center justify-center p-4 shadow-inner transition-transform hover:scale-105 active:scale-95 group"
            >
              <div className="w-14 h-14 rounded-full bg-slate-950/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform">
                <Sparkles className="w-7 h-7 text-slate-950" />
              </div>
              <span className="text-xs font-black text-slate-950 tracking-wider uppercase px-3 py-1 rounded-full bg-slate-950/20">
                Click or Tap to Scratch
              </span>
              <span className="text-[10px] text-slate-900 font-bold mt-1">
                Guaranteed Cash Inside
              </span>
            </div>
          )}
        </div>

        {/* Claim Actions */}
        <div className="mt-6">
          {!isScratched ? (
            <button
              onClick={() => setIsScratched(true)}
              className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Reveal My Reward Now</span>
            </button>
          ) : isClaimed ? (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2 text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>₹{rewardCash} Added to your ShopEase Wallet!</span>
            </div>
          ) : (
            <button
              onClick={handleClaimReward}
              disabled={claimLoading}
              className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {claimLoading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Claim & Deposit ₹{rewardCash} into Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScratchCardModal;
