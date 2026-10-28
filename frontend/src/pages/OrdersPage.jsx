import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Search,
  FileText,
  XCircle,
  AlertCircle,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

const COURIER_STAGES = [
  'Order Placed',
  'Packed at Bengaluru Fulfillment Hub',
  'Shipped via BlueDart Express',
  'Out for Delivery',
  'Delivered',
];

const OrdersPage = ({ onExplore, onViewInvoice }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'On the Way' | 'Delivered' | 'Cancelled'

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/orders/my-orders');
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: 'Cancelled' });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o))
      );
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    }
  };

  // Determine stage progression index
  const getStageIndex = (status) => {
    if (status === 'Cancelled') return -1;
    if (status === 'Order Placed') return 0;
    if (status === 'Packed') return 1;
    if (status === 'Shipped') return 2;
    if (status === 'Out for Delivery') return 3;
    if (status === 'Delivered') return 4;
    return 0;
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'All') return true;
    if (filterTab === 'Delivered') return order.orderStatus === 'Delivered';
    if (filterTab === 'Cancelled') return order.orderStatus === 'Cancelled';
    if (filterTab === 'On the Way') {
      return (
        order.orderStatus === 'Order Placed' ||
        order.orderStatus === 'Packed' ||
        order.orderStatus === 'Shipped' ||
        order.orderStatus === 'Out for Delivery'
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-400" />
            <span>My Orders & Real-Time Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track live BlueDart courier dispatch milestones and download tax invoices
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {['All', 'On the Way', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                filterTab === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Order ID, Tracking, Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-8 rounded-3xl glass-card animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-1/3" />
              <div className="h-16 bg-slate-800/60 rounded-2xl" />
              <div className="h-24 bg-slate-800/40 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center border border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">No Orders Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            You don't have any orders matching the current filter.
          </p>
          <button
            onClick={onExplore}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
          >
            Explore Store Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => {
            const currentStage = getStageIndex(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled';

            return (
              <div
                key={order._id}
                className="rounded-3xl glass-card p-6 sm:p-8 space-y-6 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Airway Bill / Tracking */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-400">Airway Bill:</span>
                      <button
                        onClick={() => handleCopy(order.trackingNumber)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-xs hover:border-indigo-500/60"
                        title="Copy Courier Tracking Code"
                      >
                        <span>{order.trackingNumber}</span>
                        {copiedCode === order.trackingNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </button>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        ({order.courierPartner || 'BlueDart Express'})
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                    <span
                      className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider inline-block ${
                        isCancelled
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                          : order.orderStatus === 'Delivered'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-base sm:text-lg font-black text-white mt-1">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* 5-STAGE LIVE COURIER TIMELINE STEPPER */}
                {isCancelled ? (
                  <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Order was cancelled. Any inventory reserved was returned to store stock.</span>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="relative">
                      {/* Connecting Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />

                      {/* 5 Nodes */}
                      <div className="grid grid-cols-5 relative z-10">
                        {COURIER_STAGES.map((stage, idx) => {
                          const isDone = idx < currentStage;
                          const isNow = idx === currentStage;

                          return (
                            <div
                              key={stage}
                              className="flex flex-col items-center text-center group px-1"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/30'
                                    : isNow
                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30 shadow-lg shadow-indigo-600/40 animate-pulse'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                              >
                                {isDone ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : isNow ? (
                                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                ) : (
                                  <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                                )}
                              </div>

                              <span
                                className={`mt-2 text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2 ${
                                  isDone
                                    ? 'text-emerald-300'
                                    : isNow
                                    ? 'text-indigo-300 font-extrabold'
                                    : 'text-slate-500'
                                }`}
                              >
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Items and Delivery Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="md:col-span-2 space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Ordered Products ({order.items?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-400">
                              Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <span className="font-extrabold text-slate-200">
                            ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Shipping Details */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Delivery Address</span>
                      </h4>
                      <p className="font-bold text-white">{order.shippingAddress?.fullName}</p>
                      <p className="text-slate-400 text-[11px]">{order.shippingAddress?.address}</p>
                      <p className="text-slate-400 text-[11px]">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => onViewInvoice(order)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Download Tax Invoice</span>
                      </button>

                      {!isCancelled && order.orderStatus !== 'Delivered' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="w-full py-1.5 rounded-xl text-rose-400 hover:text-rose-300 text-center text-[11px] font-medium"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
