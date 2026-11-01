import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNotifications } from '../context/NotificationContext';
import {
  RotateCcw,
  Package,
  Truck,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const REASON_OPTIONS = [
  'Damaged packaging during transit',
  'Defective item / does not power on',
  'Wrong size / model delivered',
  'Item not as described on storefront',
  'Missing cables / accessories',
  'Performance not matching expectations',
];

const ReturnModal = ({ order, isOpen, onClose, onSuccess }) => {
  const { triggerNotification } = useNotifications();

  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [resolution, setResolution] = useState('Instant Wallet Refund'); // 'Instant Wallet Refund' | 'Replacement'
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const items = order.items || [];
  const activeItem = items[selectedItemIdx] || items[0] || {};
  const refundAmount = activeItem ? activeItem.price * (activeItem.quantity || 1) : order.totalAmount;

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const returnData = {
        orderId: order._id,
        orderTracking: order.trackingNumber,
        items: [activeItem],
        reason: customNotes ? `${reason} - ${customNotes}` : reason,
        resolution,
        imageUrl: photoUrl,
        refundAmount,
        pickupAddress: order.shippingAddress,
      };

      const res = await apiClient.post('/returns', returnData);

      if (res.data?.success) {
        const ret = res.data.returnRequest;
        setSuccessResult(ret);

        // Trigger SMS notification simulator
        triggerNotification({
          channel: 'SMS',
          type: 'order',
          title: 'Return Pickup Scheduled',
          message: `Return #${ret.returnId} confirmed for order #${order.trackingNumber}. BlueDart doorstep reverse pickup scheduled. Track return live: shopease.pro/account`,
          orderId: ret.returnId,
        });

        if (onSuccess) onSuccess(ret);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl glass-panel border border-slate-800 p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Return or Replace Item</h3>
              <p className="text-[10px] text-slate-400">
                Order #{order.trackingNumber} • 7-Day Hassle-Free Returns
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successResult ? (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-white">Return Request Scheduled!</h4>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Return ID:</span>
                <span className="font-mono font-bold text-indigo-400">{successResult.returnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution:</span>
                <span className="font-bold text-emerald-400">{successResult.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Refund Value:</span>
                <span className="font-bold text-white">₹{Number(successResult.refundAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doorstep Pickup:</span>
                <span className="text-slate-200">Scheduled within 24–48 Hours</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Upon pickup verification, ₹{Number(successResult.refundAmount).toLocaleString('en-IN')} will be auto-credited to your ShopEase Wallet.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Done & View Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Item to Return */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Select Item to Return
              </label>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={item.product || idx}
                    onClick={() => setSelectedItemIdx(idx)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedItemIdx === idx
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold truncate text-xs">{item.name}</p>
                        <span className="text-[10px] text-slate-400">
                          Qty: {item.quantity || 1} • ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-indigo-300 shrink-0 ml-2">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reason for Return *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                {REASON_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional details */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Specific issue details (optional)
              </label>
              <textarea
                rows="2"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Device does not charge when connected to power adapter..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs resize-none"
              />
            </div>

            {/* Preferred Resolution */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Preferred Resolution
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setResolution('Instant Wallet Refund')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    resolution === 'Instant Wallet Refund'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">Instant Wallet Refund</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Auto-credited to your ShopEase Wallet upon pickup. Zero wait time.
                  </p>
                </div>

                <div
                  onClick={() => setResolution('Replacement')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    resolution === 'Replacement'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-white">Replacement Unit</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    A brand new unit will be dispatched via Prime Express upon pickup.
                  </p>
                </div>
              </div>
            </div>

            {/* Proof Photo Simulator */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Upload Photo Proof (Simulated Verification)
              </label>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <img
                  src={photoUrl}
                  alt="Return proof"
                  className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                />
                <div className="flex-1 text-[11px] text-slate-400">
                  <span className="text-white font-medium block">damage_inspect_01.jpg</span>
                  <span className="text-emerald-400 text-[10px]">Photo verified by AI Quality Inspector</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrl('https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80')
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800"
                >
                  Switch Photo
                </button>
              </div>
            </div>

            {/* Pickup Address Notice */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-semibold block">
                  Pickup Location: {order.shippingAddress?.address}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                </span>
                <span>Our courier executive will verify the package seal at doorstep.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all active:scale-95"
              >
                {submitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                ) : (
                  <>
                    <span>Submit Return Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReturnModal;

