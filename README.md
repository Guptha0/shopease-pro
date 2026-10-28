# 🛍️ ShopEase Pro — Next-Gen E-Commerce Platform & SmartSense™ Shopping Suite

> **ShopEase Pro** is an enterprise-grade full-stack e-commerce marketplace engineered with **Node.js, Express, MongoDB (Mongoose), React 19 (Vite), and Tailwind CSS**.
> It combines an Amazon & Flipkart-scale storefront experience with groundbreaking consumer shopping innovations through the proprietary **SmartSense™ Shopping Suite**.

---

## 🚀 Standout Innovation: SmartSense™ Shopping Suite

ShopEase Pro is designed to solve real-world e-commerce friction points that traditional platforms like Amazon and Flipkart overlook:

1. **30-Day SVG Price History & Fake-Discount Detector:**
   - Every product features a transparent 30-day interactive price history curve.
   - Detects inflated MRP markups vs genuine price drops with algorithmic confidence badges: *"Lowest Price in 30 Days"* vs *"Fair Market Price"*.
2. **DealBot™ AI Bargain Negotiator:**
   - An interactive conversational deal negotiator widget.
   - Negotiates real-time discounts and issues time-sensitive single-use vouchers (`DEALBOT-8`, `BARGAIN-12`) with active 15-minute countdown timers.
3. **SmartSense™ 48-Hour Price Lock:**
   - Allows users to freeze flash deal pricing for 48 hours without upfront payment, protecting buyers from sudden price surges before payday.
4. **Side-by-Side Spec Comparison Matrix:**
   - Bottom floating comparison tray supporting up to 3 products simultaneously.
   - Full-screen spec breakdown matrix highlighting winner specs (e.g. processor, battery life, display, warranty) in green.
5. **Real-Time Pincode Delivery Estimator:**
   - Direct pincode validator delivering tailored SLAs: Prime Same-Day Express, Next-Day Delivery, or Standard Surface Delivery.
6. **Printable GST Tax Invoice Generator:**
   - Compliant Indian GST Tax Invoice modal with itemized CGST/SGST calculations, HSN breakdowns, and one-click printable format.

---

## 🌟 Core Features & Modules

### 1. Storefront & Catalog Experience
- **Multi-Faceted Sidebar Filters:** Filter by Category, Brands (Apple, Samsung, ASUS ROG, Sony, Bose, Keychron, etc.), Price Range slider (₹5,000 to ₹3,00,000), Customer Ratings (`4★ & above`), and Availability (`Exclude Out of Stock`).
- **Dynamic Flipkart-Style Category Tabs:** Fast horizontal scroll tabs with a live countdown timer (`HH:MM:SS`) for Flash Deals.
- **Smart Auto-Suggest Search:** Real-time dropdown search with instant thumbnail previews and category suggestions.
- **Comprehensive Product Details:** Multi-angle image galleries, EMI calculators, bank discount banners, and verified customer review submission.

### 2. Shopping Cart & Save-for-Later
- **Dual Cart Interfaces:** Slide-over quick cart drawer + full-page Amazon-style Cart View.
- **Save-for-Later Section:** Seamlessly move items between active cart and saved items.
- **Dynamic Coupon Engine:** Supports promo codes such as `WELCOME10`, `TECHORBIT20`, and AI DealBot vouchers (`DEALBOT-8`).
- **Itemized Bill Breakdown:** Transparent MRP savings, coupon discounts, platform fee, and delivery calculations.

### 3. Multi-Step Checkout & Orders
- **3-Step Checkout:** Saved address selection, delivery speed configuration (Prime Same-Day vs Standard), and multi-method payment simulator (Credit/Debit Card, UPI / PhonePe, Net Banking, and Cash on Delivery).
- **Inventory Protection:** Atomic stock decrement with out-of-stock validation on order placement.
- **5-Stage Courier Tracking Timeline:** Real-time visual progress stepper with courier partner tracking (`TRK-BD8921KA` via BlueDart / Delhivery) and granular timestamps.

### 4. Admin Seller Central Portal
- **Financial & Operational KPIs:** Live tracking of Gross Merchandise Value (GMV), total completed orders, active catalog count, and critical low-stock alerts.
- **Product Management:** Full CRUD suite with thumbnail validation, stock modifications, and flash deal badges.
- **Fulfillment Pipeline:** Dynamic order status updates (`Order Placed` ➔ `Packed` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`) appending courier milestone logs.
- **Promotions & Flash Deals Hub:** Manage active coupon codes and toggle flash discount flags.

---

## 🏗️ Architecture & Tech Stack

```
f:/E-Commerce/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB connector (127.0.0.1:27017)
│   ├── middleware/
│   │   └── auth.js               # JWT verification & role authorization (protect, adminOnly)
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing & addresses
│   │   ├── Product.js            # Catalog schema with 30-day priceHistory & specs Map
│   │   └── Order.js              # Order schema with 5-stage timeline & airway bill
│   ├── routes/
│   │   ├── authRoutes.js         # Register, Login, Me endpoints
│   │   ├── productRoutes.js      # Multi-faceted search, reviews, & Admin CRUD
│   │   └── orderRoutes.js        # Order creation, tracking, stats, & courier status updates
│   ├── utils/
│   │   ├── generateToken.js      # JWT token signer
│   │   └── seederHelper.js       # Seeds 12 premium products, 2 demo accounts, & 3 orders
│   ├── .env                      # Environment config (PORT=5000, MONGODB_URI)
│   ├── seed.js                   # Database seeder CLI script (npm run seed)
│   ├── test-e2e.js               # 10-step automated E2E test suite
│   └── server.js                 # Express server with CORS & routing
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js      # Smart Hybrid HTTP client with transparent fallback
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top bar with auto-suggest search & pincode selector
│   │   │   ├── CategoryTabs.jsx  # Flipkart-style tabs with flash sale countdown
│   │   │   ├── HeroBanner.jsx    # SmartSense™ high-impact hero banner
│   │   │   ├── ProductCard.jsx   # Card with 30D trend, Bargain, Hold, & Add-to-Cart
│   │   │   ├── ProductDetailModal.jsx # Multi-angle gallery, bank offers, & reviews
│   │   │   ├── PriceHistoryModal.jsx  # 30-day SVG price chart & fake discount meter
│   │   │   ├── NegotiateDealModal.jsx # DealBot™ AI bargaining chat modal
│   │   │   ├── PriceLockModal.jsx     # 48-hour price lock confirmation modal
│   │   │   ├── CompareDrawer.jsx      # Floating comparison tray & side-by-side matrix
│   │   │   ├── PincodeModal.jsx       # Delivery speed & pincode calculator
│   │   │   ├── InvoiceModal.jsx       # Printable official GST Tax Invoice
│   │   │   ├── CartDrawer.jsx         # Slide-over quick cart drawer
│   │   │   ├── Toast.jsx              # Floating notification toasts
│   │   │   └── Footer.jsx             # Footer with evaluator links & assurances
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication context & localStorage persistence
│   │   │   └── CartContext.jsx   # Cart, Save-for-Later, Compare, Wishlist, & Price-Locks
│   │   ├── data/
│   │   │   └── fallbackData.js   # 12 tech products with price histories for offline mode
│   │   ├── pages/
│   │   │   ├── StorePage.jsx     # Multi-faceted sidebar filter storefront
│   │   │   ├── CartView.jsx      # Full-page cart with Save-for-Later
│   │   │   ├── CheckoutPage.jsx  # 3-step address, delivery speed, & payment simulator
│   │   │   ├── OrdersPage.jsx    # Order tracking with 5-stage courier stepper
│   │   │   ├── AdminSellerCentral.jsx # KPI cards, Product CRUD, & Order fulfillment
│   │   │   └── AuthPage.jsx      # Sign In / Register with 1-click demo buttons
│   │   ├── App.jsx               # Master application layout & modal manager
│   │   ├── index.css             # Glassmorphism & dark aesthetic tokens
│   │   └── main.jsx
│   ├── vite.config.js            # Vite configuration with /api reverse proxy
│   └── package.json
│
└── README.md
```

---

## 🔑 Demo Evaluator Credentials

The application provides instant **One-Click Demo Evaluator Buttons** on the Sign-In page (`/auth`):

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@shopease.com` | `admin123` | Full Seller Central, Product CRUD, Order Status Updates, Financial KPIs |
| **Customer** | `user@shopease.com` | `user123` | Browsing, Bargaining, Price-Lock, Checkout, Order Tracking, Invoices |

---

## 📡 RESTful API Documentation

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer; returns JWT + profile |
| `POST` | `/api/auth/login` | Public | Authenticate user or admin; returns JWT + profile |
| `GET` | `/api/auth/me` | Protected | Fetch currently authenticated user profile |

### 2. Product Endpoints (`/api/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Query catalog with `?search=`, `?category=`, `?brand=`, `?minPrice=`, `?maxPrice=`, `?minRating=`, `?inStock=`, `?flashDeals=`, `?sort=` |
| `GET` | `/api/products/:id` | Public | Fetch single product with reviews, specs, and price history |
| `POST` | `/api/products/:id/reviews` | Protected (User) | Submit rating (1-5★) and verified review |
| `POST` | `/api/products` | Protected (Admin) | Create a new catalog product |
| `PUT` | `/api/products/:id` | Protected (Admin) | Modify existing product details, stock, or pricing |
| `DELETE` | `/api/products/:id` | Protected (Admin) | Permanently delete product from catalog |

### 3. Order & Tracking Endpoints (`/api/orders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Protected (User) | Place order, initialize 5-stage courier timeline, decrement stock |
| `GET` | `/api/orders/my-orders` | Protected (User) | Retrieve authenticated user's order history |
| `GET` | `/api/orders/:id` | Protected (User/Admin) | Retrieve order details & tracking events |
| `GET` | `/api/orders` | Protected (Admin) | Retrieve all platform orders with populated customer data |
| `PATCH` | `/api/orders/:id/status` | Protected (Admin) | Transition fulfillment status and append courier milestone log |
| `GET` | `/api/orders/admin/stats` | Protected (Admin) | Aggregate GMV revenue, order volume, and low stock items |

---

## ⚡ Quick Start Guide

### 1. Database & Backend
```bash
# In backend directory
cd backend
npm install

# Seed 12 products, demo accounts, and sample orders
npm run seed

# Start Express server on http://localhost:5000
npm start
```

### 2. Frontend Development Server
```bash
# In frontend directory
cd frontend
npm install

# Launch Vite dev server on http://localhost:5173
npm run dev
```

### 3. Production Build Validation
```bash
cd frontend
npm run build
```

---

## 🧪 Automated Testing

An automated end-to-end verification test suite is included in `backend/test-e2e.js`:
```bash
cd backend
node test-e2e.js
```
The test verifies 10 critical workflows:
1. User registration & JWT generation
2. Customer login
3. Admin login & RBAC validation
4. Public product browsing with search & category filters
5. Out-of-stock guard verification
6. User order creation with stock decrement
7. User order tracking and courier timeline inspection
8. Admin order status transition (`Packed` ➔ `Shipped`)
9. Admin product creation & update
10. Admin GMV & revenue analytics retrieval

---

## 📄 License
MIT Open Source. Designed and engineered for high-performance e-commerce experiences.
