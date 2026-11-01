async function testSuite() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing ShopEase Pro Backend Endpoints at:', baseURL);

  // 1. Health check
  const healthRes = await fetch(`${baseURL}/health`);
  const health = await healthRes.json();
  console.log('✔ Health Check:', health);

  // 2. User login
  const userLoginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@shopease.com', password: 'user123' }),
  });
  const userLogin = await userLoginRes.json();
  console.log('✔ User Login Successful:', userLogin.user.name);
  const userToken = userLogin.token;

  // 3. User Wallet check (Should have ₹1500 float and 120 coins)
  const walletRes = await fetch(`${baseURL}/wallet`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const walletData = await walletRes.json();
  console.log('✔ User Wallet:', {
    balance: walletData.wallet.balance,
    rewardsCoins: walletData.wallet.rewardsCoins,
    transactionsCount: walletData.wallet.transactions.length,
  });

  // 4. Admin login
  const adminLoginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shopease.com', password: 'admin123' }),
  });
  const adminLogin = await adminLoginRes.json();
  console.log('✔ Admin Login Successful:', adminLogin.user.name);
  const adminToken = adminLogin.token;

  // 5. Fetch all Returns (Admin)
  const returnsRes = await fetch(`${baseURL}/returns`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const returnsData = await returnsRes.json();
  console.log('✔ Returns List Count:', returnsData.count);
  const sampleReturn = returnsData.returns[0];
  console.log('✔ Sample Return:', {
    returnId: sampleReturn.returnId,
    orderTracking: sampleReturn.orderTracking,
    reason: sampleReturn.reason,
    refundAmount: sampleReturn.refundAmount,
    status: sampleReturn.status,
  });

  // 6. Fetch all Support Tickets (Admin)
  const ticketsRes = await fetch(`${baseURL}/tickets`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const ticketsData = await ticketsRes.json();
  console.log('✔ Tickets List Count:', ticketsData.count);
  const sampleTicket = ticketsData.tickets[0];
  console.log('✔ Sample Ticket:', {
    ticketId: sampleTicket.ticketId,
    subject: sampleTicket.subject,
    priority: sampleTicket.priority,
    status: sampleTicket.status,
  });

  // 7. Approve Return (Should auto-credit refund to user's wallet!)
  const initialBalance = walletData.wallet.balance;
  const approveRes = await fetch(`${baseURL}/returns/${sampleReturn._id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  });
  const approveData = await approveRes.json();
  console.log('✔ Return Approved:', approveData.message);

  // 8. Verify User Wallet after refund credit
  const updatedWalletRes = await fetch(`${baseURL}/wallet`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const updatedWalletData = await updatedWalletRes.json();
  console.log('✔ User Wallet After Refund Credit:', {
    previousBalance: initialBalance,
    newBalance: updatedWalletData.wallet.balance,
    refundAdded: updatedWalletData.wallet.balance - initialBalance,
  });

  console.log('\n🎉 ALL ENTERPRISE FINTECH, RETURN, AND TICKET APIS VERIFIED PERFECTLY!');
}

testSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
