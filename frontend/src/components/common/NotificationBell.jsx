import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-modal border border-gray-100 z-50 overflow-hidden fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary-500 font-semibold hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <Link
                  key={n._id}
                  to={n.link || '/'}
                  onClick={() => { markAsRead(n._id); setOpen(false); }}
                  className={`block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-primary-50/40' : ''}`}
                >
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}