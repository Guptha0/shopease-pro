import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Cart Items
  const [cartItems, setCartItems] = useState(() => {
    try {
      const s = localStorage.getItem('shopease_cart');
      const p = s ? JSON.parse(s) : [];
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  });

  // Save for Later Items
  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const s = localStorage.getItem('shopease_saved_later');
      const p = s ? JSON.parse(s) : [];
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    try {
      const s = localStorage.getItem('shopease_wishlist');
      const p = s ? JSON.parse(s) : [];
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  });

  // Compare Tray (up to 3 items)
  const [compareList, setCompareList] = useState(() => {
    try {
      const s = localStorage.getItem('shopease_compare');
      const p = s ? JSON.parse(s) : [];
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  });

  // 48-Hour Price Lock Items
  const [priceLockedItems, setPriceLockedItems] = useState(() => {
    try {
      const s = localStorage.getItem('shopease_price_locks');
      const p = s ? JSON.parse(s) : {};
      return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
    } catch {
      return {};
    }
  });

  // Active Coupon & Delivery
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [deliverySpeed, setDeliverySpeed] = useState('Standard');
  const [deliveryPincode, setDeliveryPincode] = useState('560060');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('shopease_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('shopease_saved_later', JSON.stringify(savedForLater));
  }, [savedForLater]);

  useEffect(() => {
    localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('shopease_compare', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('shopease_price_locks', JSON.stringify(priceLockedItems));
  }, [priceLockedItems]);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.product === product._id);
      if (idx > -1) {
        const curQty = prev[idx].quantity;
        const newQty = Math.min(curQty + quantity, product.stock);
        if (curQty >= product.stock) {
          showToast(`Max stock limit (${product.stock}) reached for this item`, 'warning');
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: newQty };
        showToast(`Updated quantity in cart (${newQty} units)`, 'success');
        return updated;
      }

      // Check if price is locked for this product
      const locked = priceLockedItems[product._id];
      const effectivePrice = locked ? locked.lockedPrice : product.price;

      showToast(`Added "${product.name}" to your Cart`, 'success');
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: effectivePrice,
          mrp: product.mrp || Math.round(product.price * 1.25),
          stock: product.stock,
          imageUrl: product.imageUrl,
          quantity: Math.min(quantity, product.stock),
          isPriceLocked: !!locked,
        },
      ];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.product === productId) {
          return { ...i, quantity: Math.min(newQty, i.stock) };
        }
        return i;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((i) => i.product !== productId));
    showToast('Item removed from cart');
  };

  const moveToSaveForLater = (productId) => {
    const item = cartItems.find((i) => i.product === productId);
    if (!item) return;
    setCartItems((prev) => prev.filter((i) => i.product !== productId));
    setSavedForLater((prev) => {
      if (prev.find((i) => i.product === productId)) return prev;
      return [...prev, item];
    });
    showToast(`Moved "${item.name}" to Save for Later`);
  };

  const moveToCart = (productId) => {
    const item = savedForLater.find((i) => i.product === productId);
    if (!item) return;
    setSavedForLater((prev) => prev.filter((i) => i.product !== productId));
    addToCart(item, item.quantity || 1);
  };

  const removeFromSaveForLater = (productId) => {
    setSavedForLater((prev) => prev.filter((i) => i.product !== productId));
    showToast('Removed from Saved for Later');
  };

  // Wishlist
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        showToast(`Removed "${product.name}" from Wishlist`);
        return prev.filter((p) => p._id !== product._id);
      } else {
        showToast(`Saved "${product.name}" to Wishlist!`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p._id === productId);
  };

  // Compare Tray (up to 3 items)
  const toggleCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        return prev.filter((p) => p._id !== product._id);
      }
      if (prev.length >= 3) {
        showToast('You can compare a maximum of 3 items at a time', 'warning');
        return prev;
      }
      showToast(`Added "${product.name}" to Compare Tray`);
      return [...prev, product];
    });
  };

  const isInCompare = (productId) => {
    return compareList.some((p) => p._id === productId);
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter((p) => p._id !== productId));
  };

  const clearCompare = () => setCompareList([]);

  // 48-Hour Price Lock Hold
  const lockPrice = (product) => {
    const now = Date.now();
    const expiresAt = now + 48 * 60 * 60 * 1000; // 48 hours
    setPriceLockedItems((prev) => ({
      ...prev,
      [product._id]: {
        productId: product._id,
        name: product.name,
        lockedPrice: product.price,
        originalMrp: product.mrp,
        lockedAt: now,
        expiresAt,
      },
    }));
    showToast(`48-Hour Price Locked at ₹${product.price.toLocaleString('en-IN')}!`, 'success');
  };

  const isPriceLocked = (productId) => {
    const lock = priceLockedItems[productId];
    if (!lock) return false;
    if (Date.now() > lock.expiresAt) return false;
    return lock;
  };

  // Coupon Applicator
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 10, note: '10% Welcome Discount' });
      showToast('Coupon "WELCOME10" applied successfully! Saved 10%', 'success');
      return true;
    }
    if (cleanCode === 'TECHORBIT20') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 20, note: '20% Tech Fest Mega Discount' });
      showToast('Coupon "TECHORBIT20" applied! Saved 20%', 'success');
      return true;
    }
    if (cleanCode.startsWith('DEALBOT-') || cleanCode.startsWith('BARGAIN-')) {
      const pct = parseInt(cleanCode.split('-')[1]) || 10;
      setAppliedCoupon({ code: cleanCode, discountPercent: pct, note: `AI Deal Negotiator ${pct}% Off` });
      showToast(`AI Deal Voucher "${cleanCode}" applied! Saved ${pct}%`, 'success');
      return true;
    }
    showToast('Invalid promo code. Try WELCOME10 or negotiate with DealBot!', 'warning');
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('shopease_cart');
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const totalMRP = cartItems.reduce((acc, i) => acc + (i.mrp || i.price * 1.25) * i.quantity, 0);

  const totalPrice = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const mrpSavings = Math.max(0, totalMRP - totalPrice);

  const couponDiscount = appliedCoupon
    ? Math.round((totalPrice * appliedCoupon.discountPercent) / 100)
    : 0;

  const platformFee = cartItems.length > 0 ? 5 : 0;

  const deliveryCharge =
    cartItems.length === 0
      ? 0
      : deliverySpeed === 'Prime Same-Day Express'
      ? totalPrice > 100000 ? 0 : 99
      : totalPrice > 1000 ? 0 : 40;

  const grandTotal = Math.max(
    0,
    totalPrice - couponDiscount + platformFee + deliveryCharge
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedForLater,
        wishlist,
        compareList,
        priceLockedItems,
        appliedCoupon,
        deliverySpeed,
        deliveryPincode,
        totalItemsCount,
        totalMRP,
        totalPrice,
        mrpSavings,
        couponDiscount,
        platformFee,
        deliveryCharge,
        grandTotal,
        toastMessage,
        addToCart,
        updateQuantity,
        removeFromCart,
        moveToSaveForLater,
        moveToCart,
        removeFromSaveForLater,
        toggleWishlist,
        isInWishlist,
        toggleCompare,
        isInCompare,
        removeFromCompare,
        clearCompare,
        lockPrice,
        isPriceLocked,
        applyCoupon,
        removeCoupon,
        setDeliverySpeed,
        setDeliveryPincode,
        clearCart,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
