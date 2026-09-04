import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Briefcase, ArrowLeftRight, Compass, Heart } from 'lucide-react';

const POPULAR_AIRPORTS = [
  'Delhi (DEL)',
  'Mumbai (BOM)',
  'Bengaluru (BLR)',
  'Goa (GOI)',
  'Kochi (COK)',
  'Jaipur (JAI)',
  'Hyderabad (HYD)'
];

const RECOMMENDATIONS = [
  {
    title: 'Goa Beaches',
    subtitle: 'Sun, Sand & Serenity',
    origin: 'Mumbai (BOM)',
    destination: 'Goa (GOI)',
    price: '3,500',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'Jaipur Heritage',
    subtitle: 'Explore the Pink City',
    origin: 'Delhi (DEL)',
    destination: 'Jaipur (JAI)',
    price: '2,400',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'Kochi Palms',
    subtitle: 'Backwaters & Spice Coast',
    origin: 'Bengaluru (BLR)',
    destination: 'Kochi (COK)',
    price: '3,200',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=500&auto=format&fit=crop&q=60'
  },
  {
    title: 'Mumbai Skyline',
    subtitle: 'Gateway of India',
    origin: 'Delhi (DEL)',
    destination: 'Mumbai (BOM)',
    price: '4,600',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=500&auto=format&fit=crop&q=60'
  }
];

export default function Home({ onSearch }) {
  const [searchType, setSearchType] = useState('one-way'); // 'one-way', 'round-trip'
  const [origin, setOrigin] = useState('Delhi (DEL)');
  const [destination, setDestination] = useState('Mumbai (BOM)');
  const [date, setDate] = useState('2026-09-10');
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('ECONOMY');

  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleRecommendationClick = (rec) => {
    setOrigin(rec.origin);
    setDestination(rec.destination);
    // Smooth scroll back to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({ origin, destination, date, passengers, travelClass, searchType });
  };

  return (
    <div className="w-full flex flex-col items-center py-8 px-4 sm:py-16 sm:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Hero Headline (High contrast dark slate text) */}
      <div className="text-center">
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-slate-900 leading-tight tracking-tight">
          Fly Domestic Comforts With <br/>
          <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent text-glow-gold">
            AeroFlow India
          </span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto mt-4 font-semibold">
          Search flights across India's top routes, book your seats instantly, and manage your journey — all in one place.
        </p>
      </div>

      {/* Main Search Panel (ivory/pure white cards) */}
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 relative shadow-xl border border-yellow-500/20 bg-white">
        
        {/* Search Tabs */}
        <div className="flex space-x-2 border-b border-yellow-500/10 pb-5 mb-6">
          <button 
            type="button"
            onClick={() => setSearchType('one-way')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
              searchType === 'one-way'
                ? 'bg-yellow-500 text-slate-950 glow-btn-gold'
                : 'text-slate-500 hover:text-slate-950 hover:bg-yellow-500/10'
            }`}
          >
            One-Way
          </button>
          <button 
            type="button"
            onClick={() => setSearchType('round-trip')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
              searchType === 'round-trip'
                ? 'bg-yellow-500 text-slate-950 glow-btn-gold'
                : 'text-slate-500 hover:text-slate-950 hover:bg-yellow-500/10'
            }`}
          >
            Round Trip
          </button>
        </div>

        {/* Search Form Inputs */}
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-center">
            
            {/* Origin */}
            <div className="md:col-span-4 relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From</label>
              <div 
                onClick={() => setShowOriginList(!showOriginList)}
                className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100/80 border border-yellow-500/10 rounded-2xl p-4 cursor-pointer transition-colors"
              >
                <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm sm:text-base font-bold text-slate-800">{origin}</span>
              </div>
              {showOriginList && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-yellow-500/15 rounded-2xl shadow-2xl z-40 overflow-hidden">
                  {POPULAR_AIRPORTS.map((apt) => (
                    <div 
                      key={apt} 
                      onClick={() => { setOrigin(apt); setShowOriginList(false); }}
                      className="px-4 py-3 hover:bg-yellow-500/10 text-slate-800 text-sm cursor-pointer border-b border-yellow-500/5 last:border-0 font-bold"
                    >
                      {apt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center mt-4 md:mt-6">
              <button 
                type="button"
                onClick={handleSwap}
                className="bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500 hover:text-slate-950 p-3 rounded-2xl text-amber-600 transition-all duration-300 transform hover:rotate-180 cursor-pointer"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* Destination */}
            <div className="md:col-span-4 relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To</label>
              <div 
                onClick={() => setShowDestList(!showDestList)}
                className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100/80 border border-yellow-500/10 rounded-2xl p-4 cursor-pointer transition-colors"
              >
                <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm sm:text-base font-bold text-slate-800">{destination}</span>
              </div>
              {showDestList && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-yellow-500/15 rounded-2xl shadow-2xl z-40 overflow-hidden">
                  {POPULAR_AIRPORTS.map((apt) => (
                    <div 
                      key={apt} 
                      onClick={() => { setDestination(apt); setShowDestList(false); }}
                      className="px-4 py-3 hover:bg-yellow-500/10 text-slate-800 text-sm cursor-pointer border-b border-yellow-500/5 last:border-0 font-bold"
                    >
                      {apt}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Date, Passengers and Class */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Departure Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Departure Date</label>
              <div className="flex items-center space-x-3 bg-slate-50 border border-yellow-500/10 rounded-2xl p-4">
                <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-sm sm:text-base font-bold text-slate-800 border-none outline-none w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Passengers</label>
              <div className="flex items-center space-x-3 bg-slate-50 border border-yellow-500/10 rounded-2xl p-4">
                <Users className="w-5 h-5 text-amber-600 shrink-0" />
                <select 
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="bg-transparent text-sm sm:text-base font-bold text-slate-800 border-none outline-none w-full cursor-pointer"
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                  <option value="5">5 Passengers</option>
                </select>
              </div>
            </div>

            {/* Cabin Class */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Travel Class</label>
              <div className="flex items-center space-x-3 bg-slate-50 border border-yellow-500/10 rounded-2xl p-4">
                <Briefcase className="w-5 h-5 text-amber-600 shrink-0" />
                <select 
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="bg-transparent text-sm sm:text-base font-bold text-slate-800 border-none outline-none w-full cursor-pointer"
                >
                  <option value="ECONOMY">Economy Class</option>
                  <option value="BUSINESS">Business Class</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>
            </div>

          </div>

          {/* Search Button */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              className="glow-btn-gold flex items-center space-x-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold px-8 py-4 rounded-2xl shadow-md transition-all duration-300 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Search Flights</span>
            </button>
          </div>

        </form>

      </div>

      {/* RECOMMENDED GETAWAYS ROW */}
      <div className="w-full space-y-6">
        <div className="flex items-center space-x-3 justify-center">
          <Compass className="w-6 h-6 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-850 text-center">
            Recommended Getaway Excursions
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECOMMENDATIONS.map((rec, index) => (
            <div 
              key={index}
              onClick={() => handleRecommendationClick(rec)}
              className="glass-panel glass-panel-hover rounded-3xl border border-yellow-500/10 overflow-hidden cursor-pointer group shadow-sm bg-white"
            >
              {/* Card Image */}
              <div className="h-44 w-full relative overflow-hidden">
                <img 
                  src={rec.image} 
                  alt={rec.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-yellow-500/20 text-slate-950 text-[10px] font-black tracking-widest px-2.5 py-1.5 rounded-xl">
                  FROM ₹{rec.price}
                </div>
              </div>

              {/* Card Specs */}
              <div className="p-5 space-y-1">
                <h3 className="font-display font-extrabold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {rec.subtitle}
                </p>
                <div className="pt-3 flex items-center justify-between text-[10px] font-bold text-amber-600 uppercase tracking-widest border-t border-yellow-500/5 mt-3">
                  <span>{rec.origin.split(' ')[0]}</span>
                  <span>➔</span>
                  <span>{rec.destination.split(' ')[0]}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
