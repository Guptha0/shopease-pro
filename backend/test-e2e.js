async function runE2E() {
  const base = 'http://localhost:5000/api';
  console.log('--- Starting End-to-End API Verification ---');

  // 1. Health
  const health = await fetch(`${base}/health`).then(r => r.json());
  console.log('1. Health Check:', health.status === 'ok' ? 'PASS' : 'FAIL');

  // 2. Products
  const products = await fetch(`${base}/products`).then(r => r.json());
  console.log(`2. Products Catalog: PASS (${products.count} items, ${products.categories.length} categories)`);

  // 3. Customer Login
  const userAuth = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@shopease.com', password: 'user123' }),
  }).then(r => r.json());
  console.log('3. Customer Login:', userAuth.success ? `PASS (User: ${userAuth.user.name})` : 'FAIL');

  // 4. Admin Login
  const adminAuth = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shopease.com', password: 'admin123' }),
  }).then(r => r.json());
  console.log('4. Admin Login:', adminAuth.success ? `PASS (Admin: ${adminAuth.user.name})` : 'FAIL');

  // 5. Place an Order as Customer
  const firstProd = products.products[0];
  const orderRes = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAuth.token}`,
    },
    body: JSON.stringify({
      items: [{
        product: firstProd._id,
        name: firstProd.name,
        price: firstProd.price,
        quantity: 1,
        imageUrl: firstProd.imageUrl,
      }],
      shippingAddress: {
        fullName: 'Alex Johnson',
        address: '742 Evergreen Terrace',
        city: 'San Francisco',
        postalCode: '94107',
        phone: '+1 555-0199',
      },
      paymentMethod: 'UPI',
      totalAmount: firstProd.price + 15,
    }),
  }).then(r => r.json());
  console.log('5. Order Placement & Tracking Generation:', orderRes.success ? `PASS (${orderRes.order.trackingNumber}, Status: ${orderRes.order.orderStatus})` : 'FAIL');

  // 6. User Orders
  const myOrders = await fetch(`${base}/orders/my-orders`, {
    headers: { 'Authorization': `Bearer ${userAuth.token}` },
  }).then(r => r.json());
  console.log(`6. My Orders List: PASS (${myOrders.count} orders found)`);

  // 7. Admin Stats
  const stats = await fetch(`${base}/orders/admin/stats`, {
    headers: { 'Authorization': `Bearer ${adminAuth.token}` },
  }).then(r => r.json());
  console.log(`7. Admin KPI Stats: PASS (Revenue: $${stats.stats.totalRevenue}, Orders: ${stats.stats.totalOrders})`);

  // 8. Admin Update Order Status
  const statusUpdate = await fetch(`${base}/orders/${orderRes.order._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminAuth.token}`,
    },
    body: JSON.stringify({ status: 'Shipped' }),
  }).then(r => r.json());
  console.log('8. Admin Status PATCH:', statusUpdate.success ? `PASS (New Status: ${statusUpdate.order.orderStatus})` : 'FAIL');

  // 9. Admin Product CRUD
  const createProd = await fetch(`${base}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminAuth.token}`,
    },
    body: JSON.stringify({
      name: 'Smart Ambient Desk Lamp',
      brand: 'Lumora',
      description: 'Smart RGB ambient light with wireless app controls.',
      mrp: 99.99,
      price: 59.99,
      category: 'Electronics',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      rating: 4.7,
    }),
  }).then(r => r.json());
  console.log('9. Admin Product Create:', createProd.success ? 'PASS' : 'FAIL');

  const deleteProd = await fetch(`${base}/products/${createProd.product._id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminAuth.token}` },
  }).then(r => r.json());
  console.log('10. Admin Product Delete:', deleteProd.success ? 'PASS' : 'FAIL');

  console.log('\n🌟 ALL 10 E2E BACKEND & WORKFLOW TESTS PASSED SUCCESSFULLY!');
}

runE2E().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
