import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
    api.get(`/admin/bookings${params}`)
      .then(({ data }) => setBookings(data.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1">All platform bookings</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : bookings.length === 0 ? (
        <EmptyState title="No bookings" description={`No ${activeTab === 'all' ? '' : activeTab} bookings.`} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Booking ID', 'Guest', 'PG', 'Room', 'Check-In', 'Duration', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.bookingId}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.user?.name}</p>
                      <p className="text-xs text-gray-400">{b.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.pg?.name}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{b.roomType}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(b.checkIn)}</td>
                    <td className="px-4 py-3 text-gray-600">{b.duration}mo</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(b.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={getStatusColor(b.status)}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
