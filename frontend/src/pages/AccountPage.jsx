import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import apiClient from '../api/apiClient';
import {
  User,
  Package,
  Wallet as WalletIcon,
  RotateCcw,
  MapPin,
  Heart,
  CreditCard,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Gift,
  ExternalLink,
  MessageSquare,
  Truck,
  Coins,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import ReturnModal from '../components/ReturnModal';

const AccountPage = ({ onExploreStore, onViewInvoice, onTrackOrder }) => {
  const { user } = useAuth();
  const { wishlist, savedForLater, moveToCart, removeFromWishlist, removeFromSaveForLater } = useCart();
  const { balance, rewardsCoins, transactions, addMoney, claimReferral, claimPriceDrop } = useWallet();
  const { triggerNotification } = useNotifications();
  const { formatPrice } = useCurrency();

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Returns State
  const [returns, setReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(true);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  // Support Tickets State
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Pay Later State
  const [payLater, setPayLater] = useState({
    creditLimit: 25000,
    availableCredit: 21500,
    usedCredit: 3500,
    dues: [
      {
        id: 'DUE-9842',
        orderId: 'TRK-BD8921KA',
        amount: 3500,
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        isPaid: false,
      },
    ],
  });
  const [repayingDueId, setRepayingDueId] = useState(null);

  // Subscriptions State
  const [subscriptionsList, setSubscriptionsList] = useState([
    {
      id: 'SUB-1029',
      productName: 'Raspberry Pi 5 8GB RAM AI Starter Kit',
      originalPrice: 8499,
      discountedPrice: 7649, // 10% off
      intervalDays: 30,
      nextDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    },
  ]);

  // Gift Cards State
  const [giftCardsList, setGiftCardsList] = useState([
    {
      code: 'GFT-8492-TECH',
      amount: 1500,
      senderName: 'ShopEase VIP Rewards',
      theme: 'Tech Geek',
      isRedeemed: true,
      redeemedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      code: 'GFT-2026-FEST',
      amount: 500,
      senderName: 'ShopEase Celebrations',
      theme: 'Festive Gold',
      isRedeemed: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemingCard, setRedeemingCard] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Rohan Sharma',
    phone: user?.phone || '+91 91234 56789',
    city: 'Bengaluru',
  });

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState(
    user?.savedAddresses?.length > 0
      ? user.savedAddresses
      : [
          {
            _id: 'addr_1',
            fullName: user?.name || 'Rohan Sharma',
            address: 'Flat 402, Prestige Lakeside Habitat, Varthur',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560060',
            phone: '+91 91234 56789',
            isDefault: true,
          },
          {
            _id: 'addr_2',
            fullName: user?.name || 'Rohan Sharma (Office)',
            address: 'Block B, Embassy TechVillage, Outer Ring Rd',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560103',
            phone: '+91 98765 43210',
            isDefault: false,
          },
        ]
  );

  // Saved Cards State
  const [savedCards, setSavedCards] = useState([
    {
      id: 'card_1',
      cardNumber: '•••• •••• •••• 4242',
      cardHolder: user?.name || 'ROHAN SHARMA',
      expiry: '12/28',
      cardType: 'Visa Platinum',
    },
    {
      id: 'card_2',
      cardNumber: '•••• •••• •••• 8842',
      cardHolder: user?.name || 'ROHAN SHARMA',
      expiry: '10/29',
      cardType: 'RuPay Select',
    },
  ]);

  // Price Drop Guarantee Claim Simulation
  const [claimingDropId, setClaimingDropId] = useState(null);

  // Add Address Modal
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: user?.name || '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '',
    phone: '',
    isDefault: false,
  });

  // Fetch Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await apiClient.get('/orders/my-orders');
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch Returns
  const fetchReturns = async () => {
    setReturnsLoading(true);
    try {
      const res = await apiClient.get('/returns/my-returns');
      if (res.data?.success) {
        setReturns(res.data.returns || []);
      }
    } catch (e) {
      console.warn('Failed to fetch returns:', e);
    } finally {
      setReturnsLoading(false);
    }
  };

  // Fetch Tickets
  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await apiClient.get('/tickets/my-tickets');
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (e) {
      console.warn('Failed to fetch tickets:', e);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchReturns();
    fetchTickets();
  }, []);

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put('/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
      });
      setIsEditingProfile(false);
      triggerNotification({
        channel: 'SMS',
        type: 'wallet',
        title: 'Profile Updated',
        message: 'Your personal information and verified contact details were updated.',
      });
    } catch (e) {
      alert(e.message);
    }
  };

  // Handle Add Address
  const handleAddAddress = (e) => {
    e.preventDefault();
    const addr = {
      _id: 'addr_' + Date.now(),
      ...newAddressForm,
    };
    const updated = [addr, ...savedAddresses];
    setSavedAddresses(updated);
    setShowAddAddress(false);
    setNewAddressForm({
      fullName: user?.name || '',
      address: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '',
      phone: '',
      isDefault: false,
    });
  };

  const handleDeleteAddress = (id) => {
    setSavedAddresses((prev) => prev.filter((a) => a._id !== id));
  };

  // Handle 7-Day Price Drop Guarantee Claim
  const handleClaimPriceDrop = async (order) => {
    setClaimingDropId(order._id);
    try {
      const firstItemName = order.items?.[0]?.name || 'Purchased Item';
      const dropAmount = 750;
      await claimPriceDrop(firstItemName, dropAmount, order.trackingNumber);

      triggerNotification({
        channel: 'WHATSAPP',
        type: 'wallet',
        title: '7-Day Price-Drop Protection Refund!',
        message: `🛡️ Great news! A price drop was verified for "${firstItemName}". ₹${dropAmount} has been automatically refunded to your ShopEase Wallet!`,
      });

      alert(`₹${dropAmount} Price-Drop Protection refund credited to your wallet!`);
    } catch (e) {
      alert(e.message);
    } finally {
      setClaimingDropId(null);
    }
  };

  const handleRepayDue = async (due) => {
    setRepayingDueId(due.id);
    try {
      const res = await apiClient.post('/enterprise/paylater/repay', {
        dueId: due.id,
        amount: due.amount,
      });
      if (res.data?.success) {
        setPayLater((prev) => ({
          ...prev,
          availableCredit: Math.min(prev.creditLimit, prev.availableCredit + due.amount),
          usedCredit: Math.max(0, prev.usedCredit - due.amount),
          dues: prev.dues.map((d) => (d.id === due.id ? { ...d, isPaid: true } : d)),
        }));
        triggerNotification({
          channel: 'SMS',
          type: 'wallet',
          title: 'Pay Later Due Cleared',
          message: `Your Pay Later payment of ₹${due.amount.toLocaleString('en-IN')} for order #${due.orderId} was successful! Available credit restored.`,
        });
        alert(`Due of ₹${due.amount.toLocaleString('en-IN')} cleared successfully!`);
      }
    } catch (e) {
      alert(e.message || 'Repayment failed');
    } finally {
      setRepayingDueId(null);
    }
  };

  const handleToggleSubscription = (subId) => {
    setSubscriptionsList((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s))
    );
  };

  const handleRedeemGiftCard = async (e) => {
    e.preventDefault();
    if (!redeemCodeInput.trim()) return;
    setRedeemingCard(true);
    try {
      const res = await apiClient.post('/enterprise/giftcards/redeem', {
        code: redeemCodeInput.trim(),
      });
      if (res.data?.success) {
        const amt = res.data.creditedAmount || 500;
        triggerNotification({
          channel: 'SMS',
          type: 'wallet',
          title: 'Gift Card Redeemed!',
          message: `₹${amt.toLocaleString('en-IN')} Gift Card voucher redeemed and deposited into your Virtual Wallet!`,
        });
        setGiftCardsList((prev) => [
          {
            code: redeemCodeInput.trim().toUpperCase(),
            amount: amt,
            senderName: 'Redeemed Voucher',
            theme: 'Instant Deposit',
            isRedeemed: true,
            redeemedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setRedeemCodeInput('');
        alert(`₹${amt.toLocaleString('en-IN')} deposited to your ShopEase Wallet!`);
      }
    } catch (err) {
      alert(err.message || 'Failed to redeem gift card');
    } finally {
      setRedeemingCard(false);
    }
  };

  const navTabs = [
    { id: 'profile', label: 'Profile Details', icon: User },
    { id: 'orders', label: `My Orders & Invoices (${orders.length})`, icon: Package },
    { id: 'wallet', label: `Wallet & Passbook (${formatPrice(balance)})`, icon: WalletIcon },
    { id: 'returns', label: `Returns & Refunds (${returns.length})`, icon: RotateCcw },
    { id: 'addresses', label: 'Addresses & Cards', icon: MapPin },
    { id: 'paylater', label: 'ShopEase Pay Later (BNPL)', icon: CreditCard },
    { id: 'subscriptions', label: `Subscriptions (${subscriptionsList.length})`, icon: Clock },
    { id: 'giftcards', label: 'Digital Gift Cards', icon: Gift },
    { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
    { id: 'tickets', label: `Support Tickets (${tickets.length})`, icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 mb-8 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-600/30 shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name || 'Rohan Sharma'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Prime Member</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {user?.email || 'user@shopease.com'} • Member since October 2026
            </p>
          </div>
        </div>

        {/* Quick Balance & Coin Counters */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Wallet Balance
            </span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              {formatPrice(balance)}
            </span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              <span>Reward Coins</span>
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
              🪙 {rewardsCoins}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Tabs + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="p-3 rounded-3xl glass-card border border-slate-800 space-y-1 sticky top-28">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-xs transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90' : 'opacity-40'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Profile Details</h3>
                  <p className="text-xs text-slate-400">
                    Manage your verified account credentials and contact parameters.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Full Name</span>
                    <p className="text-sm font-bold text-white">{user?.name || 'Rohan Sharma'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Email Address</span>
                    <p className="text-sm font-bold text-white">{user?.email || 'user@shopease.com'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Primary Phone</span>
                    <p className="text-sm font-bold text-white">{user?.phone || '+91 91234 56789'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Account Tier</span>
                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified Customer (Zero Dark Pattern Protection)</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Default Address Preview */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Default Shipping Destination
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 space-y-0.5">
                      <p className="font-bold text-white">{savedAddresses[0]?.fullName}</p>
                      <p className="text-slate-400">{savedAddresses[0]?.address}</p>
                      <p className="text-slate-400">
                        {savedAddresses[0]?.city}, {savedAddresses[0]?.state} - {savedAddresses[0]?.postalCode}
                      </p>
                      <p className="text-slate-400">Phone: {savedAddresses[0]?.phone}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                    Default
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS & INVOICE VAULT */}
          {activeTab === 'orders' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">My Orders & Official Invoice Vault</h3>
                  <p className="text-xs text-slate-400">
                    Download printable GST Tax Invoices and claim 7-Day Price Drop Protection.
                  </p>
                </div>
              </div>

              {ordersLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">No orders placed yet.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isDelivered = order.orderStatus === 'Delivered';
                    return (
                      <div
                        key={order._id}
                        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
                          <div>
                            <span className="font-mono font-bold text-indigo-400 block text-sm">
                              #{order.trackingNumber}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.deliverySpeed}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                order.orderStatus === 'Delivered'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : order.orderStatus === 'Shipped'
                                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                            <span className="font-black text-sm text-white font-mono">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover bg-slate-950 shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-white block">{item.name}</span>
                                  <span className="text-slate-400 text-[11px]">Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="font-bold text-slate-200">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onViewInvoice && onViewInvoice(order)}
                              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-[11px]"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Official GST Tax Invoice</span>
                            </button>

                            {isDelivered && (
                              <button
                                onClick={() => setSelectedOrderForReturn(order)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 transition-colors font-semibold text-[11px]"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                <span>Return / Replace Item</span>
                              </button>
                            )}
                          </div>

                          {/* 7-Day Price Drop Protection */}
                          <button
                            onClick={() => handleClaimPriceDrop(order)}
                            disabled={claimingDropId === order._id}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5 font-bold text-[11px]"
                            title="Verify if any item dropped in price and auto-credit refund difference"
                          >
                            <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{claimingDropId === order._id ? 'Verifying...' : '7-Day Price Drop Refund'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WALLET & PASSBOOK */}
          {activeTab === 'wallet' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Virtual Wallet & Rewards Ledger</h3>
                  <p className="text-xs text-slate-400">
                    Your real virtual wallet balance starts at ₹0, auto-credits instant refunds, and holds earned cashbacks.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30"
                >
                  View Order Credits
                </button>
              </div>

              {/* Balances Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-indigo-900/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-indigo-300">Available Wallet Float</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    {formatPrice(balance)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    100% liquid balance. Can be used for 1-click instant checkout across any catalog SKU.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-900/30 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-amber-300">Loyalty ShopEase Coins</span>
                    <Coins className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-amber-400 font-mono">
                    🪙 {rewardsCoins}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Earn 5% cashback on every completed order. 1 ShopEase Coin = ₹1 cart discount.
                  </p>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Passbook & Transaction History
                </h4>
                {transactions && transactions.length > 0 ? (
                  <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-white">{tx.description}</p>
                          <span className="text-[10px] text-slate-500">
                            {new Date(tx.createdAt).toLocaleDateString()} • Ref: #{tx.referenceId}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold text-sm ${
                            tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'} {formatPrice(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950 text-center text-xs text-slate-500">
                    No transactions logged in this wallet yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RETURNS & REFUNDS */}
          {activeTab === 'returns' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Returns, Replacements & Wallet Refunds</h3>
                  <p className="text-xs text-slate-400">
                    Doorstep reverse pickup tracking with auto-credit to Virtual Wallet upon inspection.
                  </p>
                </div>
              </div>

              {returnsLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs">Loading returns...</div>
              ) : returns.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <p>You have no active returns or replacement requests.</p>
                  <p className="text-slate-600 text-[11px]">
                    To initiate a return, go to "My Orders" and click "Return / Replace Item" on any delivered order.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returns.map((ret) => (
                    <div
                      key={ret._id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                        <div>
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            #{ret.returnId}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Order: #{ret.orderTracking} • Reason: {ret.reason}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                              ret.status === 'Refund Approved' || ret.status === 'Refund Completed'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {ret.status}
                          </span>
                          <span className="font-mono font-black text-white text-sm">
                            {formatPrice(ret.refundAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Return Timeline Stepper */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Return Status Progression
                        </span>
                        <div className="space-y-2">
                          {ret.timeline?.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <div>
                                <span className="font-bold text-white text-xs">{step.status}</span>
                                <p className="text-[11px] text-slate-400">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SAVED ADDRESSES & PAYMENT METHODS */}
          {activeTab === 'addresses' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Saved Addresses & Payment Methods</h3>
                  <p className="text-xs text-slate-400">
                    Manage delivery destinations and fast 1-click checkout options.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add Address Form Modal */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3"
                >
                  <h4 className="font-bold text-white text-sm">Add New Delivery Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.fullName}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={newAddressForm.phone}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.address}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.city}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.postalCode}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-sm">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 leading-relaxed">{addr.address}</p>
                      <p className="text-slate-400">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-slate-400">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Saved Cards */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Saved Cards (256-Bit Tokenized)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-white">{card.cardNumber}</p>
                          <span className="text-[10px] text-slate-400">
                            {card.cardType} • Exp: {card.expiry}
                          </span>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PAY LATER (BNPL) */}
          {activeTab === 'paylater' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <span>ShopEase Pay Later (BNPL)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enjoy 30 days of 0% interest-free credit with instant 1-click checkout.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Pre-Approved Limit
                </span>
              </div>

              {/* Credit Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Credit Line</span>
                  <span className="text-xl font-black text-white">{formatPrice(payLater.creditLimit)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block">Available to Spend</span>
                  <span className="text-xl font-black text-indigo-400">{formatPrice(payLater.availableCredit)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Outstanding Dues</span>
                  <span className="text-xl font-black text-amber-400">{formatPrice(payLater.usedCredit)}</span>
                </div>
              </div>

              {/* Dues Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Upcoming Billing Dues
                </h4>
                {payLater.dues.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No outstanding dues. Your Pay Later credit is clear!</p>
                ) : (
                  <div className="space-y-3">
                    {payLater.dues.map((due) => (
                      <div
                        key={due.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white font-mono font-bold">{due.id}</strong>
                            <span className="text-slate-400">Order: #{due.orderId}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Due by: {new Date(due.dueDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-mono font-bold text-white text-sm">
                            {formatPrice(due.amount)}
                          </span>
                          {due.isPaid ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                              Paid ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRepayDue(due)}
                              disabled={repayingDueId === due.id}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                            >
                              {repayingDueId === due.id ? 'Processing...' : 'Pay Due'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SUBSCRIPTIONS (SUBSCRIBE & SAVE 10%) */}
          {activeTab === 'subscriptions' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <span>Subscribe & Save Manager</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recurring automated deliveries with guaranteed 10% discount on every renewal cycle.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  10% OFF Active
                </span>
              </div>

              {subscriptionsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <p>You have no recurring subscriptions active.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptionsList.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={sub.imageUrl}
                          alt={sub.productName}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-900 shrink-0"
                        />
                        <div>
                          <strong className="text-white text-sm font-bold block">{sub.productName}</strong>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-indigo-400 font-bold">{formatPrice(sub.discountedPrice)}</span>
                            <span className="text-slate-500 line-through text-[11px]">{formatPrice(sub.originalPrice)}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">10% OFF</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            Frequency: Every {sub.intervalDays} Days • Next Drop: {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            sub.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <button
                          onClick={() => handleToggleSubscription(sub.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 font-bold"
                        >
                          {sub.status === 'Active' ? 'Pause Renewal' : 'Resume'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: DIGITAL GIFT CARDS */}
          {activeTab === 'giftcards' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-indigo-400" />
                    <span>Digital Gift Cards & Instant Vouchers</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Redeem promo gift vouchers or send branded digital gift cards to family & friends.
                  </p>
                </div>
              </div>

              {/* Redeem Voucher Card */}
              <form
                onSubmit={handleRedeemGiftCard}
                className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
              >
                <div className="w-full sm:flex-1">
                  <label className="block text-slate-300 font-bold mb-1">Redeem Voucher to Wallet</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter code (e.g. GFT-2026-FEST)"
                    value={redeemCodeInput}
                    onChange={(e) => setRedeemCodeInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={redeemingCard}
                  className="w-full sm:w-auto sm:self-end px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 shrink-0"
                >
                  {redeemingCard ? 'Redeeming...' : 'Claim to Wallet'}
                </button>
              </form>

              {/* Gift Cards Vault */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Your Gift Cards Vault
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {giftCardsList.map((card, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-400">{card.theme || 'Gift Voucher'}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            card.isRedeemed ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {card.isRedeemed ? 'Redeemed' : 'Ready to Claim'}
                        </span>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-white">{formatPrice(card.amount)}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">From: {card.senderName}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs text-slate-300">
                        <span>{card.code}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(card.code);
                            alert(`Voucher code ${card.code} copied!`);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: WISHLIST & SAVED-FOR-LATER */}
          {activeTab === 'wishlist' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Wishlist & Saved-for-Later</h3>
                  <p className="text-xs text-slate-400">
                    Quickly transfer your saved products directly to active shopping cart.
                  </p>
                </div>
              </div>

              {wishlist.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-3">
                  <p>Your wishlist is empty.</p>
                  <button
                    onClick={onExploreStore}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
                        />
                        <div className="truncate text-xs">
                          <p className="font-bold text-white truncate">{item.name}</p>
                          <span className="text-indigo-400 font-mono font-bold">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            moveToCart(item);
                            removeFromWishlist && removeFromWishlist(item._id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                        >
                          Move to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Support Tickets & Live Help Desk</h3>
                  <p className="text-xs text-slate-400">
                    Track inquiries submitted via ShopBot AI assistant.
                  </p>
                </div>
              </div>

              {ticketsLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No active support tickets. Click the ShopBot AI assistant in the bottom-right corner to open a ticket.
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((t) => (
                    <div
                      key={t._id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                        <div>
                          <span className="font-mono font-bold text-indigo-400 text-sm">
                            #{t.ticketId}
                          </span>
                          <span className="text-slate-400 ml-2">Category: {t.category}</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            t.status === 'Resolved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{t.subject}</h4>

                      {/* Messages Thread */}
                      <div className="space-y-2 pt-2">
                        {t.messages?.map((msg, mIdx) => (
                          <div
                            key={mIdx}
                            className={`p-3 rounded-xl text-xs ${
                              msg.sender === 'agent'
                                ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-200'
                                : 'bg-slate-950 border border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-bold text-[10px] uppercase block mb-0.5 text-slate-400">
                              {msg.sender === 'agent' ? '⚡ Support Specialist Reply' : 'You'}
                            </span>
                            <p>{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Return Modal */}
      {selectedOrderForReturn && (
        <ReturnModal
          order={selectedOrderForReturn}
          isOpen={!!selectedOrderForReturn}
          onClose={() => setSelectedOrderForReturn(null)}
          onSuccess={() => {
            fetchReturns();
            setActiveTab('returns');
          }}
        />
      )}
    </div>
  );
};

export default AccountPage;
