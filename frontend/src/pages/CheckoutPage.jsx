import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('rohan@okaxis');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handlePlaceOrder = async () => {
    if (!user) {
      onNavigateToAuth();
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
        paymentMethod,
        mrpTotal,
        discountAmount: mrpSavings + couponDiscount,
        couponCode: appliedCoupon?.code || '',
        platformFee,
        deliveryCharge,
        totalAmount: grandTotal,
      };

      const res = await apiClient.post('/orders', orderData);

      if (res.data?.success) {
        clearCart();
        onOrderPlaced(res.data.order);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
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
            { num: 3, title: 'Payment Method' },
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
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
          {error}
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
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {activeStep === 3 && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-bold">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>3. Select Payment Simulator</span>
              </div>

              <div className="space-y-3">
                {/* Instant UPI */}
                <label
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-indigo-400" />
                    <div>
                      <strong className="block text-xs">Instant UPI (GPay, PhonePe, Paytm, QR)</strong>
                      <span className="text-[10px] text-slate-400">Fastest one-click verification</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="text-indigo-600"
                  />
                </label>

                {/* Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <div>
                      <strong className="block text-xs">Credit / Debit Card</strong>
                      <span className="text-[10px] text-slate-400">Visa, MasterCard, RuPay, Amex</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'Card'}
                    onChange={() => setPaymentMethod('Card')}
                    className="text-indigo-600"
                  />
                </label>

                {/* NetBanking */}
                <label
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'NetBanking'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-emerald-400" />
                    <div>
                      <strong className="block text-xs">NetBanking</strong>
                      <span className="text-[10px] text-slate-400">All major Indian banks supported</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'NetBanking'}
                    onChange={() => setPaymentMethod('NetBanking')}
                    className="text-indigo-600"
                  />
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-amber-400" />
                    <div>
                      <strong className="block text-xs">Cash on Delivery (COD)</strong>
                      <span className="text-[10px] text-slate-400">Pay cash or UPI at your doorstep</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-indigo-600"
                  />
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back to Speed
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4 sticky top-28 text-xs">
            <h4 className="font-bold text-white border-b border-slate-800 pb-3">
              Order Items ({cartItems.length})
            </h4>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
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
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-black text-white">
                <span>Grand Total:</span>
                <span className="text-indigo-300">₹{grandTotal.toLocaleString('en-IN')}</span>
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
