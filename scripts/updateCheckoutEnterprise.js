const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/CheckoutPage.jsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Add BNPL, Gift, and Subscription state
if (!code.includes('isPayLater')) {
  const targetState = `  const [isEcoPackaging, setIsEcoPackaging] = useState(true);`;
  const replacementState = `  const [isEcoPackaging, setIsEcoPackaging] = useState(true);
  const [isSubscribeAndSave, setIsSubscribeAndSave] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('Hope you enjoy this special gift from ShopEase Pro!');
  const [payLaterCredit, setPayLaterCredit] = useState({ available: 25000, limit: 25000 });`;

  code = code.replace(targetState, replacementState);
}

// 2. Adjust total calculations for Subscribe & Save 10%
if (!code.includes('subDiscount')) {
  const targetCalc = `  const coinsDiscount = redeemCoinsToggle ? maxRedeemableCoins : 0;
  const finalTotalAmount = Math.max(0, grandTotal + codFee - coinsDiscount);`;

  const replacementCalc = `  const subDiscount = isSubscribeAndSave ? Math.round(grandTotal * 0.10) : 0;
  const coinsDiscount = redeemCoinsToggle ? maxRedeemableCoins : 0;
  const finalTotalAmount = Math.max(0, grandTotal + codFee - coinsDiscount - subDiscount);`;

  code = code.replace(targetCalc, replacementCalc);
}

// 3. Add Subscribe & Save and Gift options in Step 2
if (!code.includes('Subscribe & Save 10%')) {
  const targetEco = `{/* One-Click Eco-Checkout Option */}`;

  const replacementOptions = `{/* Subscribe & Save 10% Option */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="subAndSave"
                  checked={isSubscribeAndSave}
                  onChange={(e) => setIsSubscribeAndSave(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="subAndSave" className="flex-1 cursor-pointer select-none">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Subscribe & Save Extra 10% (Automated Delivery Every 30 Days)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Never run out of essential tech & accessories. Pause, change cadence, or cancel anytime with 1 click in your Account Hub.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Saves ₹{Math.round(grandTotal * 0.10).toLocaleString('en-IN')} instantly on this order
                  </span>
                </label>
              </div>

              {/* Gift Option */}
              <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/30 space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="giftWrap"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-pink-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="giftWrap" className="flex-1 cursor-pointer select-none">
                    <div className="flex items-center gap-1.5 font-bold text-pink-300 text-xs">
                      <Gift className="w-4 h-4 text-pink-400" />
                      <span>This is a Gift (Add Premium Gift Box & Personalized Greeting Note)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Prices are hidden from physical packaging and an elegant greeting card is attached.
                    </p>
                  </label>
                </div>

                {isGift && (
                  <div className="pt-2 pl-7">
                    <input
                      type="text"
                      placeholder="Add personal greeting message..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}
              </div>

              {/* One-Click Eco-Checkout Option */}`;

  code = code.replace(targetEco, replacementOptions);
}

// 4. Add "ShopEase Pay Later (BNPL)" in Payment Methods
if (!code.includes('ShopEase Pay Later (BNPL)')) {
  const targetWallet = `{/* 1. Pay via ShopEase Wallet */}`;

  const replacementPayLater = `{/* BNPL. ShopEase Pay Later (0% EMI / 30-Day Credit) */}
                <div
                  onClick={() => setPaymentMethod('PayLater')}
                  className={\`p-4 rounded-2xl border cursor-pointer transition-all \${
                    paymentMethod === 'PayLater'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }\`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-white">ShopEase Pay Later (BNPL)</strong>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Pre-Approved
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Available Credit: <strong className="text-purple-300 font-mono">₹{payLaterCredit.available.toLocaleString('en-IN')}</strong> • Repay after 30 days at 0% interest
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'PayLater'}
                      onChange={() => setPaymentMethod('PayLater')}
                      className="text-purple-600"
                    />
                  </div>

                  {paymentMethod === 'PayLater' && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-300">
                      <span>✓ 1-Click Zero Interest Credit Line checkout</span>
                      <span className="font-bold">Due in 30 days</span>
                    </div>
                  )}
                </div>

                {/* 1. Pay via ShopEase Wallet */}`;

  code = code.replace(targetWallet, replacementPayLater);
}

// 5. Update executeOrderPlacement to handle PayLater
if (!code.includes('verifiedPaymentMethod === \'PayLater\'')) {
  const targetCheck = `if (verifiedPaymentMethod === 'Wallet' && walletBalance < finalTotalAmount) {`;

  const replacementCheck = `if (verifiedPaymentMethod === 'PayLater' && payLaterCredit.available < finalTotalAmount) {
      setError(\`Insufficient ShopEase Pay Later credit limit (Available: ₹\${payLaterCredit.available.toLocaleString('en-IN')}).\`);
      return;
    }

    if (verifiedPaymentMethod === 'Wallet' && walletBalance < finalTotalAmount) {`;

  code = code.replace(targetCheck, replacementCheck);
}

// 6. Deduct BNPL on order success
if (!code.includes('setPayLaterCredit')) {
  const targetWalletDeduct = `if (verifiedPaymentMethod === 'Wallet') {`;

  const replacementPayLaterDeduct = `if (verifiedPaymentMethod === 'PayLater') {
          setPayLaterCredit((prev) => ({
            ...prev,
            available: Math.max(0, prev.available - finalTotalAmount),
          }));
        }

        if (verifiedPaymentMethod === 'Wallet') {`;

  code = code.replace(targetWalletDeduct, replacementPayLaterDeduct);
}

// 7. Reflect Subscribe & Save discount in summary panel
if (!code.includes('Subscribe & Save Discount:')) {
  const targetSummaryTotal = `<div className="flex justify-between">
                <span>Platform Fee:</span>`;

  const replacementSummaryTotal = `{isSubscribeAndSave && (
                <div className="flex justify-between text-indigo-400 font-semibold">
                  <span>Subscribe & Save (10% Off):</span>
                  <span>- ₹{Math.round(grandTotal * 0.10).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Platform Fee:</span>`;

  code = code.replace(targetSummaryTotal, replacementSummaryTotal);
}

fs.writeFileSync('frontend/src/pages/CheckoutPage.jsx', code, 'utf8');
console.log('✔ CheckoutPage.jsx updated with Pay Later BNPL, Subscribe & Save, and Gifting');

