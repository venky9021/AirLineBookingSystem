import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Results from './pages/Results';
import Seats from './pages/Seats';
import Passengers from './pages/Passengers';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Admin from './pages/Admin';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('home'); // 'home', 'results', 'seats', 'passengers', 'payment', 'confirmation', 'dashboard', 'checkin', 'admin'
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Flow states
  const [searchParams, setSearchParams] = useState(null);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [selectedSeatsList, setSelectedSeatsList] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [checkInPnr, setCheckInPnr] = useState('');

  // Validate session token on startup
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (err) {
          api.logout();
          setUser(null);
        }
      }
    };
    validateSession();
  }, []);

  const handleAuthSuccess = (authData) => {
    setUser({
      id: authData.id,
      name: authData.name,
      email: authData.email,
      phone: authData.phone,
      role: authData.role
    });
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActivePage('home');
  };

  // Search trigger
  const handleSearchTrigger = (params) => {
    setSearchParams(params);
    setActivePage('results');
  };

  // Select flight trigger
  const handleSelectFlightTrigger = (flightId) => {
    setSelectedFlightId(flightId);
    setActivePage('seats');
  };

  // Select seats trigger
  const handleSelectSeatsTrigger = (seats) => {
    setSelectedSeatsList(seats);
    
    // Check if user is signed in first! If not, open login pop-up, then proceed.
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setActivePage('passengers');
    }
  };

  // Custom interception if user logs in during seat flow
  useEffect(() => {
    if (user && activePage === 'seats' && selectedSeatsList.length > 0) {
      setActivePage('passengers');
    }
  }, [user]);

  // Booking created trigger
  const handleBookingCreatedTrigger = (booking) => {
    setActiveBooking(booking);
    setActivePage('payment');
  };

  // Payment confirmed trigger
  const handlePaymentConfirmedTrigger = (confirmedBooking) => {
    setActiveBooking(confirmedBooking);
    setActivePage('confirmation');
  };

  // Check-In lookup trigger from dashboard
  const handleTriggerCheckIn = (pnrCode) => {
    setCheckInPnr(pnrCode);
    setActivePage('checkin');
  };

  // Routing Switchboard
  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return <Home onSearch={handleSearchTrigger} />;
      
      case 'results':
        return (
          <Results 
            searchParams={searchParams} 
            onSelectFlight={handleSelectFlightTrigger} 
            onBack={() => setActivePage('home')}
          />
        );
      
      case 'seats':
        return (
          <Seats 
            flightId={selectedFlightId} 
            searchParams={searchParams} 
            onSelectSeats={handleSelectSeatsTrigger} 
            onBack={() => setActivePage('results')}
          />
        );
      
      case 'passengers':
        return (
          <Passengers 
            flightId={selectedFlightId}
            travelClass={searchParams?.travelClass || 'ECONOMY'}
            selectedSeats={selectedSeatsList}
            onBookingCreated={handleBookingCreatedTrigger}
            onBack={() => setActivePage('seats')}
          />
        );

      case 'payment':
        return (
          <Payment 
            booking={activeBooking} 
            onPaymentConfirmed={handlePaymentConfirmedTrigger} 
            onBack={() => setActivePage('passengers')}
          />
        );

      case 'confirmation':
        return (
          <Confirmation 
            booking={activeBooking} 
            onGoToDashboard={() => setActivePage('dashboard')} 
          />
        );

      case 'dashboard':
        return (
          <Dashboard 
            onTriggerCheckIn={handleTriggerCheckIn} 
            onStartSearch={() => setActivePage('home')}
          />
        );

      case 'checkin':
        return (
          <CheckIn 
            pnrParam={checkInPnr}
            onBack={() => setActivePage('home')} 
          />
        );

      case 'admin':
        return <Admin />;

      default:
        return <Home onSearch={handleSearchTrigger} />;
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      
      {/* Navigation Top bar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Container */}
      <main className="flex-grow flex flex-col justify-start">
        {renderPageContent()}
      </main>

      {/* Footer Bottom bar */}
      <Footer />

      {/* Authentications overlay */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

    </div>
  );
}
