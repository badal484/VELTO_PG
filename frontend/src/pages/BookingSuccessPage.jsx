import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import SEOHead from '../components/common/SEOHead';
import { formatCurrency, formatDate } from '../utils/formatters';
import Loader from '../components/common/Loader';

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <SEOHead title="Booking Confirmed" />
      <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-gray-50">
        <div className="card p-8 max-w-md w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-6">Your stay has been booked successfully.</p>

          {booking && (
            <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-bold text-gray-900 font-mono">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Property</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%]">{booking.pg?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Check-In</span>
                <span className="font-semibold text-gray-900">{formatDate(booking.checkIn)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold text-gray-900">{booking.duration} month{booking.duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(booking.totalPrice + (booking.securityDeposit || 0))}
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mb-6">A confirmation email has been sent to your registered email address.</p>

          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className="btn-primary">View My Bookings</Link>
            <Link to="/listings" className="btn-ghost text-sm">Continue Browsing</Link>
          </div>
        </div>
      </div>
    </>
  );
}