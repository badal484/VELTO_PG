import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getInitials } from '../../utils/formatters';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHome ? 'bg-white shadow-navbar py-4' : 'bg-transparent py-6'
    }`}>
      <div className="page-container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary-500 p-1.5 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className={`text-xl font-bold tracking-tight ${isScrolled || !isHome ? 'text-primary-500' : 'text-white'}`}>
            Velto Stay
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/search" className={`text-sm font-medium transition-colors ${
            isScrolled || !isHome ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
          }`}>Find Stays</Link>
          <Link to="/partner" className={`text-sm font-medium transition-colors ${
            isScrolled || !isHome ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
          }`}>List Property</Link>
          <Link to="/support" className={`text-sm font-medium transition-colors ${
            isScrolled || !isHome ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
          }`}>Support</Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-3 p-1.5 rounded-full border border-gray-200 bg-white hover:shadow-card transition-all ${
                  isMenuOpen ? 'shadow-card' : ''
                }`}
              >
                <div className="ml-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <div className="relative w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm overflow-hidden">
                  {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-modal border border-gray-100 py-2 z-20 slide-up overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Dashboard</Link>
                      <Link to="/dashboard/bookings" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Bookings</Link>
                      <Link to="/dashboard/wishlist" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                    </div>

                    <div className="py-2 border-t border-gray-50">
                      <Link to="/partner/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Hosting Dashboard</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-primary-600 font-bold hover:bg-primary-50">Admin Panel</Link>
                      )}
                    </div>

                    <div className="py-2 border-t border-gray-50">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                  isScrolled || !isHome ? 'text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                }`}
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-all shadow-sm active:scale-95"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
