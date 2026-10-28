import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { MapPin, X, Check, Truck, Zap, ShieldCheck } from 'lucide-react';

const PincodeModal = ({ isOpen, onClose }) => {
  const { deliveryPincode, setDeliveryPincode, showToast } = useCart();
  const [inputPin, setInputPin] = useState(deliveryPincode);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleCheck = (e) => {
    e.preventDefault();
    if (!inputPin || inputPin.length !== 6) {
      showToast('Please enter a valid 6-digit Pincode', 'warning');
      return;
    }

    setDeliveryPincode(inputPin);

    // Dynamic delivery calculation
    if (inputPin.startsWith('560')) {
      setResult({
        city: 'Bengaluru, Karnataka',
        speed: 'Tomorrow by 9 PM — Prime Same-Day Express',
        codAvailable: true,
        isPrimeEligible: true,
      });
    } else if (
      inputPin.startsWith('110') ||
      inputPin.startsWith('400') ||
      inputPin.startsWith('600') ||
      inputPin.startsWith('500')
    ) {
      setResult({
        city: inputPin.startsWith('110') ? 'New Delhi' : inputPin.startsWith('400') ? 'Mumbai' : 'Metro Hub',
        speed: 'Delivery in 2 Days (By 8 PM)',
        codAvailable: true,
        isPrimeEligible: true,
      });
    } else {
      setResult({
        city: 'National Fulfillment Network',
        speed: 'Delivery in 3–4 Days via BlueDart Air',
        codAvailable: true,
        isPrimeEligible: false,
      });
    }
    showToast(`Delivery location set to ${inputPin}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Select Delivery Location</h3>
            <p className="text-xs text-slate-400">
              Check instant product dispatch & Prime Same-Day speed
            </p>
          </div>
        </div>

        <form onSubmit={handleCheck} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter 6-Digit Indian Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 560060 (Bengaluru)"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                Check
              </button>
            </div>
          </div>
        </form>

        {result && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 text-xs space-y-2.5 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between text-indigo-300 font-bold">
              <span>{result.city}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                Active Region
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-200">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Speed:</strong> {result.speed}
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Cash on Delivery (COD) & 7-Day Replacement Available</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[11px] text-slate-500">Popular Pincodes:</p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {['560060 (Bengaluru)', '110001 (Delhi)', '400001 (Mumbai)', '600001 (Chennai)'].map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const pin = p.split(' ')[0];
                    setInputPin(pin);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  {p}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default PincodeModal;
