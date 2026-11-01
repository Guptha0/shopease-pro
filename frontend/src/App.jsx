import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WalletProvider } from './context/WalletContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import apiClient from './api/apiClient';

// Layout Components
import Navbar from './components/Navbar';
import CategoryTabs from './components/CategoryTabs';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Footer from './components/Footer';
import CompareDrawer from './components/CompareDrawer';
import NotificationToastBanner from './components/NotificationToastBanner';

// Global Modals
import PincodeModal from './components/PincodeModal';
import InvoiceModal from './components/InvoiceModal';
import ProductDetailModal from './components/ProductDetailModal';
import PriceHistoryModal from './components/PriceHistoryModal';
import PriceLockModal from './components/PriceLockModal';
import NegotiateDealModal from './components/NegotiateDealModal';

// Pages
import StorePage from './pages/StorePage';
import CartView from './pages/CartView';
import OrdersPage from './pages/OrdersPage';
import AdminSellerCentral from './pages/AdminSellerCentral';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import WalletPage from './pages/WalletPage';
import NotificationsPage from './pages/NotificationsPage';
import AccountPage from './pages/AccountPage';
import ShopBotModal from './components/ShopBotModal';
import ScratchCardModal from './components/ScratchCardModal';
import VisualSearchModal from './components/VisualSearchModal';
import SquadBuyModal from './components/SquadBuyModal';
import GiftCardModal from './components/GiftCardModal';
import EmiCalculatorModal from './components/EmiCalculatorModal';

function AppContent() {
  const { user, isAdmin } = useAuth();

  const [currentView, setCurrentView] = useState('store'); // 'store' | 'orders' | 'admin' | 'checkout' | 'auth' | 'cart'
  const [previousView, setPreviousView] = useState('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  
  // Enterprise Modal States
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [scratchCardOrder, setScratchCardOrder] = useState(null);
  const [squadBuyProduct, setSquadBuyProduct] = useState(null);
  const [emiProduct, setEmiProduct] = useState(null);

  // Direct modal triggers from navbar or cart
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [negotiateProduct, setNegotiateProduct] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [lockProduct, setLockProduct] = useState(null);

  // Pre-load all products for navbar auto-suggest
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        if (res.data?.success && res.data.products) {
          setCatalogProducts(Array.isArray(res.data.products) ? res.data.products : []);
        }
      } catch (e) {
        console.warn('Navbar product prefetch:', e.message);
      }
    };
    loadProducts();
  }, []);

  const navigateTo = (view) => {
    if (view === 'auth') {
      setPreviousView(currentView);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryTabSelect = (tabId, isNav) => {
    if (isNav) {
      navigateTo(tabId);
    } else {
      setSelectedCategory(tabId);
      if (currentView !== 'store') {
        navigateTo('store');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <div>
        {/* Main Navbar */}
        <Navbar
          currentView={currentView}
          setCurrentView={navigateTo}
          setIsCartOpen={setIsCartOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenPincodeModal={() => setIsPincodeOpen(true)}
          onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
          onOpenGiftCards={() => setIsGiftCardOpen(true)}
          onOpenSquadBuy={() => {
            if (catalogProducts.length > 0) setSquadBuyProduct(catalogProducts[0]);
          }}
          products={catalogProducts}
          onSelectProduct={(product) => {
            setSelectedProductForDetail(product);
          }}
        />

        {/* Amazon/Flipkart Category Navigation Tabs */}
        {currentView === 'store' && (
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryTabSelect}
          />
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1">
          {currentView === 'store' && (
            <StorePage
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenSquadBuy={(p) => setSquadBuyProduct(p)}
              onOpenEmiCalculator={(p) => setEmiProduct(p)}
            />
          )}

          {currentView === 'cart' && (
            <CartView
              onProceedToCheckout={() => navigateTo('checkout')}
              onOpenNegotiator={(product) => setNegotiateProduct(product)}
              onExplore={() => navigateTo('store')}
            />
          )}

          {currentView === 'orders' && (
            <OrdersPage
              onExplore={() => navigateTo('store')}
              onViewInvoice={(order) => setInvoiceOrder(order)}
            />
          )}

          {currentView === 'admin' && (
            isAdmin ? (
              <AdminSellerCentral />
            ) : (
              <div className="max-w-md mx-auto py-24 px-4 text-center">
                <div className="p-8 rounded-3xl glass-card border border-rose-500/20">
                  <h3 className="text-xl font-bold text-white mb-2">Admin Access Required</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    You need seller/administrator privileges to access the Seller Central portal.
                  </p>
                  <button
                    onClick={() => navigateTo('auth')}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Switch to Admin Account
                  </button>
                </div>
              </div>
            )
          )}

          {currentView === 'checkout' && (
            <CheckoutPage
              onOrderPlaced={(order) => {
                setInvoiceOrder(order);
                setScratchCardOrder(order);
                navigateTo('orders');
              }}
              onNavigateToAuth={() => navigateTo('auth')}
            />
          )}

          {currentView === 'wallet' && (
            <WalletPage onExploreStore={() => navigateTo('store')} />
          )}

          {currentView === 'account' && (
            <AccountPage
              onExploreStore={() => navigateTo('store')}
              onViewInvoice={(order) => setInvoiceOrder(order)}
              onTrackOrder={() => navigateTo('orders')}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsPage
              onNavigateToOrders={() => navigateTo('orders')}
              onNavigateToWallet={() => navigateTo('wallet')}
              onExploreStore={() => navigateTo('store')}
            />
          )}

          {currentView === 'auth' && (
            <AuthPage
              onSuccess={() => {
                navigateTo(previousView === 'checkout' ? 'checkout' : 'store');
              }}
            />
          )}
        </main>
      </div>

      {/* Slide-over Quick Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          navigateTo('checkout');
        }}
      />

      {/* Side-by-Side Smart Spec Compare Drawer & Winner Highlights */}
      <CompareDrawer />

      {/* Delivery Pincode Checker Modal */}
      <PincodeModal
        isOpen={isPincodeOpen}
        onClose={() => setIsPincodeOpen(false)}
      />

      {/* Official GST Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        onTrackOrder={() => {
          setInvoiceOrder(null);
          navigateTo('orders');
        }}
      />

      {/* Top Navbar Selected Product Detail Modal */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onOpenPriceHistory={(p) => {
            setSelectedProductForDetail(null);
            setHistoryProduct(p);
          }}
          onOpenPriceLock={(p) => {
            setSelectedProductForDetail(null);
            setLockProduct(p);
          }}
          onOpenNegotiator={(p) => {
            setSelectedProductForDetail(null);
            setNegotiateProduct(p);
          }}
          onOpenSquadBuy={(p) => {
            setSelectedProductForDetail(null);
            setSquadBuyProduct(p);
          }}
          onOpenEmiCalculator={(p) => {
            setSelectedProductForDetail(null);
            setEmiProduct(p);
          }}
        />
      )}

      {/* Global Modals triggered from other contexts */}
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

      {/* Live Order SMS & WhatsApp Notification Simulator Banner */}
      <NotificationToastBanner
        onNavigateToOrders={() => navigateTo('orders')}
        onNavigateToWallet={() => navigateTo('wallet')}
      />

      {/* Floating System Notifications */}
      <ShopBotModal
        onNavigate={navigateTo}
        onSelectProduct={(p) => setSelectedProductForDetail(p)}
      />
            {/* AI Visual Snap & Search Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProductForDetail(p)}
      />

      {/* Post-Checkout Mystery Scratch Card Modal */}
      <ScratchCardModal
        isOpen={Boolean(scratchCardOrder)}
        orderNumber={scratchCardOrder?.trackingNumber || 'ORD-RECENT'}
        onClose={() => setScratchCardOrder(null)}
      />

      {/* Pinduoduo-Style Squad Buy 15% Group Discount Modal */}
      <SquadBuyModal
        isOpen={Boolean(squadBuyProduct)}
        product={squadBuyProduct}
        onClose={() => setSquadBuyProduct(null)}
        onProceedCheckout={() => navigateTo('checkout')}
      />

      {/* Digital Gift Cards Modal */}
      <GiftCardModal
        isOpen={isGiftCardOpen}
        onClose={() => setIsGiftCardOpen(false)}
      />

      {/* 0% No-Cost EMI Calculator Modal */}
      <EmiCalculatorModal
        isOpen={Boolean(emiProduct)}
        product={emiProduct}
        onClose={() => setEmiProduct(null)}
        onSelectEmiPlan={(plan, bank) => {
          setEmiProduct(null);
          navigateTo('checkout');
        }}
      />

      <Toast />

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CurrencyProvider>
        <WalletProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WalletProvider>
      </CurrencyProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
