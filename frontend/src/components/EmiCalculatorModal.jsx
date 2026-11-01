import React, { useState } from 'react';
import {
  CreditCard,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  Info,
} from 'lucide-react';

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', discount: '10% Instant Off' },
  { id: 'icici', name: 'ICICI Bank', discount: 'Zero Processing Fee' },
  { id: 'axis', name: 'Axis Bank', discount: '₹1,500 CashBack' },
  { id: 'sbi', name: 'SBI Card', discount: 'Instant Pre-Approval' },
];

const EmiCalculatorModal = ({ isOpen, onClose, product, onSelectEmiPlan }) => {
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [selectedTenure, setSelectedTenure] = useState(6);

  if (!isOpen || !product) return null;

  const price = product.price;

  const plans = [
    {
      tenure: 3,
      label: '3 Months (No-Cost EMI)',
      monthly: Math.round(price / 3),
      interestRate: 0,
      totalInterest: 0,
      isNoCost: true,
    },
    {
      tenure: 6,
      label: '6 Months (No-Cost EMI)',
      monthly: Math.round(price / 6),
      interestRate: 0,
      totalInterest: 0,
      isNoCost: true,
    },
    {
      tenure: 9,
      label: '9 Months Standard EMI',
      monthly: Math.round((price * 1.09) / 9),
      interestRate: 12,
      totalInterest: Math.round(price * 0.09),
      isNoCost: false,
    },
    {
      tenure: 12,
      label: '12 Months Low EMI',
      monthly: Math.round((price * 1.13) / 12),
      interestRate: 13,
      totalInterest: Math.round(price * 0.13),
      isNoCost: false,
    },
  ];

  const activePlan = plans.find((p) => p.tenure === selectedTenure) || plans[1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                0% No-Cost EMI Calculator
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Zero Down Payment
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Split your purchase into easy monthly installments without extra charges
            </p>
          </div>
        </div>

        {/* Product summary */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between my-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-white text-xs truncate">{product.name}</h4>
              <span className="text-slate-400 text-[11px]">Payable: ₹{price.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <span className="font-black text-white text-sm shrink-0">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Bank Partner Selector */}
        <div className="space-y-2 mb-4">
          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block">
            Select Partner Credit Card / Bank
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BANKS.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => setSelectedBank(bank)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedBank.id === bank.id
                    ? 'bg-slate-800 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs block text-white">{bank.name}</span>
                <span className="text-[10px] text-emerald-400 block truncate">
                  {bank.discount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* EMI Plans List */}
        <div className="space-y-2 mb-4 flex-1 overflow-y-auto pr-1">
          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider block">
            Available Installment Tenures
          </span>
          <div className="space-y-2">
            {plans.map((plan) => {
              const isSelected = selectedTenure === plan.tenure;
              return (
                <div
                  key={plan.tenure}
                  onClick={() => setSelectedTenure(plan.tenure)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{plan.label}</span>
                        {plan.isNoCost && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                            0% Interest
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {plan.isNoCost
                          ? `ShopEase bears all ₹${Math.round(price * 0.08).toLocaleString('en-IN')} interest`
                          : `Annual interest rate: ${plan.interestRate}% (₹${plan.totalInterest.toLocaleString('en-IN')} total interest)`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-white block">
                      ₹{plan.monthly.toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Total: ₹{(plan.monthly * plan.tenure).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              if (onSelectEmiPlan) onSelectEmiPlan(activePlan, selectedBank);
            }}
            className="w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Select {activePlan.tenure}M EMI Plan (₹{activePlan.monthly.toLocaleString('en-IN')}/mo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmiCalculatorModal;
