import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, BarChart3, Plus, Trash2, Calendar, DollarSign, Users, Plane, RefreshCw } from 'lucide-react';

export default function Admin() {
  const [flights, setFlights] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add flight states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    airlineId: 1,
    origin: 'Delhi (DEL)',
    destination: 'Mumbai (BOM)',
    departureTime: '2026-06-10T08:00',
    arrivalTime: '2026-06-10T10:15',
    totalSeats: 60,
    basePrice: 5000.00
  });

  const [savingFlight, setSavingFlight] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const flightsList = await api.getAdminFlights();
      const analyticsData = await api.getAdminAnalytics();
      setFlights(flightsList);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Staff authorization validation failed. Confirm you are signed in as an administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddFlightSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSavingFlight(true);

    try {
      const depDateStr = new Date(newFlight.departureTime).toISOString().slice(0, 19);
      const arrDateStr = new Date(newFlight.arrivalTime).toISOString().slice(0, 19);

      await api.createAdminFlight({
        ...newFlight,
        departureTime: depDateStr,
        arrivalTime: arrDateStr
      });
      setShowAddForm(false);
      setNewFlight({
        flightNumber: '',
        airlineId: 1,
        origin: 'Delhi (DEL)',
        destination: 'Mumbai (BOM)',
        departureTime: '2026-06-10T08:00',
        arrivalTime: '2026-06-10T10:15',
        totalSeats: 60,
        basePrice: 5000.00
      });
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to schedule flight.');
    } finally {
      setSavingFlight(false);
    }
  };

  const handleCancelFlight = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this flight? This will release all booked traveler tickets and mark it CANCELLED.")) return;
    setError('');
    try {
      await api.cancelAdminFlight(id);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to cancel flight.');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'airlineId' || e.target.name === 'totalSeats'
      ? parseInt(e.target.value)
      : e.target.name === 'basePrice'
      ? parseFloat(e.target.value)
      : e.target.value;

    setNewFlight({ ...newFlight, [e.target.name]: value });
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:py-8 sm:px-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-5 border-b border-yellow-500/10 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">Admin Control Room</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            Review live booking telemetry and configure domestic Indian flight schedules
          </p>
        </div>
        
        <div className="flex items-center space-x-2.5">
          <button 
            type="button"
            onClick={fetchAdminData}
            className="flex items-center justify-center bg-white hover:bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20 transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-800" />
          </button>
          
          <button 
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="glow-btn-gold flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Flight</span>
          </button>
        </div>
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
          <span className="text-slate-500 font-bold text-sm">Validating administration logs...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* STATS TELEMETRY ROW */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="glass-panel rounded-2xl border border-yellow-500/15 p-5 bg-white flex items-center space-x-4 shadow-sm">
                <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600 border border-emerald-500/10">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
                  <span className="block text-xl font-display font-black text-slate-900 text-glow-gold">
                    ₹{analytics.totalRevenue?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {/* Total Bookings */}
              <div className="glass-panel rounded-2xl border border-yellow-500/15 p-5 bg-white flex items-center space-x-4 shadow-sm">
                <div className="bg-blue-500/10 p-3 rounded-xl text-blue-600 border border-blue-500/10">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bookings Placed</span>
                  <span className="block text-xl font-display font-black text-slate-900">
                    {analytics.totalBookings || 0} Tickets
                  </span>
                </div>
              </div>

              {/* Scheduled flights */}
              <div className="glass-panel rounded-2xl border border-yellow-500/15 p-5 bg-white flex items-center space-x-4 shadow-sm">
                <div className="bg-yellow-500/10 p-3 rounded-xl text-yellow-600 border border-yellow-500/10">
                  <Plane className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Routes Scheduled</span>
                  <span className="block text-xl font-display font-black text-slate-900">
                    {analytics.totalFlights || 0} Routes
                  </span>
                </div>
              </div>

              {/* Registered travelers */}
              <div className="glass-panel rounded-2xl border border-yellow-500/15 p-5 bg-white flex items-center space-x-4 shadow-sm">
                <div className="bg-purple-500/10 p-3 rounded-xl text-purple-600 border border-purple-500/10">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accounts</span>
                  <span className="block text-xl font-display font-black text-slate-900">
                    {analytics.totalUsers || 0} Profiles
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VISUAL CHARTS PANELS */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cabin Occupancy */}
              <div className="glass-panel rounded-2xl border border-yellow-500/15 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-yellow-500/10 pb-2.5">Cabin Occupancy Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.classOccupancy || {}).map(([cName, cCount]) => {
                    const totalCount = Object.values(analytics.classOccupancy).reduce((a, b) => a + b, 0) || 1;
                    const percent = Math.round((cCount / totalCount) * 100);
                    
                    return (
                      <div key={cName} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between text-slate-500">
                          <span className="text-slate-800">{cName} CLASS</span>
                          <span>{cCount} Bookings ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-yellow-500/10">
                          <div 
                            className="bg-yellow-500 h-full rounded-full" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Airline share */}
              <div className="glass-panel rounded-2xl border border-yellow-500/15 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-yellow-500/10 pb-2.5">Airline Revenue share</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.airlineRevenue || {}).map(([aName, aRev]) => {
                    const revFloat = parseFloat(aRev);
                    const grossTotal = parseFloat(analytics.totalRevenue) || 1;
                    const percent = Math.round((revFloat / grossTotal) * 100);
                    
                    return (
                      <div key={aName} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between text-slate-500">
                          <span className="text-slate-800">{aName}</span>
                          <span>₹{revFloat.toFixed(2)} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-yellow-500/10">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(analytics.airlineRevenue || {}).length === 0 && (
                    <div className="text-xs text-slate-500 italic text-center py-6">No airline ledger transactions recorded.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ADD FLIGHT SCHEDULE FORM */}
          {showAddForm && (
            <div className="glass-panel rounded-3xl border border-yellow-500/20 bg-white p-6 shadow-xl max-w-xl mx-auto animate-float">
              <h3 className="font-display font-extrabold text-slate-900 text-lg border-b border-yellow-500/10 pb-3 mb-4">
                Schedule New Airline Route
              </h3>
              
              <form onSubmit={handleAddFlightSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Flight Number</label>
                    <input
                      required
                      type="text"
                      name="flightNumber"
                      value={newFlight.flightNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. AI-109"
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Airline Provider</label>
                    <select
                      name="airlineId"
                      value={newFlight.airlineId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="1">AeroSky India</option>
                      <option value="2">Vortex India</option>
                      <option value="3">Bharat Connect</option>
                      <option value="4">Nimbus Airways</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Origin Airport</label>
                    <input
                      required
                      type="text"
                      name="origin"
                      value={newFlight.origin}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Destination Airport</label>
                    <input
                      required
                      type="text"
                      name="destination"
                      value={newFlight.destination}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Departure Datetime</label>
                    <input
                      required
                      type="datetime-local"
                      name="departureTime"
                      value={newFlight.departureTime}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Arrival Datetime</label>
                    <input
                      required
                      type="datetime-local"
                      name="arrivalTime"
                      value={newFlight.arrivalTime}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Base Ticket Price (₹)</label>
                    <input
                      required
                      type="number"
                      name="basePrice"
                      value={newFlight.basePrice}
                      onChange={handleInputChange}
                      min="100"
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5">Total Capacity (Seats)</label>
                    <input
                      required
                      type="number"
                      name="totalSeats"
                      value={newFlight.totalSeats}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-yellow-500/15 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="border border-slate-300 hover:border-slate-400 px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFlight}
                    className="glow-btn-gold bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    {savingFlight ? 'Saving Route...' : 'Schedule Flight'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ACTIVE SCHEDULED FLIGHTS MANAGEMENT PANEL */}
          <div className="glass-panel rounded-2xl border border-yellow-500/15 bg-white p-5 shadow-sm">
            <h3 className="font-display font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>Scheduled Flights Operational List</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-500">
                <thead>
                  <tr className="border-b border-yellow-500/10 text-slate-400 uppercase tracking-wider pb-3">
                    <th className="py-3 px-2">Flight No</th>
                    <th>Airline</th>
                    <th>Origin → Destination</th>
                    <th>Departure time</th>
                    <th>Base Price</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th className="text-right px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((flight) => (
                    <tr key={flight.id} className="border-b border-slate-100 last:border-0 hover:bg-yellow-500/5 transition-colors">
                      <td className="py-3.5 px-2 text-slate-900 font-mono font-bold uppercase">{flight.flightNumber}</td>
                      <td>{flight.airline.name}</td>
                      <td className="text-slate-900 font-semibold">{flight.origin} → {flight.destination}</td>
                      <td>{new Date(flight.departureTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="font-display font-extrabold text-amber-600">₹{flight.basePrice.toFixed(2)}</td>
                      <td>{flight.availableSeats} / {flight.totalSeats}</td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                          flight.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                            : 'bg-red-500/10 border-red-500/20 text-red-650 line-through'
                        }`}>
                          {flight.status}
                        </span>
                      </td>
                      <td className="text-right px-2">
                        {flight.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleCancelFlight(flight.id)}
                            title="Cancel flight route"
                            className="p-2 bg-white border border-slate-200 hover:border-red-500/30 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {flights.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center italic text-slate-400 py-8">No scheduled routes found in logs.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
