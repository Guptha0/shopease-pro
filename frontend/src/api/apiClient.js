import axios from 'axios';
import { initialProducts } from '../data/fallbackData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// LocalStorage Mock DB Helpers
const getStoredProducts = () => {
  try {
    const data = localStorage.getItem('shopease_products');
    if (data) return JSON.parse(data);
  } catch {}
  localStorage.setItem('shopease_products', JSON.stringify(initialProducts));
  return initialProducts;
};

const saveStoredProducts = (products) => {
  localStorage.setItem('shopease_products', JSON.stringify(products));
};

const getStoredOrders = () => {
  try {
    const data = localStorage.getItem('shopease_orders');
    if (data) return JSON.parse(data);
  } catch {}
  return [];
};

const saveStoredOrders = (orders) => {
  localStorage.setItem('shopease_orders', JSON.stringify(orders));
};

const getStoredWallet = () => {
  try {
    const data = localStorage.getItem('shopease_wallet');
    if (data) return JSON.parse(data);
  } catch {}
  let currentUserEmail = '';
  try {
    const u = JSON.parse(localStorage.getItem('shopease_user') || '{}');
    currentUserEmail = u.email || '';
  } catch {}

  const isDemo = currentUserEmail === 'user@shopease.com' || !currentUserEmail;
  const initial = isDemo
    ? {
        balance: 1500,
        rewardsCoins: 120,
        transactions: [
          {
            id: 'TXN-INIT-01',
            type: 'CREDIT',
            amount: 1500,
            description: 'Demo Account Pre-loaded Float for Instant Checkout',
            referenceId: 'DEMO-SEED-1500',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'TXN-INIT-02',
            type: 'CREDIT',
            amount: 120,
            description: 'Loyalty Reward Coins',
            referenceId: 'COINS-120',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      }
    : {
        balance: 0,
        rewardsCoins: 0,
        transactions: [],
      };
  localStorage.setItem('shopease_wallet', JSON.stringify(initial));
  return initial;
};

const saveStoredWallet = (wallet) => {
  localStorage.setItem('shopease_wallet', JSON.stringify(wallet));
};

const getStoredReturns = () => {
  try {
    const data = localStorage.getItem('shopease_returns');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = [
    {
      _id: 'ret_sample_01',
      returnId: 'RET-481902',
      order: 'ord_sample_delivered',
      orderTracking: 'TRK-XP1092KA',
      userName: 'Rohan Sharma',
      userEmail: 'user@shopease.com',
      items: [
        {
          name: 'Raspberry Pi 5 8GB RAM AI Starter Kit',
          price: 8499,
          quantity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        },
      ],
      reason: 'Damaged packaging during transit',
      resolution: 'Instant Wallet Refund',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      refundAmount: 17003,
      pickupDate: new Date(Date.now() + 86400000).toISOString(),
      pickupAddress: {
        fullName: 'Rohan Sharma',
        address: 'Flat 402, Prestige Lakeside Habitat, Varthur',
        city: 'Bengaluru',
        postalCode: '560060',
        phone: '+91 91234 56789',
      },
      status: 'Return Requested',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      timeline: [
        {
          status: 'Return Requested',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          description: 'Customer requested instant wallet refund for damaged outer packaging.',
        },
        {
          status: 'Pickup Scheduled',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          description: 'BlueDart reverse pickup scheduled for doorstep retrieval.',
        },
      ],
    },
  ];
  localStorage.setItem('shopease_returns', JSON.stringify(initial));
  return initial;
};

const saveStoredReturns = (returns) => {
  localStorage.setItem('shopease_returns', JSON.stringify(returns));
};

const getStoredTickets = () => {
  try {
    const data = localStorage.getItem('shopease_tickets');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = [
    {
      _id: 'tck_sample_01',
      ticketId: 'TCK-892144',
      userName: 'Rohan Sharma',
      userEmail: 'user@shopease.com',
      subject: 'Delivery timing slot request for BlueDart express shipment',
      category: 'Delivery Delayed',
      priority: 'Medium',
      status: 'Open',
      orderId: 'TRK-BD8921KA',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      messages: [
        {
          sender: 'user',
          senderName: 'Rohan Sharma',
          text: 'Hi Team, could you please confirm the expected delivery slot for order #TRK-BD8921KA? Is BlueDart Prime available for afternoon drop?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
      ],
    },
  ];
  localStorage.setItem('shopease_tickets', JSON.stringify(initial));
  return initial;
};

const saveStoredTickets = (tickets) => {
  localStorage.setItem('shopease_tickets', JSON.stringify(tickets));
};

const getStoredNotifications = () => {
  try {
    const data = localStorage.getItem('shopease_notifications');
    if (data) return JSON.parse(data);
  } catch {}
  return [];
};

const saveStoredNotifications = (notifs) => {
  localStorage.setItem('shopease_notifications', JSON.stringify(notifs));
};

// Enterprise Storage Helpers
const getStoredPayLater = () => {
  try {
    const data = localStorage.getItem('shopease_paylater');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = {
    creditLimit: 25000,
    availableCredit: 21500,
    usedCredit: 3500,
    status: 'Active',
    dues: [
      {
        id: 'DUE-9842',
        orderId: 'TRK-BD8921KA',
        amount: 3500,
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        isPaid: false,
      },
    ],
  };
  localStorage.setItem('shopease_paylater', JSON.stringify(initial));
  return initial;
};

const saveStoredPayLater = (pl) => {
  localStorage.setItem('shopease_paylater', JSON.stringify(pl));
};

const getStoredSubscriptions = () => {
  try {
    const data = localStorage.getItem('shopease_subscriptions');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = [
    {
      id: 'SUB-1029',
      productName: 'Raspberry Pi 5 8GB RAM AI Starter Kit',
      originalPrice: 8499,
      discountedPrice: 7649,
      intervalDays: 30,
      nextDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    },
  ];
  localStorage.setItem('shopease_subscriptions', JSON.stringify(initial));
  return initial;
};

const saveStoredSubscriptions = (subs) => {
  localStorage.setItem('shopease_subscriptions', JSON.stringify(subs));
};

const getStoredGiftCards = () => {
  try {
    const data = localStorage.getItem('shopease_giftcards');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = [
    {
      code: 'GFT-8492-TECH',
      amount: 1500,
      senderName: 'ShopEase VIP Rewards',
      theme: 'Tech Geek',
      isRedeemed: true,
      redeemedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      code: 'GFT-2026-FEST',
      amount: 500,
      senderName: 'ShopEase Celebrations',
      theme: 'Festive Gold',
      isRedeemed: false,
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem('shopease_giftcards', JSON.stringify(initial));
  return initial;
};

const saveStoredGiftCards = (cards) => {
  localStorage.setItem('shopease_giftcards', JSON.stringify(cards));
};

const getStoredSquadBuy = () => {
  try {
    const data = localStorage.getItem('shopease_squadbuy');
    if (data) return JSON.parse(data);
  } catch {}
  return [];
};

const saveStoredSquadBuy = (sq) => {
  localStorage.setItem('shopease_squadbuy', JSON.stringify(sq));
};

const getStoredAbandonedCarts = () => {
  try {
    const data = localStorage.getItem('shopease_abandoned_carts');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = [
    {
      id: 'ABN-1092',
      customerName: 'Kavita Nair',
      email: 'kavita.n@gmail.com',
      phone: '+91 98450 12345',
      abandonedItem: 'Apple iPhone 16 Pro Max 256GB',
      cartValue: 134900,
      timeAgo: '42 mins ago',
      nudgeSent: false,
    },
    {
      id: 'ABN-1093',
      customerName: 'Vikram Sethi',
      email: 'vikram.s@outlook.com',
      phone: '+91 99801 54321',
      abandonedItem: 'Sony WH-1000XM5 Wireless Headphones',
      cartValue: 26990,
      timeAgo: '1 hr 15 mins ago',
      nudgeSent: true,
    },
    {
      id: 'ABN-1094',
      customerName: 'Ananya Sharma',
      email: 'ananya.s@techcorp.in',
      phone: '+91 98765 43210',
      abandonedItem: 'Keychron Q1 Pro Mechanical Keyboard',
      cartValue: 16499,
      timeAgo: '2 hrs ago',
      nudgeSent: false,
    },
    {
      id: 'ABN-1095',
      customerName: 'Siddharth Rao',
      email: 'sid.rao@startup.io',
      phone: '+91 97412 88990',
      abandonedItem: 'LG UltraGear 34" Curved Gaming Monitor',
      cartValue: 54990,
      timeAgo: '3 hrs ago',
      nudgeSent: false,
    },
  ];
  localStorage.setItem('shopease_abandoned_carts', JSON.stringify(initial));
  return initial;
};

const saveStoredAbandonedCarts = (carts) => {
  localStorage.setItem('shopease_abandoned_carts', JSON.stringify(carts));
};

// Hybrid Wrapper
export const apiClient = {
  // Generic GET
  async get(url, config = {}) {
    try {
      const res = await axiosInstance.get(url, config);
      return res;
    } catch (err) {
      console.warn(`[Hybrid API Fallback] ${url}:`, err.message);
      
      // Fallback for /products
      if (url.startsWith('/products')) {
        const products = getStoredProducts();
        const params = config.params || {};

        let filtered = [...products];

        if (params.category && params.category !== 'All' && params.category !== "Today's Flash Deals" && params.category !== 'Price-Drop Radar') {
          filtered = filtered.filter(p => p.category.toLowerCase() === params.category.toLowerCase());
        }

        if (params.flashDeals === 'true' || params.category === "Today's Flash Deals") {
          filtered = filtered.filter(p => p.isFlashDeal);
        }

        if (params.brand && params.brand !== 'All') {
          const brands = params.brand.split(',').map(b => b.trim().toLowerCase());
          filtered = filtered.filter(p => brands.includes(p.brand.toLowerCase()));
        }

        if (params.minPrice) {
          filtered = filtered.filter(p => p.price >= Number(params.minPrice));
        }

        if (params.maxPrice) {
          filtered = filtered.filter(p => p.price <= Number(params.maxPrice));
        }

        if (params.minRating) {
          filtered = filtered.filter(p => p.rating >= Number(params.minRating));
        }

        if (params.inStock === 'true') {
          filtered = filtered.filter(p => p.stock > 0);
        }

        if (params.search && params.search.trim()) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            p =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          );
        }

        if (params.sort === 'price_asc') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (params.sort === 'price_desc') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (params.sort === 'rating_desc') {
          filtered.sort((a, b) => b.rating - a.rating);
        } else if (params.sort === 'biggest_drop' || params.category === 'Price-Drop Radar') {
          filtered.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
        }

        const categories = [...new Set(products.map(p => p.category))];
        const brands = [...new Set(products.map(p => p.brand))];

        return {
          data: {
            success: true,
            count: filtered.length,
            categories,
            brands,
            products: filtered,
          },
        };
      }

      // Fallback for /orders/my-orders
      if (url === '/orders/my-orders') {
        const orders = getStoredOrders();
        return { data: { success: true, count: orders.length, orders } };
      }

      // Fallback for /orders/admin/stats
      if (url === '/orders/admin/stats') {
        const orders = getStoredOrders();
        const products = getStoredProducts();
        const totalGMV = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.totalAmount : 0), 0);
        return {
          data: {
            success: true,
            stats: {
              totalRevenue: totalGMV,
              totalOrders: orders.length,
              totalProducts: products.length,
              lowStockCount: products.filter(p => p.stock < 5).length,
              statusBreakdown: [],
            },
          },
        };
      }

      // Fallback for /orders
      if (url === '/orders') {
        const orders = getStoredOrders();
        return { data: { success: true, count: orders.length, orders } };
      }

      // Fallback for /wallet
      if (url === '/wallet') {
        const wallet = getStoredWallet();
        return { data: { success: true, wallet } };
      }

      // Fallback for /notifications
      if (url === '/notifications') {
        const notifications = getStoredNotifications();
        return { data: { success: true, notifications } };
      }

      // Fallback for /returns
      if (url.startsWith('/returns')) {
        const returns = getStoredReturns();
        return { data: { success: true, count: returns.length, returns } };
      }

      // Fallback for /tickets
      if (url.startsWith('/tickets')) {
        const tickets = getStoredTickets();
        return { data: { success: true, count: tickets.length, tickets } };
      }

      // Enterprise GET Fallbacks
      if (url === '/enterprise/paylater') {
        const payLater = getStoredPayLater();
        return { data: { success: true, payLater } };
      }

      if (url.startsWith('/enterprise/subscriptions')) {
        const subscriptions = getStoredSubscriptions();
        return { data: { success: true, count: subscriptions.length, subscriptions } };
      }

      if (url.startsWith('/enterprise/giftcards')) {
        const giftCards = getStoredGiftCards();
        return { data: { success: true, count: giftCards.length, giftCards } };
      }

      if (url.startsWith('/enterprise/squadbuy')) {
        const squadDeals = getStoredSquadBuy();
        return { data: { success: true, count: squadDeals.length, squadDeals } };
      }

      if (url.startsWith('/enterprise/abandoned-carts')) {
        const abandonedCarts = getStoredAbandonedCarts();
        return { data: { success: true, count: abandonedCarts.length, abandonedCarts } };
      }

      throw err;
    }
  },

  // Generic POST
  async post(url, data, config = {}) {
    try {
      const res = await axiosInstance.post(url, data, config);
      return res;
    } catch (err) {
      console.warn(`[Hybrid API Fallback] POST ${url}:`, err.message);

      // Auth login
      if (url === '/auth/login') {
        const { email, password } = data;
        if (email === 'admin@shopease.com' && password === 'admin123') {
          return {
            data: {
              success: true,
              token: 'mock_admin_jwt_token',
              user: {
                _id: 'usr_admin',
                name: 'ShopEase Administrator',
                email: 'admin@shopease.com',
                role: 'admin',
              },
            },
          };
        }
        if (email === 'user@shopease.com' && password === 'user123') {
          return {
            data: {
              success: true,
              token: 'mock_user_jwt_token',
              user: {
                _id: 'usr_customer',
                name: 'Rohan Sharma',
                email: 'user@shopease.com',
                role: 'user',
              },
            },
          };
        }
        // Generic successful login for custom entered accounts
        return {
          data: {
            success: true,
            token: 'mock_user_jwt_' + Date.now(),
            user: {
              _id: 'usr_' + Date.now(),
              name: email.split('@')[0],
              email,
              role: 'user',
            },
          },
        };
      }

      // Auth register
      if (url === '/auth/register') {
        return {
          data: {
            success: true,
            token: 'mock_user_jwt_' + Date.now(),
            user: {
              _id: 'usr_' + Date.now(),
              name: data.name,
              email: data.email,
              role: 'user',
            },
          },
        };
      }

      // Wallet Add Money
      if (url === '/wallet/add-money') {
        const wallet = getStoredWallet();
        const amt = Number(data.amount) || 0;
        wallet.balance = (wallet.balance || 0) + amt;
        const newTxn = {
          id: 'TXN-' + Date.now().toString(36).toUpperCase(),
          type: 'CREDIT',
          amount: amt,
          description: data.paymentMethod === 'UPI' ? `Loaded money via UPI (${data.upiId || 'Instant UPI'})` : `Loaded money via ${data.paymentMethod || 'Card'}`,
          referenceId: 'UPI-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          createdAt: new Date().toISOString(),
        };
        wallet.transactions = [newTxn, ...(wallet.transactions || [])];
        saveStoredWallet(wallet);
        return {
          data: {
            success: true,
            message: `₹${amt.toLocaleString('en-IN')} added to your ShopEase Wallet!`,
            wallet,
          },
        };
      }

      // Wallet Pay
      if (url === '/wallet/pay') {
        const wallet = getStoredWallet();
        const amt = Number(data.amount) || 0;
        if ((wallet.balance || 0) < amt) {
          throw new Error('Insufficient wallet balance');
        }
        wallet.balance = (wallet.balance || 0) - amt;
        const newTxn = {
          id: 'TXN-' + Date.now().toString(36).toUpperCase(),
          type: 'DEBIT',
          amount: amt,
          description: data.description || `Payment for ShopEase Order #${data.orderId || 'NEW'}`,
          referenceId: 'ORD-' + (data.orderId || Math.random().toString(36).substring(2, 8).toUpperCase()),
          createdAt: new Date().toISOString(),
        };
        wallet.transactions = [newTxn, ...(wallet.transactions || [])];
        saveStoredWallet(wallet);
        return { data: { success: true, message: 'Payment successful', wallet } };
      }

      // Wallet Referral
      if (url === '/wallet/referral') {
        const wallet = getStoredWallet();
        const bonus = 100;
        wallet.balance = (wallet.balance || 0) + bonus;
        const newTxn = {
          id: 'TXN-' + Date.now().toString(36).toUpperCase(),
          type: 'CREDIT',
          amount: bonus,
          description: `Referral Reward: Friend joined via ${data.referralCode || 'FRIEND-REF'}`,
          referenceId: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString(),
        };
        wallet.transactions = [newTxn, ...(wallet.transactions || [])];
        saveStoredWallet(wallet);
        return { data: { success: true, message: '₹100 Referral Cash credited', wallet } };
      }

      // Returns submission
      if (url === '/returns') {
        const returns = getStoredReturns();
        const retId = 'RET-' + Math.floor(100000 + Math.random() * 900000);
        const newReturn = {
          _id: 'ret_' + Date.now(),
          returnId: retId,
          ...data,
          status: 'Return Requested',
          createdAt: new Date().toISOString(),
          timeline: [
            {
              status: 'Return Requested',
              timestamp: new Date().toISOString(),
              description: `Return requested: ${data.reason}`,
            },
            {
              status: 'Pickup Scheduled',
              timestamp: new Date().toISOString(),
              description: 'Doorstep pickup assigned to BlueDart courier executive.',
            },
          ],
        };
        returns.unshift(newReturn);
        saveStoredReturns(returns);

        // Add SMS notification
        const notifs = getStoredNotifications();
        notifs.unshift({
          id: 'NOTIF-' + Date.now().toString(36).toUpperCase(),
          channel: 'SMS',
          type: 'order',
          title: 'Return Pickup Scheduled',
          message: `Your return request #${retId} has been confirmed. BlueDart pickup scheduled for ${new Date(data.pickupDate).toLocaleDateString()}. Track live: shopease.pro/orders`,
          orderId: retId,
          read: false,
          timestamp: new Date().toISOString(),
        });
        saveStoredNotifications(notifs);

        return { data: { success: true, returnRequest: newReturn } };
      }

      // Tickets submission
      if (url === '/tickets') {
        const tickets = getStoredTickets();
        const tckId = 'TCK-' + Math.floor(100000 + Math.random() * 900000);
        const newTicket = {
          _id: 'tck_' + Date.now(),
          ticketId: tckId,
          ...data,
          status: 'Open',
          createdAt: new Date().toISOString(),
          messages: [
            {
              sender: 'user',
              senderName: data.userName || 'Customer',
              text: data.message,
              timestamp: new Date().toISOString(),
            },
          ],
        };
        tickets.unshift(newTicket);
        saveStoredTickets(tickets);
        return { data: { success: true, ticket: newTicket } };
      }

      // Ticket messages
      if (url.includes('/tickets/') && url.endsWith('/messages')) {
        const parts = url.split('/');
        const id = parts[2];
        const tickets = getStoredTickets();
        const tck = tickets.find(t => t._id === id || t.ticketId === id);
        if (tck) {
          tck.messages.push({
            sender: data.sender || 'agent',
            senderName: data.sender === 'agent' ? 'Support Specialist' : 'Customer',
            text: data.text,
            timestamp: new Date().toISOString(),
          });
          saveStoredTickets(tickets);
          return { data: { success: true, ticket: tck } };
        }
      }

      // Claim price drop
      if (url === '/wallet/claim-price-drop') {
        const wallet = getStoredWallet();
        const amt = Number(data.refundAmount) || 500;
        wallet.balance = (wallet.balance || 0) + amt;
        const newTxn = {
          id: 'TXN-' + Date.now().toString(36).toUpperCase(),
          type: 'CREDIT',
          amount: amt,
          description: `7-Day Price-Drop Refund for Order #${data.orderId || 'PRICEDROP'}`,
          referenceId: 'PD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString(),
        };
        wallet.transactions.unshift(newTxn);
        saveStoredWallet(wallet);
        return { data: { success: true, message: `₹${amt} Price-Drop Refund Credited to Wallet!`, wallet } };
      }

      // Order creation
      if (url === '/orders') {
        const orders = getStoredOrders();
        const tracking = 'TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const coinsEarned = Math.round((Number(data.totalAmount) || 0) * 0.05);

        // Update Wallet on Fallback
        const wallet = getStoredWallet();
        if (data.paymentMethod === 'Wallet') {
          wallet.balance = Math.max(0, (wallet.balance || 0) - (Number(data.totalAmount) || 0));
          wallet.transactions.unshift({
            id: 'TXN-' + Date.now().toString(36).toUpperCase(),
            type: 'DEBIT',
            amount: Number(data.totalAmount) || 0,
            description: `Order Checkout Payment #${tracking}`,
            referenceId: `ORD-${tracking}`,
            createdAt: new Date().toISOString(),
          });
        }

        if (data.coinsRedeemed && Number(data.coinsRedeemed) > 0) {
          wallet.rewardsCoins = Math.max(0, (wallet.rewardsCoins || 0) - Number(data.coinsRedeemed));
          wallet.transactions.unshift({
            id: 'TXN-' + Date.now().toString(36).toUpperCase(),
            type: 'DEBIT',
            amount: Number(data.coinsRedeemed),
            description: `Redeemed ${data.coinsRedeemed} Coins for Cart Discount on #${tracking}`,
            referenceId: `COIN-RED-${tracking}`,
            createdAt: new Date().toISOString(),
          });
        }

        if (coinsEarned > 0) {
          wallet.rewardsCoins = (wallet.rewardsCoins || 0) + coinsEarned;
          wallet.transactions.unshift({
            id: 'TXN-' + Date.now().toString(36).toUpperCase(),
            type: 'CREDIT',
            amount: coinsEarned,
            description: `5% Cashback Reward (${coinsEarned} ShopEase Coins) on #${tracking}`,
            referenceId: `CB-${tracking}`,
            createdAt: new Date().toISOString(),
          });
        }
        saveStoredWallet(wallet);

        const newOrder = {
          _id: 'ord_' + Date.now(),
          ...data,
          coinsEarned,
          orderStatus: 'Order Placed',
          trackingNumber: tracking,
          courierPartner: data.deliverySpeed === 'Prime Same-Day Express' ? 'BlueDart Prime' : 'BlueDart Express',
          createdAt: new Date().toISOString(),
          timeline: [
            {
              status: 'Order Placed',
              location: `${data.shippingAddress?.city || 'Bengaluru'} Online Portal`,
              timestamp: new Date().toISOString(),
              description: 'Order confirmed and payment verified successfully.',
            },
            {
              status: 'Packed at Bengaluru Fulfillment Hub',
              location: 'Bengaluru Sort Center, KA 560060',
              timestamp: new Date(Date.now() + 1800000).toISOString(),
              description: 'Quality tested & sealed in BlueDart security bag.',
            },
          ],
        };
        orders.unshift(newOrder);
        saveStoredOrders(orders);

        // Store notification
        const notifs = getStoredNotifications();
        notifs.unshift({
          id: 'NOTIF-' + Date.now().toString(36).toUpperCase(),
          channel: 'SMS',
          type: 'order',
          title: 'Order Confirmation & Cashback',
          message: `Your ShopEase order #${tracking} is confirmed via ${data.paymentMethod || 'UPI'}. Cashback of ${coinsEarned} coins credited! Track live: shopease.pro/orders`,
          orderId: tracking,
          read: false,
          timestamp: new Date().toISOString(),
        });
        saveStoredNotifications(notifs);

        return { data: { success: true, order: newOrder } };
      }

      // Product creation
      if (url === '/products') {
        const products = getStoredProducts();
        const newProduct = {
          _id: 'prod_' + Date.now(),
          ...data,
          rating: 4.5,
          numReviews: 1,
          priceHistory: [
            { date: '2026-10-01', price: Math.round(data.price * 1.1) },
            { date: '2026-10-28', price: data.price },
          ],
          reviews: [],
        };
        products.unshift(newProduct);
        saveStoredProducts(products);
        return { data: { success: true, product: newProduct } };
      }

      // Product review submission
      if (url.includes('/reviews')) {
        return { data: { success: true, message: 'Review recorded' } };
      }

      // Enterprise POST Fallbacks
      if (url === '/enterprise/paylater/pay') {
        const payLater = getStoredPayLater();
        const amt = Number(data.amount) || 0;
        if (payLater.availableCredit < amt) {
          throw new Error(`Insufficient BNPL credit. Available: ₹${payLater.availableCredit.toLocaleString('en-IN')}`);
        }
        payLater.availableCredit -= amt;
        payLater.usedCredit += amt;
        payLater.dues.unshift({
          id: 'DUE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          orderId: data.orderId || 'ORD-NEW',
          amount: amt,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isPaid: false,
        });
        saveStoredPayLater(payLater);
        return {
          data: {
            success: true,
            message: `₹${amt.toLocaleString('en-IN')} paid via ShopEase Pay Later! Repay in 30 days.`,
            payLater,
          },
        };
      }

      if (url === '/enterprise/paylater/repay') {
        const payLater = getStoredPayLater();
        const repayAmt = Number(data.amount) || payLater.usedCredit;
        payLater.usedCredit = Math.max(0, payLater.usedCredit - repayAmt);
        payLater.availableCredit = Math.min(payLater.creditLimit, payLater.availableCredit + repayAmt);
        if (data.dueId) {
          const targetDue = payLater.dues.find((d) => d.id === data.dueId);
          if (targetDue) {
            targetDue.isPaid = true;
            targetDue.paidAt = new Date().toISOString();
          }
        } else {
          payLater.dues.forEach((d) => {
            d.isPaid = true;
            d.paidAt = new Date().toISOString();
          });
        }
        saveStoredPayLater(payLater);
        return { data: { success: true, message: 'Repayment recorded successfully', payLater } };
      }

      if (url === '/enterprise/subscriptions') {
        const subscriptions = getStoredSubscriptions();
        const newSub = {
          id: 'SUB-' + Math.floor(1000 + Math.random() * 9000),
          productName: data.productName || 'Subscription Item',
          originalPrice: Number(data.originalPrice) || 1000,
          discountedPrice: Number(data.discountedPrice) || 900,
          intervalDays: Number(data.intervalDays) || 30,
          nextDeliveryDate: new Date(Date.now() + (Number(data.intervalDays) || 30) * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
        };
        subscriptions.unshift(newSub);
        saveStoredSubscriptions(subscriptions);
        return { data: { success: true, message: 'Subscribed & Saved 10%!', subscription: newSub } };
      }

      if (url === '/enterprise/giftcards/create') {
        const giftCards = getStoredGiftCards();
        const newCard = {
          code: 'GFT-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          amount: Number(data.amount) || 1000,
          senderName: data.senderName || 'Valued Friend',
          recipientEmail: data.recipientEmail || '',
          theme: data.theme || 'Premium Gold',
          customMessage: data.customMessage || '',
          isRedeemed: false,
          createdAt: new Date().toISOString(),
        };
        giftCards.unshift(newCard);
        saveStoredGiftCards(giftCards);
        return { data: { success: true, message: 'Digital Gift Card generated!', giftCard: newCard } };
      }

      if (url === '/enterprise/giftcards/redeem') {
        const giftCards = getStoredGiftCards();
        const code = (data.code || '').trim().toUpperCase();
        const card = giftCards.find((c) => c.code.toUpperCase() === code);
        if (!card) {
          throw new Error('Invalid or unrecognised gift card voucher code');
        }
        if (card.isRedeemed) {
          throw new Error('This gift card voucher has already been redeemed');
        }
        card.isRedeemed = true;
        card.redeemedAt = new Date().toISOString();
        saveStoredGiftCards(giftCards);

        // Credit to Wallet
        const wallet = getStoredWallet();
        wallet.balance = (wallet.balance || 0) + card.amount;
        wallet.transactions.unshift({
          id: 'TXN-' + Date.now().toString(36).toUpperCase(),
          type: 'CREDIT',
          amount: card.amount,
          description: `Redeemed Gift Card #${card.code} (${card.theme || 'Gift Voucher'})`,
          referenceId: `GFT-${card.code}`,
          createdAt: new Date().toISOString(),
        });
        saveStoredWallet(wallet);

        return {
          data: {
            success: true,
            message: `₹${card.amount.toLocaleString('en-IN')} Gift Card Voucher deposited into Wallet!`,
            creditedAmount: card.amount,
            balance: wallet.balance,
          },
        };
      }

      if (url === '/enterprise/squadbuy/create') {
        const squadDeals = getStoredSquadBuy();
        const code = 'SQD-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const newSquad = {
          squadCode: code,
          product: data.productId,
          productName: data.productName || 'Group Buy Item',
          originalPrice: Number(data.originalPrice) || 1000,
          squadPrice: Number(data.squadPrice) || Math.round((Number(data.originalPrice) || 1000) * 0.85),
          targetMembers: 2,
          members: [
            {
              name: 'You (Host)',
              joinedAt: new Date().toISOString(),
            },
          ],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'Open',
        };
        squadDeals.unshift(newSquad);
        saveStoredSquadBuy(squadDeals);
        return { data: { success: true, message: 'Squad Buy created!', squad: newSquad } };
      }

      if (url.includes('/enterprise/squadbuy/') && url.endsWith('/join')) {
        const parts = url.split('/');
        const code = parts[parts.length - 2];
        const squadDeals = getStoredSquadBuy();
        const sq = squadDeals.find((s) => s.squadCode.toUpperCase() === code.toUpperCase());
        if (sq) {
          sq.members.push({
            name: 'Friend (Joined via Share Link)',
            joinedAt: new Date().toISOString(),
          });
          if (sq.members.length >= sq.targetMembers) {
            sq.status = 'Completed';
          }
          saveStoredSquadBuy(squadDeals);
          return { data: { success: true, message: 'Joined squad deal! 15% discount unlocked.', squad: sq } };
        }
      }

      if (url === '/enterprise/abandoned-carts/nudge') {
        const carts = getStoredAbandonedCarts();
        const target = carts.find((c) => c.id === data.cartId);
        if (target) {
          target.nudgeSent = true;
          saveStoredAbandonedCarts(carts);
        }
        return {
          data: {
            success: true,
            message: `Automated recovery alert with 5% promo voucher sent to ${target?.customerName || 'Customer'}!`,
          },
        };
      }

      throw err;
    }
  },

  // Generic PUT
  async put(url, data, config = {}) {
    try {
      return await axiosInstance.put(url, data, config);
    } catch (err) {
      console.warn(`[Hybrid API Fallback] PUT ${url}:`, err.message);
      if (url === '/auth/profile') {
        const tokenUser = JSON.parse(localStorage.getItem('shopease_user') || '{}');
        const updated = { ...tokenUser, ...data };
        localStorage.setItem('shopease_user', JSON.stringify(updated));
        return { data: { success: true, user: updated } };
      }

      if (url.startsWith('/products/')) {
        const id = url.split('/products/')[1];
        const products = getStoredProducts();
        const idx = products.findIndex(p => p._id === id);
        if (idx > -1) {
          products[idx] = { ...products[idx], ...data };
          saveStoredProducts(products);
          return { data: { success: true, product: products[idx] } };
        }
      }
      throw err;
    }
  },

  // Generic PATCH
  async patch(url, data, config = {}) {
    try {
      return await axiosInstance.patch(url, data, config);
    } catch (err) {
      console.warn(`[Hybrid API Fallback] PATCH ${url}:`, err.message);
      // Return approval
      if (url.includes('/returns/') && url.endsWith('/approve')) {
        const parts = url.split('/');
        const id = parts[2];
        const returns = getStoredReturns();
        const ret = returns.find(r => r._id === id || r.returnId === id);
        if (ret) {
          ret.status = 'Refund Completed';
          ret.timeline.push({
            status: 'Refund Completed',
            timestamp: new Date().toISOString(),
            description: `Admin approved refund of ₹${ret.refundAmount?.toLocaleString('en-IN')}. Auto-credited to Virtual Wallet.`,
          });
          saveStoredReturns(returns);

          // Credit customer wallet
          const wallet = getStoredWallet();
          wallet.balance = (wallet.balance || 0) + (ret.refundAmount || 0);
          wallet.transactions.unshift({
            id: 'TXN-' + Date.now().toString(36).toUpperCase(),
            type: 'CREDIT',
            amount: ret.refundAmount || 0,
            description: `Instant Refund for Return #${ret.returnId} (${ret.orderTracking})`,
            referenceId: `RET-REF-${ret.returnId}`,
            createdAt: new Date().toISOString(),
          });
          saveStoredWallet(wallet);

          // Notify customer
          const notifs = getStoredNotifications();
          notifs.unshift({
            id: 'NOTIF-' + Date.now().toString(36).toUpperCase(),
            channel: 'SMS',
            type: 'wallet',
            title: 'Refund Credited to Virtual Wallet',
            message: `ShopEase Pro: Instant Wallet Refund of ₹${ret.refundAmount?.toLocaleString('en-IN')} for return #${ret.returnId} credited successfully! Check balance in wallet passbook.`,
            orderId: ret.returnId,
            read: false,
            timestamp: new Date().toISOString(),
          });
          saveStoredNotifications(notifs);

          return { data: { success: true, returnRequest: ret } };
        }
      }

      // Return status update
      if (url.includes('/returns/') && url.endsWith('/status')) {
        const parts = url.split('/');
        const id = parts[2];
        const returns = getStoredReturns();
        const ret = returns.find(r => r._id === id || r.returnId === id);
        if (ret) {
          ret.status = data.status;
          ret.timeline.push({
            status: data.status,
            timestamp: new Date().toISOString(),
            description: `Status changed to ${data.status}`,
          });
          saveStoredReturns(returns);
          return { data: { success: true, returnRequest: ret } };
        }
      }

      // Ticket resolution
      if (url.includes('/tickets/') && url.endsWith('/resolve')) {
        const parts = url.split('/');
        const id = parts[2];
        const tickets = getStoredTickets();
        const tck = tickets.find(t => t._id === id || t.ticketId === id);
        if (tck) {
          tck.status = 'Resolved';
          tck.resolvedAt = new Date().toISOString();
          saveStoredTickets(tickets);
          return { data: { success: true, ticket: tck } };
        }
      }

      if (url.includes('/status')) {
        const id = url.split('/orders/')[1].split('/status')[0];
        const orders = getStoredOrders();
        const order = orders.find(o => o._id === id);
        if (order) {
          order.orderStatus = data.status;
          order.timeline.push({
            status: data.status,
            location: 'Fulfillment Hub',
            timestamp: new Date().toISOString(),
            description: `Order milestone transitioned to ${data.status}`,
          });
          saveStoredOrders(orders);

          // Append simulated SMS/WhatsApp milestone notification
          const notifs = getStoredNotifications();
          notifs.unshift({
            id: 'NOTIF-' + Date.now().toString(36).toUpperCase(),
            channel: 'SMS',
            type: 'order',
            title: `Order Milestone: ${data.status}`,
            message: `Your ShopEase order #${order.trackingNumber || id} has been transitioned to ${data.status} via BlueDart Express. Track live: shopease.pro/orders`,
            orderId: order.trackingNumber || id,
            read: false,
            timestamp: new Date().toISOString(),
          });
          saveStoredNotifications(notifs);

          return { data: { success: true, order } };
        }
      }
      throw err;
    }
  },

  // Generic DELETE
  async delete(url, config = {}) {
    try {
      return await axiosInstance.delete(url, config);
    } catch (err) {
      console.warn(`[Hybrid API Fallback] DELETE ${url}:`, err.message);
      if (url.startsWith('/products/')) {
        const id = url.split('/products/')[1];
        let products = getStoredProducts();
        products = products.filter(p => p._id !== id);
        saveStoredProducts(products);
        return { data: { success: true, id } };
      }
      throw err;
    }
  },
};

export default apiClient;
