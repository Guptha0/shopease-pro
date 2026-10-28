import React from 'react';
import { CheckCircle2, Download, Printer, X, Package, ShieldCheck, MapPin } from 'lucide-react';

const InvoiceModal = ({ order, onClose, onTrackOrder }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Top Header */}
        <div className="border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                SE
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">ShopEase Pro Retail Ltd.</h3>
                <p className="text-[10px] text-slate-400">GSTIN: 29AABCS1429B1Z8 • Bengaluru Mega Hub</p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase">
                Tax Invoice • Paid
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Order #{order._id?.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking & Courier Info */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Courier Partner & Airway Bill:</span>
            <strong className="text-indigo-300 font-mono text-sm">
              {order.courierPartner || 'BlueDart Express'} • {order.trackingNumber}
            </strong>
          </div>
          <div className="sm:text-right">
            <span className="text-slate-400 text-[11px] block">Order Timestamp:</span>
            <span className="text-slate-200">
              {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        {/* Customer Address Details */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
              Billed To:
            </span>
            <p className="font-bold text-white">{order.shippingAddress?.fullName}</p>
            <p className="text-slate-400 text-[11px]">{order.shippingAddress?.address}</p>
            <p className="text-slate-400 text-[11px]">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
            </p>
            <p className="text-slate-500 text-[11px]">Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="text-right">
            <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
              Payment Details:
            </span>
            <p className="text-slate-200 font-semibold">Mode: {order.paymentMethod || 'UPI'}</p>
            <p className="text-slate-400 text-[11px]">Delivery Speed: {order.deliverySpeed || 'Standard'}</p>
            <p className="text-emerald-400 text-[11px] font-medium">Status: {order.orderStatus}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden mb-6 text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Product Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {order.items?.map((item, idx) => (
                <tr key={idx} className="text-slate-200">
                  <td className="p-3 font-semibold">{item.name}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right font-mono">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-mono font-bold">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Calculations */}
        <div className="border-t border-slate-800 pt-4 space-y-1.5 text-xs text-right max-w-xs ml-auto mb-6">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Integrated GST (18% included):</span>
            <span>₹{Math.round(order.totalAmount * 0.18).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Delivery & Platform Fee:</span>
            <span className="text-emerald-400 font-bold">Paid</span>
          </div>
          <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
            <span>Grand Total:</span>
            <span className="text-indigo-300">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice</span>
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onTrackOrder();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
            >
              <Package className="w-4 h-4" />
              <span>Track Courier Milestone</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
