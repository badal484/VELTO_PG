import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  return (
    <footer className="bg-gray-900 text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-500 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-lg font-bold">Velto Stay</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {isAdmin 
                ? "Master Admin Console — Platform Oversight & Governance. Ensuring quality, security, and trust across the Velto Stay ecosystem."
                : isOwner 
                ? "Bangalore's #1 Property Management & Booking Platform. Empowering owners with automated tools and quality tenants."
                : "Find Your Perfect Stay, Instantly. Verified PG accommodations across Bangalore."
              }
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p><a href="mailto:admin@veltostay.com" className="hover:text-white transition-colors">admin@veltostay.com</a></p>
              <p><a href="tel:+916204646300" className="hover:text-white transition-colors">+91 6204646300</a></p>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-4">
              {isAdmin ? 'Management' : 'Company'}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {isAdmin ? (
                <>
                  <li><Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
                  <li><Link to="/admin/applications" className="hover:text-white transition-colors">Verify Partners</Link></li>
                  <li><Link to="/admin/users" className="hover:text-white transition-colors">User Records</Link></li>
                  <li><Link to="/admin/audit-log" className="hover:text-white transition-colors">Audit Trail</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/support" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/list-your-pg" className="hover:text-white transition-colors">Partner with Us</Link></li>
                  <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Discover / Resources */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-4">
              {isAdmin ? 'System Ops' : isOwner ? 'Partner Resources' : 'Discover'}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {isAdmin ? (
                <>
                  <li><Link to="/admin/settings" className="hover:text-white transition-colors">Platform Settings</Link></li>
                  <li><Link to="/admin/bookings" className="hover:text-white transition-colors">Booking Audit</Link></li>
                  <li><Link to="/admin/payouts" className="hover:text-white transition-colors">Payout Management</Link></li>
                  <li><Link to="/admin/inspections" className="hover:text-white transition-colors">Quality Inspections</Link></li>
                </>
              ) : isOwner ? (
                <>
                  <li><Link to="/owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
                  <li><Link to="/partner/apply" className="hover:text-white transition-colors">Add New Property</Link></li>
                  <li><Link to="/support" className="hover:text-white transition-colors">Partner Support</Link></li>
                  <li><Link to="/list-your-pg" className="hover:text-white transition-colors">Why Partner With Us</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/listings?area=Koramangala 5th Block" className="hover:text-white transition-colors">PGs in Koramangala</Link></li>
                  <li><Link to="/listings?area=HSR Layout Sector 2" className="hover:text-white transition-colors">PGs in HSR Layout</Link></li>
                  <li><Link to="/listings?area=Indiranagar 100ft Road" className="hover:text-white transition-colors">PGs in Indiranagar</Link></li>
                  <li><Link to="/listings?area=Whitefield Main Road" className="hover:text-white transition-colors">PGs in Whitefield</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-gray-300 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/support" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Velto Stay. All rights reserved.</p>
          <p className="text-sm text-gray-600">Built for Bangalore 🏙️</p>
        </div>
      </div>
    </footer>
  );
}