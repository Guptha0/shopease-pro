import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Bot, Send, Sparkles, Check, Clock, X, Zap } from 'lucide-react';

const NegotiateDealModal = ({ product, onClose }) => {
  const { applyCoupon, addToCart } = useCart();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes timer

  const initialPrice = product ? product.price : 25000;

  useEffect(() => {
    // Initial welcome message from DealBot
    setMessages([
      {
        sender: 'bot',
        text: `Hey there! I am DealBot 🤖, your automated ShopEase Deal Negotiator. I see you're interested in "${
          product ? product.name : 'your cart'
        }" currently at ₹${initialPrice.toLocaleString('en-IN')}. What kind of bundle or discount are you looking for today?`,
      },
    ]);
  }, [product]);

  // Countdown timer for generated coupon
  useEffect(() => {
    if (!generatedVoucher) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [generatedVoucher]);

  const handleSendPrompt = (userMsg) => {
    const textToSend = userMsg || inputText;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setInputText('');
    setIsBotTyping(true);

    setTimeout(() => {
      const discountPct = Math.floor(Math.random() * 5) + 8; // 8% - 12%
      const code = `DEALBOT-${discountPct}`;
      const savings = Math.round((initialPrice * discountPct) / 100);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `You drive a hard bargain! 🤝 I checked with our fulfillment warehouse manager. If you checkout within the next 15 minutes, I can unlock an exclusive ${discountPct}% instant instant price-cut (saving you ₹${savings.toLocaleString(
            'en-IN'
          )}). Here is your personalized voucher:`,
        },
      ]);
      setGeneratedVoucher({ code, discountPct, savings });
      setIsBotTyping(false);
    }, 1200);
  };

  const handleApplyVoucher = () => {
    if (!generatedVoucher) return;
    if (product) {
      addToCart(product, 1);
    }
    applyCoupon(generatedVoucher.code);
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col h-[560px] relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white">DealBot™ AI Bargain Suite</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Live automated negotiation engine • Outbids Amazon & Flipkart
            </p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isBotTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 text-slate-400 rounded-2xl rounded-tl-none p-3 border border-slate-700/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {generatedVoucher && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 text-center space-y-2 animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Personalized Voucher Unlocked</span>
              </div>

              <div className="py-2 px-4 rounded-xl bg-slate-900 border border-dashed border-indigo-400 text-white font-mono text-base font-black tracking-widest inline-block">
                {generatedVoucher.code}
              </div>

              <div className="text-[11px] text-slate-300">
                Saves <strong className="text-emerald-400">₹{generatedVoucher.savings.toLocaleString('en-IN')}</strong> ({generatedVoucher.discountPct}% OFF)
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Expires in {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              <button
                onClick={handleApplyVoucher}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Apply Code & Add to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Negotiate Suggestion Chips */}
        {!generatedVoucher && (
          <div className="pt-2 pb-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSendPrompt("I'm comparing with Amazon, can you match or beat their price?")}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
            >
              Price Match Amazon?
            </button>
            <button
              onClick={() => handleSendPrompt("I can buy this immediately if you give me 10% off!")}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
            >
              10% Instant Deal?
            </button>
            <button
              onClick={() => handleSendPrompt("Can you give me a bundle discount?")}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
            >
              Bundle Discount?
            </button>
          </div>
        )}

        {/* Input Bar */}
        {!generatedVoucher && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Type your counter-offer (e.g. Can you do ₹24,000?)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isBotTyping || !inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NegotiateDealModal;
