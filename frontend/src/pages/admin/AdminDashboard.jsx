import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import StatCard from '../../components/dashboard/StatCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, revenueRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/revenue-chart').catch(() => ({ data: { data: [] } })),
        ]);
        
        const dash = dashRes.data.data;
        setStats({
          totalUsers: dash.users,
          activePGs: dash.activePGs,
          totalBookings: dash.recentBookings.length, // Or use a real count if available
          totalRevenue: dash.totalRevenue
        });
        setRevenueData(revenueRes.data.data);
        setRecentBookings(dash.recentBookings);
        setPendingApps(dash.pendingApplicationsList || []); // Assuming we add this to backend or use the count
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers ?? '—'} color="blue"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatCard title="Active PGs" value={stats?.activePGs ?? '—'} color="green"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? '—'} color="primary"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <StatCard title="Total Revenue" value={stats?.totalRevenue != null ? formatCurrency(stats.totalRevenue) : '—'} color="amber"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      {/* Revenue Chart */}
      <div className="card p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Revenue (Last 6 Months)</h2>
        <RevenueChart data={revenueData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Applications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Pending Applications</h2>
            <Link to="/admin/applications" className="text-sm text-primary-500 font-semibold hover:underline">View All</Link>
          </div>
          {pendingApps.length === 0 ? (
            <p className="text-gray-400 text-sm">No pending applications</p>
          ) : (
            <div className="space-y-3">
              {pendingApps.map(app => (
                <Link key={app._id} to={`/admin/applications/${app._id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{app.pgName}</p>
                    <p className="text-xs text-gray-400">{app.owner?.name} · {formatDate(app.createdAt)}</p>
                  </div>
                  <span className="badge-warning text-xs">pending</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-primary-500 font-semibold hover:underline">View All</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent bookings</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(b => (
                <div key={b._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{b.user?.name}</p>
                    <p className="text-xs text-gray-400">{b.pg?.name} · {formatDate(b.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(b.totalPrice)}</p>
                    <span className={`text-xs font-semibold ${b.status === 'confirmed' ? 'text-green-600' : b.status === 'cancelled' ? 'text-red-500' : 'text-amber-600'}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}