import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';

const POPULAR = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Electronic City'];

export default function HeroSection() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={isAdmin 
            ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000" 
            : "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=2000"
          }
          alt="Platform Background"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${isAdmin ? 'from-slate-900/90 via-slate-900/60 to-white' : 'from-black/65 via-black/40 to-white'}`} />
      </div>

      <div className="relative z-10 w-full page-container text-center py-32 slide-up">
        <span className="inline-block text-xs font-bold text-white/60 uppercase tracking-[0.25em] mb-6">
          {isAdmin ? `Administrator: ${user.name}` : isOwner ? `Welcome back, ${user.name}` : "Bangalore's #1 PG Platform"}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-[1.15] tracking-tight">
          {isAdmin ? (
            <>Master Control<br className="hidden sm:block" /> Center & <span className="text-primary-400">Oversight.</span></>
          ) : isOwner ? (
            <>Manage Your<br className="hidden sm:block" /> Stays, <span className="text-primary-400">Effortlessly.</span></>
          ) : (
            <>Find Your Perfect<br className="hidden sm:block" /> Stay, <span className="text-primary-400">Instantly.</span></>
          )}
        </h1>
        <p className="text-base sm:text-lg text-white/80 mb-10 max-w-xl mx-auto font-medium leading-relaxed">
          {isAdmin
            ? "Access platform-wide analytics, verify partner applications, audit transactions, and maintain Velto Stay service standards."
            : isOwner 
            ? "Track your bookings, manage inventory, and monitor revenue from your dedicated partner dashboard."
            : "Discover premium, verified PG accommodations in Bangalore's most vibrant neighborhoods. Simple booking, secure payments."
          }
        </p>

        {isAdmin ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <Link to="/admin" className="btn-primary w-full sm:flex-1 py-4 text-base shadow-xl shadow-primary-500/20">
              Go to Dashboard
            </Link>
            <Link to="/admin/audit-log" className="w-full sm:flex-1 py-4 text-base bg-white/10 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md">
              System Audit Logs
            </Link>
          </div>
        ) : isOwner ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <Link to="/owner/dashboard" className="btn-primary w-full sm:flex-1 py-4 text-base shadow-xl shadow-primary-500/20">
              Go to Dashboard
            </Link>
            <Link to="/partner/apply" className="w-full sm:flex-1 py-4 text-base bg-white/10 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md">
              Add New Property
            </Link>
          </div>
        ) : (
          <>
            <SearchBar className="max-w-3xl mx-auto" />
            <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Popular:</span>
              {POPULAR.map(area => (
                <Link
                  key={area}
                  to={`/listings?search=${encodeURIComponent(area)}`}
                  className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white hover:bg-white hover:text-primary-500 transition-all"
                >
                  {area}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
