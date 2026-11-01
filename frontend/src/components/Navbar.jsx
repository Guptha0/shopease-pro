import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';
import {
  ShoppingBag,
  Camera,
  Globe,
  Gift,
  Users,
  ShoppingCart,
  Search,
  MapPin,
  Heart,
  Scale,
  Package,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  X,
  Wallet,
  Bell,
} from 'lucide-react';

const Navbar = ({
  onOpenVisualSearch,
  onOpenGiftCards,
  onOpenSquadBuy,
  currentView,
  setCurrentView,
  setIsCartOpen,
  searchTerm,
  setSearchTerm,
  onOpenPincodeModal,
  products = [],
  onSelectProduct,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItemsCount, wishlist, compareList, deliveryPincode } = useCart();
  const { balance, rewardsCoins } = useWallet();
  const { unreadCount } = useNotifications();

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { currency, setCurrency, currencies, activeCurrency } = useCurrency();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Auto-suggest matches
  const safeSearch = searchTerm && typeof searchTerm === 'string' ? searchTerm.trim() : '';
  const suggestions =
    safeSearch.length > 1 && Array.isArray(products)
      ? products
          .filter(
            (p) =>
              p?.name?.toLowerCase().includes(safeSearch.toLowerCase()) ||
              p?.brand?.toLowerCase().includes(safeSearch.toLowerCase()) ||
              p?.category?.toLowerCase().includes(safeSearch.toLowerCase())
          )
          .slice(0, 5)
      : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          {/* Brand Logo with Explore Plus Badge */}
          <button
            onClick={() => setCurrentView('store')}
            className="flex items-center gap-3 text-left group shrink-0 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  ShopEase
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider rounded bg-indigo-600 text-white shadow-sm">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 italic">
                <span>Explore</span>
                <span className="text-indigo-400">Plus</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              </div>
            </div>
          </button>

          {/* Delivery Location Pincode Checker Trigger */}
          <button
            onClick={onOpenPincodeModal}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-left text-xs transition-colors shrink-0"
          >
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">
                Deliver to
              </span>
              <span className="font-bold text-white flex items-center gap-1 leading-tight">
                Bengaluru {deliveryPincode}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </button>

          {/* Live Search Bar with Auto-Suggest Dropdown */}
          <div ref={searchRef} className="flex-1 max-w-xl relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search iPhone 16, RTX 4080, Sony XM5, Keychron..."
                value={searchTerm}
                onFocus={() => setSuggestOpen(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSuggestOpen(true);
                  if (currentView !== 'store') setCurrentView('store');
                }}
                className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all shadow-inner"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenVisualSearch && (
                  <button
                    type="button"
                    onClick={onOpenVisualSearch}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                    title="AI Snap & Search (Visual Image Search)"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Auto-suggest dropdown menu */}
            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs animate-fadeIn">
                <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                  Matching Catalog Products
                </p>
                {suggestions.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSuggestOpen(false);
                      if (onSelectProduct) onSelectProduct(p);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover bg-slate-950 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-white truncate text-xs">{p.name}</p>
                        <span className="text-[10px] text-indigo-400 font-medium">
                          {p.brand} • {p.category}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-white shrink-0 ml-2">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Digital Wallet Balance Pill */}
            <button
              onClick={() => setCurrentView('wallet')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs ${
                currentView === 'wallet'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border-slate-800 hover:border-indigo-500/40 text-slate-200'
              }`}
              title="ShopEase Pro Digital Wallet"
            >
              <div className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-white font-mono text-xs">
                  ₹{Number(balance).toLocaleString('en-IN')}
                </span>
                <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono">
                  🪙{rewardsCoins}
                </span>
              </div>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setCurrentView('notifications')}
              className={`relative p-2.5 rounded-xl border transition-all ${
                currentView === 'notifications'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="SMS & WhatsApp Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setCurrentView('store')}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all hidden sm:block"
              title="My Wishlist"
            >
              <Heart className="w-4 h-4" />
              {Array.isArray(wishlist) && wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-rose-500/40">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Compare Tray */}
            {Array.isArray(compareList) && compareList.length > 0 && (
              <button
                onClick={() => setCurrentView('store')}
                className="relative p-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all hidden sm:block"
                title="Compare Selected Products"
              >
                <Scale className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {compareList.length}
                </span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm group"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200"
                >
                  <span className="hidden sm:inline line-clamp-1 max-w-[110px]">
                    {user.name}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1 animate-fadeIn">
                    <div className="p-2 border-b border-slate-800">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 capitalize">
                        {user.role} Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 font-bold text-left"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>My Account Hub</span>
                    </button>

                    {onOpenSquadBuy && (
                      <button
                        onClick={() => {
                          onOpenSquadBuy();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-purple-300 text-left"
                      >
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>Squad Buy (15% Off)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentView('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-slate-300 text-left"
                    >
                      <Package className="w-4 h-4 text-indigo-400" />
                      <span>My Orders & Tracking</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('wallet');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-slate-300 text-left"
                    >
                      <Wallet className="w-4 h-4 text-indigo-400" />
                      <span>Digital Wallet & Passbook</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('notifications');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-slate-300 text-left"
                    >
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Alerts & Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-purple-950/40 text-purple-300 text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>Seller Central</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-950/40 text-rose-400 text-left border-t border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('auth')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
