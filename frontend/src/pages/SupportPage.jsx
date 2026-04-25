import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/common/SEOHead';
import EmptyState from '../components/common/EmptyState';
import ChatDrawer from '../components/support/ChatDrawer';
import { formatRelativeTime } from '../utils/formatters';

const STATUS_BADGE = {
  open: 'badge-warning',
  in_progress: 'badge-primary',
  resolved: 'badge-neutral',
};

export default function SupportPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'other', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchChats = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data } = await api.get('/support/chat/my');
      setChats(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchChats(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/support/chat', form);
      setChats(prev => [data.data, ...prev]);
      setActiveChatId(data.data._id);
      setShowNew(false);
      setForm({ subject: '', category: 'other', message: '' });
      toast.success('Support chat started');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Support" description="Get help from the Velto Stay support team." />
      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="page-container max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support</h1>
              <p className="text-gray-500 mt-1">We typically reply within a few hours</p>
            </div>
            {user && (
              <button onClick={() => setShowNew(!showNew)} className="btn-primary">
                New Ticket
              </button>
            )}
          </div>

          {/* New ticket form */}
          {showNew && (
            <div className="card p-6 mb-6 slide-up">
              <h3 className="font-bold text-gray-900 mb-4">Start a Support Chat</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Subject</label>
                  <input className="input-field" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required maxLength={200} placeholder="Briefly describe your issue" />
                </div>
                <div>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="booking_issue">Booking Issue</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="account_issue">Account Issue</option>
                    <option value="pg_issue">PG Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Message</label>
                  <textarea className="input-field resize-none" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required maxLength={1000} placeholder="Describe your issue in detail…" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Starting…' : 'Start Chat'}</button>
                  <button type="button" onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Chat list */}
          {!user ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 mb-4">Sign in to access support</p>
              <a href="/login" className="btn-primary">Sign In</a>
            </div>
          ) : loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
          ) : chats.length === 0 ? (
            <EmptyState title="No support tickets" description="Start a chat if you need help with anything." action={{ label: 'New Ticket', onClick: () => setShowNew(true) }} />
          ) : (
            <div className="space-y-3">
              {chats.map(chat => (
                <button key={chat._id} onClick={() => setActiveChatId(chat._id)} className="w-full card p-4 text-left hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{chat.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(chat.lastMessage)}</p>
                    </div>
                    <span className={STATUS_BADGE[chat.status] || 'badge-neutral'}>{chat.status.replace('_', ' ')}</span>
                  </div>
                  {chat.unreadByUser > 0 && (
                    <span className="mt-2 inline-block text-xs font-bold text-primary-500">{chat.unreadByUser} new reply</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeChatId && <ChatDrawer chatId={activeChatId} onClose={() => { setActiveChatId(null); fetchChats(); }} />}
    </>
  );
}
