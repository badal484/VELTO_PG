import React from 'react';
import { BarChart3, Users, Home, ClipboardList, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ADMIN_CARDS = [
  { title: 'Property Verification', count: '12 Pending', icon: ShieldCheck, color: 'bg-amber-500', link: '/admin/applications' },
  { title: 'Platform Users', count: '2,540 Total', icon: Users, color: 'bg-blue-500', link: '/admin/users' },
  { title: 'Live Bookings', count: '45 Active', icon: ClipboardList, color: 'bg-emerald-500', link: '/admin/bookings' },
  { title: 'Total Revenue', count: '₹12.4L', icon: BarChart3, color: 'bg-primary-500', link: '/admin/payouts' },
];

export default function AdminLandingContent() {
  return (
    <div className="py-24 bg-white">
      <div className="page-container">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Oversight</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Quick access to the most critical platform management tools. Monitor health, growth, and security at a glance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {ADMIN_CARDS.map((card, i) => (
            <Link key={card.title} to={card.link} className="card p-8 group hover:shadow-2xl transition-all duration-300 slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{card.count}</h3>
            </Link>
          ))}
        </div>

        {/* Rapid Actions */}
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden slide-up delay-400">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-500/10 -skew-x-12 translate-x-1/4" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Security & Quality Control</h2>
              <p className="text-slate-400 text-lg mb-10">All new properties must pass the 24-point physical inspection before appearing on the public search results. You have 3 inspections scheduled for today.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/admin/inspections" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                  View Inspections
                </Link>
                <Link to="/admin/settings" className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">
                  Platform Settings
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Uptime', val: '99.9%' },
                { label: 'Response', val: '1.2s' },
                { label: 'Verified', val: '88%' },
                { label: 'Safety', val: '100%' }
              ].map(m => (
                <div key={m.label} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <p className="text-primary-400 text-2xl font-black">{m.val}</p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">System Pulse</h3>
          <div className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden">
            {[
              { type: 'application', msg: 'New Partner Application: "Green Oasis PG"', time: '12 mins ago', status: 'Pending' },
              { type: 'user', msg: 'New User Registered: riklestork@gmail.com', time: '45 mins ago', status: 'Verified' },
              { type: 'alert', msg: 'Security: Unusual login attempt from 192.168.1.1', time: '2 hours ago', status: 'Blocked' },
              { type: 'payout', msg: 'Monthly Payouts Processed: ₹4.2L', time: '5 hours ago', status: 'Success' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 border-b border-gray-100 last:border-0 hover:bg-white transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'application' ? 'bg-amber-500' : 
                    item.type === 'user' ? 'bg-blue-500' : 
                    item.type === 'alert' ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{item.msg}</p>
                    <p className="text-xs text-gray-400 font-medium">{item.time}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  item.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                  item.status === 'Verified' ? 'bg-blue-100 text-blue-600' :
                  item.status === 'Blocked' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/admin/audit-log" className="text-xs font-bold text-gray-400 hover:text-primary-500 uppercase tracking-widest transition-colors">
              View Full Audit Trail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
