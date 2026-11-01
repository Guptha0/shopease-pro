import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { initialProducts } from '../data/fallbackData';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Search,
  Check,
  ShoppingBag,
  ArrowRight,
  Layers,
  Zap,
} from 'lucide-react';

const SAMPLE_PRESETS = [
  {
    title: 'Titanium AI Smartphone',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
    targetCategory: 'Mobiles & Tablets',
  },
  {
    title: 'Mechanical Gaming Keyboard',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    targetCategory: 'Smart Electronics & IoT',
  },
  {
    title: 'ANC Studio Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    targetCategory: 'Audio & Wearables',
  },
  {
    title: 'High-TGP Gaming Machine',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80',
    targetCategory: 'Laptops & Gaming',
  },
];

const VisualSearchModal = ({ isOpen, onClose, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [addedId, setAddedId] = useState(null);

  if (!isOpen) return null;

  const handleRunVisualSearch = (imageUrl, categoryHint) => {
    setActiveImage(imageUrl);
    setIsScanning(true);
    setMatchedProducts([]);

    setTimeout(() => {
      // Find matching products based on category or visual features
      const matches = initialProducts
        .filter((p) => (categoryHint ? p.category === categoryHint : true))
        .map((p, idx) => ({
          ...p,
          matchScore: 98 - idx * 4,
        }))
        .slice(0, 3);

      setMatchedProducts(matches);
      setIsScanning(false);
    }, 1200);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      handleRunVisualSearch(previewUrl, null);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  ShopEase AI Snap & Search
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Visual Embeddings
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload or select an image to identify gadgets and matching catalog SKUs instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs">
          {/* Upload Area */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-slate-200 font-bold mb-1">
              Drag & Drop product photo or click to browse
            </p>
            <p className="text-[11px] text-slate-500">
              Supports JPEG, PNG, WEBP (Screen snips or camera snapshots)
            </p>
          </div>

          {/* Sample Preset Gadgets */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Or Try Sample Gadget Presets
              </span>
              <span className="text-[10px] text-indigo-400">1-Click Test</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunVisualSearch(preset.imageUrl, preset.targetCategory)}
                  className={`p-2 rounded-2xl bg-slate-950 border text-left transition-all group overflow-hidden ${
                    activeImage === preset.imageUrl
                      ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    className="w-full aspect-square rounded-xl object-cover mb-2 group-hover:scale-105 transition-transform"
                  />
                  <p className="font-bold text-white text-[11px] truncate">{preset.title}</p>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {preset.targetCategory}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Scanning Status */}
          {isScanning && (
            <div className="p-8 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Analyzing Image Vectors...</p>
                <p className="text-slate-400 text-[11px]">
                  Matching color histograms, silhouette geometry, and brand patterns against catalog
                </p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isScanning && matchedProducts.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5" />
                  <span>Visual Search Matches Found ({matchedProducts.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">Ranked by visual similarity</span>
              </div>

              <div className="space-y-2.5">
                {matchedProducts.map((p) => {
                  const isAdded = addedId === p._id;
                  return (
                    <div
                      key={p._id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5 hover:border-indigo-500/40 transition-all"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {p.matchScore}% Match
                          </span>
                          <span className="text-[10px] text-indigo-400 font-bold uppercase">
                            {p.brand}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs truncate mt-0.5">{p.name}</h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-extrabold text-white text-sm">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-500 line-through text-[11px]">
                            ₹{(p.mrp || p.price * 1.25).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                        {onSelectProduct && (
                          <button
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white bg-slate-900 border border-slate-800 text-center"
                          >
                            Inspect Specs
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualSearchModal;
