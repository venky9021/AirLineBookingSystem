import React from 'react';
import { Plane, User, LogOut, LayoutDashboard, Ticket, CheckSquare, Search } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenAuth, activePage, setActivePage }) {
  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-yellow-500/10 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('home')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="bg-gradient-to-tr from-yellow-500 to-amber-600 p-2 rounded-xl text-slate-950 transition-transform duration-300 group-hover:rotate-12">
            <Plane className="w-6 h-6 fill-current" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-wide bg-gradient-to-r from-slate-900 via-slate-850 to-amber-700 bg-clip-text text-transparent">
            AeroFlow
          </span>
        </div>

        {/* Navigation Routes */}
        <div className="hidden md:flex items-center space-x-1">
          <button 
            type="button"
            onClick={() => setActivePage('home')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
              activePage === 'home' 
                ? 'text-amber-600 bg-yellow-500/10 border-b-2 border-yellow-500' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-yellow-500/5'
            }`}
          >
            <Search className="w-4 h-4 text-amber-600" />
            <span>Search Flights</span>
          </button>

          {user && (
            <button 
              type="button"
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
                activePage === 'dashboard' 
                  ? 'text-amber-600 bg-yellow-500/10 border-b-2 border-yellow-500' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-yellow-500/5'
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-650" />
              <span>My Trips</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => setActivePage('checkin')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
              activePage === 'checkin' 
                ? 'text-amber-600 bg-yellow-500/10 border-b-2 border-yellow-500' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-yellow-500/5'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-650" />
            <span>Check-In</span>
          </button>

          {user && user.role === 'ADMIN' && (
            <button 
              type="button"
              onClick={() => setActivePage('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
                activePage === 'admin' 
                  ? 'text-amber-600 bg-yellow-500/10 border-b-2 border-yellow-500' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-yellow-500/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-650" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* User Session Action */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800">{user.name}</span>
                <span className="text-xs text-amber-600 font-bold">
                  {user.role === 'ADMIN' ? 'Staff Administrator' : 'Frequent Flyer'}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-500 flex items-center justify-center font-display font-extrabold text-slate-950 shadow-sm border border-yellow-400">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <button 
                type="button"
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={onOpenAuth}
              className="glow-btn-gold flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm cursor-pointer shadow-sm"
            >
              <User className="w-4 h-4 fill-current" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
