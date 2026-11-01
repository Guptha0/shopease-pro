const fs = require('fs');

// 1. Update Navbar.jsx
let nav = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8').replace(/\r\n/g, '\n');
if (!nav.includes("setCurrentView('account')")) {
  const targetMenu = `                    <button
                      onClick={() => {
                        setCurrentView('orders');`;

  const replacementMenu = `                    <button
                      onClick={() => {
                        setCurrentView('account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 font-bold text-left"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>My Account Hub</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('orders');`;

  nav = nav.replace(targetMenu, replacementMenu);
  fs.writeFileSync('frontend/src/components/Navbar.jsx', nav, 'utf8');
  console.log('Navbar.jsx updated with Account Hub button!');
}

// 2. Update CategoryTabs.jsx
let cat = fs.readFileSync('frontend/src/components/CategoryTabs.jsx', 'utf8').replace(/\r\n/g, '\n');
if (!cat.includes("id: 'account'")) {
  const targetTabs = `{ id: 'orders', label: 'Track Orders', icon: Package, isNav: true },`;
  const replacementTabs = `{ id: 'account', label: 'My Account Hub', icon: Package, isNav: true },\n    { id: 'orders', label: 'Track Orders', icon: Package, isNav: true },`;
  cat = cat.replace(targetTabs, replacementTabs);
  fs.writeFileSync('frontend/src/components/CategoryTabs.jsx', cat, 'utf8');
  console.log('CategoryTabs.jsx updated with Account Hub tab!');
}

