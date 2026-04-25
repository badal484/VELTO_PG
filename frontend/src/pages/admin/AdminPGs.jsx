import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';

export default function AdminPGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState(null);

  const fetchPGs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/pgs${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setPgs(data.data);
    } catch {
      toast.error('Failed to load PGs');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPGs(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPGs();
  };

  const doAction = async (pgId, action) => {
    setActing(pgId);
    try {
      await api.put(`/admin/pgs/${pgId}/${action}`);
      toast.success(`PG ${action}d`);
      setPgs(prev => prev.map(p => {
        if (p._id !== pgId) return p;
        if (action === 'verify') return { ...p, verified: true };
        if (action === 'feature') return { ...p, featured: !p.featured };
        if (action === 'deactivate') return { ...p, status: 'inactive' };
        return p;
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage all listed PGs</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input className="input-field py-2 w-56" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search PGs…" />
          <button type="submit" className="btn-primary py-2">Search</button>
        </form>
      </div>

      {loading ? <Loader /> : pgs.length === 0 ? (
        <EmptyState title="No PGs found" description="Try a different search term." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Name', 'Owner', 'Area', 'Price From', 'Status', 'Flags', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pgs.map(pg => (
                  <tr key={pg._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{pg.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{pg.pgType}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pg.owner?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{pg.address?.area}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(pg.priceFrom)}</td>
                    <td className="px-4 py-3">
                      <span className={pg.status === 'active' ? 'badge-success' : 'badge-neutral'}>{pg.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {pg.verified && <span className="badge-primary text-xs">Verified</span>}
                        {pg.featured && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {!pg.verified && (
                          <button onClick={() => doAction(pg._id, 'verify')} disabled={acting === pg._id}
                            className="text-xs text-green-600 font-semibold hover:underline disabled:opacity-50">
                            Verify
                          </button>
                        )}
                        <button onClick={() => doAction(pg._id, 'feature')} disabled={acting === pg._id}
                          className="text-xs text-amber-600 font-semibold hover:underline disabled:opacity-50">
                          {pg.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        {pg.status === 'active' && (
                          <button onClick={() => doAction(pg._id, 'deactivate')} disabled={acting === pg._id}
                            className="text-xs text-red-500 font-semibold hover:underline disabled:opacity-50">
                            Deactivate
                          </button>
                        )}
                        <Link to={`/pg/${pg._id}`} target="_blank"
                          className="text-xs text-gray-500 font-semibold hover:underline">
                          View
                        </Link>
                      </div>
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
