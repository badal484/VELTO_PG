import React from 'react';
import { Link } from 'react-router-dom';

export default function PartnerCTA() {
  return (
    <section className="py-12 px-4">
      <div className="page-container">
        <div className="bg-gray-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[120px]" />
          <div className="relative z-10">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-[0.2em] mb-4 block">For Property Owners</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              List Your PG on Velto Stay
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Join 100+ verified property owners. Get instant bookings, automated payments, and a dedicated dashboard to manage everything.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/list-your-pg" className="btn-primary px-8 py-3.5">
                Apply to List Your PG
              </Link>
              <Link to="/support" className="border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
