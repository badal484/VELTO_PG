import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const ROLE_BADGE = { user: 'badge-neutral', owner: 'badge-primary', admin: 'badge-warning' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setUsers(data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleBan = async (userId, isBanned) => {
    setActing(userId);
    try {
      if (isBanned) {
        await api.put(`/admin/users/${userId}/unban`);
        toast.success('User unbanned');
      } else {
        await api.put(`/admin/users/${userId}/ban`);
        toast.success('User banned');
      }
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage platform users</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input className="input-field py-2 w-56" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" />
          <button type="submit" className="btn-primary py-2">Search</button>
        </form>
      </div>

      {loading ? <Loader /> : users.length === 0 ? (
        <EmptyState title="No users found" description="Try a different search term." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={ROLE_BADGE[u.role] || 'badge-neutral'}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.isBanned
                        ? <span className="badge-error">Banned</span>
                        : u.isEmailVerified
                        ? <span className="badge-success">Active</span>
                        : <span className="badge-warning">Unverified</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleBan(u._id, u.isBanned)} disabled={acting === u._id}
                          className={`text-xs font-semibold hover:underline disabled:opacity-50 ${u.isBanned ? 'text-green-600' : 'text-red-500'}`}>
                          {u.isBanned ? 'Unban' : 'Ban'}
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
