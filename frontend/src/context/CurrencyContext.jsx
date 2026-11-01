import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

export const CURRENCIES = {
  INR: { symbol: '₹', rate: 1, name: 'Indian Rupee (INR)', flag: '🇮🇳' },
  USD: { symbol: '$', rate: 0.0118, name: 'US Dollar (USD)', flag: '🇺🇸' },
  EUR: { symbol: '€', rate: 0.0109, name: 'Euro (EUR)', flag: '🇪🇺' },
  GBP: { symbol: '£', rate: 0.0093, name: 'British Pound (GBP)', flag: '🇬🇧' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('shopease_currency') || 'INR';
    } catch {
      return 'INR';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shopease_currency', currency);
    } catch (e) {}
  }, [currency]);

  const activeCurrency = CURRENCIES[currency] || CURRENCIES.INR;

  const formatPrice = (amountInINR) => {
    const num = Number(amountInINR) || 0;
    if (currency === 'INR') {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    const converted = num * activeCurrency.rate;
    return `${activeCurrency.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const convertPrice = (amountInINR) => {
    const num = Number(amountInINR) || 0;
    if (currency === 'INR') return num;
    return Math.round(num * activeCurrency.rate * 100) / 100;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        activeCurrency,
        formatPrice,
        convertPrice,
        currencies: CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if not wrapped
    return {
      currency: 'INR',
      setCurrency: () => {},
      activeCurrency: CURRENCIES.INR,
      formatPrice: (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`,
      convertPrice: (amt) => Number(amt || 0),
      currencies: CURRENCIES,
    };
  }
  return context;
};

export default CurrencyContext;
