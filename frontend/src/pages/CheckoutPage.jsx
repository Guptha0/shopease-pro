import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';
import apiClient from '../api/apiClient';
import {
  MapPin,
  Truck,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  Zap,
  Wallet,
  Coins,
  Gift,
  Clock,
  Sparkles,
  AlertTriangle,
  Copy,
  Plus,
  Leaf,
} from 'lucide-react';

const CheckoutPage = ({ onOrderPlaced, onNavigateToAuth }) => {
  const { user } = useAuth();
  const {
    cartItems,
    totalMRP,
    mrpSavings,
    couponDiscount,
    appliedCoupon,
    platformFee,
    deliveryCharge,
    grandTotal,
    deliverySpeed,
    setDeliverySpeed,
    clearCart,
  } = useCart();

  const {
    balance: walletBalance,
    rewardsCoins,
    payWithWallet,
    redeemCoins: deductCoinsFromWallet,
    awardCashbackCoins,
    addMoney,
  } = useWallet();

  const { triggerNotification } = useNotifications();

  const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Speed, 3: Payment

  // Address Form
  const [address, setAddress] = useState({
    fullName: user?.name || 'Rohan Sharma',
    address: 'Flat 402, Prestige Lakeside Habitat, Varthur',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560060',
    phone: '+91 91234 56789',
  });

  // Coin Cashback & Redemption Engine
  const [redeemCoinsToggle, setRedeemCoinsToggle] = useState(false);
  const [isEcoPackaging, setIsEcoPackaging] = useState(true);
  const [isSubscribeAndSave, setIsSubscribeAndSave] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('Hope you enjoy this special gift from ShopEase Pro!');
  const [payLaterCredit, setPayLaterCredit] = useState({ available: 25000, limit: 25000 });

  // Payment Selection
  // 'Wallet' | 'QR_CODE' | 'UPI' | 'Card' | 'NetBanking' | 'COD'
  const [paymentMethod, setPaymentMethod] = useState('Wallet');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // QR Code Simulator State
  const [qrCountdown, setQrCountdown] = useState(180); // 3 minutes = 180s
  const [isSimulatingQrPayment, setIsSimulatingQrPayment] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Inline Quick Add Money for Wallet
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddAmount, setQuickAddAmount] = useState(1000);
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  // 3-Minute Countdown Timer for QR Code
  useEffect(() => {
    let timer = null;
    if (activeStep === 3 && paymentMethod === 'QR_CODE') {
      timer = setInterval(() => {
        setQrCountdown((prev) => (prev > 0 ? prev - 1 : 180));
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [activeStep, paymentMethod]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="p-8 rounded-3xl glass-card">
          <Truck className="w-12 h-12 mx-auto text-slate-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-xs text-slate-400 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
        </div>
      </div>
    );
  }

  // Financial Calculations
  const codFee = paymentMethod === 'COD' ? 40 : 0;
  const maxRedeemableCoins = Math.min(rewardsCoins, grandTotal);
  const subDiscount = isSubscribeAndSave ? Math.round(grandTotal * 0.10) : 0;
  const coinsDiscount = redeemCoinsToggle ? maxRedeemableCoins : 0;
  const finalTotalAmount = Math.max(0, grandTotal + codFee - coinsDiscount - subDiscount);

  // 5% Cashback in ShopEase Coins (1 Coin = ₹1) + 50 Eco Bonus Coins
  const cashbackCoinsEarned = Math.round(finalTotalAmount * 0.05);
  const ecoBonusCoins = isEcoPackaging ? 50 : 0;
  const totalCashbackCoins = cashbackCoinsEarned + ecoBonusCoins;
  const totalCoinsEarned = totalCashbackCoins;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpiHandle = () => {
    navigator.clipboard?.writeText?.('shopease@okaxis');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleQuickAddMoney = async () => {
    setQuickAddLoading(true);
    try {
      await addMoney(quickAddAmount, 'UPI', 'user@okhdfcbank');
      setShowQuickAdd(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setQuickAddLoading(false);
    }
  };

  const executeOrderPlacement = async (verifiedPaymentMethod = paymentMethod) => {
    if (!user) {
      onNavigateToAuth();
      return;
    }

    // Check wallet balance if paying with Wallet
    if (verifiedPaymentMethod === 'PayLater' && payLaterCredit.available < finalTotalAmount) {
      setError(`Insufficient ShopEase Pay Later credit limit (Available: ₹${payLaterCredit.available.toLocaleString('en-IN')}).`);
      return;
    }

    if (verifiedPaymentMethod === 'Wallet' && walletBalance < finalTotalAmount) {
      setError(`Insufficient wallet balance (Need ₹${(finalTotalAmount - walletBalance).toLocaleString('en-IN')} more). Please top up or choose another payment method.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          price: item.price,
          mrp: item.mrp || item.price * 1.25,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        shippingAddress: address,
        deliverySpeed,
        paymentMethod: verifiedPaymentMethod,
        mrpTotal,
        discountAmount: mrpSavings + couponDiscount + coinsDiscount,
        couponCode: appliedCoupon?.code || '',
        platformFee,
        deliveryCharge,
        codFee,
        coinsRedeemed: coinsDiscount,
        coinsEarned: totalCoinsEarned,
        isEcoPackaging,
        totalAmount: finalTotalAmount,
      };

      const res = await apiClient.post('/orders', orderData);

      if (res.data?.success) {
        const placedOrder = res.data.order;

        // Client-side Wallet deduction if Wallet payment
        if (verifiedPaymentMethod === 'Wallet') {
          try {
            await payWithWallet(finalTotalAmount, placedOrder.trackingNumber);
          } catch (wErr) {
            console.warn('Local wallet pay fallback:', wErr);
          }
        }

        // Deduct redeemed coins from client context
        if (coinsDiscount > 0) {
          deductCoinsFromWallet(coinsDiscount, placedOrder.trackingNumber);
        }

        // Award 5% cashback coins + eco bonus to client context
        if (totalCoinsEarned > 0) {
          awardCashbackCoins(totalCoinsEarned, placedOrder.trackingNumber);
        }

        // Trigger Instant Simulated SMS Notification
        triggerNotification({
          channel: 'SMS',
          type: 'order',
          title: 'Order Placed & Cashback Credited!',
          message: `Your ShopEase order #${placedOrder.trackingNumber} is confirmed via ${verifiedPaymentMethod}! ₹${placedOrder.totalAmount.toLocaleString('en-IN')} paid. Cashback & Eco-Bonus (${totalCoinsEarned} Coins) credited to your wallet! Track live: shopease.pro/orders`,
          orderId: placedOrder.trackingNumber,
        });

        clearCart();
        onOrderPlaced(placedOrder);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
      setIsSimulatingQrPayment(false);
    }
  };

  // Simulate Instant QR Code Payment
  const handleSimulateQrPayment = async () => {
    setIsSimulatingQrPayment(true);
    setTimeout(async () => {
      await executeOrderPlacement('QR_CODE');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Checkout Progress Stepper */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />
          {[
            { num: 1, title: 'Delivery Address' },
            { num: 2, title: 'Delivery Speed' },
            { num: 3, title: 'FinTech Checkout' },
          ].map((s) => {
            const isCompleted = activeStep > s.num;
            const isCurrent = activeStep === s.num;

            return (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => s.num < activeStep && setActiveStep(s.num)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </button>
                <span
                  className={`mt-2 text-[11px] font-semibold ${
                    isCurrent ? 'text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {!user && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-300 text-xs">
            <Lock className="w-5 h-5 shrink-0" />
            <span>You must be signed in to place orders and unlock Prime Express tracking.</span>
          </div>
          <button
            onClick={onNavigateToAuth}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Step Form Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: DELIVERY ADDRESS */}
          {activeStep === 1 && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-bold">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <span>1. Select or Enter Delivery Address</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Street Address & Flat / House No *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <span>Continue to Delivery Speed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY SPEED */}
          {activeStep === 2 && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-bold">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span>2. Choose Delivery Speed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Standard Free Delivery */}
                <div
                  onClick={() => setDeliverySpeed('Standard')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    deliverySpeed === 'Standard'
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">Standard Delivery</span>
                    <span className="font-bold text-emerald-400 text-xs">FREE</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Estimated arrival in 2–3 business days via BlueDart Air.
                  </p>
                </div>

                {/* Prime Same-Day Express */}
                <div
                  onClick={() => setDeliverySpeed('Prime Same-Day Express')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    deliverySpeed === 'Prime Same-Day Express'
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Prime Express</span>
                    </span>
                    <span className="font-bold text-indigo-300 text-xs">
                      {grandTotal > 100000 ? 'FREE' : '₹99'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Guaranteed delivery <strong className="text-slate-200">Tomorrow by 9 PM</strong> directly from Bengaluru Mega Hub.
                  </p>
                </div>
              </div>

              {/* Subscribe & Save 10% Option */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="subAndSave"
                  checked={isSubscribeAndSave}
                  onChange={(e) => setIsSubscribeAndSave(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="subAndSave" className="flex-1 cursor-pointer select-none">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Subscribe & Save Extra 10% (Automated Delivery Every 30 Days)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Never run out of essential tech & accessories. Pause, change cadence, or cancel anytime with 1 click in your Account Hub.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Saves ₹{Math.round(grandTotal * 0.10).toLocaleString('en-IN')} instantly on this order
                  </span>
                </label>
              </div>

              {/* Gift Option */}
              <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/30 space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="giftWrap"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-pink-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="giftWrap" className="flex-1 cursor-pointer select-none">
                    <div className="flex items-center gap-1.5 font-bold text-pink-300 text-xs">
                      <Gift className="w-4 h-4 text-pink-400" />
                      <span>This is a Gift (Add Premium Gift Box & Personalized Greeting Note)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Prices are hidden from physical packaging and an elegant greeting card is attached.
                    </p>
                  </label>
                </div>

                {isGift && (
                  <div className="pt-2 pl-7">
                    <input
                      type="text"
                      placeholder="Add personal greeting message..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}
              </div>

              {/* One-Click Eco-Checkout Option */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="ecoPackaging"
                  checked={isEcoPackaging}
                  onChange={(e) => setIsEcoPackaging(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="ecoPackaging" className="flex-1 cursor-pointer select-none">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span>Consolidate into 1 Box / Plastic-Free Packaging</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    100% biodegradable corrugated boxes with zero single-use plastic tape. Better for the planet, zero packaging waste.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Earns +50 Bonus Loyalty Coins for Sustainable Shopping</span>
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back to Address
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <span>Continue to FinTech Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ADVANCED FINTECH PAYMENT SUITE */}
          {activeStep === 3 && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5 text-white font-bold">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>3. Instant FinTech Payment Suite</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>

              {/* LOYALTY REWARDS REDEMPTION BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Redeem ShopEase Reward Coins</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500 text-slate-950">
                          1 COIN = ₹1
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        You have <strong className="text-amber-400 font-bold">{rewardsCoins} Coins</strong> available.
                        {rewardsCoins > 0 ? (
                          <span> Toggle to save <strong className="text-white">₹{maxRedeemableCoins}</strong> immediately.</span>
                        ) : (
                          <span> Earn coins automatically on this order!</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {rewardsCoins > 0 && (
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={redeemCoinsToggle}
                        onChange={(e) => setRedeemCoinsToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                    </label>
                  )}
                </div>

                {redeemCoinsToggle && (
                  <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span>Loyalty Coins Discount Applied:</span>
                    <span>- ₹{coinsDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* PAYMENT METHODS LIST */}
              <div className="space-y-3">
                {/* BNPL. ShopEase Pay Later (0% EMI / 30-Day Credit) */}
                <div
                  onClick={() => setPaymentMethod('PayLater')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'PayLater'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-white">ShopEase Pay Later (BNPL)</strong>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Pre-Approved
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Available Credit: <strong className="text-purple-300 font-mono">₹{payLaterCredit.available.toLocaleString('en-IN')}</strong> • Repay after 30 days at 0% interest
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'PayLater'}
                      onChange={() => setPaymentMethod('PayLater')}
                      className="text-purple-600"
                    />
                  </div>

                  {paymentMethod === 'PayLater' && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-300">
                      <span>✓ 1-Click Zero Interest Credit Line checkout</span>
                      <span className="font-bold">Due in 30 days</span>
                    </div>
                  )}
                </div>

                {/* 1. Pay via ShopEase Wallet */}
                <div
                  onClick={() => setPaymentMethod('Wallet')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Wallet'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-white">Pay via ShopEase Wallet</strong>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            1-Click Fast
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Available Balance: <strong className="text-indigo-300 font-mono">₹{walletBalance.toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'Wallet'}
                      onChange={() => setPaymentMethod('Wallet')}
                      className="text-indigo-600"
                    />
                  </div>

                  {paymentMethod === 'Wallet' && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      {walletBalance >= finalTotalAmount ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Sufficient Balance — Instant 1-Click Checkout Enabled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-400">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            Shortfall of ₹{(finalTotalAmount - walletBalance).toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowQuickAdd(!showQuickAdd);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]"
                          >
                            + Quick Top Up
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Quick Add Money for Wallet */}
                  {paymentMethod === 'Wallet' && showQuickAdd && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">Quick Top Up</span>
                        <span className="text-[10px] text-slate-400">Instant UPI Float</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[1000, 2000, 5000].map((amt) => (
                          <button
                            type="button"
                            key={amt}
                            onClick={() => setQuickAddAmount(amt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              quickAddAmount === amt ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-300'
                            }`}
                          >
                            +₹{amt}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={handleQuickAddMoney}
                          disabled={quickAddLoading}
                          className="px-4 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white ml-auto"
                        >
                          {quickAddLoading ? 'Adding...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Scan & Pay (Dynamic UPI QR Code) */}
                <div
                  onClick={() => setPaymentMethod('QR_CODE')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'QR_CODE'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-white">Scan & Pay (Dynamic UPI QR Code)</strong>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Live Scanner
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Scan using GPay, PhonePe, Paytm, or BHIM app
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'QR_CODE'}
                      onChange={() => setPaymentMethod('QR_CODE')}
                      className="text-indigo-600"
                    />
                  </div>

                  {/* QR Code Dynamic Panel */}
                  {paymentMethod === 'QR_CODE' && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                        {/* High Fidelity Dynamic SVG QR Code */}
                        <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
                          <svg className="w-36 h-36" viewBox="0 0 120 120">
                            {/* QR Finder Patterns */}
                            <rect x="0" y="0" width="35" height="35" rx="4" fill="#0f172a" />
                            <rect x="5" y="5" width="25" height="25" rx="2" fill="#ffffff" />
                            <rect x="10" y="10" width="15" height="15" rx="1" fill="#0f172a" />

                            <rect x="85" y="0" width="35" height="35" rx="4" fill="#0f172a" />
                            <rect x="90" y="5" width="25" height="25" rx="2" fill="#ffffff" />
                            <rect x="95" y="10" width="15" height="15" rx="1" fill="#0f172a" />

                            <rect x="0" y="85" width="35" height="35" rx="4" fill="#0f172a" />
                            <rect x="5" y="90" width="25" height="25" rx="2" fill="#ffffff" />
                            <rect x="10" y="95" width="15" height="15" rx="1" fill="#0f172a" />

                            {/* Center Logo Placeholder */}
                            <rect x="45" y="45" width="30" height="30" rx="6" fill="#4f46e5" />
                            <text x="60" y="64" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
                              ₹
                            </text>

                            {/* Simulated QR Data Matrix Blocks */}
                            <rect x="40" y="10" width="6" height="6" fill="#0f172a" />
                            <rect x="50" y="10" width="6" height="6" fill="#0f172a" />
                            <rect x="65" y="10" width="6" height="6" fill="#0f172a" />
                            <rect x="45" y="25" width="6" height="6" fill="#0f172a" />
                            <rect x="60" y="25" width="6" height="6" fill="#0f172a" />
                            <rect x="70" y="20" width="6" height="6" fill="#0f172a" />
                            <rect x="10" y="45" width="6" height="6" fill="#0f172a" />
                            <rect x="25" y="55" width="6" height="6" fill="#0f172a" />
                            <rect x="15" y="70" width="6" height="6" fill="#0f172a" />
                            <rect x="85" y="50" width="6" height="6" fill="#0f172a" />
                            <rect x="100" y="65" width="6" height="6" fill="#0f172a" />
                            <rect x="90" y="80" width="6" height="6" fill="#0f172a" />
                            <rect x="45" y="85" width="6" height="6" fill="#0f172a" />
                            <rect x="65" y="95" width="6" height="6" fill="#0f172a" />
                            <rect x="55" y="105" width="6" height="6" fill="#0f172a" />
                            <rect x="75" y="100" width="6" height="6" fill="#0f172a" />
                          </svg>
                          <span className="text-[10px] font-black text-slate-900 tracking-wider mt-1">
                            UPI AUTO-PAY
                          </span>
                        </div>

                        {/* QR Details & Actions */}
                        <div className="flex-1 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">UPI Handle:</span>
                            <button
                              type="button"
                              onClick={handleCopyUpiHandle}
                              className="font-mono text-indigo-300 font-bold flex items-center gap-1 hover:text-white"
                            >
                              <span>shopease@okaxis</span>
                              {copiedUpi ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Payable Amount:</span>
                            <span className="text-white font-black text-sm">
                              ₹{finalTotalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* 3-Minute Countdown */}
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>QR Expires In:</span>
                            </span>
                            <span className="font-mono font-black text-amber-400 text-sm">
                              {formatTime(qrCountdown)}
                            </span>
                          </div>

                          {/* Interactive Simulate QR Payment Button */}
                          <button
                            type="button"
                            onClick={handleSimulateQrPayment}
                            disabled={isSimulatingQrPayment}
                            className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                            {isSimulatingQrPayment ? (
                              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Simulate Successful UPI App Payment</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Cash on Delivery (COD) with ₹40 Fee */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-white">Cash on Delivery (COD)</strong>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            +₹40 Handling Fee
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Pay cash or UPI scan at your doorstep upon arrival
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-indigo-600"
                    />
                  </div>
                </div>

                {/* 4. Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white">Credit / Debit Card</strong>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Visa, MasterCard, RuPay, Amex
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'Card'}
                      onChange={() => setPaymentMethod('Card')}
                      className="text-indigo-600"
                    />
                  </div>
                </div>

                {/* 5. NetBanking */}
                <div
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'NetBanking'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white">NetBanking</strong>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          All major Indian banks (HDFC, ICICI, SBI, Axis)
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'NetBanking'}
                      onChange={() => setPaymentMethod('NetBanking')}
                      className="text-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back to Speed
                </button>

                {paymentMethod !== 'QR_CODE' && (
                  <button
                    type="button"
                    onClick={() => executeOrderPlacement(paymentMethod)}
                    disabled={submitting || (paymentMethod === 'Wallet' && walletBalance < finalTotalAmount)}
                    className="px-8 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>
                          {paymentMethod === 'Wallet'
                            ? `Pay ₹${finalTotalAmount.toLocaleString('en-IN')} with Wallet`
                            : `Confirm & Place Order (₹${finalTotalAmount.toLocaleString('en-IN')})`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4 sticky top-28 text-xs">
            <h4 className="font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Order Items ({cartItems.length})</span>
              <span className="text-[11px] font-semibold text-indigo-400 font-mono">
                5% Cashback Active
              </span>
            </h4>

            <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
              {cartItems.map((item) => (
                <div key={item.product} className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="font-bold text-white">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Itemized Price Breakdown */}
            <div className="border-t border-slate-800 pt-3 space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Total MRP:</span>
                <span className="text-slate-200">₹{totalMRP.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Discount on MRP:</span>
                <span>- ₹{mrpSavings.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon ({appliedCoupon.code}):</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {redeemCoinsToggle && coinsDiscount > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>ShopEase Coins Redeemed:</span>
                  <span>- ₹{coinsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {isSubscribeAndSave && (
                <div className="flex justify-between text-indigo-400 font-semibold">
                  <span>Subscribe & Save (10% Off):</span>
                  <span>- ₹{Math.round(grandTotal * 0.10).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Platform Fee:</span>
                <span className="text-slate-200">₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="text-emerald-400 font-bold">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-amber-400">
                  <span>COD Handling Fee:</span>
                  <span>+ ₹40</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-black text-white">
                <span>Grand Total:</span>
                <span className="text-indigo-300">₹{finalTotalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* 5% Cashback Reward + Eco Bonus Projection */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 text-[11px] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-slate-300">
                You will earn <strong className="text-amber-400">+{totalCoinsEarned} ShopEase Coins</strong> on this order! {isEcoPackaging && <span className="text-emerald-400 font-semibold">(Includes +50 Eco-Packaging Bonus)</span>}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 text-center text-[10px] text-slate-500">
              Includes 18% Integrated GST • Official Tax Invoice issued upon checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
