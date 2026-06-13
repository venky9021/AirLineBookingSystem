import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Clock, Filter, AlertTriangle, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

export default function Results({ searchParams, onSelectFlight, onBack }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [priceRange, setPriceRange] = useState(15000);
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [sortBy, setSortBy] = useState('price-asc'); // 'price-asc', 'duration-asc'

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.searchFlights(
          searchParams.origin,
          searchParams.destination,
          searchParams.date
        );
        setFlights(data);
      } catch (err) {
        setError('Failed to fetch matching flights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams]);

  // Format date helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to format time (e.g. 08:00 AM)
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper to calculate duration
  const calculateDuration = (depTime, arrTime) => {
    const diffMs = new Date(arrTime) - new Date(depTime);
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  // Calculate pricing based on class selected (Domestic INR)
  const getDisplayPrice = (basePrice) => {
    const classMultiplier = switchMultiplier(searchParams.travelClass);
    const base = parseFloat(basePrice) * classMultiplier * searchParams.passengers;
    const taxes = base * 0.10;
    const convFee = 150.00; // domestic conv fee in INR
    return (base + taxes + convFee).toFixed(2);
  };

  const switchMultiplier = (tc) => {
    switch (tc?.toUpperCase()) {
      case 'FIRST': return 2.5;
      case 'BUSINESS': return 1.5;
      default: return 1.0;
    }
  };

  // Filter and sort logic
  const filteredFlights = flights
    .filter(f => {
      const price = parseFloat(getDisplayPrice(f.basePrice));
      return price <= priceRange;
    })
    .filter(f => {
      if (selectedAirline === 'ALL') return true;
      return f.airline.name === selectedAirline;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') {
        return parseFloat(getDisplayPrice(a.basePrice)) - parseFloat(getDisplayPrice(b.basePrice));
      } else if (sortBy === 'duration-asc') {
        const durA = new Date(a.arrivalTime) - new Date(a.departureTime);
        const durB = new Date(b.arrivalTime) - new Date(b.departureTime);
        return durA - durB;
      }
      return 0;
    });

  // Extract unique airline list for filter
  const uniqueAirlines = Array.from(new Set(flights.map(f => f.airline.name)));

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:py-8 sm:px-8">
      
      {/* Return button & search summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-5 border-b border-yellow-500/10 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center justify-center bg-white hover:bg-yellow-500/10 hover:text-amber-600 p-2.5 rounded-xl border border-yellow-500/20 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5 text-lg sm:text-xl font-display font-extrabold text-slate-900">
              <span>{searchParams.origin}</span>
              <ArrowRight className="w-4 h-4 text-amber-650" />
              <span>{searchParams.destination}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              {formatDate(searchParams.date)} • {searchParams.passengers} Traveler(s) • {searchParams.travelClass.charAt(0) + searchParams.travelClass.slice(1).toLowerCase()} Class
            </p>
          </div>
        </div>
        
        <div className="text-sm font-bold text-slate-650">
          Showing <span className="text-amber-600">{filteredFlights.length}</span> flight(s)
        </div>
      </div>

      {loading ? (
        <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin"></div>
          <span className="text-slate-500 font-bold text-sm">Scanning luxury domestic airlines...</span>
        </div>
      ) : error ? (
        <div className="w-full py-16 text-center max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-800 font-bold text-lg mb-2">{error}</p>
          <button onClick={onBack} className="text-amber-600 hover:underline text-sm font-semibold">Modify search parameters</button>
        </div>
      ) : flights.length === 0 ? (
        <div className="w-full py-16 text-center max-w-md mx-auto glass-panel rounded-3xl p-8 bg-white border border-yellow-500/10">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-slate-900 font-extrabold text-xl mb-2">No Scheduled Flights Found</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            We couldn't find domestic schedules between {searchParams.origin} and {searchParams.destination} on {formatDate(searchParams.date)}.
          </p>
          <button 
            type="button"
            onClick={onBack}
            className="glow-btn-gold bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
          >
            Change Route or Date
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Panels */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-2xl p-5 border border-yellow-500/15 bg-white">
              <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-yellow-500/10">
                <Filter className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Filters</h3>
              </div>

              {/* Sorting */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Sort By</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 border border-yellow-500/10 rounded-xl p-3 text-sm text-slate-700 outline-none cursor-pointer"
                >
                  <option value="price-asc">Cheapest First</option>
                  <option value="duration-asc">Fastest First</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  <span>Max Budget</span>
                  <span className="text-amber-600 font-display">₹{priceRange}</span>
                </div>
                <input 
                  type="range" 
                  min="2000" 
                  max="40000" 
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full accent-yellow-500 bg-slate-100 rounded-lg appearance-none cursor-pointer h-1.5"
                />
              </div>

              {/* Airline Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Airlines</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="airline" 
                      checked={selectedAirline === 'ALL'}
                      onChange={() => setSelectedAirline('ALL')}
                      className="accent-yellow-500"
                    />
                    <span>All Scheduled Airlines</span>
                  </label>
                  {uniqueAirlines.map(name => (
                    <label key={name} className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="airline" 
                        checked={selectedAirline === name}
                        onChange={() => setSelectedAirline(name)}
                        className="accent-yellow-500"
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Search Result Cards List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredFlights.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border border-yellow-500/10 bg-white">
                <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <span className="text-slate-500 text-sm font-bold">No flights match the current filter criteria. Try adjusting filters.</span>
              </div>
            ) : (
              filteredFlights.map((flight) => (
                <div 
                  key={flight.id} 
                  className="glass-panel glass-panel-hover rounded-2xl border border-yellow-500/15 p-5 flex flex-col md:flex-row items-stretch gap-6 shadow-sm bg-white"
                >
                  
                  {/* Airline Info */}
                  <div className="flex items-center md:flex-col md:justify-center md:items-start space-x-4 md:space-x-0 md:w-44 shrink-0">
                    <img 
                      src={flight.airline.logoUrl} 
                      alt={flight.airline.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-yellow-500/10 bg-slate-50"
                    />
                    <div className="md:mt-3">
                      <h4 className="font-display font-extrabold text-slate-900 text-sm leading-tight">{flight.airline.name}</h4>
                      <p className="text-xs text-amber-600 font-bold tracking-wider mt-0.5">{flight.flightNumber}</p>
                    </div>
                  </div>

                  {/* Flight Timeline & Routing */}
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <div className="text-left">
                      <span className="block font-display font-extrabold text-lg sm:text-xl text-slate-800">{formatTime(flight.departureTime)}</span>
                      <span className="block text-xs font-bold text-slate-500 uppercase mt-0.5">{flight.origin}</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center relative px-2">
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {calculateDuration(flight.departureTime, flight.arrivalTime)}
                      </span>
                      <div className="w-full flex items-center my-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <div className="flex-1 h-[1.5px] bg-gradient-to-r from-slate-300 via-yellow-500 to-slate-300"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0"></div>
                      </div>
                      <span className="text-[10px] text-amber-650 font-bold tracking-wider bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/15">
                        NON-STOP
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block font-display font-extrabold text-lg sm:text-xl text-slate-800">{formatTime(flight.arrivalTime)}</span>
                      <span className="block text-xs font-bold text-slate-500 uppercase mt-0.5">{flight.destination}</span>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="border-t md:border-t-0 md:border-l border-yellow-500/10 pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-48 shrink-0 gap-4">
                    <div className="text-left md:text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</span>
                      <span className="block font-display font-black text-2xl text-slate-900 text-glow-gold">
                        ₹{getDisplayPrice(flight.basePrice)}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-semibold mt-0.5 leading-none">
                        Base Fare + Taxes & Fees
                      </span>
                    </div>

                    <button 
                      onClick={() => onSelectFlight(flight.id)}
                      className="glow-btn-gold bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md cursor-pointer"
                    >
                      Select Seats
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
