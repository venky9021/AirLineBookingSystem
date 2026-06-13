import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, CreditCard, Landmark, Wallet, HelpCircle, ShieldAlert } from 'lucide-react';

export default function Payment({ booking, onPaymentConfirmed, onBack }) {
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD', 'UPI', 'NET_BANKING'
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = parseFloat(booking.totalPrice);
  const convFee = 150.00; // domestic conv fee in INR
  const baseFare = (total - convFee) / 1.10;
  const taxes = baseFare * 0.10;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (paymentMethod === 'CARD') {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
        setError('Please enter complete credit card credentials.');
        setLoading(false);
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!formData.upiId.trim()) {
        setError('Please enter a valid UPI address.');
        setLoading(false);
        return;
      }
    }

    try {
      const txnId = 'TXN-TEST-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      
      const updatedBooking = await api.confirmPayment(
        booking.id,
        paymentMethod,
        txnId,
        total
      );
      onPaymentConfirmed(updatedBooking);
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try a different card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:py-8 sm:px-8">
      
      {/* Title */}
      <div className="mb-8 pb-5 border-b border-yellow-500/10">
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">Payment Checkout</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold">
          Confirm flight booking reservation and choose transaction gateway
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-red-300 text-xs sm:text-sm flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Order Summary breakdown */}
        <div className="lg:col-span-5 glass-panel rounded-3xl border border-yellow-500/15 bg-white p-6 space-y-6">
          <h3 className="font-display font-extrabold text-slate-800 text-lg border-b border-yellow-500/10 pb-3">
            Ticket Ledger
          </h3>

          <div className="space-y-4 text-sm font-semibold text-slate-600">
            <div className="flex justify-between items-center">
              <span>PNR Code</span>
              <span className="bg-yellow-500/10 text-amber-600 font-black tracking-widest px-3 py-1 rounded-lg border border-yellow-500/15 text-xs font-mono">
                {booking.pnr}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Flight Route</span>
              <span className="text-slate-950 font-bold">{booking.flight.origin} → {booking.flight.destination}</span>
            </div>

            <div className="flex justify-between">
              <span>Travel Class</span>
              <span className="text-slate-950 font-bold">{booking.travelClass}</span>
            </div>

            <div className="border-t border-yellow-500/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Seat Base Fare</span>
                <span>₹{baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Airport Taxes (10%)</span>
                <span>₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span>₹{convFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-yellow-500/15 pt-4 flex justify-between items-center text-slate-800">
              <span className="text-base font-extrabold">Total Price</span>
              <span className="font-display font-black text-2xl text-amber-600 text-glow-gold">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-yellow-500/10 rounded-2xl flex items-center space-x-2.5 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secured 256-bit SSL transaction gateway</span>
          </div>
        </div>

        {/* RIGHT PANEL: Payment Selectors */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-yellow-500/15 bg-white p-6 space-y-6">
          
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-2 pb-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`flex flex-col items-center justify-center py-3.5 px-2.5 rounded-2xl border text-center transition-all duration-300 gap-1.5 cursor-pointer ${
                paymentMethod === 'CARD'
                  ? 'bg-yellow-500/10 border-yellow-500 text-amber-600 font-bold'
                  : 'bg-slate-50 border-yellow-500/5 text-slate-500 hover:text-slate-900 hover:bg-yellow-500/10'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-semibold">Credit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`flex flex-col items-center justify-center py-3.5 px-2.5 rounded-2xl border text-center transition-all duration-300 gap-1.5 cursor-pointer ${
                paymentMethod === 'UPI'
                  ? 'bg-yellow-500/10 border-yellow-500 text-amber-600 font-bold'
                  : 'bg-slate-50 border-yellow-500/5 text-slate-500 hover:text-slate-900 hover:bg-yellow-500/10'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-xs font-semibold">UPI / Wallet</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('NET_BANKING')}
              className={`flex flex-col items-center justify-center py-3.5 px-2.5 rounded-2xl border text-center transition-all duration-300 gap-1.5 cursor-pointer ${
                paymentMethod === 'NET_BANKING'
                  ? 'bg-yellow-500/10 border-yellow-500 text-amber-600 font-bold'
                  : 'bg-slate-50 border-yellow-500/5 text-slate-500 hover:text-slate-900 hover:bg-yellow-500/10'
              }`}
            >
              <Landmark className="w-5 h-5" />
              <span className="text-xs font-semibold">Net Banking</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {paymentMethod === 'CARD' && (
              <div className="space-y-4 animate-float">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                  <input
                    required
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Number</label>
                  <input
                    required
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="4111 2222 3333 4444"
                    className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date</label>
                    <input
                      required
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CVV Code</label>
                    <input
                      required
                      type="password"
                      name="cardCvv"
                      value={formData.cardCvv}
                      onChange={handleInputChange}
                      placeholder="•••"
                      maxLength="3"
                      className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="space-y-4 animate-float">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">UPI Virtual Payment Address (VPA)</label>
                  <input
                    required
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    placeholder="e.g. traveler@upi"
                    className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">A verification request will be triggered on your mobile UPI application.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'NET_BANKING' && (
              <div className="space-y-4 animate-float">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Your Bank</label>
                  <select
                    className="w-full bg-slate-50 border border-yellow-500/10 rounded-xl p-3.5 text-sm text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="HDFC">Bharat National Bank</option>
                    <option value="ICICI">Apex India Trust</option>
                    <option value="SBI">Imperial Union Bank</option>
                  </select>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1.5">You will be redirected to the secure login console of your bank.</p>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={loading}
              className="glow-btn-gold w-full mt-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold py-4 rounded-2xl shadow-md transition-all duration-300 text-sm cursor-pointer"
            >
              {loading ? 'Decrypting Secure Gateway...' : `Authorize & Pay ₹${total.toFixed(2)}`}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
