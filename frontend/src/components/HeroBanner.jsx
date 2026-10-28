import React from 'react';
import { Sparkles, ShieldCheck, Zap, Truck, ArrowRight } from 'lucide-react';

const HeroBanner = ({ onShopNowClick }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 sm:p-12 mb-10 shadow-2xl shadow-indigo-950/50">
      {/* Background radial gradients */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>SmartSense™ Shopping Suite • Amazon & Flipkart-Scale Marketplace</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          Next-Gen Tech Commerce.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Powered by SmartSense™.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
          Compare specs side-by-side, verify real 30-day price trends against inflated discounts, freeze flash prices for 48 hours, and negotiate instant voucher codes with DealBot™ AI.
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <span>30-Day SVG Price History</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Truck className="w-4 h-4" />
            </div>
            <span>DealBot™ AI Bargaining</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>5-Stage Courier Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
