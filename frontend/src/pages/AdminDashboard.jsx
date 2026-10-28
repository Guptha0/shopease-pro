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
  ExternalLink,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

  // KPI Data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderUpdatingId, setOrderUpdatingId] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: 10,
    imageUrl: '',
    rating: 4.5,
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Notification Banner
  const [statusNotice, setStatusNotice] = useState(null);

  const showNotice = (msg, isError = false) => {
    setStatusNotice({ text: msg, isError });
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Fetch KPI Stats
  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/orders/admin/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch admin stats:', err.message);
    }
  };

  // Fetch All Products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await apiClient.get('/products');
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      showNotice('Failed to load products: ' + err.message, true);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch All Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await apiClient.get('/orders');
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      showNotice('Failed to load orders: ' + err.message, true);
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

  // Handle Order Status Change (PATCH /api/orders/:id/status)
  const handleStatusChange = async (orderId, newStatus) => {
    setOrderUpdatingId(orderId);
    try {
      const res = await apiClient.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      if (res.data?.success) {
        // Update local orders list immediately
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
        showNotice(`Order status updated to "${newStatus}"`);
        fetchStats(); // Update revenue & stats
      }
    } catch (err) {
      showNotice(err.message || 'Failed to update order status', true);
    } finally {
      setOrderUpdatingId(null);
    }
  };

  // Product Form Open (Add)
  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      rating: 4.8,
    });
    setFormError('');
    setShowAddModal(true);
  };

  // Product Form Open (Edit)
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl,
      rating: product.rating || 4.5,
    });
    setFormError('');
  };

  // Handle Product Create / Update Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.description || !formData.price || !formData.imageUrl) {
      setFormError('Please fill out all required fields');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingProduct) {
        // PUT /api/products/:id
        const res = await apiClient.put(`/products/${editingProduct._id}`, formData);
        if (res.data?.success) {
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data.product : p))
          );
          setEditingProduct(null);
          showNotice(`Product "${formData.name}" updated successfully`);
        }
      } else {
        // POST /api/products
        const res = await apiClient.post('/products', formData);
        if (res.data?.success) {
          setProducts((prev) => [res.data.product, ...prev]);
          setShowAddModal(false);
          showNotice(`Product "${formData.name}" created successfully`);
        }
      }
      fetchStats();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Product Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      const res = await apiClient.delete(`/products/${deletingProduct._id}`);
      if (res.data?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
        showNotice(`Product "${deletingProduct.name}" removed from catalog`);
        setDeletingProduct(null);
        fetchStats();
      }
    } catch (err) {
      showNotice(err.message || 'Failed to delete product', true);
    }
  };

  // Filtered products for search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="p-8 rounded-3xl glass-card border border-rose-500/20">
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-xs text-slate-400 mb-6">
            You must be logged in as an Administrator (`admin@store.com`) to access management controls.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Administrator Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time catalog CRUD, live order dispatch tracking, and financial analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchProducts();
              fetchOrders();
              showNotice('Dashboard refreshed');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {statusNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 shadow-xl ${
            statusNotice.isError
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotice.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
          <button onClick={() => setStatusNotice(null)}>
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Total Revenue
            </span>
            <span className="text-2xl font-black text-white">
              ${stats.totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Total Orders
            </span>
            <span className="text-2xl font-black text-white">
              {stats.totalOrders}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Active Catalog
            </span>
            <span className="text-2xl font-black text-white">
              {stats.totalProducts}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Count */}
        <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Low Stock Alert (&lt;5)
            </span>
            <span className={`text-2xl font-black ${stats.lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {stats.lowStockCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Management ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Customer Orders ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="rounded-3xl glass-card overflow-hidden border border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock Status</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {productsLoading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                        Loading products catalog...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No products match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
                            />
                            <div className="max-w-xs">
                              <p className="font-bold text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900 border border-slate-700 text-indigo-300">
                            {product.category}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-extrabold text-white text-sm">
                          ${product.price.toFixed(2)}
                        </td>

                        <td className="py-4 px-6">
                          {product.stock <= 0 ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
                              0 (Out of Stock)
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                              {product.stock} units (Low)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                              {product.stock} units
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-slate-300 font-semibold">
                          ★ {product.rating ? product.rating.toFixed(1) : '4.5'}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40 transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="rounded-3xl glass-card overflow-hidden border border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-4 px-6">Tracking / Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Items Purchased</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ordersLoading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                        Loading customer orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No customer orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-indigo-300 block">
                            {order.trackingNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: {order._id.slice(-6)} •{' '}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-bold text-white">
                            {order.user?.name || order.shippingAddress?.fullName || 'Guest Customer'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {order.user?.email || 'No email provided'}
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-200">
                              {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                            </span>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {order.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-extrabold text-white text-sm">
                          ${order.totalAmount.toFixed(2)}
                        </td>

                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                            {order.paymentMethod}
                          </span>
                        </td>

                        {/* Interactive Status Dropdown */}
                        <td className="py-4 px-6">
                          <div className="relative inline-block w-40">
                            <select
                              value={order.orderStatus}
                              disabled={orderUpdatingId === order._id}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              className={`w-full text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none transition-all cursor-pointer ${
                                order.orderStatus === 'Delivered'
                                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                                  : order.orderStatus === 'Shipped' || order.orderStatus === 'Out for Delivery'
                                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                                  : order.orderStatus === 'Cancelled'
                                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                                  : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            {orderUpdatingId === order._id && (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative animate-fadeIn">
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
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              {editingProduct
                ? 'Update catalog item details, inventory counts, or pricing'
                : 'Enter item attributes to publish to the customer storefront'}
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Image URL (Unsplash or CDN) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  {formSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : editingProduct ? (
                    'Save Changes'
                  ) : (
                    'Publish Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete Product</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently remove "{deletingProduct.name}" from the store catalog?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
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

export default AdminDashboard;
