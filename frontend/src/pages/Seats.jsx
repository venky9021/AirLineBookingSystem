import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Check, Users, Briefcase, Info } from 'lucide-react';

export default function Seats({ flightId, searchParams, onSelectSeats, onBack }) {
  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Track passenger seat selections: { passengerIndex: seatNumber }
  const [selectedSeats, setSelectedSeats] = useState({});
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  const passengerCount = searchParams.passengers;
  const travelClass = searchParams.travelClass.toUpperCase();

  useEffect(() => {
    const fetchSeatMap = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getFlight(flightId);
        setFlight(data.flight);
        setSeats(data.seats);
      } catch (err) {
        setError('Failed to fetch the seat map. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [flightId]);

  const handleSeatClick = (seat) => {
    if (seat.seatClass !== travelClass) {
      setError(`Your search was for ${travelClass} class. Please select a seat in that cabin area.`);
      return;
    }
    setError('');

    if (!seat.isAvailable) {
      setError(`Seat ${seat.seatNumber} is occupied by another traveler.`);
      return;
    }

    const seatAlreadySelectedByOther = Object.entries(selectedSeats).some(
      ([idx, sNum]) => parseInt(idx) !== activePassengerIndex && sNum === seat.seatNumber
    );

    if (seatAlreadySelectedByOther) {
      setError(`Seat ${seat.seatNumber} has already been picked by another traveler in your booking.`);
      return;
    }

    const updated = { ...selectedSeats, [activePassengerIndex]: seat.seatNumber };
    setSelectedSeats(updated);

    if (activePassengerIndex < passengerCount - 1) {
      setActivePassengerIndex(activePassengerIndex + 1);
    }
  };

  const getSeatStatus = (seat) => {
    if (!seat.isAvailable) return 'booked';

    const isSelected = Object.values(selectedSeats).includes(seat.seatNumber);
    if (isSelected) return 'selected';

    if (seat.seatClass === travelClass) return 'available';

    return 'locked';
  };

  const rows = {};
  seats.forEach((seat) => {
    const rowNum = seat.seatNumber.replace(/[A-F]/g, '');
    if (!rows[rowNum]) rows[rowNum] = [];
    rows[rowNum].push(seat);
  });

  const sortedRowKeys = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));

  const allSeatsAssigned = Object.keys(selectedSeats).length === passengerCount;

  const handleSubmit = () => {
    if (!allSeatsAssigned) return;
    onSelectSeats(Object.values(selectedSeats));
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:py-8 sm:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-5 border-b border-yellow-500/10 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center justify-center bg-white hover:bg-yellow-500/10 hover:text-amber-600 p-2.5 rounded-xl border border-yellow-500/20 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">Select Cabin Seats</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Flight {flight?.flightNumber} • {travelClass} Section
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin"></div>
          <span className="text-slate-500 font-bold text-sm">Rendering cabin maps...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Passenger Selector Grid */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="glass-panel rounded-2xl p-5 border border-yellow-500/15 bg-white shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-650" />
                <span>Travelers Seat Assignment</span>
              </h3>

              <div className="space-y-3">
                {Array.from({ length: passengerCount }).map((_, index) => (
                  <div 
                    key={index}
                    onClick={() => setActivePassengerIndex(index)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      activePassengerIndex === index
                        ? 'bg-yellow-500/10 border-yellow-500 text-slate-900 font-bold shadow-inner'
                        : 'bg-slate-50 border-yellow-500/5 hover:bg-yellow-500/5 text-slate-500 font-semibold'
                    }`}
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span>Traveler {index + 1}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-extrabold font-display ${
                        selectedSeats[index] 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20 font-black' 
                          : 'bg-slate-100 text-slate-400 font-bold'
                      }`}>
                        {selectedSeats[index] ? `Seat ${selectedSeats[index]}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-start space-x-2.5 font-semibold">
                <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Selection Legend */}
            <div className="glass-panel rounded-2xl p-5 border border-yellow-500/15 bg-white shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Cabin Seating Map Legend</h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-md bg-emerald-500/10 border border-emerald-500"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-md bg-yellow-500 pulse-selected-seat"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-md bg-red-100 border border-red-300 text-red-500 flex items-center justify-center font-bold text-[8px]">🚫</div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200 text-slate-300 flex items-center justify-center font-bold text-[8px]">🚫</div>
                  <span>Other Class</span>
                </div>
              </div>
            </div>

            {/* Checkout / Next button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allSeatsAssigned}
              className="glow-btn-gold w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 disabled:from-slate-100 disabled:to-slate-200 disabled:text-slate-400 text-slate-950 font-extrabold py-4 rounded-2xl shadow-md transition-all duration-300 text-center text-sm cursor-pointer"
            >
              Continue to Passenger Details
            </button>
          </div>

          {/* Aircraft Layout Map */}
          <div className="lg:col-span-8 glass-panel rounded-3xl border border-yellow-500/15 bg-white p-6 flex flex-col items-center overflow-x-auto order-1 lg:order-2 shadow-sm">
            
            {/* Aircraft Nose Indicator */}
            <div className="w-48 h-12 bg-gradient-to-b from-slate-50 to-slate-100 border border-yellow-500/20 rounded-t-full flex items-center justify-center font-display font-black text-[10px] text-slate-500 tracking-widest uppercase mb-8 shadow-inner">
              COCKPIT NOSE
            </div>

            {/* Aircraft Cabin Body */}
            <div className="flex flex-col space-y-3.5 border-x-4 border-slate-200 px-4 sm:px-8 py-8 rounded-2xl bg-slate-50/20 max-w-md w-full relative">
              
              {/* Wings Overlay Visual indicators */}
              <div className="absolute -left-20 top-[40%] hidden sm:block bg-gradient-to-r from-slate-100 to-slate-50 h-10 w-20 border-y border-slate-200 rounded-l-2xl shadow-sm"></div>
              <div className="absolute -right-20 top-[40%] hidden sm:block bg-gradient-to-l from-slate-100 to-slate-50 h-10 w-20 border-y border-slate-200 rounded-r-2xl shadow-sm"></div>

              {sortedRowKeys.map((rowKey) => {
                const rowSeats = rows[rowKey];

                return (
                  <div key={rowKey} className="flex items-center justify-between gap-1 sm:gap-2">
                    
                    {/* Row Label */}
                    <div className="w-5 text-[10px] font-black text-slate-400 text-center shrink-0">
                      {rowKey}
                    </div>

                    {/* Seat Grid */}
                    <div className="flex-1 flex justify-center items-center gap-1 sm:gap-2">
                      
                      {/* Left Seats A, B, C */}
                      <div className="flex gap-1.5 sm:gap-2">
                        {rowSeats.slice(0, 3).map((seat) => {
                          const status = getSeatStatus(seat);
                          return (
                            <button
                              type="button"
                              key={seat.id}
                              disabled={status === 'booked' || status === 'locked'}
                              onClick={() => handleSeatClick(seat)}
                              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center font-display font-bold text-xs transition-all duration-200 ${
                                status === 'selected'
                                  ? 'bg-yellow-500 border-yellow-400 text-slate-950 pulse-selected-seat font-black'
                                  : status === 'booked'
                                  ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed font-bold'
                                  : status === 'locked'
                                  ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed font-semibold'
                                  : 'bg-emerald-500/10 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-600 cursor-pointer font-bold'
                              }`}
                            >
                              {seat.seatNumber.slice(-1)}
                            </button>
                          );
                        })}
                      </div>

                      {/* AISLE */}
                      <div className="w-6 sm:w-10 flex items-center justify-center">
                        <div className="h-full w-[1.5px] border-r border-dashed border-slate-200"></div>
                      </div>

                      {/* Right Seats D, E, F */}
                      <div className="flex gap-1.5 sm:gap-2">
                        {rowSeats.slice(3, 6).map((seat) => {
                          const status = getSeatStatus(seat);
                          return (
                            <button
                              type="button"
                              key={seat.id}
                              disabled={status === 'booked' || status === 'locked'}
                              onClick={() => handleSeatClick(seat)}
                              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center font-display font-bold text-xs transition-all duration-200 ${
                                status === 'selected'
                                  ? 'bg-yellow-500 border-yellow-400 text-slate-950 pulse-selected-seat font-black'
                                  : status === 'booked'
                                  ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed font-bold'
                                  : status === 'locked'
                                  ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed font-semibold'
                                  : 'bg-emerald-500/10 border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-600 cursor-pointer font-bold'
                              }`}
                            >
                              {seat.seatNumber.slice(-1)}
                            </button>
                          );
                        })}
                      </div>

                    </div>

                    {/* Row Label (right) */}
                    <div className="w-5 text-[10px] font-black text-slate-400 text-center shrink-0">
                      {rowKey}
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Cabin Divider labels */}
            <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Cabin Class Dividers: Rows 1-2 (First), Rows 3-4 (Business), Rows 5-10 (Economy)
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
