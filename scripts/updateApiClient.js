const fs = require('fs');

let code = fs.readFileSync('frontend/src/api/apiClient.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Add sample stored returns and tickets helpers if not present
if (!code.includes('getStoredReturns')) {
  const targetHelpers = `const getStoredNotifications = () => {`;

  const replacementHelpers = `const getStoredReturns = () => {
  try {
    const data = localStorage.getItem('shopease_returns');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = [
    {
      _id: 'ret_sample_01',
      returnId: 'RET-481902',
      order: 'ord_sample_delivered',
      orderTracking: 'TRK-XP1092KA',
      userName: 'Rohan Sharma',
      userEmail: 'user@shopease.com',
      items: [
        {
          name: 'Raspberry Pi 5 8GB RAM AI Starter Kit',
          price: 8499,
          quantity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        },
      ],
      reason: 'Damaged packaging during transit',
      resolution: 'Instant Wallet Refund',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      refundAmount: 17003,
      pickupDate: new Date(Date.now() + 86400000).toISOString(),
      pickupAddress: {
        fullName: 'Rohan Sharma',
        address: 'Flat 402, Prestige Lakeside Habitat, Varthur',
        city: 'Bengaluru',
        postalCode: '560060',
        phone: '+91 91234 56789',
      },
      status: 'Return Requested',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      timeline: [
        {
          status: 'Return Requested',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          description: 'Customer requested instant wallet refund for damaged outer packaging.',
        },
        {
          status: 'Pickup Scheduled',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          description: 'BlueDart reverse pickup scheduled for doorstep retrieval.',
        },
      ],
    },
  ];
  localStorage.setItem('shopease_returns', JSON.stringify(initial));
  return initial;
};

const saveStoredReturns = (returns) => {
  localStorage.setItem('shopease_returns', JSON.stringify(returns));
};

const getStoredTickets = () => {
  try {
    const data = localStorage.getItem('shopease_tickets');
    if (data) return JSON.parse(data);
  } catch {}
  const initial = [
    {
      _id: 'tck_sample_01',
      ticketId: 'TCK-892144',
      userName: 'Rohan Sharma',
      userEmail: 'user@shopease.com',
      subject: 'Delivery timing slot request for BlueDart express shipment',
      category: 'Delivery Delayed',
      priority: 'Medium',
      status: 'Open',
      orderId: 'TRK-BD8921KA',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      messages: [
        {
          sender: 'user',
          senderName: 'Rohan Sharma',
          text: 'Hi Team, could you please confirm the expected delivery slot for order #TRK-BD8921KA? Is BlueDart Prime available for afternoon drop?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
      ],
    },
  ];
  localStorage.setItem('shopease_tickets', JSON.stringify(initial));
  return initial;
};

const saveStoredTickets = (tickets) => {
  localStorage.setItem('shopease_tickets', JSON.stringify(tickets));
};

const getStoredNotifications = () => {`;

  code = code.replace(targetHelpers, replacementHelpers);
}

// 2. Add GET /returns and /tickets fallbacks
if (!code.includes("url.startsWith('/returns')")) {
  const targetGet = `      // Fallback for /notifications
      if (url === '/notifications') {
        const notifications = getStoredNotifications();
        return { data: { success: true, notifications } };
      }`;

  const replacementGet = `      // Fallback for /notifications
      if (url === '/notifications') {
        const notifications = getStoredNotifications();
        return { data: { success: true, notifications } };
      }

      // Fallback for /returns
      if (url.startsWith('/returns')) {
        const returns = getStoredReturns();
        return { data: { success: true, count: returns.length, returns } };
      }

      // Fallback for /tickets
      if (url.startsWith('/tickets')) {
        const tickets = getStoredTickets();
        return { data: { success: true, count: tickets.length, tickets } };
      }`;

  code = code.replace(targetGet, replacementGet);
}

// 3. Add POST /returns, /tickets, and /wallet/claim-price-drop
if (!code.includes("url === '/returns'")) {
  const targetPost = `      // Order creation
      if (url === '/orders') {`;

  const replacementPost = `      // Returns submission
      if (url === '/returns') {
        const returns = getStoredReturns();
        const retId = 'RET-' + Math.floor(100000 + Math.random() * 900000);
        const newReturn = {
          _id: 'ret_' + Date.now(),
          returnId: retId,
          ...data,
          status: 'Return Requested',
          createdAt: new Date().toISOString(),
          timeline: [
            {
              status: 'Return Requested',
              timestamp: new Date().toISOString(),
              description: \`Return requested: \${data.reason}\`,
            },
            {
              status: 'Pickup Scheduled',
              timestamp: new Date().toISOString(),
              description: 'Doorstep pickup assigned to BlueDart courier executive.',
            },
          ],
        };
        returns.unshift(newReturn);
        saveStoredReturns(returns);

        // Add SMS notification
        const notifs = getStoredNotifications();
        notifs.unshift({
          id: 'NOTIF-' + Date.now().toString(36).toUpperCase(),
          channel: 'SMS',
          type: 'order',
          title: 'Return Pickup Scheduled',
          message: \`Your return request #\${retId} has been confirmed. BlueDart pickup scheduled for \${new Date(data.pickupDate).toLocaleDateString()}. Track live: shopease.pro/orders\`,
          orderId: retId,
          read: false,
          timestamp: new Date().toISOString(),
        });
        saveStoredNotifications(notifs);

        return { data: { success: true, returnRequest: newReturn } };
      }

      // Tickets submission
      if (url === '/tickets') {
        const tickets = getStoredTickets();
        const tckId = 'TCK-' + Math.floor(100000 + Math.random() * 900000);
        const newTicket = {
          _id: 'tck_' + Date.now(),
          ticketId: tckId,
          ...data,
          status: 'Open',
          createdAt: new Date().toISOString(),
          messages: [
            {
              sender: 'user',
              senderName: data.userName || 'Customer',
              text: data.message,
              timestamp: new Date().toISOString(),
            },
          ],
        };
        tickets.unshift(newTicket);
        saveStoredTickets(tickets);
        return { data: { success: true, ticket: newTicket } };
      }

      // Ticket messages
      if (url.includes('/tickets/') && url.endsWith('/messages')) {
        const parts = url.split('/');
        const id = parts[2];
        const tickets = getStoredTickets();
        const tck = tickets.find(t => t._id === id || t.ticketId === id);
        if (tck) {
          tck.messages.push({
            sender: data.sender || 'agent',
            senderName: data.sender === 'agent' ? 'Support Specialist' : 'Customer',
            text: data.text,
            timestamp: new Date().toISOString(),
          });
          saveStoredTickets(tickets);
          return { data: { success: true, ticket: tck } };
        }
      }

      // Claim price drop
      if (url === '/wallet/claim-price-drop') {
        const wallet = getStoredWallet();
        const amt = Number(data.refundAmount) || 500;
        wallet.balance = (wallet.balance || 0) + amt;
        const newTxn = {
          id: 'TXN-' + Date.now().toString(36).toUpperCase(),
          type: 'CREDIT',
          amount: amt,
          description: \`7-Day Price-Drop Refund for Order #\${data.orderId || 'PRICEDROP'}\`,
          referenceId: 'PD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString(),
        };
        wallet.transactions.unshift(newTxn);
        saveStoredWallet(wallet);
        return { data: { success: true, message: \`₹\${amt} Price-Drop Refund Credited to Wallet!\`, wallet } };
      }

      // Order creation
      if (url === '/orders') {`;

  code = code.replace(targetPost, replacementPost);
}

// 4. Add PUT /auth/profile
if (!code.includes("url === '/auth/profile'")) {
  const targetPut = `      if (url.startsWith('/products/')) {`;

  const replacementPut = `      if (url === '/auth/profile') {
        const tokenUser = JSON.parse(localStorage.getItem('shopease_user') || '{}');
        const updated = { ...tokenUser, ...data };
        localStorage.setItem('shopease_user', JSON.stringify(updated));
        return { data: { success: true, user: updated } };
      }

      if (url.startsWith('/products/')) {`;

  code = code.replace(targetPut, replacementPut);
}

// 5. Add PATCH /returns/:id/approve and /tickets/:id/resolve
if (!code.includes("url.includes('/returns/') && url.endsWith('/approve')")) {
  const targetPatch = `      if (url.includes('/status')) {`;

  const replacementPatch = `      // Return approval
      if (url.includes('/returns/') && url.endsWith('/approve')) {
        const parts = url.split('/');
        const id = parts[2];
        const returns = getStoredReturns();
        const ret = returns.find(r => r._id === id || r.returnId === id);
        if (ret) {
          ret.status = 'Refund Completed';
          ret.timeline.push({
            status: 'Refund Completed',
            timestamp: new Date().toISOString(),
            description: \`Admin approved refund of ₹\${ret.refundAmount?.toLocaleString('en-IN')}. Auto-credited to Virtual Wallet.\`,
          });
          saveStoredReturns(returns);

          // Credit customer wallet
          const wallet = getStoredWallet();
          wallet.balance = (wallet.balance || 0) + (ret.refundAmount || 0);
          wallet.transactions.unshift({
            id: 'TXN-' + Date.now().toString(36).toUpperCase(),
            type: 'CREDIT',
            amount: ret.refundAmount || 0,
            description: \`Instant Refund for Return #\${ret.returnId} (\${ret.orderTracking})\`,
            referenceId: \`RET-REF-\${ret.returnId}\`,
            createdAt: new Date().toISOString(),
          });
          saveStoredWallet(wallet);

          // Notify customer
          const notifs = getStoredNotifications();
          notifs.unshift({
            id: 'NOTIF-' + Date.now().toString(36).toUpperCase(),
            channel: 'SMS',
            type: 'wallet',
            title: 'Refund Credited to Virtual Wallet',
            message: \`ShopEase Pro: Instant Wallet Refund of ₹\${ret.refundAmount?.toLocaleString('en-IN')} for return #\${ret.returnId} credited successfully! Check balance in wallet passbook.\`,
            orderId: ret.returnId,
            read: false,
            timestamp: new Date().toISOString(),
          });
          saveStoredNotifications(notifs);

          return { data: { success: true, returnRequest: ret } };
        }
      }

      // Return status update
      if (url.includes('/returns/') && url.endsWith('/status')) {
        const parts = url.split('/');
        const id = parts[2];
        const returns = getStoredReturns();
        const ret = returns.find(r => r._id === id || r.returnId === id);
        if (ret) {
          ret.status = data.status;
          ret.timeline.push({
            status: data.status,
            timestamp: new Date().toISOString(),
            description: \`Status changed to \${data.status}\`,
          });
          saveStoredReturns(returns);
          return { data: { success: true, returnRequest: ret } };
        }
      }

      // Ticket resolution
      if (url.includes('/tickets/') && url.endsWith('/resolve')) {
        const parts = url.split('/');
        const id = parts[2];
        const tickets = getStoredTickets();
        const tck = tickets.find(t => t._id === id || t.ticketId === id);
        if (tck) {
          tck.status = 'Resolved';
          tck.resolvedAt = new Date().toISOString();
          saveStoredTickets(tickets);
          return { data: { success: true, ticket: tck } };
        }
      }

      if (url.includes('/status')) {`;

  code = code.replace(targetPatch, replacementPatch);
}

fs.writeFileSync('frontend/src/api/apiClient.js', code, 'utf8');
console.log('apiClient.js updated with complete mock fallbacks!');

