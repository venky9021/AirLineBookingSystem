import React, { useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, UserCheck, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Passengers({ flightId, travelClass, selectedSeats, onBookingCreated, onBack }) {
  const passengerCount = selectedSeats.length;

  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }).map((_, index) => ({
      firstName: '',
      lastName: '',
      passportNumber: '',
      dob: '',
      nationality: 'India',
      seatNumber: selectedSeats[index]
    }))
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const hasEmptyField = passengers.some(
      p => !p.firstName.trim() || !p.lastName.trim() || !p.passportNumber.trim() || !p.dob
    );

    if (hasEmptyField) {
      setError('Please populate all traveler information details before proceeding.');
      setLoading(false);
      return;
    }

    try {
      const bookingData = await api.createBooking(flightId, travelClass, passengers);
      onBookingCreated(bookingData);
    } catch (err) {
      setError(err.message || 'Failed to initialize booking transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:py-8 sm:px-8">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8 pb-5 border-b border-yellow-500/10">
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center justify-center bg-white hover:bg-yellow-500/10 hover:text-amber-600 p-2.5 rounded-xl border border-yellow-500/20 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">Passenger Details</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            Collect passport information for {passengerCount} traveler(s)
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-955/40 border border-red-500/20 rounded-2xl text-red-300 text-xs sm:text-sm flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {passengers.map((passenger, index) => (
          <div 
            key={index}
            className="glass-panel rounded-3xl border border-yellow-500/15 bg-white p-6 relative shadow-sm"
          >
            
            {/* Top Badge */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-yellow-500/10">
              <h3 className="font-display font-extrabold text-slate-850 text-base sm:text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                <span>Traveler {index + 1}</span>
              </h3>
              <span className="bg-yellow-500/10 text-amber-600 text-xs font-black tracking-widest px-3.5 py-1.5 rounded-xl border border-yellow-500/15">
                SEAT {passenger.seatNumber}
              </span>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* First Name */}
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">First Name</label>
                <input 
                  required
                  type="text"
                  value={passenger.firstName}
                  onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                  placeholder="e.g. John"
                  className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Last Name</label>
                <input 
                  required
                  type="text"
                  value={passenger.lastName}
                  onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Passport Number */}
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Passport Number</label>
                <input 
                  required
                  type="text"
                  value={passenger.passportNumber}
                  onChange={(e) => handleInputChange(index, 'passportNumber', e.target.value)}
                  placeholder="e.g. Z1234567"
                  className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Date of Birth</label>
                <input 
                  required
                  type="date"
                  value={passenger.dob}
                  onChange={(e) => handleInputChange(index, 'dob', e.target.value)}
                  className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors cursor-pointer"
                />
              </div>

              {/* Nationality */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Nationality</label>
                <input 
                  required
                  type="text"
                  value={passenger.nationality}
                  onChange={(e) => handleInputChange(index, 'nationality', e.target.value)}
                  placeholder="e.g. India"
                  className="w-full bg-slate-50 border border-yellow-500/10 focus:border-yellow-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-colors"
                />
              </div>

            </div>

          </div>
        ))}

        {/* Info Box */}
        <div className="p-4 bg-slate-50 border border-yellow-500/10 rounded-2xl flex items-start space-x-3 text-xs sm:text-sm text-slate-500 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>Your personal details are encrypted and securely passed to regional aviation authorities. Double check passport spellings.</span>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="glow-btn-gold bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold px-8 py-4 rounded-2xl shadow-md transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Creating Booking Reservation...' : 'Proceed to Payment'}
          </button>
        </div>
      </form>

    </div>
  );
}
