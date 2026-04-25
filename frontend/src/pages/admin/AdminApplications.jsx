import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const STATUS_TABS = ['all', 'pending', 'inspection', 'approved', 'rejected'];

const BADGE = {
  pending: 'badge-warning',
  inspection: 'badge-primary',
  approved: 'badge-success',
  rejected: 'badge-error',
};

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchApps = async () => {
    setLoading(true);
    try {
      let params = '';
      if (activeTab === 'pending') {
        params = '?status=submitted'; // Backend uses 'submitted' for new apps
      } else if (activeTab !== 'all') {
        params = `?status=${activeTab}`;
      }
      const { data } = await api.get(`/admin/applications${params}`);
      setApplications(data.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchApps(); }, [activeTab]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Partner Applications</h1>
        <p className="text-gray-500 mt-1">Review and approve PG owner applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : applications.length === 0 ? (
        <EmptyState title="No applications" description={`No ${activeTab === 'all' ? '' : activeTab} applications found.`} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['PG Name', 'Owner', 'Area', 'Submitted', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{app.pgName}</td>
                    <td className="px-4 py-3 text-gray-600">{app.applicant?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{app.address?.area}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={BADGE[app.status] || 'badge-neutral'}>{app.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/applications/${app._id}`}
                        className="text-primary-500 font-semibold text-xs hover:underline">
                        Review
                      </Link>
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
