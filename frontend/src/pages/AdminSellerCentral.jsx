import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Flame,
  Tag,
  TrendingUp,
} from 'lucide-react';

const AdminSellerCentral = () => {
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders' | 'deals'

  // KPI Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState('');

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Apple',
    category: 'Mobiles & Tablets',
    description: '',
    mrp: '',
    price: '',
    stock: 15,
    imageUrl: '',
    isFlashDeal: false,
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotice = (msg, isErr = false) => {
    setNotice({ msg, isErr });
    setTimeout(() => setNotice(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/orders/admin/stats');
      if (res.data?.success) setStats(res.data.stats);
    } catch (err) {
      console.warn('Failed stats fetch:', err);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await apiClient.get('/products');
      if (res.data?.success) setProducts(res.data.products);
    } catch (err) {
      showNotice(err.message, true);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await apiClient.get('/orders');
      if (res.data?.success) setOrders(res.data.orders);
    } catch (err) {
      showNotice(err.message, true);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  // Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
        showNotice(`Order status changed to "${newStatus}"`);
        fetchStats();
      }
    } catch (err) {
      showNotice(err.message || 'Status update failed', true);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle Flash Deal
  const handleToggleFlashDeal = async (product) => {
    try {
      const updatedDeal = !product.isFlashDeal;
      await apiClient.put(`/products/${product._id}`, { isFlashDeal: updatedDeal });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isFlashDeal: updatedDeal } : p))
      );
      showNotice(`Flash Deal ${updatedDeal ? 'Activated' : 'Deactivated'} for ${product.name}`);
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  // Open Add Product
  const openAdd = () => {
    setFormData({
      name: '',
      brand: 'Apple',
      category: 'Mobiles & Tablets',
      description: '',
      mrp: '',
      price: '',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      isFlashDeal: false,
    });
    setFormError('');
    setShowAddModal(true);
  };

  // Open Edit Product
  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || 'Apple',
      category: product.category,
      description: product.description,
      mrp: product.mrp,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isFlashDeal: product.isFlashDeal || false,
    });
    setFormError('');
  };

  // Submit Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.price || !formData.imageUrl) {
      setFormError('Please fill out all required fields');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingProduct) {
        const res = await apiClient.put(`/products/${editingProduct._id}`, formData);
        if (res.data?.success) {
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data.product : p))
          );
          setEditingProduct(null);
          showNotice(`Product updated successfully`);
        }
      } else {
        const res = await apiClient.post('/products', formData);
        if (res.data?.success) {
          setProducts((prev) => [res.data.product, ...prev]);
          setShowAddModal(false);
          showNotice(`New product added to catalog`);
        }
      }
      fetchStats();
    } catch (err) {
      setFormError(err.message || 'Product operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await apiClient.delete(`/products/${deletingProduct._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setDeletingProduct(null);
      showNotice(`Product removed from catalog`);
      fetchStats();
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="p-8 rounded-3xl glass-card border border-rose-500/20">
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Seller Central Access Restricted</h2>
          <p className="text-xs text-slate-400 mb-6">
            Please log in with an Administrator account (`admin@shopease.com`) to manage inventory and fulfillment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Seller Central Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enterprise merchant portal for inventory replenishment, BlueDart courier dispatch, and promotions
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchProducts();
            fetchOrders();
            showNotice('Seller Central Refreshed');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 shadow-xl ${
            notice.isErr
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.isErr ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{notice.msg}</span>
          </div>
          <button onClick={() => setNotice(null)}>
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Total GMV (Gross Revenue)
            </span>
            <span className="text-2xl font-black text-white">
              ₹{stats.totalRevenue?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Total Customer Orders
            </span>
            <span className="text-2xl font-black text-white">{stats.totalOrders}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Active Catalog SKUs
            </span>
            <span className="text-2xl font-black text-white">{products.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Low-Stock Warnings (&lt;5)
            </span>
            <span className={`text-2xl font-black ${stats.lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {stats.lowStockCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventory & Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Fulfillment & Dispatch ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
            activeTab === 'deals'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Flash Deals & Coupons</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search products by title, brand, category..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="rounded-3xl glass-card overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Brand / Category</th>
                    <th className="py-4 px-6">MRP / Sale Price</th>
                    <th className="py-4 px-6">Stock Status</th>
                    <th className="py-4 px-6">Deal Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {productsLoading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                        Loading catalog...
                      </td>
                    </tr>
                  ) : filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-800/30">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
                          />
                          <div className="max-w-xs">
                            <p className="font-bold text-white truncate">{p.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-semibold text-white">{p.brand}</p>
                        <span className="text-[10px] text-slate-400">{p.category}</span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-extrabold text-white text-sm">
                          ₹{p.price?.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-500 line-through">
                          MRP: ₹{p.mrp?.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {p.stock <= 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                            Out of Stock
                          </span>
                        ) : p.stock <= 5 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                            {p.stock} units (Low)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            {p.stock} units
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleFlashDeal(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            p.isFlashDeal
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{p.isFlashDeal ? 'Flash Deal' : 'Regular'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-300"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULFILLMENT & ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-3xl glass-card overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Airway Bill / Order</th>
                    <th className="py-4 px-6">Customer Details</th>
                    <th className="py-4 px-6">Items Count</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Courier Milestone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ordersLoading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-800/30">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-indigo-300 block">
                          {o.trackingNumber}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {o.courierPartner || 'BlueDart'} • ID: {o._id?.slice(-6)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-bold text-white">
                          {o.shippingAddress?.fullName || o.user?.name || 'Customer'}
                        </p>
                        <p className="text-[11px] text-slate-400">{o.shippingAddress?.city}</p>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {o.items?.reduce((a, i) => a + i.quantity, 0) || 1} items
                      </td>

                      <td className="py-4 px-6 font-extrabold text-white text-sm">
                        ₹{o.totalAmount?.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                          {o.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      {/* Real-time Status Dropdown */}
                      <td className="py-4 px-6">
                        <div className="relative inline-block w-44">
                          <select
                            value={o.orderStatus}
                            disabled={updatingOrderId === o._id}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className={`w-full text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none transition-all cursor-pointer ${
                              o.orderStatus === 'Delivered'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                : o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery'
                                ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                                : o.orderStatus === 'Cancelled'
                                ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                                : 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                            }`}
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packed">Packed at Hub</option>
                            <option value="Shipped">Shipped (In Transit)</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {updatingOrderId === o._id && (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white absolute right-2.5 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FLASH DEALS & PROMOTIONS */}
      {activeTab === 'deals' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Tag className="w-5 h-5" />
                <span>Active Coupon: WELCOME10</span>
              </div>
              <p className="text-xs text-slate-400">
                Grants 10% instant checkout discount across any order. Auto-applied for new customer onboarding.
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400">
                Status: LIVE
              </span>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Tag className="w-5 h-5" />
                <span>Active Coupon: TECHORBIT20</span>
              </div>
              <p className="text-xs text-slate-400">
                Grants 20% discount on orders exceeding ₹20,000 in Electronics & Gaming categories.
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400">
                Status: LIVE
              </span>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Flame className="w-5 h-5" />
                <span>DealBot™ AI Negotiator</span>
              </div>
              <p className="text-xs text-slate-400">
                Automated dynamic coupon generator giving 8% - 12% vouchers (e.g. DEALBOT-10) with 15-min expiry.
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400">
                Algorithm: ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="absolute right-6 top-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {editingProduct ? 'Edit Catalog Product' : 'Add New SKU to Store'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Configure product details, MRP, sale price, and category
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Mobiles & Tablets">Mobiles & Tablets</option>
                    <option value="Laptops & Gaming">Laptops & Gaming</option>
                    <option value="Audio & Wearables">Audio & Wearables</option>
                    <option value="Smart Electronics & IoT">Smart Electronics & IoT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stock Units *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="flashCheck"
                  checked={formData.isFlashDeal}
                  onChange={(e) => setFormData({ ...formData, isFlashDeal: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                />
                <label htmlFor="flashCheck" className="text-slate-300 font-medium cursor-pointer">
                  Tag as "Today's Flash Deal" (Appears on Flash Deals tab)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                >
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Delete Product</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove "{deletingProduct.name}" from the store catalog?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellerCentral;
