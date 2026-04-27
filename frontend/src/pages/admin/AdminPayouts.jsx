import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [processing, setProcessing] = useState(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/payouts');
      setPayouts(data.data);
    } catch {
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayouts(); }, []);

  const generatePayouts = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/admin/payouts/generate');
      toast.success(`Generated ${data.data?.length || 0} payouts`);
      fetchPayouts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payouts');
    } finally {
      setGenerating(false);
    }
  };

  const processPayout = async (payoutId) => {
    setProcessing(payoutId);
    try {
      await api.put(`/admin/payouts/${payoutId}/process`);
      toast.success('Payout marked as processed');
      setPayouts(prev => prev.map(p => p._id === payoutId ? { ...p, status: 'processed' } : p));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payout');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-500 mt-1">Monthly owner payouts</p>
        </div>
        <button onClick={generatePayouts} disabled={generating} className="btn-primary">
          {generating ? 'Generating…' : 'Generate Monthly Payouts'}
        </button>
      </div>

      {loading ? <Loader /> : payouts.length === 0 ? (
        <EmptyState title="No payouts" description="Generate payouts for the current month." action={{ label: 'Generate Now', onClick: generatePayouts }} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Owner', 'Period', 'Gross Revenue', 'Commission', 'Net Amount', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.owner?.name}</p>
                      <p className="text-xs text-gray-400">{p.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">Month {p.month}, {p.year}</td>
                    <td className="px-4 py-3">{formatCurrency(p.grossRevenue)}</td>
                    <td className="px-4 py-3 text-gray-500">{p.commissionPercent}% = {formatCurrency(p.commission)}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(p.netAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={p.status === 'processed' ? 'badge-success' : p.status === 'failed' ? 'badge-error' : 'badge-warning'}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <button onClick={() => processPayout(p._id)} disabled={processing === p._id}
                          className="text-xs text-primary-500 font-semibold hover:underline disabled:opacity-50">
                          {processing === p._id ? 'Processing…' : 'Mark Processed'}
                        </button>
                      )}
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