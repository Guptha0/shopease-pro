import React from 'react';
import { useCart } from '../context/CartContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, onProceedToCheckout }) => {
  const {
    cartItems,
    totalItemsCount,
    subtotal,
    shipping,
    tax,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isOpen) return null;

  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Cart</h2>
                <p className="text-xs text-slate-400">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                {amountToFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-indigo-300">${amountToFreeShipping.toFixed(2)}</strong> for Free Shipping
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Unlocked Free Shipping!
                  </span>
                )}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {freeShippingProgress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Explore our curated products and add items to your cart.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product}
                  className="flex gap-4 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 transition-all"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-18 h-18 rounded-lg object-cover bg-slate-950 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product)}
                          className="text-slate-400 hover:text-rose-400 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-indigo-400 font-medium">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.product, item.quantity - 1)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-100 min-w-4 text-center">
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
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-200">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-200">
                    {shipping === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-200">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-black text-indigo-300 text-base">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
