import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Smartphone,
  Laptop,
  Headphones,
  Cpu,
  TrendingDown,
  Package,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const CategoryTabs = ({ selectedCategory, onSelectCategory }) => {
  const { isAdmin } = useAuth();

  // Flash deals countdown timer (counts down to midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'All', label: 'All Catalog', icon: null },
    {
      id: "Today's Flash Deals",
      label: "Today's Flash Deals",
      icon: Flame,
      highlight: true,
      badge: `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`,
    },
    { id: 'Mobiles & Tablets', label: 'Mobiles & Tablets', icon: Smartphone },
    { id: 'Laptops & Gaming', label: 'Laptops & Gaming', icon: Laptop },
    { id: 'Audio & Wearables', label: 'Audio & Wearables', icon: Headphones },
    { id: 'Smart Electronics & IoT', label: 'Smart Electronics & IoT', icon: Cpu },
    {
      id: 'Price-Drop Radar',
      label: 'Price-Drop Radar',
      icon: TrendingDown,
      special: true,
      badge: 'Lowest 30D',
    },
    { id: 'account', label: 'My Account Hub', icon: Package, isNav: true },
    { id: 'orders', label: 'Track Orders', icon: Package, isNav: true },
    ...(isAdmin
      ? [{ id: 'admin', label: 'Admin Seller Central', icon: ShieldCheck, isNav: true, admin: true }]
      : []),
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id, tab.isNav)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : tab.highlight
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                    : tab.special
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20'
                    : tab.admin
                    ? 'bg-purple-950/40 text-purple-400 border border-purple-500/20 hover:text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      tab.highlight ? 'text-amber-400 animate-pulse' : 'text-indigo-400'
                    }`}
                  />
                )}
                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tab.highlight
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-purple-500/20 text-purple-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
