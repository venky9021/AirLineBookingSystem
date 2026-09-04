import React from 'react';
import { Plane, Globe, Compass, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 px-4 sm:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500/10 p-1.5 rounded-lg text-yellow-500">
            <Plane className="w-5 h-5 fill-current" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900">
            AeroFlow <span className="text-yellow-500 text-xs">v1.0.0</span>
          </span>
        </div>

        {/* Made with love */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700">
          <span>Crafted with</span>
          <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
          <span>for premium airline checkout experiences.</span>
        </div>

        {/* Social Mock Links */}
        <div className="flex items-center space-x-4 text-slate-600">
          <a href="#" className="hover:text-yellow-500 transition-colors"><Globe className="w-4 h-4" /></a>
          <a href="#" className="hover:text-yellow-500 transition-colors"><Compass className="w-4 h-4" /></a>
        </div>

      </div>
    </footer>
  );
}
