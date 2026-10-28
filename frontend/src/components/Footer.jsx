import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Zap } from 'lucide-react';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white">ShopSphere</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Full-Stack E-Commerce platform featuring real-time stock management, JWT authentication, and interactive visual logistics tracking.
            </p>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-xs uppercase tracking-wider">
              Product Categories
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => onNavigate('store')} className="hover:text-indigo-400">Audio & Acoustic Systems</button></li>
              <li><button onClick={() => onNavigate('store')} className="hover:text-indigo-400">Wearables & Smartwatches</button></li>
              <li><button onClick={() => onNavigate('store')} className="hover:text-indigo-400">Laptops & Computing</button></li>
              <li><button onClick={() => onNavigate('store')} className="hover:text-indigo-400">Charging & Accessories</button></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 text-xs uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => onNavigate('store')} className="hover:text-indigo-400">Store Catalog</button></li>
              <li><button onClick={() => onNavigate('orders')} className="hover:text-indigo-400">Order Tracking</button></li>
              <li><button onClick={() => onNavigate('admin')} className="hover:text-purple-400">Admin Console</button></li>
              <li><button onClick={() => onNavigate('auth')} className="hover:text-indigo-400">Sign In / Switch Role</button></li>
            </ul>
          </div>

          {/* Evaluation Quick Info */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Evaluation Ready</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Admin: <code className="text-indigo-300">admin@store.com</code> / <code className="text-indigo-300">admin123</code>
            </p>
            <p className="text-[11px] text-slate-400">
              Customer: <code className="text-indigo-300">user@store.com</code> / <code className="text-indigo-300">user123</code>
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with React, Express, MongoDB & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
