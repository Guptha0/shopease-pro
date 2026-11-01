const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/AccountPage.jsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Add state for PayLater and Subscriptions
if (!code.includes('subscriptionsList')) {
  const targetState = `  // Support Tickets State
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);`;

  const replacementState = `  // Support Tickets State
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Pay Later State
  const [payLater, setPayLater] = useState({
    creditLimit: 25000,
    availableCredit: 21500,
    usedCredit: 3500,
    dues: [
      {
        id: 'DUE-9842',
        orderId: 'TRK-BD8921KA',
        amount: 3500,
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        isPaid: false,
      },
    ],
  });

  // Subscriptions State
  const [subscriptionsList, setSubscriptionsList] = useState([
    {
      id: 'SUB-1029',
      productName: 'Raspberry Pi 5 8GB RAM AI Starter Kit',
      originalPrice: 8499,
      discountedPrice: 7649, // 10% off
      intervalDays: 30,
      nextDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    },
  ]);

  // Gift Cards State
  const [giftCardsList, setGiftCardsList] = useState([
    {
      code: 'GFT-8492-TECH',
      amount: 1500,
      senderName: 'ShopEase VIP Rewards',
      theme: 'Tech Geek',
      isRedeemed: true,
      redeemedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ]);`;

  code = code.replace(targetState, replacementState);
}

// 2. Add tabs in navTabs array
if (!code.includes("id: 'paylater'")) {
  const targetTabs = `    { id: 'wishlist', label: \`Wishlist (\${wishlist.length})\`, icon: Heart },
    { id: 'tickets', label: \`Support Tickets (\${tickets.length})\`, icon: MessageSquare },`;

  const replacementTabs = `    { id: 'paylater', label: 'ShopEase Pay Later (BNPL)', icon: CreditCard },
    { id: 'subscriptions', label: \`Subscriptions (\${subscriptionsList.length})\`, icon: Clock },
    { id: 'giftcards', label: 'Digital Gift Cards', icon: Gift },
    { id: 'wishlist', label: \`Wishlist (\${wishlist.length})\`, icon: Heart },
    { id: 'tickets', label: \`Support Tickets (\${tickets.length})\`, icon: MessageSquare },`;

  code = code.replace(targetTabs, replacementTabs);
}

// 3. Render PayLater, Subscriptions, and Gift Cards tab panes
if (!code.includes("activeTab === 'paylater'")) {
  const targetEnd = `      {/* RETURN MODAL */}`;

  const replacementPanes = `      {/* TAB: SHOPEASE PAY LATER (BNPL) */}
      {activeTab === 'paylater' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black text-white">ShopEase Pay Later (BNPL)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Pre-Approved Line
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Shop with 1-click zero interest credit. Repay dues within 30 days without hidden fees.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400 block">Available Credit Limit</span>
              <span className="text-2xl font-black text-white font-mono">
                ₹{payLater.availableCredit.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">Total Limit: ₹{payLater.creditLimit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Used Credit</span>
              <span className="text-2xl font-bold text-rose-400 font-mono">
                ₹{payLater.usedCredit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Repayment Status</span>
              <span className="text-sm font-bold text-emerald-400 block mt-1">
                Zero Interest (Active Grace Period)
              </span>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Repay Outstanding Dues</span>
                <span className="text-xs font-bold text-white">1-Click Fast Clear</span>
              </div>
              <button
                onClick={() => {
                  setPayLater((prev) => ({
                    ...prev,
                    availableCredit: prev.creditLimit,
                    usedCredit: 0,
                    dues: prev.dues.map((d) => ({ ...d, isPaid: true })),
                  }));
                  triggerNotification({
                    channel: 'SMS',
                    type: 'wallet',
                    title: 'Pay Later Dues Cleared!',
                    message: 'ShopEase Pay Later: Outstanding dues of ₹3,500 cleared successfully. Available credit restored to ₹25,000!',
                  });
                  alert('Outstanding Pay Later dues repaid successfully! Credit line restored to ₹25,000.');
                }}
                disabled={payLater.usedCredit === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-all shadow-md"
              >
                {payLater.usedCredit === 0 ? 'Fully Paid' : 'Repay Dues'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MY SUBSCRIPTIONS (SUBSCRIBE & SAVE 10%) */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Subscribe & Save Recurring Deliveries ({subscriptionsList.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated recurring orders with 10% discount. Pause, resume, or cancel anytime.
            </p>
          </div>

          <div className="space-y-4">
            {subscriptionsList.map((sub) => (
              <div
                key={sub.id}
                className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={sub.imageUrl}
                    alt={sub.productName}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-950 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        10% Subscribe Discount Active
                      </span>
                      <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${
                        sub.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }\`}>
                        {sub.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1">{sub.productName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Delivery cadence: <strong className="text-white">Every {sub.intervalDays} Days</strong> • Next dispatch on {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-black text-white">
                      ₹{sub.discountedPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-500 line-through text-xs block">
                      ₹{sub.originalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newStatus = sub.status === 'Active' ? 'Paused' : 'Active';
                        setSubscriptionsList((prev) =>
                          prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s))
                        );
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      {sub.status === 'Active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => {
                        setSubscriptionsList((prev) => prev.filter((s) => s.id !== sub.id));
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/40 text-rose-300 hover:bg-rose-950/70"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DIGITAL GIFT CARDS */}
      {activeTab === 'giftcards' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/50 via-slate-900 to-indigo-950/40 border border-pink-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-black text-white">Digital Gift Cards & Vouchers</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Send personalized gift cards or redeem codes directly into your Virtual Wallet.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {giftCardsList.map((gft, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-pink-400 text-xs">{gft.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Redeemed to Wallet
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    From: {gft.senderName} • {gft.theme} Edition
                  </span>
                </div>
                <span className="text-lg font-black text-white font-mono">
                  +₹{gft.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RETURN MODAL */}`;

  code = code.replace(targetEnd, replacementPanes);
}

fs.writeFileSync('frontend/src/pages/AccountPage.jsx', code, 'utf8');
console.log('✔ AccountPage.jsx updated with Pay Later, Subscriptions, and Gift Cards tabs');

