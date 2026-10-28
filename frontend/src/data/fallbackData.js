// Initial seed data for hybrid offline/Vercel standalone mode
export const initialProducts = [
  {
    _id: 'prod_1',
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
    priceHistory: [
      { date: '2026-10-01', price: 144900 },
      { date: '2026-10-08', price: 142900 },
      { date: '2026-10-15', price: 139900 },
      { date: '2026-10-22', price: 137900 },
      { date: '2026-10-28', price: 134900 }
    ],
    isFlashDeal: true,
    rating: 4.9,
    numReviews: 240,
    badges: ['Lowest Price in 30 Days', 'Deal of the Day', 'Prime Same-Day'],
  },
  {
    _id: 'prod_2',
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
    priceHistory: [
      { date: '2026-10-01', price: 139999 },
      { date: '2026-10-10', price: 134999 },
      { date: '2026-10-18', price: 129999 },
      { date: '2026-10-28', price: 124999 }
    ],
    isFlashDeal: false,
    rating: 4.8,
    numReviews: 195,
    badges: ['Lowest Price in 30 Days', 'Top Rated'],
  },
  {
    _id: 'prod_3',
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
    priceHistory: [
      { date: '2026-10-01', price: 44999 },
      { date: '2026-10-15', price: 41999 },
      { date: '2026-10-28', price: 39999 }
    ],
    isFlashDeal: true,
    rating: 4.7,
    numReviews: 86,
    badges: ['Fair Market Price', 'Best Value Tablet'],
  },
  {
    _id: 'prod_4',
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
    priceHistory: [
      { date: '2026-10-01', price: 279990 },
      { date: '2026-10-14', price: 264990 },
      { date: '2026-10-28', price: 254990 }
    ],
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 45,
    badges: ['Lowest Price in 30 Days', 'Ultimate Gaming'],
  },
  {
    _id: 'prod_5',
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
    priceHistory: [
      { date: '2026-10-01', price: 319900 },
      { date: '2026-10-15', price: 299900 },
      { date: '2026-10-28', price: 289900 }
    ],
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 110,
    badges: ['Fair Market Price', 'Creator Choice'],
  },
  {
    _id: 'prod_6',
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
    priceHistory: [
      { date: '2026-10-01', price: 64999 },
      { date: '2026-10-18', price: 61999 },
      { date: '2026-10-28', price: 59999 }
    ],
    isFlashDeal: true,
    rating: 4.8,
    numReviews: 135,
    badges: ['Deal of the Day', 'Top Handheld'],
  },
  {
    _id: 'prod_7',
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
    priceHistory: [
      { date: '2026-10-01', price: 31990 },
      { date: '2026-10-12', price: 28990 },
      { date: '2026-10-28', price: 26990 }
    ],
    isFlashDeal: true,
    rating: 4.8,
    numReviews: 520,
    badges: ['Lowest Price in 30 Days', 'Deal of the Day', 'Prime Same-Day'],
  },
  {
    _id: 'prod_8',
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
    priceHistory: [
      { date: '2026-10-01', price: 89900 },
      { date: '2026-10-16', price: 83900 },
      { date: '2026-10-28', price: 79900 }
    ],
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 160,
    badges: ['Lowest Price in 30 Days', 'Top Smartwatch'],
  },
  {
    _id: 'prod_9',
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
    priceHistory: [
      { date: '2026-10-01', price: 24900 },
      { date: '2026-10-20', price: 22900 },
      { date: '2026-10-28', price: 21900 }
    ],
    isFlashDeal: false,
    rating: 4.6,
    numReviews: 78,
    badges: ['Fair Market Price'],
  },
  {
    _id: 'prod_10',
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
    priceHistory: [
      { date: '2026-10-01', price: 18999 },
      { date: '2026-10-15', price: 17499 },
      { date: '2026-10-28', price: 16499 }
    ],
    isFlashDeal: false,
    rating: 4.9,
    numReviews: 64,
    badges: ['Lowest Price in 30 Days', 'Enthusiast Choice'],
  },
  {
    _id: 'prod_11',
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
    priceHistory: [
      { date: '2026-10-01', price: 9999 },
      { date: '2026-10-16', price: 8999 },
      { date: '2026-10-28', price: 8499 }
    ],
    isFlashDeal: true,
    rating: 4.9,
    numReviews: 142,
    badges: ['Deal of the Day', 'Top Developer Tool'],
  },
  {
    _id: 'prod_12',
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
    priceHistory: [
      { date: '2026-10-01', price: 17499 },
      { date: '2026-10-15', price: 15999 },
      { date: '2026-10-28', price: 14999 }
    ],
    isFlashDeal: false,
    rating: 4.8,
    numReviews: 92,
    badges: ['Lowest Price in 30 Days', 'Prime Same-Day'],
  },
];
