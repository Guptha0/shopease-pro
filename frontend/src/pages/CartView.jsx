import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  Trash2,
  Bookmark,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Tag,
  Check,
  Bot,
  Sparkles,
  Lock,
} from 'lucide-react';

const CartView = ({ onProceedToCheckout, onOpenNegotiator, onExplore }) => {
  const {
    cartItems,
    savedForLater,
    totalItemsCount,
    totalMRP,
    totalPrice,
    mrpSavings,
    couponDiscount,
    platformFee,
    deliveryCharge,
    grandTotal,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    moveToSaveForLater,
    moveToCart,
    removeFromSaveForLater,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput.trim());
    if (ok) setCouponInput('');
  };

  const totalSaved = mrpSavings + couponDiscount;

  if (cartItems.length === 0 && savedForLater.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="p-12 rounded-3xl glass-card border border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            Explore our verified tech catalog, compare specs, or negotiate an exclusive deal with DealBot!
          </p>
          <button
            onClick={onExplore}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Shopping Cart ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your items, apply vouchers, or move products to Save-for-Later
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items & Save for Later */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Cart Items */}
          <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Selected Products</span>
              {cartItems.length > 0 && (
                <button
                  onClick={() => onOpenNegotiator(null)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900/40"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>Bargain Cart with DealBot</span>
                </button>
              )}
            </h3>

            {cartItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No active items in cart. Check your "Saved for Later" section below.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {cartItems.map((item) => (
                  <div key={item.product} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-950 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {item.name}
                          </h4>
                          <span className="font-black text-sm text-white shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {item.brand} • {item.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-indigo-300">
                            ₹{item.price.toLocaleString('en-IN')} each
                          </span>
                          <span className="text-[11px] text-slate-500 line-through">
                            ₹{(item.mrp || item.price * 1.25).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between gap-3 pt-3">
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity - 1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className={`transition-colors ${
                              item.quantity >= item.stock
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <button
                            onClick={() => moveToSaveForLater(item.product)}
                            className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save for Later</span>
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product)}
                            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amazon/Flipkart SAVE FOR LATER SECTION */}
          {savedForLater.length > 0 && (
            <div className="rounded-3xl glass-card p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Saved for Later ({savedForLater.length})</span>
                <span className="text-[11px] text-slate-400">
                  Items reserved for your future purchase
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedForLater.map((item) => (
                  <div
                    key={item.product}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 text-xs"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white truncate">{item.name}</h4>
                        <span className="font-extrabold text-indigo-300 block">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => moveToCart(item.product)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeFromSaveForLater(item.product)}
                          className="text-slate-500 hover:text-rose-400 text-[11px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price Details & Coupon Applicator */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Section */}
          <div className="p-5 rounded-3xl glass-card border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Coupons & Discount Vouchers</span>
            </h4>

            {appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-emerald-400">
                    {appliedCoupon.code}
                  </span>
                  <p className="text-[10px] text-emerald-300">{appliedCoupon.note}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-slate-400 hover:text-rose-400"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Apply
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Try: <code className="text-indigo-300">WELCOME10</code> or <code className="text-indigo-300">TECHORBIT20</code></span>
              <button
                onClick={() => onOpenNegotiator(null)}
                className="text-purple-400 hover:text-purple-300 font-bold"
              >
                Bargain Code ✨
              </button>
            </div>
          </div>

          {/* Granular Price Breakdown */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">
              Price Details ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
            </h4>

            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span className="text-slate-200 font-medium">
                  ₹{totalMRP.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-emerald-400">
                <span>Discount on MRP</span>
                <span className="font-bold">
                  - ₹{mrpSavings.toLocaleString('en-IN')}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Savings ({appliedCoupon.code})</span>
                  <span className="font-bold">
                    - ₹{couponDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Platform Convenience Fee</span>
                <span className="text-slate-200 font-medium">₹{platformFee}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-emerald-400 font-bold">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-base">
                <span className="font-bold text-white">Total Amount</span>
                <span className="font-black text-indigo-300 text-lg">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {totalSaved > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold text-center">
                🎉 You will save ₹{totalSaved.toLocaleString('en-IN')} on this order!
              </div>
            )}

            <button
              onClick={onProceedToCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Safe and Secure Payments • 100% Authentic Products</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
