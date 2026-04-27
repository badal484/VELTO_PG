import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/common/SEOHead';
import StatCard from '../components/dashboard/StatCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Loader from '../components/common/Loader';

import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters';

const RevenueChart = React.lazy(() => import('../components/dashboard/RevenueChart'));

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bookingsRes, revenueRes, payoutsRes, propertiesRes] = await Promise.all([
          api.get('/bookings/owner/all?limit=50'),
          api.get('/admin/revenue-chart').catch(() => ({ data: { data: [] } })),
          api.get('/admin/payouts').catch(() => ({ data: { data: [] } })),
          api.get('/owner/pgs').catch(() => ({ data: { data: [] } })),
        ]);
        setBookings(bookingsRes.data.data);
        setRevenueData(revenueRes.data.data);
        setPayouts(payoutsRes.data.data);
        setProperties(propertiesRes.data.data);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalRevenue = bookings.filter(b => b.payment?.status === 'paid').reduce((sum, b) => sum + b.totalPrice, 0);
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'pending').length;

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      console.log(`Attempting to cancel booking: ${bookingId}`);
      const { data } = await api.put(`/bookings/${bookingId}/cancel`, { reason: 'Cancelled by owner' });
      console.log('Cancellation response:', data);
      toast.success(data.message || 'Booking cancelled');
      
      // Update local state immediately for instant feedback
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      
      // Still refresh from server to ensure data integrity
      const { data: updated } = await api.get('/bookings/owner/all?limit=50');
      if (updated.success) setBookings(updated.data);
    } catch (err) {
      console.error('Cancellation error details:', err.response?.data);
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const togglePropertyStatus = async (pgId) => {
    try {
      const { data } = await api.put(`/owner/pgs/${pgId}/status`);
      toast.success(data.message);
      setProperties(prev => prev.map(p => p._id === pgId ? { ...p, isActive: data.data.isActive } : p));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateAvailability = async (pgId, roomType, newBeds) => {
    try {
      const { data } = await api.put(`/owner/pgs/${pgId}/rooms/${roomType}`, { availableBeds: newBeds });
      setProperties(prev => prev.map(p => 
        p._id === pgId 
          ? { ...p, rooms: p.rooms.map(r => r.type === roomType ? { ...r, availableBeds: data.data.rooms.find(nr => nr.type === roomType).availableBeds } : r) }
          : p
      ));
      toast.success('Availability updated');
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const [showWalkIn, setShowWalkIn] = useState(null); // pgId
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', roomType: '', amount: '' });

  const handleWalkIn = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        guestInfo: { name: walkInForm.name, phone: walkInForm.phone },
        roomType: walkInForm.roomType,
        totalPrice: Number(walkInForm.amount)
      };
      await api.post(`/owner/pgs/${showWalkIn}/walk-in`, payload);
      toast.success('Walk-in booking recorded');
      setShowWalkIn(null);
      setWalkInForm({ name: '', phone: '', roomType: '', amount: '' });
      // Refresh properties to show updated bed count
      const { data } = await api.get('/owner/pgs');
      setProperties(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record walk-in');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <>
      <SEOHead title="Owner Dashboard" />
      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="page-container">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button onClick={() => navigate('/partner/apply')} className="btn-primary text-sm px-5 py-2.5">
              Add New Property
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} color="primary"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard title="Active Bookings" value={confirmed} color="green"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard title="Pending" value={pending} color="amber"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard title="Total Bookings" value={bookings.length} color="blue"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          </div>

          {/* Revenue chart */}
          <div className="card p-6 mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Revenue (Last 6 Months)</h2>
            <React.Suspense fallback={<div className="h-[220px] flex items-center justify-center bg-gray-50 rounded-xl animate-pulse text-gray-400 text-sm">Loading analytics...</div>}>
              <RevenueChart data={revenueData} />
            </React.Suspense>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
            {['bookings', 'properties', 'payouts'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {t}
              </button>
            ))}
          </div>

          {activeTab === 'bookings' && (
            bookings.length === 0 ? (
              <EmptyState title="No bookings yet" description="Your bookings will appear here." />
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>{['Booking ID', 'Guest', 'Contact', 'PG', 'Room', 'Check-In', 'Amount', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bookings.map(b => (
                        <tr key={b._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingId}</td>
                          <td className="px-4 py-3 font-medium">{b.user?.name}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {b.user?.phone || 'No phone'}<br/>{b.user?.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{b.pg?.name}</td>
                          <td className="px-4 py-3 capitalize text-gray-600">{b.roomType}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(b.checkIn)}</td>
                          <td className="px-4 py-3 font-semibold">{formatCurrency(b.totalPrice)}</td>
                          <td className="px-4 py-3"><span className={getStatusColor(b.status)}>{b.status}</span></td>
                          <td className="px-4 py-3">
                            {(b.status === 'pending' || b.status === 'confirmed') && (
                              <button 
                                onClick={() => handleCancel(b._id)}
                                className="text-xs text-red-600 font-semibold hover:underline"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {activeTab === 'properties' && (
            properties.length === 0 ? (
              <EmptyState title="No properties yet" description="List your PG to start receiving bookings." action={{ label: 'List Property', onClick: () => window.location.href = '/list-property' }} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(p => (
                  <div key={p._id} className="card p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.address.area}, {p.address.city}</p>
                      </div>
                      <span className={`badge-${p.isVerified ? 'success' : 'warning'}`}>{p.isVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Views</p>
                        <p className="text-xl font-bold text-gray-900">{p.views || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Bookings</p>
                        <p className="text-xl font-bold text-gray-900">{p.totalBookings || 0}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Room Availability</p>
                      {p.rooms.map(r => (
                        <div key={r.type} className="flex justify-between items-center bg-white border border-gray-100 p-2.5 rounded-xl">
                          <span className="capitalize text-xs font-medium text-gray-700">{r.type} Sharing</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-400">{r.availableBeds}/{r.totalBeds} beds</span>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                              <button 
                                onClick={() => handleUpdateAvailability(p._id, r.type, r.availableBeds - 1)}
                                disabled={r.availableBeds <= 0}
                                className="px-2 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold">{r.availableBeds}</span>
                              <button 
                                onClick={() => handleUpdateAvailability(p._id, r.type, r.availableBeds + 1)}
                                disabled={r.availableBeds >= r.totalBeds}
                                className="px-2 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => togglePropertyStatus(p._id)}
                        className={`btn-${p.isActive ? 'ghost' : 'primary'} flex-1 text-xs py-2 min-w-[80px]`}
                      >
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => setShowWalkIn(p._id)}
                        className="btn-ghost flex-1 text-xs py-2 min-w-[80px] text-primary-600 border-primary-200"
                      >
                        Walk-in
                      </button>
                      <button className="btn-ghost flex-1 text-xs py-2 min-w-[80px]" onClick={() => window.location.href=`/pg/${p._id}`}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'payouts' && (
            payouts.length === 0 ? (
              <EmptyState title="No payouts yet" description="Monthly payouts will appear here once processed." />
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>{['Period', 'Gross Revenue', 'Commission', 'Net Amount', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {payouts.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">Month {p.month}, {p.year}</td>
                          <td className="px-4 py-3">{formatCurrency(p.grossRevenue)}</td>
                          <td className="px-4 py-3 text-gray-500">{p.commissionPercent}% = {formatCurrency(p.commission)}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(p.netAmount)}</td>
                          <td className="px-4 py-3">
                            <span className={p.status === 'processed' ? 'badge-success' : p.status === 'failed' ? 'badge-error' : 'badge-warning'}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Walk-in Modal */}
      {showWalkIn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Record Walk-in</h3>
              <button onClick={() => setShowWalkIn(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleWalkIn} className="space-y-4">
              <div>
                <label className="input-label">Guest Name</label>
                <input className="input-field" value={walkInForm.name} onChange={e => setWalkInForm(f => ({ ...f, name: e.target.value }))} required placeholder="Full name" />
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input className="input-field" value={walkInForm.phone} onChange={e => setWalkInForm(f => ({ ...f, phone: e.target.value }))} required placeholder="Mobile number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Room Type</label>
                  <select className="input-field" value={walkInForm.roomType} onChange={e => setWalkInForm(f => ({ ...f, roomType: e.target.value }))} required>
                    <option value="">Select</option>
                    {properties.find(p => p._id === showWalkIn)?.rooms.map(r => (
                      <option key={r.type} value={r.type} disabled={r.availableBeds === 0}>
                        {r.type} ({r.availableBeds} left)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Amount Paid</label>
                  <input type="number" className="input-field" value={walkInForm.amount} onChange={e => setWalkInForm(f => ({ ...f, amount: e.target.value }))} required placeholder="Price" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="btn-primary w-full py-3">Record Resident</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}