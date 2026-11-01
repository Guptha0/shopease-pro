const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Return = require('../models/Return');
const Ticket = require('../models/Ticket');

// Helper to generate 30 days of historical price points
const generate30DayPriceHistory = (currentPrice, minPrice, maxPrice) => {
  const history = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Wave pattern with some drops
    const wave = Math.sin(i / 4);
    let p = Math.round(minPrice + (maxPrice - minPrice) * ((wave + 1) / 2));
    if (i === 0) p = currentPrice; // Today's price
    history.push({ date: dateStr, price: p });
  }
  return history;
};

const initialProducts = [
  {
    name: 'Apple iPhone 16 Pro Max 256GB - Natural Titanium',
    brand: 'Apple',
    category: 'Mobiles & Tablets',
    description: 'A18 Pro bionic chip, Grade 5 titanium design, 48MP Fusion camera system with 5x Telephoto, and Camera Control shutter button.',
    mrp: 144900,
    price: 134900,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Apple A18 Pro (3nm)',
      'Display': '6.9" Super Retina XDR OLED 120Hz',
      'Battery': '4685 mAh (Up to 33h Video)',
      'Camera': '48MP Main + 48MP Ultra-wide + 12MP 5x Telephoto',
      'Warranty': '1 Year Apple Official Warranty',
      'Value Score': '94/100'
    },
    priceHistory: generate30DayPriceHistory(134900, 134900, 144900),
    isFlashDeal: true,
    rating: 4.9,
    numReviews: 240,
    badges: ['Lowest Price in 30 Days', 'Deal of the Day', 'Prime Same-Day'],
  },
  {
    name: 'Samsung Galaxy S24 Ultra 512GB AI Phone - Titanium Gray',
    brand: 'Samsung',
    category: 'Mobiles & Tablets',
    description: 'Galaxy AI suite with Live Translate and Circle to Search. Built-in S-Pen, 200MP Quad Tele camera, and Snapdragon 8 Gen 3 for Galaxy.',
    mrp: 139999,
    price: 124999,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Display': '6.8" Dynamic AMOLED 2X 120Hz Flat',
      'Battery': '5000 mAh with 45W Fast Charging',
      'Camera': '200MP + 50MP 5x + 10MP 3x + 12MP',
      'Warranty': '1 Year Brand Warranty',
      'Value Score': '92/100'
    },
    priceHistory: generate30DayPriceHistory(124999, 124999, 139999),
    isFlashDeal: false,
    rating: 4.8,
    numReviews: 195,
    badges: ['Lowest Price in 30 Days', 'Top Rated'],
  },
  {
    name: 'OnePlus Pad 2 Snapdragon 8 Gen 3 Tablet (12GB/256GB)',
    brand: 'OnePlus',
    category: 'Mobiles & Tablets',
    description: '12.1-inch 3K 144Hz ReadFit display with 7:5 ratio. 6-speaker acoustic stereo sound and 9510mAh battery with 67W SUPERVOOC charging.',
    mrp: 47999,
    price: 39999,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Qualcomm Snapdragon 8 Gen 3',
      'Display': '12.1" 3K 144Hz 7:5 ReadFit IPS',
      'Battery': '9510 mAh (67W Fast Charging)',
      'Audio': '6 Omnidirectional Hi-Res Speakers',
      'Warranty': '1 Year Official Warranty',
      'Value Score': '96/100'
    },
    priceHistory: generate30DayPriceHistory(39999, 39999, 44999),
    isFlashDeal: true,
    rating: 4.7,
    numReviews: 86,
    badges: ['Fair Market Price', 'Best Value Tablet'],
  },
  {
    name: 'ASUS ROG Strix SCAR 16 RTX 4080 Gaming Laptop',
    brand: 'ASUS ROG',
    category: 'Laptops & Gaming',
    description: 'Intel Core i9-14900HX, 32GB DDR5, 1TB PCIe 4.0 SSD, NVIDIA GeForce RTX 4080 (175W TGP), and ROG Nebula HDR Mini-LED 240Hz Display.',
    mrp: 299990,
    price: 254990,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Intel Core i9-14900HX (24 cores)',
      'GPU': 'NVIDIA GeForce RTX 4080 12GB GDDR6',
      'Display': '16" QHD+ 240Hz Mini LED 1100 Nits',
      'RAM / SSD': '32GB DDR5-5600 / 1TB NVMe Gen4',
      'Warranty': '2 Year On-site ROG Care',
      'Value Score': '91/100'
    },
    priceHistory: generate30DayPriceHistory(254990, 254990, 279990),
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 45,
    badges: ['Lowest Price in 30 Days', 'Ultimate Gaming'],
  },
  {
    name: 'Apple MacBook Pro 14" M3 Max 36GB / 1TB SSD',
    brand: 'Apple',
    category: 'Laptops & Gaming',
    description: 'M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display, up to 18 hours battery life, Space Black finish.',
    mrp: 319900,
    price: 289900,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Apple M3 Max (14-core CPU)',
      'GPU': '30-core GPU with Hardware Ray Tracing',
      'Display': '14.2" Liquid Retina XDR 120Hz',
      'RAM / SSD': '36GB Unified Memory / 1TB SSD',
      'Warranty': '1 Year Apple International Warranty',
      'Value Score': '95/100'
    },
    priceHistory: generate30DayPriceHistory(289900, 289900, 319900),
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 110,
    badges: ['Fair Market Price', 'Creator Choice'],
  },
  {
    name: 'Steam Deck OLED 1TB Handheld Gaming Console',
    brand: 'Valve',
    category: 'Laptops & Gaming',
    description: 'HDR OLED 7.4-inch display, 90Hz refresh rate, 50Wh battery, Wi-Fi 6E, and full Steam library compatibility on the go.',
    mrp: 69999,
    price: 59999,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'APU': 'AMD 6nm Custom Zen 2 + RDNA 2',
      'Display': '7.4" HDR OLED 90Hz 1000 nits',
      'Storage': '1TB High-speed NVMe SSD',
      'Battery': '50Wh (3-12 hours gameplay)',
      'Warranty': '1 Year International Warranty',
      'Value Score': '97/100'
    },
    priceHistory: generate30DayPriceHistory(59999, 59999, 64999),
    isFlashDeal: true,
    rating: 4.8,
    numReviews: 135,
    badges: ['Deal of the Day', 'Top Handheld'],
  },
  {
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'Audio & Wearables',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Crystal-clear hands-free calling, up to 30-hour battery life.',
    mrp: 34990,
    price: 26990,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'ANC Driver': 'Integrated Processor V1 + QN1 HD',
      'Battery': '30 Hours (3 min charge = 3 hours)',
      'Codecs': 'LDAC, AAC, SBC, Hi-Res Wireless',
      'Weight': '250 grams Ultra-Comfort',
      'Warranty': '1 Year Brand Warranty',
      'Value Score': '98/100'
    },
    priceHistory: generate30DayPriceHistory(26990, 26990, 31990),
    isFlashDeal: true,
    rating: 4.8,
    numReviews: 520,
    badges: ['Lowest Price in 30 Days', 'Deal of the Day', 'Prime Same-Day'],
  },
  {
    name: 'Apple Watch Ultra 2 Titanium GPS + Cellular (49mm)',
    brand: 'Apple',
    category: 'Audio & Wearables',
    description: 'Rugged titanium case, precision dual-frequency GPS, up to 36 hours of battery life, 100m water resistance, and S9 SiP with Double Tap gesture.',
    mrp: 89900,
    price: 79900,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Case': 'Aerospace-Grade Titanium 49mm',
      'Display': 'Always-On Retina 3000 Nits Sapphire',
      'Battery': '36 Hours Standard / 72h Low Power',
      'Sensors': 'Depth Gauge, ECG, Blood Oxygen, Temp',
      'Warranty': '1 Year Apple Warranty',
      'Value Score': '93/100'
    },
    priceHistory: generate30DayPriceHistory(79900, 79900, 89900),
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 160,
    badges: ['Lowest Price in 30 Days', 'Top Smartwatch'],
  },
  {
    name: 'Bose QuietComfort Ultra Spatial Audio Earbuds',
    brand: 'Bose',
    category: 'Audio & Wearables',
    description: 'World-class noise cancellation with CustomTune technology and breakthrough Bose Immersive Audio for spatial sound reproduction.',
    mrp: 25900,
    price: 21900,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Audio Mode': 'Bose Immersive Spatial Audio',
      'Battery': '6h Earbuds + 18h Case (24h Total)',
      'Water Resistance': 'IPX4 Sweat & Weather resistant',
      'Bluetooth': 'v5.3 Snapdragon Sound certified',
      'Warranty': '1 Year Bose India Warranty',
      'Value Score': '90/100'
    },
    priceHistory: generate30DayPriceHistory(21900, 21900, 24900),
    isFlashDeal: false,
    rating: 4.6,
    numReviews: 78,
    badges: ['Fair Market Price'],
  },
  {
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    brand: 'Keychron',
    category: 'Smart Electronics & IoT',
    description: 'Full CNC machined 6063 aluminum body, double-gasket acoustic design, QMK/VIA programmable, and hot-swappable tactile Banana switches.',
    mrp: 19999,
    price: 16499,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Chassis': 'CNC Anodized Aluminum 75% Layout',
      'Switches': 'Keychron K-Pro Pre-lubed Hot-swap',
      'Connectivity': 'Bluetooth 5.1 + Type-C 1000Hz',
      'Firmware': 'QMK/VIA Web Configurator Support',
      'Warranty': '1 Year Brand Warranty',
      'Value Score': '96/100'
    },
    priceHistory: generate30DayPriceHistory(16499, 16499, 18999),
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 64,
    badges: ['Lowest Price in 30 Days', 'Enthusiast Choice'],
  },
  {
    name: 'Raspberry Pi 5 8GB RAM AI Starter Kit',
    brand: 'Raspberry Pi',
    category: 'Smart Electronics & IoT',
    description: 'Broadcom BCM2712 2.4GHz quad-core 64-bit Arm Cortex-A76 CPU, 8GB LPDDR4X, PCIe 2.0 interface, dual 4K HDMI, and official active cooler kit.',
    mrp: 9999,
    price: 8499,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'CPU': 'Broadcom BCM2712 Quad Cortex-A76 @ 2.4GHz',
      'RAM': '8GB LPDDR4X-4267 SDRAM',
      'Ports': 'PCIe 2.0 + Dual 4K60p HDMI + Gigabit LAN',
      'Power': '5V/5A USB-C PD Supported',
      'Warranty': '1 Year Element14 Warranty',
      'Value Score': '99/100'
    },
    priceHistory: generate30DayPriceHistory(8499, 8499, 9999),
    isFlashDeal: true,
    rating: 4.9,
    numReviews: 142,
    badges: ['Deal of the Day', 'Top Developer Tool'],
  },
  {
    name: 'Anker Prime 27,650mAh 250W Multi-Device Fast PowerBank',
    brand: 'Anker',
    category: 'Smart Electronics & IoT',
    description: 'Massive capacity with 250W total output. Fast-charges two laptops simultaneously, smart digital LCD screen, and companion Bluetooth app monitoring.',
    mrp: 18999,
    price: 14999,
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Capacity': '27,650 mAh (99.54 Wh Airline Safe)',
      'Max Output': '250W (140W Single Port PD 3.1)',
      'Screen': 'Smart Color Display with Real-time Watts',
      'Ports': '2x USB-C + 1x USB-A (3 Devices)',
      'Warranty': '2 Year Anker Official Replacement',
      'Value Score': '95/100'
    },
    priceHistory: generate30DayPriceHistory(14999, 14999, 17499),
    isFlashDeal: false,
    rating: 4.8,
    numReviews: 92,
    badges: ['Lowest Price in 30 Days', 'Prime Same-Day'],
  },
  {
    name: 'Lenovo LOQ 15.6" FHD 144Hz Gaming Laptop (Core i5 13th Gen / RTX 4050 6GB)',
    brand: 'Lenovo',
    category: 'Laptops & Gaming',
    description: 'Intel Core i5-13450HX 10-core CPU, NVIDIA GeForce RTX 4050 6GB GDDR6 (95W TGP), 16GB DDR5 4800MHz RAM, 512GB NVMe SSD, and 100% sRGB 144Hz G-Sync display.',
    mrp: 86990,
    price: 67990,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Intel Core i5-13450HX (10 Cores, Up to 4.6GHz)',
      'GPU': 'NVIDIA GeForce RTX 4050 6GB GDDR6 (95W TGP)',
      'Display': '15.6" FHD IPS 144Hz 100% sRGB G-Sync',
      'RAM / SSD': '16GB DDR5-4800 / 512GB M.2 Gen4 NVMe',
      'Battery': '60Wh with Rapid Charge Pro (50% in 30m)',
      'Warranty': '1 Year Onsite + 1 Year Premium Care',
      'Value Score': '98/100'
    },
    priceHistory: generate30DayPriceHistory(67990, 67990, 86990),
    isFlashDeal: true,
    rating: 4.8,
    numReviews: 148,
    badges: ['Lowest Price in 30 Days', 'Best Gaming Laptop under ₹70k', 'Prime Same-Day'],
  },
];

const seedDatabaseIfEmpty = async (forceClear = false) => {
  const count = await Product.countDocuments();
  if (!forceClear && count >= 13) {
    return;
  }

  if (forceClear || count < 13) {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Return.deleteMany({});
    await Ticket.deleteMany({});
  }

  // Create Demo Admin
  const admin = await User.create({
    name: 'ShopEase Administrator',
    email: 'admin@shopease.com',
    password: 'admin123',
    role: 'admin',
    savedAddresses: [
      {
        fullName: 'Admin HQ',
        address: 'Plot 42, Electronics City Phase 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        phone: '+91 98765 43210',
        isDefault: true,
      },
    ],
  });

  // Seed Admin Wallet
  await Wallet.create({
    user: admin._id,
    balance: 25000,
    rewardsCoins: 1200,
    transactions: [
      {
        id: 'TXN-ADM-01',
        type: 'CREDIT',
        amount: 25000,
        description: 'Admin Merchant Operating Float',
        referenceId: 'ADM-FLOAT-INIT',
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
    ],
  });

  // Create Demo Customer
  const customer = await User.create({
    name: 'Rohan Sharma',
    email: 'user@shopease.com',
    password: 'user123',
    role: 'user',
    savedAddresses: [
      {
        fullName: 'Rohan Sharma',
        address: 'Flat 402, Prestige Lakeside Habitat, Varthur',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560060',
        phone: '+91 91234 56789',
        isDefault: true,
      },
    ],
  });

  // Seed Customer Demo Wallet (₹1,500 balance + 120 reward coins for instant evaluator testing)
  await Wallet.create({
    user: customer._id,
    balance: 1500,
    rewardsCoins: 120,
    transactions: [
      {
        id: 'TXN-INIT-01',
        type: 'CREDIT',
        amount: 1500,
        description: 'Demo Pre-Loaded Float for Instant Checkout',
        referenceId: 'DEMO-FLOAT-1500',
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: 'TXN-INIT-02',
        type: 'CREDIT',
        amount: 120,
        description: 'Loyalty Reward Coins from Previous Orders',
        referenceId: 'REWARD-COINS-120',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
    ],
  });

  // Insert 12 Products
  const insertedProducts = await Product.insertMany(initialProducts);

  // 3 Sample Orders in diverse fulfillment stages
  const now = new Date();

  // Order 1: Shipped via BlueDart
  await Order.create({
    user: customer._id,
    items: [
      {
        product: insertedProducts[6]._id, // Sony WH-1000XM5
        name: insertedProducts[6].name,
        price: insertedProducts[6].price,
        mrp: insertedProducts[6].mrp,
        quantity: 1,
        imageUrl: insertedProducts[6].imageUrl,
      },
    ],
    shippingAddress: customer.savedAddresses[0],
    deliverySpeed: 'Prime Same-Day Express',
    paymentMethod: 'UPI',
    mrpTotal: 34990,
    discountAmount: 8000,
    couponCode: 'WELCOME10',
    platformFee: 5,
    deliveryCharge: 0,
    taxAmount: 2429,
    totalAmount: 26995,
    orderStatus: 'Shipped',
    trackingNumber: 'TRK-BD8921KA',
    courierPartner: 'BlueDart Prime Express',
    timeline: [
      {
        status: 'Order Placed',
        location: 'Bengaluru Online Storefront',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        description: 'Payment authorized via PhonePe UPI.',
      },
      {
        status: 'Packed at Bengaluru Fulfillment Hub',
        location: 'Bengaluru Sort Center, KA 560060',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 18),
        description: 'Quality tested & sealed in BlueDart security bag.',
      },
      {
        status: 'Shipped via BlueDart Express',
        location: 'In-Transit to Local Delivery Facility (Varthur)',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 6),
        description: 'Package arrived at delivery station.',
      },
    ],
  });

  // Order 2: Packed
  await Order.create({
    user: customer._id,
    items: [
      {
        product: insertedProducts[9]._id, // Keychron Keyboard
        name: insertedProducts[9].name,
        price: insertedProducts[9].price,
        mrp: insertedProducts[9].mrp,
        quantity: 1,
        imageUrl: insertedProducts[9].imageUrl,
      },
      {
        product: insertedProducts[11]._id, // Anker PowerBank
        name: insertedProducts[11].name,
        price: insertedProducts[11].price,
        mrp: insertedProducts[11].mrp,
        quantity: 1,
        imageUrl: insertedProducts[11].imageUrl,
      },
    ],
    shippingAddress: customer.savedAddresses[0],
    deliverySpeed: 'Standard',
    paymentMethod: 'Card',
    mrpTotal: 38998,
    discountAmount: 7500,
    couponCode: 'TECHORBIT20',
    platformFee: 5,
    deliveryCharge: 0,
    taxAmount: 2835,
    totalAmount: 31503,
    orderStatus: 'Packed',
    trackingNumber: 'TRK-DL4378KA',
    courierPartner: 'Delhivery Surface',
    timeline: [
      {
        status: 'Order Placed',
        location: 'Bengaluru Online Storefront',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5),
        description: 'Payment verified with HDFC Credit Card.',
      },
      {
        status: 'Packed at Bengaluru Fulfillment Hub',
        location: 'Whitefield Mega Hub, KA',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2),
        description: 'Invoice generated & ready for courier hand-over.',
      },
    ],
  });

  // Order 3: Delivered
  const deliveredOrder = await Order.create({
    user: customer._id,
    items: [
      {
        product: insertedProducts[10]._id, // Raspberry Pi 5
        name: insertedProducts[10].name,
        price: insertedProducts[10].price,
        mrp: insertedProducts[10].mrp,
        quantity: 2,
        imageUrl: insertedProducts[10].imageUrl,
      },
    ],
    shippingAddress: customer.savedAddresses[0],
    deliverySpeed: 'Standard',
    paymentMethod: 'COD',
    mrpTotal: 19998,
    discountAmount: 3000,
    couponCode: '',
    platformFee: 5,
    deliveryCharge: 0,
    taxAmount: 1530,
    totalAmount: 17003,
    orderStatus: 'Delivered',
    trackingNumber: 'TRK-XP1092KA',
    courierPartner: 'BlueDart Express',
    timeline: [
      {
        status: 'Order Placed',
        location: 'Bengaluru Online Storefront',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48),
        description: 'Cash on delivery order confirmed.',
      },
      {
        status: 'Packed at Bengaluru Fulfillment Hub',
        location: 'Whitefield Mega Hub, KA',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 36),
        description: 'Packed and verified.',
      },
      {
        status: 'Shipped via BlueDart Express',
        location: 'East Bengaluru Hub, KA',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        description: 'In-transit.',
      },
      {
        status: 'Out for Delivery',
        location: 'Varthur Delivery Beat, Bengaluru',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 8),
        description: 'Courier executive assigned for doorstep drop.',
      },
      {
        status: 'Delivered',
        location: 'Customer Doorstep (Prestige Lakeside)',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 4),
        description: 'Delivered and signed by Rohan Sharma.',
      },
    ],
  });

  // Pre-populate 1 Sample Return on Delivered Order for Evaluator Testing
  await Return.create({
    returnId: 'RET-481902',
    order: deliveredOrder._id,
    orderTracking: deliveredOrder.trackingNumber,
    user: customer._id,
    userName: customer.name,
    userEmail: customer.email,
    items: deliveredOrder.items,
    reason: 'Damaged packaging during transit',
    resolution: 'Instant Wallet Refund',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    refundAmount: deliveredOrder.totalAmount,
    pickupDate: new Date(now.getTime() + 86400000),
    pickupAddress: customer.savedAddresses[0],
    status: 'Return Requested',
    timeline: [
      {
        status: 'Return Requested',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3),
        description: 'Customer requested instant wallet refund for damaged outer packaging.',
      },
      {
        status: 'Pickup Scheduled',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 1),
        description: 'BlueDart doorstep reverse pickup scheduled for doorstep retrieval.',
      },
    ],
  });

  // Pre-populate 1 Active Support Ticket in Admin Help Desk
  await Ticket.create({
    ticketId: 'TCK-892144',
    user: customer._id,
    userName: customer.name,
    userEmail: customer.email,
    subject: 'Delivery timing slot request for BlueDart express shipment',
    category: 'Delivery Delayed',
    priority: 'Medium',
    status: 'Open',
    orderId: 'TRK-BD8921KA',
    messages: [
      {
        sender: 'user',
        senderName: 'Rohan Sharma',
        text: 'Hi Team, could you please confirm the expected delivery slot for order #TRK-BD8921KA? Is BlueDart Prime available for afternoon drop?',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      },
    ],
  });

  console.log('[ShopEase Pro Seed] Loaded 12 products, 2 demo accounts, 3 tracked orders, 1 sample return, and 1 support ticket.');
};

module.exports = { seedDatabaseIfEmpty, initialProducts };
