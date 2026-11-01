import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ShoppingCart,
  Star,
  Check,
  Heart,
  TrendingDown,
  Lock,
  Bot,
  Scale,
  Zap,
  Sparkles,
  ShieldCheck,
  Leaf,
  Users,
  CreditCard,
} from 'lucide-react';

const ProductCard = ({
  product,
  onOpenDetail,
  onOpenPriceHistory,
  onOpenPriceLock,
  onOpenNegotiator,
  onOpenSquadBuy,
  onOpenEmiCalculator,
}) => {
  const {
    addToCart,
    cartItems,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    isPriceLocked,
  } = useCart();
  const { formatPrice } = useCurrency();

  const [addedAnimation, setAddedAnimation] = useState(false);

  const cartItem = cartItems.find((i) => i.product === product._id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = inCartQty >= product.stock;

  const wished = isInWishlist(product._id);
  const compared = isInCompare(product._id);
  const priceLock = isPriceLocked(product._id);

  // Discount percentage
  const mrp = product.mrp || Math.round(product.price * 1.25);
  const discountPercent = Math.max(1, Math.round(((mrp - product.price) / mrp) * 100));

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group rounded-2xl glass-card overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer relative"
    >
      {/* Top Image Section */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Floating Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
            wished
              ? 'bg-rose-500/90 text-white'
              : 'bg-slate-950/70 text-slate-400 hover:text-rose-400 border border-slate-700/60'
          }`}
          title={wished ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${wished ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500 text-slate-950 uppercase tracking-wider shadow-sm">
            {discountPercent}% OFF
          </span>

          {product.isFlashDeal && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-sm">
              <Zap className="w-2.5 h-2.5 fill-current" />
              Flash Deal
            </span>
          )}
        </div>

        {/* Price Lock Indicator Badge */}
        {priceLock && (
          <div className="absolute bottom-2 left-2.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 flex items-center gap-1 backdrop-blur-md shadow-sm">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              Price Locked
            </span>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-bold text-indigo-400 uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
              <span className="text-slate-500 text-[10px]">({product.numReviews || 12})</span>
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Pricing Row with Multi-Currency */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base sm:text-lg font-black text-white">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-500 line-through">
              {formatPrice(mrp)}
            </span>
          </div>

          {/* Squad Buy & 0% EMI Quick Action Bar */}
          <div className="flex items-center gap-1.5 mt-2 text-[10px]">
            {onOpenSquadBuy && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSquadBuy(product);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-pink-950/50 hover:bg-pink-900/70 border border-pink-500/40 text-pink-300 hover:text-white transition-all font-semibold shadow-sm"
                title="Start or Join Squad Buy (15% OFF)"
              >
                <Users className="w-3 h-3 text-pink-400 shrink-0" />
                <span>Squad -15%</span>
              </button>
            )}
            {onOpenEmiCalculator && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmiCalculator(product);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-blue-300 hover:text-white transition-all font-semibold shadow-sm"
                title="0% No Cost EMI Calculator"
              >
                <CreditCard className="w-3 h-3 text-blue-400 shrink-0" />
                <span>0% EMI</span>
              </button>
            )}
          </div>

          {/* Zero-Dark-Pattern Transparency & Price Drop Protection Badges */}
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[10px] space-y-1">
            <div className="flex items-center gap-1 font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero Dark Patterns: 8% Margin • ₹0 Hidden Fees</span>
            </div>
            <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-emerald-500/10">
              <span className="flex items-center gap-1 text-emerald-400">
                <Leaf className="w-2.5 h-2.5" />
                <span>Plastic-Free Box</span>
              </span>
              <span className="text-indigo-300 font-semibold">
                🛡️ 7D Price-Drop Refund
              </span>
            </div>
          </div>
        </div>

        {/* Smart Innovation Quick-Action Pills */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPriceHistory(product);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
            title="Inspect 30-Day SVG Price History"
          >
            <TrendingDown className="w-3 h-3 text-indigo-400" />
            <span>30D Trend</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenNegotiator(product);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-950/70 border border-purple-500/30 text-purple-300 hover:text-white"
            title="Bargain with AI DealBot"
          >
            <Bot className="w-3 h-3 text-purple-400" />
            <span>Bargain</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPriceLock(product);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 text-amber-300 hover:text-white"
            title="Lock price for 48 hours"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Hold</span>
          </button>
        </div>

        {/* Bottom Compare Checkbox & Add to Cart */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <label
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={compared}
              onChange={() => toggleCompare(product)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span>Compare</span>
          </label>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxInCart}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              addedAnimation
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : isOutOfStock || isMaxInCart
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
