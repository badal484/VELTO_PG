import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, toasts,
      addToast, removeToast, markAsRead, markAllAsRead, fetchNotifications
    }}>
      {children}
      
      {/* Toast Portal */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto slide-up">
            <div className={`card p-4 flex items-start gap-3 border-l-4 shadow-modal ${
              toast.type === 'success' ? 'border-l-green-500' : 
              toast.type === 'error' ? 'border-l-red-500' : 'border-l-primary-500'
            }`}>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">{toast.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);