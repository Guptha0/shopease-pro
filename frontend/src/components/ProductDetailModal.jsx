import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  TrendingDown,
  Lock,
  Bot,
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Sparkles,
  Send,
  CheckCircle2,
} from 'lucide-react';

const ProductDetailModal = ({
  product,
  onClose,
  onOpenPriceHistory,
  onOpenPriceLock,
  onOpenNegotiator,
}) => {
  const { addToCart, toggleWishlist, isInWishlist, deliveryPincode } = useCart();
  const { user } = useAuth();

  const [activeImage, setActiveImage] = useState(product?.imageUrl);
  const [reviews, setReviews] = useState(product?.reviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!product) return null;

  const wished = isInWishlist(product._id);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.imageUrl];
  const mrp = product.mrp || Math.round(product.price * 1.25);
  const savings = mrp - product.price;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      await apiClient.post(`/products/${product._id}/reviews`, {
        rating: newRating,
        comment: newComment,
      });
      const added = {
        name: user?.name || 'Verified Buyer',
        rating: Number(newRating),
        comment: newComment,
        createdAt: new Date().toISOString(),
      };
      setReviews([added, ...reviews]);
      setNewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.warn('Review submission error:', err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md shadow-md ${
                  wished
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-950/80 text-slate-400 hover:text-rose-400 border border-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-indigo-500 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* SmartSense™ Features Quick Bar */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SmartSense™ Shopping Suite Included</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onOpenPriceHistory(product)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-200 text-left flex items-center gap-2"
                >
                  <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-[11px]">30D Price Trend</strong>
                    <span className="text-[10px] text-slate-400">View price drops</span>
                  </div>
                </button>

                <button
                  onClick={() => onOpenNegotiator(product)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-200 text-left flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <strong className="block text-[11px]">DealBot Bargain</strong>
                    <span className="text-[10px] text-slate-400">Unlock 10% voucher</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs, Offers */}
          <div className="space-y-5 text-xs">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {product.brand} • {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 leading-snug">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                  ★ {product.rating ? product.rating.toFixed(1) : '4.5'}
                </div>
                <span className="text-slate-400 font-medium">
                  {product.numReviews || reviews.length} Ratings & Verified Reviews
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500 line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Save ₹{savings.toLocaleString('en-IN')} ({Math.round((savings / mrp) * 100)}% OFF)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Inclusive of all taxes + 1 Year Manufacturer Warranty</p>
            </div>

            {/* Bank & EMI Offers Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Available Bank & Card Offers</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                <li>
                  <strong className="text-slate-300">Bank Offer:</strong> 10% Instant Discount up to ₹1,500 on HDFC & SBI Bank Cards.
                </li>
                <li>
                  <strong className="text-slate-300">No Cost EMI:</strong> Available starting from ₹{Math.round(product.price / 12).toLocaleString('en-IN')}/month.
                </li>
                <li>
                  <strong className="text-slate-300">SmartSense™ Voucher:</strong> Use coupon <code className="text-indigo-300">WELCOME10</code> for an extra 10% off.
                </li>
              </ul>
            </div>

            {/* Delivery Pincode Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-300 font-bold block">
                    Delivery to Bengaluru ({deliveryPincode})
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Tomorrow by 9 PM with Prime Same-Day Express
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                FREE Delivery
              </span>
            </div>

            {/* Specifications Table */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Technical Specifications
                </h4>
                <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 p-2.5 text-[11px]">
                      <span className="text-slate-400 font-medium">{k}</span>
                      <span className="col-span-2 text-white font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  addToCart(product, 1);
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenPriceLock(product);
                }}
                className="px-4 py-3.5 rounded-2xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all flex items-center gap-1.5"
                title="Lock price for 48 hours"
              >
                <Lock className="w-4 h-4" />
                <span>48H Price-Lock</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 pt-8 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Customer Ratings & Verified Reviews</span>
              <span className="text-xs text-slate-400">({reviews.length})</span>
            </h3>
          </div>

          {/* Review List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{r.name}</span>
                  <div className="flex items-center text-amber-400 text-[11px] font-bold">
                    ★ {r.rating} / 5
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{r.comment}</p>
                <span className="text-[10px] text-slate-600 block">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Verified Purchase'}
                </span>
              </div>
            ))}
          </div>

          {/* Write a Review Form */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Submit a Verified Review</h4>
            {reviewSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you! Your review has been submitted and posted.</span>
              </div>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Your Rating:</span>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value={5}>5 ★ - Exceptional</option>
                  <option value={4}>4 ★ - Very Good</option>
                  <option value={3}>3 ★ - Average</option>
                  <option value={2}>2 ★ - Disappointing</option>
                  <option value={1}>1 ★ - Poor</option>
                </select>
              </div>

              <textarea
                rows="2"
                required
                placeholder="Share your experience regarding performance, packaging, and battery life..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Review</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
