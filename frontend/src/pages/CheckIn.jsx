import React, { useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, CheckCircle2, ShieldAlert, CheckSquare, Printer, MapPin, QrCode } from 'lucide-react';

export default function CheckIn({ pnrParam, onBack }) {
  const [pnr, setPnr] = useState(pnrParam || '');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [checkInResult, setCheckInResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!pnr.trim() || !lastName.trim()) {
      setError('Please populate both PNR locator and traveler last name.');
      setLoading(false);
      return;
    }

    try {
      const data = await api.checkIn(pnr.toUpperCase().trim(), lastName.trim());
      setCheckInResult(data);
    } catch (err) {
      setError(err.message || 'Check-in failed. Please verify PNR and last name spelling.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:py-8 sm:px-8">
      
      {/* Title */}
      <div className="mb-8 pb-5 border-b border-yellow-500/10 print:hidden">
        <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">Online Check-In</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold">
          Check-in active flights 24-48 hours before departure and generate boarding passes
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-red-300 text-xs sm:text-sm flex items-start space-x-2.5 print:hidden">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!checkInResult ? (
        /* CHECK-IN SEARCH FORM */
        <div className="max-w-md mx-auto glass-panel rounded-3xl p-6 sm:p-8 border border-yellow-500/15 bg-white shadow-lg animate-float print:hidden">
          
          <div className="text-center mb-6">
            <div className="bg-yellow-500/10 p-3 rounded-full text-amber-600 w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-extrabold text-slate-900">Lookup Reservation</h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Enter your PNR code and traveler last name</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PNR Locator</label>
              <input
                required
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="e.g. AX9K2L"
                maxLength="6"
                className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none uppercase font-mono tracking-wider transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Traveler Last Name</label>
              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-btn-gold w-full mt-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating flight details...' : 'Begin Check-In'}
            </button>
          </form>

        </div>
      ) : (
        /* BOARDING PASS DISPLAY SECTION */
        <div className="space-y-8 print:block">
          
          {/* Top Success alert */}
          <div className="p-4 bg-emerald-50 border border-emerald-550/20 rounded-2xl text-emerald-700 text-sm flex items-center space-x-3 print:hidden font-semibold">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>{checkInResult.message}</span>
          </div>

          {/* Boarding Pass visual layouts */}
          <div className="space-y-6">
            {checkInResult.passengers.map((passenger, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-3xl border border-yellow-500/15 bg-white p-6 flex flex-col md:flex-row relative overflow-hidden shadow-md justify-between gap-6"
              >
                {/* Accent side block */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-500"></div>

                {/* Left Side: Route and Passenger details */}
                <div className="flex-1 space-y-6">
                  {/* Route Bar */}
                  <div className="flex items-center space-x-6">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Origin</span>
                      <span className="block font-display font-black text-2xl text-slate-900">{checkInResult.booking.flight.origin.slice(0, 3).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{checkInResult.booking.flight.origin}</span>
                    </div>

                    <div className="flex items-center justify-center shrink-0">
                      <div className="h-[1.5px] w-12 border-t border-dashed border-yellow-500/25"></div>
                    </div>

                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Destination</span>
                      <span className="block font-display font-black text-2xl text-slate-900">{checkInResult.booking.flight.destination.slice(0, 3).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{checkInResult.booking.flight.destination}</span>
                    </div>
                  </div>

                  {/* Passenger specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500 border-t border-yellow-500/10 pt-4">
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-400">Passenger Name</span>
                      <span className="text-slate-850 font-bold">{passenger.firstName} {passenger.lastName}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-400">Flight Code</span>
                      <span className="text-slate-850 font-mono font-bold uppercase">{checkInResult.booking.flight.flightNumber}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-400">Class Section</span>
                      <span className="text-amber-600 font-bold">{checkInResult.booking.travelClass}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-400">Seat Number</span>
                      <span className="text-amber-600 font-display font-black text-base tracking-wide">{passenger.seatNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: QR Gate ticket */}
                <div className="border-t md:border-t-0 md:border-l border-yellow-500/10 pt-6 md:pt-0 md:pl-6 shrink-0 flex flex-col items-center justify-center gap-2">
                  <div className="bg-white border border-yellow-500/10 p-2 rounded-xl">
                    <QrCode className="w-16 h-16 text-slate-900 shrink-0" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest font-mono">PNR: {checkInResult.booking.pnr}</span>
                </div>

              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center space-x-4 print:hidden">
            <button
              type="button"
              onClick={() => setCheckInResult(null)}
              className="flex items-center space-x-2 bg-white hover:bg-yellow-500/10 hover:text-amber-600 border border-yellow-500/20 px-6 py-3 rounded-2xl font-bold text-sm text-slate-700 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-white hover:bg-yellow-500/10 hover:text-amber-600 border border-yellow-500/20 px-6 py-3 rounded-2xl font-bold text-sm text-slate-700 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Boarding Passes</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
