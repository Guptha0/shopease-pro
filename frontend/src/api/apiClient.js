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

      // Order creation
      if (url === '/orders') {
        const orders = getStoredOrders();
        const tracking = 'TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const newOrder = {
          _id: 'ord_' + Date.now(),
          ...data,
          orderStatus: 'Order Placed',
          trackingNumber: tracking,
          courierPartner: 'BlueDart Express',
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

      throw err;
    }
  },

  // Generic PUT
  async put(url, data, config = {}) {
    try {
      return await axiosInstance.put(url, data, config);
    } catch (err) {
      console.warn(`[Hybrid API Fallback] PUT ${url}:`, err.message);
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
