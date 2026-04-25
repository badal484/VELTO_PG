import React, { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ChatDrawer from './ChatDrawer';

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'other', message: '' });
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const startChat = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/support/chat', form);
      setActiveChatId(data.data._id);
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      {!activeChatId && (
        <button
          onClick={() => setOpen(!open)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-modal flex items-center justify-center z-40 hover:bg-primary-600 transition-colors active:scale-95"
          aria-label="Support"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </button>
      )}

      {/* New chat form */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-modal border border-gray-100 z-40 slide-up">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Start a Support Chat</h3>
            <p className="text-xs text-gray-400 mt-0.5">We typically reply within a few hours</p>
          </div>
          <form onSubmit={startChat} className="p-4 space-y-3">
            <div>
              <label className="input-label">Subject</label>
              <input
                className="input-field"
                placeholder="Briefly describe your issue"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                required
                maxLength={200}
              />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option value="booking_issue">Booking Issue</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="account_issue">Account Issue</option>
                <option value="pg_issue">PG Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="input-label">Message</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Describe your issue in detail…"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                required
                maxLength={1000}
              />
            </div>
            {error && <p className="input-error">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Starting…' : 'Start Chat'}
            </button>
          </form>
        </div>
      )}

      {/* Active chat drawer */}
      {activeChatId && (
        <ChatDrawer chatId={activeChatId} onClose={() => setActiveChatId(null)} />
      )}
    </>
  );
}
