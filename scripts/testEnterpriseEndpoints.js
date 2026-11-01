const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING ENTERPRISE & FINTECH SUITE TESTS ---');

  // 1. Login as demo user
  const userLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'user@shopease.com', password: 'user123' }
  );
  console.log('1. User Login:', userLogin.status, userLogin.data?.success ? 'SUCCESS' : 'FAILED');
  const userToken = userLogin.data?.token;

  // 2. Login as admin
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@shopease.com', password: 'admin123' }
  );
  console.log('2. Admin Login:', adminLogin.status, adminLogin.data?.success ? 'SUCCESS' : 'FAILED');
  const adminToken = adminLogin.data?.token;

  // 3. Test Pay Later GET
  const payLaterRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/enterprise/paylater',
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log('3. PayLater GET:', payLaterRes.status, `Available: ₹${payLaterRes.data?.payLater?.availableCredit}`);

  // 4. Test Pay Later Payment
  const payLaterPayRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/enterprise/paylater/pay',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    },
    { amount: 1500, orderId: 'TRK-TEST-BNPL' }
  );
  console.log('4. PayLater Pay:', payLaterPayRes.status, payLaterPayRes.data?.message);

  // 5. Test Gift Card Creation & Redemption
  const gcCreateRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/enterprise/giftcards/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    },
    { amount: 500, recipientEmail: 'friend@gmail.com', theme: 'Birthday Surprise' }
  );
  console.log('5. GiftCard Create:', gcCreateRes.status, `Code: ${gcCreateRes.data?.giftCard?.code}`);
  const cardCode = gcCreateRes.data?.giftCard?.code;

  if (cardCode) {
    const gcRedeemRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/enterprise/giftcards/redeem',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      },
      { code: cardCode }
    );
    console.log('6. GiftCard Redeem:', gcRedeemRes.status, `Credited: ₹${gcRedeemRes.data?.creditedAmount}`);
  }

  // 7. Test Subscriptions
  const subRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/enterprise/subscriptions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    },
    {
      productName: 'Mechanical Switch Lubricant & Keycap Puller Kit',
      originalPrice: 1299,
      discountedPrice: 1169,
      intervalDays: 60,
    }
  );
  console.log('7. Subscribe & Save (10% OFF):', subRes.status, subRes.data?.message);

  // 8. Test Squad Buy
  const squadCreateRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/enterprise/squadbuy/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    },
    {
      productName: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      originalPrice: 26990,
      squadPrice: 22941,
    }
  );
  console.log('8. Squad Buy Create (15% OFF):', squadCreateRes.status, `Code: ${squadCreateRes.data?.squad?.squadCode}`);

  // 9. Test Abandoned Carts Radar (Admin)
  const abandonedRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/enterprise/abandoned-carts',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('9. Abandoned Carts Radar GET:', abandonedRes.status, `Found ${abandonedRes.data?.abandonedCarts?.length} carts`);

  // 10. Test Abandoned Cart Nudge
  const nudgeRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/enterprise/abandoned-carts/nudge',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { cartId: 'ABN-1092' }
  );
  console.log('10. Abandoned Cart Nudge POST:', nudgeRes.status, nudgeRes.data?.message);

  console.log('--- ALL ENTERPRISE SUITE TESTS COMPLETED ---');
}

runTests().catch(console.error);
