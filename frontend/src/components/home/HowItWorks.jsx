import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Search & Filter',
    desc: 'Browse verified PGs by area, price, amenities, and gender preference. Use our map view to find the perfect location.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    num: '02',
    title: 'Book Instantly',
    desc: 'Select your room type, set your move-in date, and complete payment securely via Razorpay in under 2 minutes.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    num: '03',
    title: 'Move In Stress-Free',
    desc: 'Receive a confirmation with all details. Our team ensures a smooth move-in experience at every verified property.',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="page-container">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] mb-3 block">Simple Process</span>
          <h2 className="section-title">How Velto Stay Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gray-200" style={{ left: '16.67%', right: '16.67%' }} />
          {STEPS.map((step, idx) => (
            <div key={step.num} className="relative text-center group">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500 group-hover:shadow-card-hover transition-all duration-300 relative z-10">
                <svg className="w-7 h-7 text-primary-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                </svg>
              </div>
              <span className="text-xs font-bold text-primary-500/50 uppercase tracking-widest mb-2 block">{step.num}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}