const fs = require('fs');

console.log('Starting enterprise modules wiring...');

// ==========================================
// 1. UPDATE App.jsx
// ==========================================
let appCode = fs.readFileSync('frontend/src/App.jsx', 'utf8').replace(/\r\n/g, '\n');

if (!appCode.includes('CurrencyProvider')) {
  appCode = appCode.replace(
    "import { NotificationProvider } from './context/NotificationContext';",
    "import { NotificationProvider } from './context/NotificationContext';\nimport { CurrencyProvider } from './context/CurrencyContext';"
  );
  appCode = appCode.replace(
    "<WalletProvider>",
    "<CurrencyProvider>\n        <WalletProvider>"
  );
  appCode = appCode.replace(
    "</WalletProvider>",
    "</WalletProvider>\n      </CurrencyProvider>"
  );
}

if (!appCode.includes('ScratchCardModal')) {
  appCode = appCode.replace(
    "import ShopBotModal from './components/ShopBotModal';",
    `import ShopBotModal from './components/ShopBotModal';
import ScratchCardModal from './components/ScratchCardModal';
import VisualSearchModal from './components/VisualSearchModal';
import SquadBuyModal from './components/SquadBuyModal';
import GiftCardModal from './components/GiftCardModal';
import EmiCalculatorModal from './components/EmiCalculatorModal';`
  );
}

if (!appCode.includes('isVisualSearchOpen')) {
  const targetState = `  const [catalogProducts, setCatalogProducts] = useState([]);`;
  const replacementState = `  const [catalogProducts, setCatalogProducts] = useState([]);
  
  // Enterprise Modal States
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [scratchCardOrder, setScratchCardOrder] = useState(null);
  const [squadBuyProduct, setSquadBuyProduct] = useState(null);
  const [emiProduct, setEmiProduct] = useState(null);`;

  appCode = appCode.replace(targetState, replacementState);
}

// Pass enterprise triggers to Navbar
if (!appCode.includes('onOpenVisualSearch')) {
  appCode = appCode.replace(
    "onOpenPincodeModal={() => setIsPincodeOpen(true)}",
    `onOpenPincodeModal={() => setIsPincodeOpen(true)}
          onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
          onOpenGiftCards={() => setIsGiftCardOpen(true)}
          onOpenSquadBuy={() => {
            if (catalogProducts.length > 0) setSquadBuyProduct(catalogProducts[0]);
          }}`
  );
}

// Pass triggers to StorePage
if (!appCode.includes('onOpenSquadBuy=')) {
  appCode = appCode.replace(
    `setSelectedCategory={setSelectedCategory}
            />`,
    `setSelectedCategory={setSelectedCategory}
              onOpenSquadBuy={(p) => setSquadBuyProduct(p)}
              onOpenEmiCalculator={(p) => setEmiProduct(p)}
            />`
  );
}

// Pass triggers to CheckoutPage
if (!appCode.includes('onOrderCompletedWithScratch=')) {
  appCode = appCode.replace(
    `onOrderPlaced={(order) => {
                setInvoiceOrder(order);
                navigateTo('orders');
              }}`,
    `onOrderPlaced={(order) => {
                setInvoiceOrder(order);
                setScratchCardOrder(order);
                navigateTo('orders');
              }}`
  );
}

// Pass triggers to ProductDetailModal
if (!appCode.includes('onOpenSquadBuy=')) {
  appCode = appCode.replace(
    `onOpenNegotiator={(p) => {
            setSelectedProductForDetail(null);
            setNegotiateProduct(p);
          }}`,
    `onOpenNegotiator={(p) => {
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
          }}`
  );
}

// Mount enterprise modals before Toast
if (!appCode.includes('<VisualSearchModal')) {
  const targetToast = `<Toast />`;
  const replacementModals = `      {/* AI Visual Snap & Search Modal */}
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

      <Toast />`;

  appCode = appCode.replace(targetToast, replacementModals);
}

fs.writeFileSync('frontend/src/App.jsx', appCode, 'utf8');
console.log('✔ App.jsx updated with all Enterprise modals and CurrencyProvider');

// ==========================================
// 2. UPDATE Navbar.jsx (Currency Switcher & Visual Search)
// ==========================================
let navCode = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8').replace(/\r\n/g, '\n');

if (!navCode.includes('useCurrency')) {
  navCode = navCode.replace(
    "import { useCart } from '../context/CartContext';",
    "import { useCart } from '../context/CartContext';\nimport { useCurrency } from '../context/CurrencyContext';"
  );
}

if (!navCode.includes('Camera')) {
  navCode = navCode.replace(
    "  ShoppingBag,",
    "  ShoppingBag,\n  Camera,\n  Globe,\n  Gift,\n  Users,"
  );
}

if (!navCode.includes('currencyDropdownOpen')) {
  navCode = navCode.replace(
    "const Navbar = ({",
    `const Navbar = ({\n  onOpenVisualSearch,\n  onOpenGiftCards,\n  onOpenSquadBuy,`
  );
  navCode = navCode.replace(
    "const [suggestOpen, setSuggestOpen] = useState(false);",
    `const [suggestOpen, setSuggestOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { currency, setCurrency, currencies, activeCurrency } = useCurrency();`
  );
}

// Add Camera button in search bar
if (!navCode.includes('onOpenVisualSearch()')) {
  const targetClear = `{searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}`;

  const replacementSearchTools = `<div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
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
              </div>`;

  navCode = navCode.replace(targetClear, replacementSearchTools);
}

// Add Currency Switcher dropdown & Gift card shortcut before user dropdown
if (!navCode.includes('currencyOpen')) {
  const targetNotif = `{/* Notification Bell */}`;
  const replacementCurrency = `{/* Global Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all"
                title="Change Display Currency"
              >
                <span>{activeCurrency?.flag || '🇮🇳'}</span>
                <span>{currency}</span>
              </button>

              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-fadeIn">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Currency
                  </div>
                  {Object.entries(currencies || {}).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrency(key);
                        setCurrencyOpen(false);
                      }}
                      className={\`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all \${
                        currency === key ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }\`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{val.flag}</span>
                        <span>{key} ({val.symbol})</span>
                      </span>
                      {currency === key && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Digital Gift Cards Shortcut */}
            {onOpenGiftCards && (
              <button
                onClick={onOpenGiftCards}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 transition-all hidden md:flex items-center gap-1.5 text-xs font-semibold"
                title="Send Digital Gift Cards"
              >
                <Gift className="w-4 h-4 text-pink-400" />
                <span>Gift Cards</span>
              </button>
            )}

            {/* Notification Bell */}`;

  navCode = navCode.replace(targetNotif, replacementCurrency);
}

// Add Squad Buy in user dropdown
if (!navCode.includes('Squad Buy Deals')) {
  navCode = navCode.replace(
    `<span>My Account Hub</span>
                    </button>`,
    `<span>My Account Hub</span>
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
                    )}`
  );
}

fs.writeFileSync('frontend/src/components/Navbar.jsx', navCode, 'utf8');
console.log('✔ Navbar.jsx updated with Currency Switcher, Snap & Search, and Gift Cards');

