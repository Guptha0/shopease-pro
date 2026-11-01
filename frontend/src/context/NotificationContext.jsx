import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(null);

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    channel: 'SMS',
    type: 'order',
    title: 'BlueDart Express Tracking Alert',
    message: 'Your ShopEase order #TRK-BD8921KA has been shipped via BlueDart Express. Track live: shopease.pro/orders',
    orderId: 'TRK-BD8921KA',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    channel: 'WHATSAPP',
    id: 'NOTIF-02',
    type: 'wallet',
    title: 'ShopEase FinTech Welcome',
    message: 'Welcome to ShopEase FinTech! ₹5,000 Demo Balance and 250 Reward Coins have been credited to your digital wallet.',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    channel: 'SMS',
    id: 'NOTIF-03',
    type: 'deal',
    title: 'Price Drop Radar',
    message: 'Deal Alert: Apple iPhone 16 Pro Max has reached its Lowest Price in 30 Days (₹1,34,900)! Instant cashback of 5% applies.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('shopease_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached notifications:', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [activePushToast, setActivePushToast] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shopease_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to cache notifications:', e);
    }
  }, [notifications]);

  // Push new notification & show simulated top-right toast
  const triggerNotification = ({
    channel = 'SMS',
    title = 'Order Notification',
    message = '',
    orderId = '',
    type = 'order',
  }) => {
    const newNotif = {
      id: 'NOTIF-' + Date.now().toString(36).toUpperCase(),
      channel: channel.toUpperCase(), // 'SMS' | 'WHATSAPP'
      type, // 'order' | 'wallet' | 'deal'
      title,
      message,
      orderId,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show simulated floating mobile notification banner
    setActivePushToast(newNotif);

    // Auto dismiss active toast after 6 seconds
    setTimeout(() => {
      setActivePushToast((current) => (current?.id === newNotif.id ? null : current));
    }, 6000);
  };

  const dismissPushToast = () => {
    setActivePushToast(null);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('shopease_notifications');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activePushToast,
        unreadCount,
        triggerNotification,
        dismissPushToast,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

