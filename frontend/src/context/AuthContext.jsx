import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shopease_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('shopease_token') || null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: t, user: u } = res.data;
        setToken(t);
        setUser(u);
        localStorage.setItem('shopease_token', t);
        localStorage.setItem('shopease_user', JSON.stringify(u));
        return u;
      }
      throw new Error(res.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      if (res.data?.success) {
        const { token: t, user: u } = res.data;
        setToken(t);
        setUser(u);
        localStorage.setItem('shopease_token', t);
        localStorage.setItem('shopease_user', JSON.stringify(u));
        return u;
      }
      throw new Error(res.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shopease_token');
    localStorage.removeItem('shopease_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
