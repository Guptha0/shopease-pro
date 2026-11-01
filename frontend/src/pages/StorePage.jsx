import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useCurrency } from '../context/CurrencyContext';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import PriceHistoryModal from '../components/PriceHistoryModal';
import PriceLockModal from '../components/PriceLockModal';
import NegotiateDealModal from '../components/NegotiateDealModal';
import {
  SlidersHorizontal,
  RefreshCw,
  Search,
  FilterX,
  PackageSearch,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

const StorePage = ({
  searchTerm,
  setSearchTerm,
  selectedCategory = 'All',
  setSelectedCategory,
  onOpenSquadBuy,
  onOpenEmiCalculator,
}) => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [flashDealsOnly, setFlashDealsOnly] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [detailProduct, setDetailProduct] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [lockProduct, setLockProduct] = useState(null);
  const [negotiateProduct, setNegotiateProduct] = useState(null);

  // Mobile sidebar collapsible
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (Array.isArray(selectedBrands) && selectedBrands.length > 0) {
        params.brand = selectedBrands.join(',');
      }
      if (maxPrice < 300000) {
        params.maxPrice = maxPrice;
      }
      if (minRating > 0) {
        params.minRating = minRating;
      }
      if (inStockOnly) {
        params.inStock = 'true';
      }
      if (flashDealsOnly || selectedCategory === "Today's Flash Deals") {
        params.flashDeals = 'true';
      }
      if (sortOption) {
        params.sort = sortOption;
      }

      const res = await apiClient.get('/products', { params });
      if (res.data?.success) {
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        if (Array.isArray(res.data.categories) && res.data.categories.length) {
          setCategories(['All', ...res.data.categories]);
        }
        if (Array.isArray(res.data.brands) && res.data.brands.length) {
          setBrands(res.data.brands);
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    searchTerm,
    selectedCategory,
    selectedBrands,
    maxPrice,
    minRating,
    inStockOnly,
    flashDealsOnly,
    sortOption,
  ]);

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    if (setSelectedCategory) setSelectedCategory('All');
    setSelectedBrands([]);
    setMaxPrice(300000);
    setMinRating(0);
    setInStockOnly(false);
    setFlashDealsOnly(false);
    setSearchTerm('');
    setSortOption('newest');
  };

  const hasActiveFilters =
    searchTerm ||
    (selectedCategory && selectedCategory !== 'All') ||
    selectedBrands.length > 0 ||
    maxPrice < 300000 ||
    minRating > 0 ||
    inStockOnly ||
    flashDealsOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter & Refine'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Featured & Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="biggest_drop">Biggest Price Drop</option>
            </select>
          </div>
        </div>

        {/* Sidebar Filter Panel */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } lg:block w-full lg:w-64 shrink-0 space-y-6 bg-slate-900/60 lg:bg-transparent p-5 lg:p-0 rounded-2xl border border-slate-800/80 lg:border-none`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <FilterX className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Flash Deals & Price Radar Quick Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 cursor-pointer hover:bg-amber-500/20 transition-colors">
              <input
                type="checkbox"
                checked={flashDealsOnly}
                onChange={(e) => setFlashDealsOnly(e.target.checked)}
                className="rounded bg-slate-900 border-amber-500/40 text-amber-500 focus:ring-0"
              />
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Flash Deals Only</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exclude Out of Stock</span>
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Max Price</span>
              <span className="font-extrabold text-indigo-400">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="300000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹5K</span>
              <span>₹1.5L</span>
              <span>₹3.0L</span>
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300">Brands</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-none">
              {(brands.length > 0
                ? brands
                : ['Apple', 'Samsung', 'ASUS ROG', 'Sony', 'Bose', 'Keychron', 'Raspberry Pi', 'Anker', 'Valve', 'OnePlus']
              ).map((b) => (
                <label
                  key={b}
                  className="flex items-center justify-between text-xs text-slate-400 hover:text-white cursor-pointer select-none py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => handleBrandToggle(b)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>{b}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Customer Rating Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300">Customer Rating</h4>
            <div className="space-y-1">
              {[
                { label: '4.5★ & Above', value: 4.5 },
                { label: '4.0★ & Above', value: 4.0 },
                { label: 'All Ratings', value: 0 },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setMinRating(r.value)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    minRating === r.value
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.label}</span>
                  </div>
                  {minRating === r.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Catalog Column */}
        <div className="flex-1 min-w-0">
          {/* Top Sort Bar & Active Badges (Desktop) */}
          <div className="hidden lg:flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-white">{products.length}</span> items
              found
              {hasActiveFilters && (
                <span className="text-indigo-400 font-semibold">• Filtered</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sort by:</span>
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="newest">Featured & Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Customer Rating</option>
                <option value="biggest_drop">Biggest Price Drop (SmartSense™)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
              <span className="text-slate-400 text-[11px] font-bold">Active:</span>
              {searchTerm && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px]">
                  Keyword: "{searchTerm}"
                </span>
              )}
              {selectedCategory && selectedCategory !== 'All' && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                  {selectedCategory}
                </span>
              )}
              {selectedBrands.map((b) => (
                <span
                  key={b}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-200 border border-indigo-500/40 text-[11px]"
                >
                  {b}
                </span>
              ))}
              {maxPrice < 300000 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  Under ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              )}
              {minRating > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                  {minRating}★ & Above
                </span>
              )}
              {flashDealsOnly && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                  Flash Deals
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="ml-auto text-[11px] text-rose-400 hover:text-rose-300 font-bold"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Product Grid Area */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl glass-card overflow-hidden animate-pulse flex flex-col h-96"
                >
                  <div className="h-48 bg-slate-800/80 w-full" />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-800 rounded w-1/3" />
                      <div className="h-5 bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-800 rounded w-full" />
                    </div>
                    <div className="h-10 bg-slate-800 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 rounded-2xl glass-card border border-rose-500/20 p-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Failed to load catalog</h3>
              <p className="text-xs text-rose-300 mb-6">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 rounded-2xl glass-card p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <PackageSearch className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No matching products</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
                No items match your active price or brand filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onOpenDetail={setDetailProduct}
                  onOpenPriceHistory={setHistoryProduct}
                  onOpenPriceLock={setLockProduct}
                  onOpenNegotiator={setNegotiateProduct}
                  onOpenSquadBuy={onOpenSquadBuy}
                  onOpenEmiCalculator={onOpenEmiCalculator}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Interactive SmartSense™ Modals */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOpenPriceHistory={(p) => {
            setDetailProduct(null);
            setHistoryProduct(p);
          }}
          onOpenPriceLock={(p) => {
            setDetailProduct(null);
            setLockProduct(p);
          }}
          onOpenNegotiator={(p) => {
            setDetailProduct(null);
            setNegotiateProduct(p);
          }}
          onOpenSquadBuy={(p) => {
            setDetailProduct(null);
            if (onOpenSquadBuy) onOpenSquadBuy(p);
          }}
          onOpenEmiCalculator={(p) => {
            setDetailProduct(null);
            if (onOpenEmiCalculator) onOpenEmiCalculator(p);
          }}
        />
      )}

      {historyProduct && (
        <PriceHistoryModal
          product={historyProduct}
          onClose={() => setHistoryProduct(null)}
        />
      )}

      {lockProduct && (
        <PriceLockModal
          product={lockProduct}
          onClose={() => setLockProduct(null)}
        />
      )}

      {negotiateProduct && (
        <NegotiateDealModal
          product={negotiateProduct}
          onClose={() => setNegotiateProduct(null)}
        />
      )}
    </div>
  );
};

export default StorePage;
