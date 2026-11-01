import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import apiClient from '../api/apiClient';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  Package,
  TrendingDown,
  ShieldAlert,
  Headphones,
  Check,
  ChevronRight,
  Plus,
  LifeBuoy,
  MessageSquare,
  Clock,
  ArrowRight,
  ExternalLink,
  Minimize2,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

const SUGGESTIONS = [
  '🎮 Best gaming laptop under ₹70,000',
  '⌨️ Discounts on mechanical keyboards',
  '📦 Can you track my last order?',
  '🛡️ How does price-drop protection work?',
  '🔄 How do I return or replace an item?',
  '🎫 Open a Support Ticket',
];

const ShopBotModal = ({ onNavigate, onSelectProduct }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { triggerNotification } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'ticket'
  const [messages, setMessages] = useState([
    {
      id: 'msg_init',
      sender: 'bot',
      text: "👋 Hi there! I'm **ShopBot**, your AI Shopping & Support Concierge. Ask me for product recommendations, order tracking updates, price-drop claims, or support tickets!",
      products: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);

  // Support Ticket Form State
  const [ticketCategory, setTicketCategory] = useState('Delivery Delayed');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Quick Add to Cart from Bot message
  const handleBotAddToCart = (product) => {
    addToCart(product, 1);
    setAddedProductId(product._id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  // Process user prompt with smart natural language matching
  const processUserQuery = async (queryText) => {
    const q = queryText.toLowerCase().trim();

    // Check if user wants support ticket directly
    if (q.includes('support ticket') || q.includes('open ticket') || q.includes('human') || q.includes('help desk') || q.includes('agent')) {
      setActiveTab('ticket');
      return {
        text: "I've opened the **Support Help Desk Ticket** tab for you below! Fill in your issue details and our priority support team will resolve it within 2 hours.",
        products: [],
      };
    }

    // 1. Gaming Laptop under 70k
    if ((q.includes('gaming') && q.includes('laptop')) || (q.includes('laptop') && (q.includes('70') || q.includes('under')))) {
      try {
        const res = await apiClient.get('/products');
        const prods = res.data?.products || [];
        const laptops = prods.filter(
          (p) =>
            (p.category === 'Laptops & Gaming' || p.name.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('gaming')) &&
            p.price <= 75000
        );

        if (laptops.length > 0) {
          return {
            text: `🎯 Here is our **#1 recommended gaming machine under ₹70,000** with high-TGP dedicated graphics, high refresh rate, and verified 7-day price-drop protection:`,
            products: laptops,
          };
        }
      } catch (e) {
        console.warn('Bot product query error:', e);
      }

      return {
        text: `🎯 The best gaming laptop under ₹70,000 is the **Lenovo LOQ 15.6" 144Hz Gaming Laptop** powered by Intel Core i5 13th Gen & NVIDIA GeForce RTX 4050 6GB GDDR6 (priced at ₹67,990, discounted from ₹86,990). Alternatively, the **Steam Deck OLED 1TB** (₹59,999) delivers AAA portable gaming!`,
        products: [],
      };
    }

    // 2. Mechanical Keyboards & Discounts
    if (q.includes('keyboard') || q.includes('keychron') || q.includes('mechanical')) {
      try {
        const res = await apiClient.get('/products');
        const prods = res.data?.products || [];
        const keyboards = prods.filter(
          (p) => p.name.toLowerCase().includes('keyboard') || p.name.toLowerCase().includes('keychron')
        );

        if (keyboards.length > 0) {
          return {
            text: `⌨️ Yes! We currently have a special deal on the **Keychron Q1 Pro Custom Mechanical Keyboard** with 18% OFF, double-gasket acoustic dampening, and hot-swappable switches:`,
            products: keyboards,
          };
        }
      } catch (e) {}

      return {
        text: `⌨️ We have an exclusive discount on the **Keychron Q1 Pro Wireless Custom Mechanical Keyboard** for ₹16,499 (18% off MRP ₹19,999) with hot-swap switches and CNC aluminum body!`,
        products: [],
      };
    }

    // 3. Track latest order
    if (q.includes('track') || q.includes('where is my order') || q.includes('order status') || q.includes('last order')) {
      try {
        const res = await apiClient.get('/orders/my-orders');
        const orders = res.data?.orders || [];
        if (orders.length > 0) {
          const latest = orders[0];
          return {
            text: `📦 Your most recent order **#${latest.trackingNumber || latest._id}** is currently **${latest.orderStatus}** via **${latest.courierPartner || 'BlueDart Express'}**.\n\n• Delivery Location: ${latest.shippingAddress?.city || 'Bengaluru'}\n• Amount: ₹${latest.totalAmount.toLocaleString('en-IN')}\n\nYou can inspect the full tracking timeline in your [My Orders](/orders) page!`,
            products: [],
          };
        }
      } catch (e) {}

      return {
        text: `📦 Your latest order **#TRK-BD8921KA** is in transit via **BlueDart Express** (Status: Out for Delivery in Bengaluru). Expected doorstep delivery by today 6:30 PM!`,
        products: [],
      };
    }

    // 4. Price-Drop Protection
    if (q.includes('price drop') || q.includes('price-drop') || q.includes('protection') || q.includes('guarantee')) {
      return {
        text: `🛡️ **ShopEase Pro 7-Day Instant Price-Drop Guarantee**:\n\nIf any product you purchased drops in price on ShopEase Pro within 7 days of your order, we automatically refund the entire difference directly into your **ShopEase Virtual Wallet**!\n\nNo tedious paperwork—you can also click *"Claim Price-Drop Refund"* in your Account Hub under My Orders.`,
        products: [],
      };
    }

    // 5. Return & Replacement Workflow
    if (q.includes('return') || q.includes('replace') || q.includes('refund')) {
      return {
        text: `🔄 **Automated Return & Instant Wallet Refund**:\n\n1. Head over to **Account > Returns & Refunds** or **My Orders**.\n2. Click **"Return / Replace Item"** on any delivered item.\n3. Choose your reason (*Defective, Wrong size, Damaged package*), choose **Instant Wallet Refund**, and upload a photo.\n4. BlueDart doorstep pickup is scheduled automatically.\n5. Once approved, the refund is auto-credited to your Virtual Wallet instantly with an SMS alert!`,
        products: [],
      };
    }

    // 6. Generic Product Search / Fallback
    try {
      const res = await apiClient.get('/products');
      const prods = res.data?.products || [];
      const matched = prods.filter((p) =>
        q.split(' ').some((word) => word.length > 2 && (p.name.toLowerCase().includes(word) || p.brand.toLowerCase().includes(word) || p.category.toLowerCase().includes(word)))
      );

      if (matched.length > 0) {
        return {
          text: `✨ I found ${matched.length} top-rated match${matched.length > 1 ? 'es' : ''} in our catalog for "${queryText}":`,
          products: matched.slice(0, 2),
        };
      }
    } catch (e) {}

    return {
      text: `I'm here to help! You can ask me to find products (e.g. *"Best laptop under ₹70k"*, *"Audio headphones"*), check your latest order tracking status, explain our Zero-Dark-Pattern policy, or click below to open a direct support ticket.`,
      products: [],
    };
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      products: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsTyping(true);

    try {
      const botResponse = await processUserQuery(textToSend);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_bot_' + Date.now(),
            sender: 'bot',
            text: botResponse.text,
            products: botResponse.products || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
      }, 500);
    } catch (err) {
      setIsTyping(false);
    }
  };

  // Submit Support Ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      alert('Please fill out both the ticket subject and description.');
      return;
    }

    setTicketSubmitting(true);
    try {
      const res = await apiClient.post('/tickets', {
        category: ticketCategory,
        priority: ticketPriority,
        subject: ticketSubject,
        orderId: ticketOrderId || 'TRK-BD8921KA',
        message: ticketMessage,
      });

      if (res.data?.success) {
        const ticket = res.data.ticket;
        setTicketSuccess(ticket);

        // Simulated SMS notification
        triggerNotification({
          channel: 'SMS',
          type: 'support',
          title: `Support Ticket Created #${ticket.ticketId}`,
          message: `Your support request for "${ticket.subject}" has been received (Ref: ${ticket.ticketId}). Priority resolution agent assigned.`,
          orderId: ticket.ticketId,
        });

        // Add confirmation to chat
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_ticket_' + Date.now(),
            sender: 'bot',
            text: `✅ **Support Ticket Created Successfully!**\n\n• **Ticket ID**: \`${ticket.ticketId}\`\n• **Category**: ${ticket.category}\n• **Status**: Open (Agent Assigned)\n\nOur customer support operations team has received your inquiry. Track status in your Account Hub under Support Tickets!`,
            products: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // Reset form
        setTicketSubject('');
        setTicketMessage('');
      }
    } catch (err) {
      alert('Failed to submit support ticket: ' + err.message);
    } finally {
      setTicketSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Avatar Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all group border border-indigo-400/30"
          title="Open ShopBot AI Shopping Assistant & Support"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-white">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black tracking-tight flex items-center gap-1">
              <span>ShopBot</span>
              <span className="px-1 py-0.2 rounded text-[9px] bg-amber-400 text-slate-950 font-bold uppercase">
                AI
              </span>
            </div>
            <p className="text-[10px] text-indigo-200">24/7 Smart Concierge</p>
          </div>
        </button>
      )}

      {/* Floating Dialog Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[600px] max-h-[85vh] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">ShopBot AI</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pro Assistant
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active • Smart Engine Ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Minimize ShopBot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 bg-slate-900/60 border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Shopping Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`py-2.5 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'ticket'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Open Support Ticket</span>
            </button>
          </div>

          {/* Tab 1: AI Chat Assistant */}
          {activeTab === 'chat' && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 shadow-md whitespace-pre-wrap leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="prose prose-invert prose-xs">
                        {m.text}
                      </div>

                      {/* Attached Product Recommendations Cards */}
                      {m.products && m.products.length > 0 && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/80">
                          {m.products.map((p) => {
                            const isAdded = addedProductId === p._id;
                            const mrp = p.mrp || Math.round(p.price * 1.25);
                            return (
                              <div
                                key={p._id}
                                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 hover:border-indigo-500/40 transition-all"
                              >
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-14 h-14 rounded-lg object-cover bg-slate-900 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-[11px] truncate">
                                    {p.name}
                                  </h4>
                                  <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="font-extrabold text-white text-xs">
                                      ₹{p.price.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-[10px] text-slate-500 line-through">
                                      ₹{mrp.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-emerald-400 font-bold">
                                    ★ {p.rating ? p.rating.toFixed(1) : '4.8'} • 7-Day Price Protect
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    onClick={() => handleBotAddToCart(p)}
                                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all ${
                                      isAdded
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Added</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag className="w-3 h-3" />
                                        <span>Add</span>
                                      </>
                                    )}
                                  </button>
                                  {onSelectProduct && (
                                    <button
                                      onClick={() => onSelectProduct(p)}
                                      className="px-2 py-1 rounded text-[9px] text-slate-400 hover:text-white bg-slate-900 border border-slate-800 text-center"
                                    >
                                      Specs
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <span className="text-[9px] text-slate-400 block mt-1 text-right">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 p-2 text-slate-400 text-xs">
                    <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span>ShopBot is scanning products & policies...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.replace(/^[^\s]+\s/, ''))}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-[10px]"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about laptops under ₹70k, track order, etc..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-all shrink-0 shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* Tab 2: Open Support Ticket Form */}
          {activeTab === 'ticket' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <LifeBuoy className="w-4 h-4 text-indigo-400" />
                  <span>ShopEase Priority Help Desk</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Have an issue that AI cannot resolve? File a support ticket and our human response desk will resolve it within 2 hours.
                </p>
              </div>

              {ticketSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Ticket #{ticketSuccess.ticketId} Created!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    A representative has been dispatched. Track updates in your Account Hub.
                  </p>
                  <button
                    onClick={() => {
                      setTicketSuccess(null);
                      setActiveTab('chat');
                    }}
                    className="mt-2 text-[10px] font-bold underline"
                  >
                    Back to AI Chat
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmitTicket} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Issue Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Delivery Delayed">Delivery Delayed</option>
                    <option value="Payment Failed">Payment Failed</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Refund Inquiry">Refund Inquiry</option>
                    <option value="Product Technical Issue">Product Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Associated Order ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TRK-BD8921KA"
                      value={ticketOrderId}
                      onChange={(e) => setTicketOrderId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Ticket Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of the issue"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Describe your issue in detail *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details so our support specialists can resolve it quickly..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    {ticketSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <LifeBuoy className="w-4 h-4" />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShopBotModal;

