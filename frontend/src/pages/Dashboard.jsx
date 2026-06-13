import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, Calendar, ShieldAlert, XCircle, RefreshCw, Compass } from 'lucide-react';

export default function Dashboard({ onTriggerCheckIn, onStartSearch }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyBookings();
      setBookings(data.sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime)));
    } catch (err) {
      setError('Failed to fetch your booking coordinates. Ensure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This will release all locked seat coordinates.")) return;
    setCancellingId(id);
    setError('');

    try {
      await api.cancelBooking(id);
      fetchMyBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel the reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:py-8 sm:px-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-yellow-500/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">My Trips Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            Manage your active flight itineraries and download boarding passes
          </p>
        </div>
        <button 
          type="button"
          onClick={fetchMyBookings}
          className="flex items-center justify-center bg-white hover:bg-yellow-500/10 hover:text-amber-600 p-2.5 rounded-xl border border-yellow-500/20 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-800" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-red-300 text-xs sm:text-sm flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin"></div>
          <span className="text-slate-500 font-bold text-sm">Loading active bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="w-full py-16 text-center max-w-md mx-auto glass-panel rounded-3xl p-8 bg-white border border-yellow-500/10 shadow-sm">
          <Compass className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-spin" style={{ animationDuration: '8s' }} />
          <h3 className="text-slate-950 font-extrabold text-xl mb-2">No Scheduled Journeys</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed font-semibold">
            You haven't scheduled any flight reservations yet. Book your first domestic flight now to see it listed here!
          </p>
          <button 
            type="button"
            onClick={onStartSearch}
            className="glow-btn-gold bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer"
          >
            Explore Routes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div 
              key={booking.id}
              className="glass-panel rounded-2xl border border-yellow-500/15 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-yellow-500/30 transition-colors shadow-sm"
            >
              
              {/* Flight Summary */}
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-500/10 p-3 rounded-xl text-amber-650 shrink-0 mt-1 border border-yellow-500/5">
                  <Ticket className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-sm sm:text-base font-extrabold text-slate-800">
                    <span>{booking.flight.origin}</span>
                    <span>→</span>
                    <span>{booking.flight.destination}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-bold space-y-1 mt-1">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{formatDate(booking.flight.departureTime)}</span>
                    </div>
                    <div>Airline: {booking.flight.airline.name} • Class: {booking.travelClass}</div>
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="flex flex-row md:flex-col justify-between md:items-end gap-2.5">
                <div className="text-left md:text-right">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PNR Locator</span>
                  <span className="font-display font-black text-slate-900 tracking-wider text-base uppercase font-mono">{booking.pnr}</span>
                </div>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold font-display border ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    : booking.status === 'CHECKED_IN'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                    : booking.status === 'CANCELLED'
                    ? 'bg-red-500/10 border-red-500/20 text-red-500 line-through'
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                }`}>
                  {booking.status}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex md:flex-col gap-2 shrink-0">
                {booking.status === 'CONFIRMED' && (
                  <button 
                    type="button"
                    onClick={() => onTriggerCheckIn(booking.pnr)}
                    className="flex-1 glow-btn-gold bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer"
                  >
                    Online Check-In
                  </button>
                )}

                {booking.status !== 'CANCELLED' && (
                  <button 
                    type="button"
                    disabled={cancellingId === booking.id}
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex-1 flex items-center justify-center space-x-1.5 border border-slate-200 hover:border-red-500 hover:bg-red-500/10 text-slate-500 hover:text-red-500 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{cancellingId === booking.id ? 'Releasing Seats...' : 'Cancel Ticket'}</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
