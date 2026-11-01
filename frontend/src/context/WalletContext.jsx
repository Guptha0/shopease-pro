import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

const DEMO_CUSTOMER_WALLET = {
  balance: 1500,
  rewardsCoins: 120,
  transactions: [
    {
      id: 'TXN-INIT-01',
      type: 'CREDIT',
      amount: 1500,
      description: 'Demo Pre-Loaded Float for Instant Checkout',
      referenceId: 'DEMO-FLOAT-1500',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'TXN-INIT-02',
      type: 'CREDIT',
      amount: 120,
      description: 'Loyalty Reward Coins from Previous Orders',
      referenceId: 'REWARD-COINS-120',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
};

const FRESH_USER_WALLET = {
  balance: 0,
  rewardsCoins: 0,
  transactions: [],
};

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();

  const [wallet, setWallet] = useState(() => {
    try {
      const saved = localStorage.getItem('shopease_wallet');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.balance === 'number') return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached wallet:', e);
    }
    // Demo accounts start with ₹1,500 float, fresh users start with ₹0
    return user?.email === 'user@shopease.com' || !user ? DEMO_CUSTOMER_WALLET : FRESH_USER_WALLET;
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shopease_wallet', JSON.stringify(wallet));
    } catch (e) {
      console.warn('Failed to persist wallet:', e);
    }
  }, [wallet]);

  // Fetch from backend when user changes
  const fetchWallet = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/wallet');
      if (res.data?.success && res.data.wallet) {
        setWallet(res.data.wallet);
      }
    } catch (err) {
      console.warn('[Wallet] Backend fetch offline fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  // Add Money via UPI/Card
  const addMoney = async (amount, paymentMethod = 'UPI', upiId = 'user@okaxis') => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid amount greater than zero');
    }

    try {
      const res = await apiClient.post('/wallet/add-money', {
        amount: numAmount,
        paymentMethod,
        upiId,
      });

      if (res.data?.success && res.data.wallet) {
        setWallet(res.data.wallet);
        return res.data;
      }
    } catch (err) {
      console.warn('[Wallet] Fallback local add-money:', err.message);
    }

    // LocalStorage fallback update
    const newTxn = {
      id: 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase(),
      type: 'CREDIT',
      amount: numAmount,
      description: paymentMethod === 'UPI' ? `Money Loaded via UPI (${upiId})` : `Money Loaded via ${paymentMethod}`,
      referenceId: 'UPI-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...wallet,
      balance: (wallet.balance || 0) + numAmount,
      transactions: [newTxn, ...(wallet.transactions || [])],
    };

    setWallet(updated);
    return {
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} added to your wallet!`,
      wallet: updated,
    };
  };

  // Pay using Wallet during checkout
  const payWithWallet = async (amount, orderId = '', description = '') => {
    const numAmount = Number(amount);
    if ((wallet.balance || 0) < numAmount) {
      throw new Error(`Insufficient wallet balance. Available: ₹${(wallet.balance || 0).toLocaleString('en-IN')}`);
    }

    try {
      const res = await apiClient.post('/wallet/pay', {
        amount: numAmount,
        orderId,
        description,
      });

      if (res.data?.success && res.data.wallet) {
        setWallet(res.data.wallet);
        return res.data;
      }
    } catch (err) {
      console.warn('[Wallet] Fallback local pay:', err.message);
    }

    // Fallback debit
    const newTxn = {
      id: 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase(),
      type: 'DEBIT',
      amount: numAmount,
      description: description || `Payment for Order #${orderId || 'NEW'}`,
      referenceId: 'ORD-' + (orderId || Math.random().toString(36).substring(2, 8).toUpperCase()),
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...wallet,
      balance: Math.max(0, (wallet.balance || 0) - numAmount),
      transactions: [newTxn, ...(wallet.transactions || [])],
    };

    setWallet(updated);
    return { success: true, wallet: updated };
  };

  // Redeem Coins at checkout
  const redeemCoins = (coinsToRedeem, orderTracking = '') => {
    const numCoins = Number(coinsToRedeem);
    if (numCoins <= 0) return;

    const newTxn = {
      id: 'TXN-' + Date.now().toString(36).toUpperCase(),
      type: 'DEBIT',
      amount: numCoins,
      description: `Redeemed ${numCoins} ShopEase Coins for Cart Discount on #${orderTracking}`,
      referenceId: 'COIN-RED-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      rewardsCoins: Math.max(0, (prev.rewardsCoins || 0) - numCoins),
      transactions: [newTxn, ...(prev.transactions || [])],
    }));
  };

  // Award 5% Cashback Coins on purchase
  const awardCashbackCoins = (coinsEarned, orderTracking = '') => {
    const numCoins = Number(coinsEarned);
    if (numCoins <= 0) return;

    const newTxn = {
      id: 'TXN-' + Date.now().toString(36).toUpperCase(),
      type: 'CREDIT',
      amount: numCoins,
      description: `5% Cashback Reward (${numCoins} ShopEase Coins) on #${orderTracking}`,
      referenceId: 'CB-' + (orderTracking || Math.random().toString(36).substring(2, 8).toUpperCase()),
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      rewardsCoins: (prev.rewardsCoins || 0) + numCoins,
      transactions: [newTxn, ...(prev.transactions || [])],
    }));
  };

  // Claim ₹100 Referral Reward
  const claimReferral = async (referralCode = 'FRIEND-REF') => {
    try {
      const res = await apiClient.post('/wallet/referral', { referralCode });
      if (res.data?.success && res.data.wallet) {
        setWallet(res.data.wallet);
        return res.data;
      }
    } catch (err) {
      console.warn('[Wallet] Fallback local referral claim:', err.message);
    }

    const bonus = 100;
    const newTxn = {
      id: 'TXN-' + Date.now().toString(36).toUpperCase(),
      type: 'CREDIT',
      amount: bonus,
      description: `Referral Reward: Friend joined via ${referralCode}`,
      referenceId: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...wallet,
      balance: (wallet.balance || 0) + bonus,
      transactions: [newTxn, ...(wallet.transactions || [])],
    };

    setWallet(updated);
    return {
      success: true,
      message: '₹100 Referral Cash successfully credited to your wallet!',
      wallet: updated,
    };
  };

  // Claim 7-Day Price Drop Protection Refund
  const claimPriceDrop = async (productName = 'Product', dropAmount = 500, orderTracking = 'TRK-RECENT') => {
    const numDrop = Number(dropAmount) || 500;
    try {
      const res = await apiClient.post('/wallet/claim-price-drop', {
        productName,
        dropAmount: numDrop,
        orderTracking,
      });
      if (res.data?.success && res.data.wallet) {
        setWallet(res.data.wallet);
        return res.data;
      }
    } catch (err) {
      console.warn('[Wallet] Fallback local price drop claim:', err.message);
    }

    const newTxn = {
      id: 'TXN-' + Date.now().toString(36).toUpperCase(),
      type: 'CREDIT',
      amount: numDrop,
      description: `7-Day Price-Drop Protection Guarantee Refund: ${productName}`,
      referenceId: 'DROP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...wallet,
      balance: (wallet.balance || 0) + numDrop,
      transactions: [newTxn, ...(wallet.transactions || [])],
    };
    setWallet(updated);
    return {
      success: true,
      message: `₹${numDrop.toLocaleString('en-IN')} Price-Drop refund automatically credited to your wallet!`,
      wallet: updated,
    };
  };

  // Credit Refund directly to wallet
  const creditRefund = (refundAmount, returnId = '', orderTracking = '') => {
    const numAmt = Number(refundAmount) || 0;
    if (numAmt <= 0) return;

    const newTxn = {
      id: 'TXN-' + Date.now().toString(36).toUpperCase(),
      type: 'CREDIT',
      amount: numAmt,
      description: `Instant Refund for Return #${returnId} (${orderTracking})`,
      referenceId: 'REFUND-' + returnId,
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      balance: (prev.balance || 0) + numAmt,
      transactions: [newTxn, ...(prev.transactions || [])],
    }));
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance: wallet.balance || 0,
        rewardsCoins: wallet.rewardsCoins || 0,
        transactions: wallet.transactions || [],
        loading,
        fetchWallet,
        addMoney,
        payWithWallet,
        redeemCoins,
        awardCashbackCoins,
        claimReferral,
        claimPriceDrop,
        creditRefund,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};

