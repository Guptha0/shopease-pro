const fs = require('fs');

let code = fs.readFileSync('frontend/src/App.jsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Imports
if (!code.includes('import AccountPage')) {
  code = code.replace(
    "import NotificationsPage from './pages/NotificationsPage';",
    "import NotificationsPage from './pages/NotificationsPage';\nimport AccountPage from './pages/AccountPage';\nimport ShopBotModal from './components/ShopBotModal';"
  );
}

// 2. View
if (!code.includes("currentView === 'account'")) {
  const targetView = `{currentView === 'wallet' && (
            <WalletPage onExploreStore={() => navigateTo('store')} />
          )}`;

  const replacementView = `{currentView === 'wallet' && (
            <WalletPage onExploreStore={() => navigateTo('store')} />
          )}

          {currentView === 'account' && (
            <AccountPage
              onExploreStore={() => navigateTo('store')}
              onViewInvoice={(order) => setInvoiceOrder(order)}
              onTrackOrder={() => navigateTo('orders')}
            />
          )}`;

  code = code.replace(targetView, replacementView);
}

// 3. Mount ShopBotModal
if (!code.includes('<ShopBotModal')) {
  code = code.replace(
    '<Toast />',
    `<ShopBotModal
        onNavigate={navigateTo}
        onSelectProduct={(p) => setSelectedProductForDetail(p)}
      />\n      <Toast />`
  );
}

fs.writeFileSync('frontend/src/App.jsx', code, 'utf8');
console.log('App.jsx successfully updated!');

