import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/common/SEOHead';
import BookingCard from '../components/dashboard/BookingCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Loader from '../components/common/Loader';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.data);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      const { data } = await api.put(`/bookings/${bookingId}/cancel`, { reason: 'Cancelled by user' });
      toast.success(data.message || 'Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);
  const TABS = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <>
      <SEOHead title="My Dashboard" />
      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="page-container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-gray-500 mt-1">Manage your bookings and account</p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Bookings', value: bookings.length },
              { label: 'Active Stays', value: bookings.filter(b => b.status === 'confirmed').length },
              { label: 'Pending Payment', value: bookings.filter(b => b.status === 'pending').length },
              { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bookings */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">My Bookings</h2>
                <Link to="/listings" className="text-xs text-primary-500 font-semibold hover:underline">Browse PGs</Link>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {loading ? <Loader /> : error ? (
                <ErrorState message={error} onRetry={fetchBookings} />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No bookings yet"
                  description="Book your first PG and it'll appear here."
                  action={{ label: 'Find a PG', onClick: () => window.location.href = '/listings' }}
                />
              ) : (
                <div className="space-y-4">
                  {filtered.map(b => (
                    <BookingCard 
                      key={b._id} 
                      booking={b} 
                      onCancel={handleCancel} 
                      isCancelling={cancelling === b._id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Profile card */}
            <div>
              <div className="card p-6 mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{user?.email}</p>
                  <p>{user?.phone}</p>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Links</h3>
                <div className="space-y-1">
                  <Link to="/listings" className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 text-sm text-gray-600 font-medium transition-colors">Find Stays</Link>
                  <Link to="/list-your-pg" className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 text-sm text-gray-600 font-medium transition-colors">List My PG</Link>
                  <Link to="/support" className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 text-sm text-gray-600 font-medium transition-colors">Get Support</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
