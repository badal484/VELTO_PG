import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const RESIDENT_FEATURES = [
  { title: 'Verified Properties', desc: 'Every property is physically inspected for safety and quality before listing.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { title: 'Instant Booking', desc: 'Secure your stay in seconds with integrated Razorpay payments and instant confirmation.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { title: 'Zero Hidden Fees', desc: 'Transparent pricing. No brokerages, no surprises. Security deposits managed securely.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: '24/7 Support', desc: 'Real humans ready to help. Chat with our support team at any time for any issue.', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
];

const OWNER_FEATURES = [
  { title: 'Timely Payouts', desc: 'Receive your revenue directly in your bank account every month without fail.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Guest Verification', desc: 'We verify every resident\'s identity and documents before they move in.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { title: 'Real-time Analytics', desc: 'Monitor occupancy, revenue, and guest satisfaction from your dedicated dashboard.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { title: 'Partner Support', desc: 'Get 24/7 dedicated assistance for all your property management needs.', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
];

export default function WhyVeltoStay() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const data = isOwner ? OWNER_FEATURES : RESIDENT_FEATURES;

  return (
    <section className="py-24 bg-white">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6, mb-12">
          <div>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] mb-3 block">
              {isOwner ? 'Partner Excellence' : 'Premium Selection'}
            </span>
            <h2 className="section-title">
              {isOwner ? 'Elite Partner Network' : 'The Elite Collection'}
            </h2>
            <p className="text-gray-500 mt-3 leading-relaxed max-w-md">
              {isOwner 
                ? 'Discover how top-performing properties maintain 95%+ occupancy through our Elite Partner standards.'
                : 'Hand-picked properties verified for quality, safety, and comfort.'
              }
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map(f => (
            <div key={f.title} className="group text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-5 mx-auto group-hover:bg-primary-500 group-hover:text-white transition-all duration-250">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}