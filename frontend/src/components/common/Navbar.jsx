import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const solid = scrolled || !isHome;
  const textCls = solid ? 'text-gray-700 hover:text-gray-900' : 'text-white/80 hover:text-white';

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner/dashboard' : '/dashboard';

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${solid ? 'bg-white shadow-navbar py-3' : 'bg-transparent py-5'}`}>
      <div className="page-container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary-500 p-1.5 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className={`text-lg font-bold tracking-tight transition-colors ${solid ? 'text-gray-900' : 'text-white'}`}>
            Velto Stay
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          {user?.role === 'admin' ? (
            <>
              <Link to="/listings" className={`text-sm font-medium transition-colors ${textCls}`}>Marketplace</Link>
              <Link to="/admin/applications" className={`text-sm font-medium transition-colors ${textCls}`}>Verifications</Link>
              <Link to="/admin/audit-log" className={`text-sm font-medium transition-colors ${textCls}`}>Audit Logs</Link>
            </>
          ) : (
            <>
              {user?.role !== 'owner' && (
                <Link to="/listings" className={`text-sm font-medium transition-colors ${textCls}`}>Find Stays</Link>
              )}
              <Link to={user?.role === 'owner' ? '/partner/apply' : '/list-your-pg'} className={`text-sm font-medium transition-colors ${textCls}`}>
                {user?.role === 'owner' ? 'Add Property' : 'List Property'}
              </Link>
            </>
          )}
          <Link to="/support" className={`text-sm font-medium transition-colors ${textCls}`}>Support</Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full border transition-all ${
                    solid ? 'border-gray-200 bg-white hover:shadow-card' : 'border-white/30 hover:bg-white/10'
                  } ${menuOpen ? 'shadow-card' : ''}`}
                >
                  <svg className={`w-4 h-4 ${solid ? 'text-gray-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-modal border border-gray-100 overflow-hidden z-50 fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
                    </div>
                    <div className="py-1">
                      <Link to={dashboardLink} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">Dashboard</Link>
                      {user.role === 'user' && (
                        <Link to="/list-your-pg" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">Become a Partner</Link>
                      )}
                      <Link to="/support" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">Support</Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${solid ? 'text-gray-700 hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary !py-2 !px-4 !text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
