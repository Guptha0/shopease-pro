import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Scale, X, ShoppingCart, Check, Trophy, Sparkles } from 'lucide-react';

const CompareDrawer = () => {
  const { compareList, removeFromCompare, clearCompare, addToCart } = useCart();
  const [showFullModal, setShowFullModal] = useState(false);

  const safeCompareList = Array.isArray(compareList) ? compareList : [];
  if (safeCompareList.length === 0) return null;

  // Find winners
  const lowestPriceItem = [...safeCompareList].sort((a, b) => a.price - b.price)[0];
  const highestRatedItem = [...safeCompareList].sort((a, b) => b.rating - a.rating)[0];

  // Extract all unique spec keys
  const allSpecKeys = Array.from(
    new Set(
      safeCompareList.flatMap((p) => (p.specs ? Object.keys(p.specs) : []))
    )
  );

  return (
    <>
      {/* Floating Tray at the bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl rounded-2xl glass-panel p-3.5 shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Compare Tray</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-[10px] text-indigo-300">
                {safeCompareList.length}/3
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Side-by-side spec & price analysis
            </p>
          </div>
        </div>

        {/* Selected Product Chips */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {safeCompareList.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-6 h-6 rounded-md object-cover bg-slate-950"
              />
              <span className="truncate max-w-[100px] text-[11px] font-medium hidden sm:inline">
                {p.name}
              </span>
              <button
                onClick={() => removeFromCompare(p._id)}
                className="text-slate-400 hover:text-rose-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCompare}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
          >
            Clear
          </button>
          <button
            onClick={() => setShowFullModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30"
          >
            Compare Now ({compareList.length})
          </button>
        </div>
      </div>

      {/* Full Comparison Modal */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFullModal(false)}
              className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>SmartSense™ Spec Comparison Matrix</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  Automated spec breakdown highlighting best price, rating, and value ratio
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="p-4 w-44 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                      Specification
                    </th>
                    {compareList.map((p) => (
                      <th key={p._id} className="p-4 min-w-[220px] text-white">
                        <div className="space-y-2">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-20 h-20 rounded-xl object-cover bg-slate-950 mx-auto"
                          />
                          <p className="font-bold text-xs line-clamp-2">{p.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-indigo-300 text-sm">
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => addToCart(p, 1)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {/* Price Row */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-400">Effective Price</td>
                    {compareList.map((p) => {
                      const isWinner = p._id === lowestPriceItem?._id;
                      return (
                        <td key={p._id} className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-sm ${isWinner ? 'text-emerald-400' : 'text-slate-200'}`}>
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                            {isWinner && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-400" /> Lowest Price
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 line-through">
                            MRP: ₹{p.mrp?.toLocaleString('en-IN')}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rating Row */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-400">Customer Rating</td>
                    {compareList.map((p) => {
                      const isWinner = p._id === highestRatedItem?._id;
                      return (
                        <td key={p._id} className="p-4">
                          <span className={`font-bold ${isWinner ? 'text-amber-400' : 'text-slate-300'}`}>
                            ★ {p.rating} / 5.0
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1">
                            ({p.numReviews || 0} reviews)
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Category & Brand */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-400">Brand / Category</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="p-4 text-slate-300">
                        {p.brand} • {p.category}
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Specs */}
                  {allSpecKeys.map((key) => (
                    <tr key={key} className="hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-slate-400">{key}</td>
                      {compareList.map((p) => (
                        <td key={p._id} className="p-4 text-slate-200">
                          {p.specs?.[key] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowFullModal(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompareDrawer;
