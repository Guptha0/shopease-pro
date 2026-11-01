const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/AdminSellerCentral.jsx', 'utf8');

// 1. Add tabs to top tab bar
if (!code.includes('setActiveTab(\'returns\')')) {
  const targetTabs = `<button
          onClick={() => setActiveTab('deals')}`;

  const replacementTabs = `<button
          onClick={() => setActiveTab('returns')}
          className={\`flex items-center gap-2 px-5 py-3 border-b-2 transition-all \${
            activeTab === 'returns'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }\`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Returns & Refunds ({returns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={\`flex items-center gap-2 px-5 py-3 border-b-2 transition-all \${
            activeTab === 'tickets'
              ? 'border-rose-500 text-rose-400 bg-rose-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }\`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Support Desk ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}`;

  code = code.replace(targetTabs, replacementTabs);
}

// 2. Add fetch methods and handlers
if (!code.includes('fetchReturns')) {
  const targetEffect = `  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);`;

  const replacementEffect = `  const fetchReturns = async () => {
    setReturnsLoading(true);
    try {
      const res = await apiClient.get('/returns');
      if (res.data?.success) setReturns(res.data.returns || []);
    } catch (err) {
      console.warn('Failed returns fetch:', err.message);
    } finally {
      setReturnsLoading(false);
    }
  };

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await apiClient.get('/tickets');
      if (res.data?.success) setTickets(res.data.tickets || []);
    } catch (err) {
      console.warn('Failed tickets fetch:', err.message);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchProducts();
      fetchOrders();
      fetchReturns();
      fetchTickets();
    }
  }, [isAdmin]);

  // Approve Refund & Auto-Credit Virtual Wallet
  const handleApproveRefund = async (returnId) => {
    setProcessingReturnId(returnId);
    try {
      const res = await apiClient.patch('/returns/' + returnId + '/approve');
      if (res.data?.success) {
        const updatedReturn = res.data.returnRequest;
        setReturns((prev) =>
          prev.map((r) => (r._id === returnId || r.returnId === returnId ? updatedReturn : r))
        );
        showNotice('Refund of ₹' + updatedReturn.refundAmount?.toLocaleString('en-IN') + ' approved and auto-credited to customer wallet!');

        triggerNotification({
          channel: 'SMS',
          type: 'wallet',
          title: 'Refund Credited to Virtual Wallet',
          message: 'ShopEase Pro: Instant Wallet Refund of ₹' + updatedReturn.refundAmount?.toLocaleString('en-IN') + ' for return #' + updatedReturn.returnId + ' credited successfully! Check balance in wallet passbook.',
          orderId: updatedReturn.returnId,
        });
      }
    } catch (err) {
      showNotice(err.message || 'Failed to approve refund', true);
    } finally {
      setProcessingReturnId(null);
    }
  };

  // Update Return Status
  const handleUpdateReturnStatus = async (returnId, status) => {
    try {
      const res = await apiClient.patch('/returns/' + returnId + '/status', { status });
      if (res.data?.success) {
        const updatedReturn = res.data.returnRequest;
        setReturns((prev) =>
          prev.map((r) => (r._id === returnId || r.returnId === returnId ? updatedReturn : r))
        );
        showNotice('Return #' + returnId + ' transitioned to "' + status + '"');
      }
    } catch (err) {
      showNotice(err.message || 'Status update failed', true);
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async (ticketId) => {
    setResolvingTicketId(ticketId);
    try {
      const res = await apiClient.patch('/tickets/' + ticketId + '/resolve', {
        resolutionNote: 'Issue resolved by ShopEase Support Desk specialist.',
      });
      if (res.data?.success) {
        const updatedTicket = res.data.ticket;
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId || t.ticketId === ticketId ? updatedTicket : t))
        );
        showNotice('Support Ticket #' + updatedTicket.ticketId + ' marked as Resolved!');

        triggerNotification({
          channel: 'SMS',
          type: 'support',
          title: 'Support Ticket #' + updatedTicket.ticketId + ' Resolved',
          message: 'ShopEase Help Desk has marked ticket #' + updatedTicket.ticketId + ' as resolved. Thank you for shopping with us!',
          orderId: updatedTicket.ticketId,
        });
      }
    } catch (err) {
      showNotice(err.message || 'Failed to resolve ticket', true);
    } finally {
      setResolvingTicketId(null);
    }
  };

  // Send Reply to Ticket
  const handleSendTicketReply = async (ticketId) => {
    const replyText = ticketReplies[ticketId];
    if (!replyText?.trim()) return;

    try {
      const res = await apiClient.post('/tickets/' + ticketId + '/messages', {
        text: replyText,
        sender: 'agent',
      });
      if (res.data?.success) {
        const updatedTicket = res.data.ticket;
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId || t.ticketId === ticketId ? updatedTicket : t))
        );
        setTicketReplies((prev) => ({ ...prev, [ticketId]: '' }));
        showNotice('Reply sent to customer on #' + updatedTicket.ticketId);
      }
    } catch (err) {
      showNotice(err.message || 'Failed to send reply', true);
    }
  };`;

  code = code.replace(targetEffect, replacementEffect);
}

// 3. Add Tab Panes for Returns & Tickets before ADD / EDIT MODAL
if (!code.includes('activeTab === \'returns\'')) {
  const targetModal = `      {/* ADD / EDIT MODAL */}`;

  const replacementPanes = `      {/* TAB 4: RETURNS & REFUNDS MANAGEMENT */}
      {activeTab === 'returns' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <span>Returns, Replacements & Wallet Refunds ({returns.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect customer returned items, verify transit damage proofs, and approve 1-click virtual wallet refunds.
              </p>
            </div>
            <button
              onClick={fetchReturns}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Returns</span>
            </button>
          </div>

          {returnsLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading return requests...</div>
          ) : returns.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card text-center space-y-2">
              <RotateCcw className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-sm font-bold text-white">No active returns found</h3>
              <p className="text-xs text-slate-500">All customer orders are currently in good standing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((ret) => {
                const isApproved = ret.status === 'Refund Completed';
                const isProcessing = processingReturnId === ret._id || processingReturnId === ret.returnId;
                return (
                  <div
                    key={ret._id || ret.returnId}
                    className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-indigo-400">
                            #{ret.returnId}
                          </span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="text-xs text-slate-400">
                            Order: <strong className="text-white font-mono">{ret.orderTracking || 'N/A'}</strong>
                          </span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="text-xs text-slate-400">
                            Customer: <strong className="text-white">{ret.userName || 'Customer'}</strong> ({ret.userEmail || ''})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Requested on {new Date(ret.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ret.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }\`}
                        >
                          {ret.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Reason & Resolution
                        </span>
                        <div>
                          <p className="text-slate-300 font-semibold">{ret.reason}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {ret.resolution || 'Instant Wallet Refund'}
                            </span>
                            <span className="text-white font-bold">
                              ₹{ret.refundAmount?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Doorstep Pickup
                        </span>
                        <p className="text-slate-300">
                          Scheduled: <strong className="text-white">{new Date(ret.pickupDate || Date.now()).toLocaleDateString()}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {ret.pickupAddress?.address || ret.pickupAddress?.city || 'Bengaluru Mega Hub'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Customer Inspection Photo
                        </span>
                        {ret.imageUrl ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={ret.imageUrl}
                              alt="Proof"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900"
                            />
                            <a
                              href={ret.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                            >
                              <span>View Full Proof</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">No image attached</p>
                        )}
                      </div>
                    </div>

                    {ret.items && ret.items.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          {ret.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shrink-0"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-6 h-6 rounded object-cover bg-slate-950"
                              />
                              <span className="text-slate-200 font-medium truncate max-w-[180px]">
                                {item.name}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                Qty: {item.quantity} (₹{(item.price * item.quantity).toLocaleString('en-IN')})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Milestone Status:</span>
                        <select
                          value={ret.status}
                          onChange={(e) => handleUpdateReturnStatus(ret._id || ret.returnId, e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Return Requested">Return Requested</option>
                          <option value="Pickup Scheduled">Pickup Scheduled</option>
                          <option value="Item Picked Up">Item Picked Up</option>
                          <option value="Inspected at Hub">Inspected at Hub</option>
                          <option value="Refund Completed">Refund Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        {!isApproved && ret.resolution === 'Instant Wallet Refund' && (
                          <button
                            onClick={() => handleApproveRefund(ret._id || ret.returnId)}
                            disabled={isProcessing}
                            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Crediting Wallet...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve Refund (Auto-Credit ₹{ret.refundAmount?.toLocaleString('en-IN')})</span>
                              </>
                            )}
                          </button>
                        )}
                        {isApproved && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Refund Credited to Virtual Wallet</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS & HELP DESK */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-rose-400" />
                <span>Customer Support Tickets & Help Desk ({tickets.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Priority help desk escalation from ShopBot AI. Reply directly or resolve open inquiries.
              </p>
            </div>
            <button
              onClick={fetchTickets}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Tickets</span>
            </button>
          </div>

          {ticketsLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading support tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card text-center space-y-2">
              <LifeBuoy className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-sm font-bold text-white">No active support tickets</h3>
              <p className="text-xs text-slate-500">All customer support issues have been resolved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((tck) => {
                const isResolved = tck.status === 'Resolved';
                const isResolving = resolvingTicketId === tck._id || resolvingTicketId === tck.ticketId;
                const replyText = ticketReplies[tck._id || tck.ticketId] || '';

                return (
                  <div
                    key={tck._id || tck.ticketId}
                    className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-rose-400">
                            #{tck.ticketId}
                          </span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {tck.category}
                          </span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span
                            className={\`px-2 py-0.5 rounded text-[10px] font-bold \${
                              tck.priority === 'Urgent'
                                ? 'bg-rose-500/20 text-rose-400'
                                : tck.priority === 'High'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-indigo-500/20 text-indigo-300'
                            }\`}
                          >
                            {tck.priority} Priority
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm mt-1">{tck.subject}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          From: <strong className="text-slate-200">{tck.userName || 'Customer'}</strong> ({tck.userEmail}) • Ref Order: <code className="text-indigo-400">{tck.orderId || 'N/A'}</code>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }\`}
                        >
                          {tck.status}
                        </span>
                        {!isResolved && (
                          <button
                            onClick={() => handleResolveTicket(tck._id || tck.ticketId)}
                            disabled={isResolving}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 max-h-60 overflow-y-auto text-xs">
                      {tck.messages && tck.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={\`flex flex-col \${m.sender === 'agent' ? 'items-end' : 'items-start'}\`}
                        >
                          <div
                            className={\`max-w-[85%] rounded-2xl p-3 \${
                              m.sender === 'agent'
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-xs'
                            }\`}
                          >
                            <div className="flex items-center justify-between gap-4 text-[10px] mb-1 opacity-70">
                              <span>{m.senderName || (m.sender === 'agent' ? 'Support Agent' : 'Customer')}</span>
                              <span>{new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isResolved && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Type an official reply to the customer..."
                          value={replyText}
                          onChange={(e) =>
                            setTicketReplies((prev) => ({
                              ...prev,
                              [tck._id || tck.ticketId]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendTicketReply(tck._id || tck.ticketId);
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleSendTicketReply(tck._id || tck.ticketId)}
                          disabled={!replyText.trim()}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT MODAL */}`;

  code = code.replace(targetModal, replacementPanes);
}

fs.writeFileSync('frontend/src/pages/AdminSellerCentral.jsx', code, 'utf8');
console.log('AdminSellerCentral.jsx successfully updated!');

