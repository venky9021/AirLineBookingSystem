import React from 'react';
import { ShieldCheck, Calendar, MapPin, Printer, ArrowRight, CheckCircle2, Ticket } from 'lucide-react';

export default function Confirmation({ booking, onGoToDashboard }) {
  // Helper to format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:py-12 sm:px-8 text-center print:bg-white print:text-black">
      
      {/* Printable Area Starts */}
      <div className="print:block space-y-8">
        
        {/* Animated Check */}
        <div className="flex flex-col items-center justify-center space-y-4 print:hidden">
          <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 text-emerald-600 animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 leading-tight">
            Booking Confirmed!
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto font-semibold">
            Your domestic payment was authorized successfully. An e-ticket has been generated and dispatched to your email.
          </p>
        </div>

        {/* E-Ticket Card Layout */}
        <div className="glass-panel rounded-3xl border border-yellow-500/15 bg-white p-6 sm:p-8 text-left shadow-xl relative overflow-hidden">
          
          {/* Accent glow top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600"></div>

          {/* Ticket Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-yellow-500/10 pb-5 mb-6 gap-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">AeroFlow Electronic Ticket</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xl sm:text-2xl font-display font-black text-slate-900">{booking.flight.airline.name}</span>
                <span className="text-xs bg-yellow-500/10 text-amber-600 font-bold border border-yellow-500/20 px-2 py-0.5 rounded-md uppercase">
                  {booking.flight.flightNumber}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passenger Record Locator (PNR)</span>
              <span className="block font-display font-black text-2xl text-amber-600 text-glow-gold tracking-wider mt-1 uppercase font-mono">
                {booking.pnr}
              </span>
            </div>
          </div>

          {/* Trip Summary Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-yellow-500/10 pb-6 mb-6">
            
            {/* Origin & Destination */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-yellow-500/10">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flight Routing</span>
                  <div className="flex items-center space-x-2 text-sm sm:text-base font-bold text-slate-800 mt-0.5">
                    <span>{booking.flight.origin}</span>
                    <ArrowRight className="w-4 h-4 text-amber-650" />
                    <span>{booking.flight.destination}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-yellow-500/10">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Departure Date & Time</span>
                  <span className="block text-sm sm:text-base font-bold text-slate-850 mt-0.5">
                    {formatDate(booking.flight.departureTime)} at {new Date(booking.flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Boarding pass mock QR code representation */}
            <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-50 border border-yellow-500/10 p-4 rounded-2xl">
              
              {/* Fake QR pattern */}
              <div className="w-28 h-28 bg-white p-2 rounded-xl flex flex-wrap gap-0.5 shadow-inner">
                {Array.from({ length: 196 }).map((_, i) => {
                  const fill = (i % 3 === 0 || i % 7 === 0 || i % 11 === 0 || i < 15 || i > 180 || (i % 14 < 4 && i % 14 > 0));
                  return (
                    <div 
                      key={i} 
                      className={`w-[6px] h-[6px] rounded-[1px] ${fill ? 'bg-slate-900' : 'bg-transparent'}`}
                    ></div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest mt-2 uppercase">AEROFLOW-E-GATE</span>
            </div>

          </div>

          {/* Passenger details */}
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider">Passenger Manifest</h3>
            <div className="bg-slate-50 border border-yellow-500/10 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-yellow-500/10">
                <span className="col-span-2">Name</span>
                <span>Passport</span>
                <span className="text-right">Allocated Seat</span>
              </div>
              
              {booking.passengers && booking.passengers.map((p, idx) => (
                <div key={idx} className="grid grid-cols-4 text-xs sm:text-sm text-slate-700 font-bold items-center py-1">
                  <span className="col-span-2 text-slate-850">{p.firstName} {p.lastName}</span>
                  <span className="text-slate-500 font-mono">{p.passportNumber || 'N/A'}</span>
                  <span className="text-right font-display font-black text-amber-600">{p.seatNumber}</span>
                </div>
              ))}

              {(!booking.passengers || booking.passengers.length === 0) && (
                <div className="text-xs text-slate-400 italic">No passenger manifest preloaded. Refer to email booking coordinates.</div>
              )}

            </div>
          </div>

        </div>

      </div>
      {/* Printable Area Ends */}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-white hover:bg-yellow-500/10 hover:text-amber-600 border border-yellow-500/20 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print E-Ticket Invoice</span>
        </button>

        <button
          onClick={onGoToDashboard}
          className="glow-btn-gold flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-md cursor-pointer"
        >
          <Ticket className="w-4 h-4" />
          <span>View My Bookings</span>
        </button>
      </div>

    </div>
  );
}
